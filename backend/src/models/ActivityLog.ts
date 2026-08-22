import { Schema, model, Document } from 'mongoose';

export interface IActivityLog extends Document {
  documentId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  action: string;
  details?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    details: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ActivityLog = model<IActivityLog>('ActivityLog', ActivityLogSchema);
