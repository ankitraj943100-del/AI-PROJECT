import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DocumentModel } from '../models/Document';
import { chatWithDocument } from '../services/aiService';

export const handleAiChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId, message, chatHistory } = req.body;

    if (!documentId || !message) {
      res.status(400).json({ message: 'Document ID and user message are required.' });
      return;
    }

    const document = await DocumentModel.findById(documentId);
    if (!document) {
      res.status(404).json({ message: 'Document not found.' });
      return;
    }

    const pdfText = document.rawText || document.summary?.overview || document.title;
    const aiReply = await chatWithDocument(pdfText, message, chatHistory || []);

    res.json({
      reply: aiReply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: 'AI chat failed.', error: (error as Error).message });
  }
};
