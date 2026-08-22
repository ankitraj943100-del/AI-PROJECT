import { Schema, model, Document } from 'mongoose';

export interface IDocument extends Document {
  title: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  ownerId: Schema.Types.ObjectId;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  summary?: {
    overview: string;
    keyHighlights: string[];
    executiveBrief: string;
  };
  deadlines?: Array<{
    title: string;
    date: string;
    description?: string;
    priority: 'High' | 'Medium' | 'Low';
  }>;
  rawText?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true },
    originalName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, default: 'application/pdf' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    summary: {
      overview: { type: String },
      keyHighlights: [{ type: String }],
      executiveBrief: { type: String },
    },
    deadlines: [
      {
        title: { type: String, required: true },
        date: { type: String, required: true },
        description: { type: String },
        priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
      },
    ],
    rawText: { type: String },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export const DocumentModel = model<IDocument>('Document', DocumentSchema);
