import { getProducer, kafka } from '../config/kafka';
import { extractTextFromPdf } from './pdfService';
import { analyzePdfContent } from './aiService';
import { DocumentModel } from '../models/Document';
import { Task } from '../models/Task';
import { sseService } from './sseService';
import { cacheSet } from '../config/redis';
import { config } from '../config/env';
import { isDbConnected } from '../config/db';
import { inMemoryStore } from '../config/memoryStore';

export interface PdfUploadEvent {
  documentId: string;
  filePath: string;
  userId: string;
}

const KAFKA_TOPIC = 'pdf-upload-event';
let isKafkaConnected = false;

// Initialize Kafka Consumer & Producer if available
export const initKafkaPipeline = async (): Promise<void> => {
  try {
    const producer = getProducer();
    await producer.connect();
    isKafkaConnected = true;
    console.log('[Kafka] Producer connected.');

    const consumer = kafka.consumer({ groupId: config.kafkaGroupId });
    await consumer.connect();
    await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: true });

    consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value) {
          const event: PdfUploadEvent = JSON.parse(message.value.toString());
          await processPdfDocument(event);
        }
      },
    });
    console.log('[Kafka] Consumer connected & listening to pdf-upload-event.');
  } catch (err) {
    isKafkaConnected = false;
    console.warn('[Kafka] Broker unavailable. Operating in-memory async processing pipeline.');
  }
};

export const publishPdfUploadEvent = async (event: PdfUploadEvent): Promise<void> => {
  if (isKafkaConnected) {
    try {
      const producer = getProducer();
      await producer.send({
        topic: KAFKA_TOPIC,
        messages: [{ value: JSON.stringify(event) }],
      });
      return;
    } catch (err) {
      console.warn('[Kafka] Send error, switching to async processing fallback:', err);
    }
  }

  // Asynchronous queue fallback when Kafka is offline
  setImmediate(() => {
    processPdfDocument(event).catch((e) => console.error('[Pipeline] Error in async worker:', e));
  });
};

export const processPdfDocument = async (event: PdfUploadEvent): Promise<void> => {
  const { documentId, filePath, userId } = event;

  try {
    // Step 1: Update status & send progress
    if (isDbConnected) {
      await DocumentModel.findByIdAndUpdate(documentId, { status: 'processing' });
    } else {
      const doc = inMemoryStore.documents.find((d) => d._id === documentId);
      if (doc) doc.status = 'processing';
    }

    sseService.sendProgress(documentId, {
      status: 'processing',
      progress: 25,
      message: 'Extracting text and OCR context from PDF...',
    });

    // Step 2: Extract text
    const rawText = await extractTextFromPdf(filePath);
    if (isDbConnected) {
      await DocumentModel.findByIdAndUpdate(documentId, { rawText });
    } else {
      const doc = inMemoryStore.documents.find((d) => d._id === documentId);
      if (doc) doc.rawText = rawText;
    }

    sseService.sendProgress(documentId, {
      status: 'processing',
      progress: 65,
      message: 'Running AI LLM analysis & generating structured insights...',
    });

    // Step 3: AI structured analysis
    const aiResult = await analyzePdfContent(rawText);

    // Step 4: Persist Summary & Deadlines
    let updatedDoc: any;

    if (isDbConnected) {
      updatedDoc = await DocumentModel.findByIdAndUpdate(
        documentId,
        {
          status: 'completed',
          summary: aiResult.summary,
          deadlines: aiResult.deadlines,
        },
        { new: true }
      );

      // Step 5: Save Tasks to MongoDB
      if (aiResult.tasks && aiResult.tasks.length > 0) {
        const tasksToInsert = aiResult.tasks.map((t) => ({
          documentId,
          title: t.title,
          description: t.description || '',
          priority: t.priority,
          status: 'todo',
          dueDate: t.dueDate || '',
          createdBy: userId,
        }));
        await Task.insertMany(tasksToInsert);
      }
    } else {
      const docIndex = inMemoryStore.documents.findIndex((d) => d._id === documentId);
      if (docIndex !== -1) {
        inMemoryStore.documents[docIndex].status = 'completed';
        inMemoryStore.documents[docIndex].summary = aiResult.summary;
        inMemoryStore.documents[docIndex].deadlines = aiResult.deadlines;
        updatedDoc = inMemoryStore.documents[docIndex];
      }

      if (aiResult.tasks && aiResult.tasks.length > 0) {
        aiResult.tasks.forEach((t) => {
          inMemoryStore.tasks.push({
            _id: `mem_tsk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            documentId,
            title: t.title,
            description: t.description || '',
            priority: t.priority,
            status: 'todo',
            dueDate: t.dueDate || '',
            createdBy: userId,
            createdAt: new Date(),
          });
        });
      }
    }

    // Step 6: Cache in Redis
    await cacheSet(`doc_analysis_${documentId}`, JSON.stringify(aiResult), 86400);

    // Step 7: Send final SSE notification
    sseService.sendProgress(documentId, {
      status: 'completed',
      progress: 100,
      message: 'Document analysis complete!',
      payload: updatedDoc,
    });
  } catch (error) {
    console.error(`[Pipeline] Failed processing document ${documentId}:`, error);

    if (isDbConnected) {
      await DocumentModel.findByIdAndUpdate(documentId, {
        status: 'failed',
        errorMessage: (error as Error).message,
      });
    } else {
      const doc = inMemoryStore.documents.find((d) => d._id === documentId);
      if (doc) {
        doc.status = 'failed';
        doc.errorMessage = (error as Error).message;
      }
    }

    sseService.sendProgress(documentId, {
      status: 'failed',
      progress: 0,
      message: `Analysis failed: ${(error as Error).message}`,
    });
  }
};
