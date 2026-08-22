import { Schema, model, Document } from 'mongoose';

export interface ITask extends Document {
  documentId: Schema.Types.ObjectId;
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: string;
  assignedTo?: Schema.Types.ObjectId;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    title: { type: String, required: true },
    description: { type: String },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
    dueDate: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Task = model<ITask>('Task', TaskSchema);
