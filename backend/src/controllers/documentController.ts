import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DocumentModel } from '../models/Document';
import { storePdfFile } from '../services/s3Service';
import { publishPdfUploadEvent } from '../services/eventPipeline';
import { sseService } from '../services/sseService';
import { TeamMember } from '../models/TeamMember';
import { Task } from '../models/Task';
import { isDbConnected } from '../config/db';
import { inMemoryStore } from '../config/memoryStore';

export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No PDF file uploaded.' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { fileUrl, filePath } = await storePdfFile(req.file);
    const docTitle = req.body.title || req.file.originalname.replace(/\.pdf$/i, '');

    let document: any;

    if (isDbConnected) {
      document = await DocumentModel.create({
        title: docTitle,
        originalName: req.file.originalname,
        fileUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        ownerId: req.user.userId,
        status: 'pending',
      });

      await TeamMember.create({
        documentId: document._id,
        userId: req.user.userId,
        role: 'Owner',
        invitedBy: req.user.userId,
      });
    } else {
      document = {
        _id: `mem_doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title: docTitle,
        originalName: req.file.originalname,
        fileUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        ownerId: req.user.userId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryStore.documents.unshift(document);

      const ownerMember = {
        _id: `mem_tm_${Date.now()}`,
        documentId: document._id,
        userId: req.user.userId,
        role: 'Owner',
        invitedBy: req.user.userId,
        createdAt: new Date(),
      };
      inMemoryStore.teamMembers.push(ownerMember);
    }

    // Trigger async processing event pipeline
    await publishPdfUploadEvent({
      documentId: document._id.toString(),
      filePath,
      userId: req.user.userId,
    });

    res.status(201).json({
      message: 'Document uploaded successfully. AI processing pipeline triggered.',
      document,
    });
  } catch (error) {
    console.error('[documentController] Upload error:', error);
    res.status(500).json({ message: 'Document upload failed.', error: (error as Error).message });
  }
};

export const getDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    let documents: any[];

    if (isDbConnected) {
      const teamMemberships = await TeamMember.find({ userId: req.user.userId });
      const docIds = teamMemberships.map((m) => m.documentId);
      documents = await DocumentModel.find({
        $or: [{ ownerId: req.user.userId }, { _id: { $in: docIds } }],
      }).sort({ createdAt: -1 });
    } else {
      documents = inMemoryStore.documents.filter(
        (d) => d.ownerId === req.user?.userId || inMemoryStore.teamMembers.some((m) => m.documentId === d._id && m.userId === req.user?.userId)
      );
    }

    res.json({ documents });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch documents.' });
  }
};

export const getDocumentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let document: any;
    let tasks: any[];
    let teamMembers: any[];

    if (isDbConnected) {
      document = await DocumentModel.findById(id).populate('ownerId', 'name email avatar');
      tasks = await Task.find({ documentId: id }).populate('assignedTo', 'name email avatar');
      teamMembers = await TeamMember.find({ documentId: id }).populate('userId', 'name email avatar');
    } else {
      document = inMemoryStore.documents.find((d) => d._id === id);
      tasks = inMemoryStore.tasks
        .filter((t) => t.documentId === id)
        .map((t) => ({
          ...t,
          assignedTo: inMemoryStore.users.find((u) => u._id === t.assignedTo) || null,
        }));
      teamMembers = inMemoryStore.teamMembers
        .filter((m) => m.documentId === id)
        .map((m) => ({
          ...m,
          userId: inMemoryStore.users.find((u) => u._id === m.userId) || { name: 'User', email: 'user@example.com' },
        }));
    }

    if (!document) {
      res.status(404).json({ message: 'Document not found.' });
      return;
    }

    res.json({ document, tasks, teamMembers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch document details.' });
  }
};

export const streamDocumentProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  sseService.addClient(id, res);

  res.write(`data: ${JSON.stringify({ status: 'connected', message: 'SSE Stream Active' })}\n\n`);
};
