import { Schema, model, Document } from 'mongoose';

export interface ITeamMember extends Document {
  documentId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  role: 'Owner' | 'Editor' | 'Viewer';
  invitedBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['Owner', 'Editor', 'Viewer'], default: 'Editor' },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

TeamMemberSchema.index({ documentId: 1, userId: 1 }, { unique: true });

export const TeamMember = model<ITeamMember>('TeamMember', TeamMemberSchema);
