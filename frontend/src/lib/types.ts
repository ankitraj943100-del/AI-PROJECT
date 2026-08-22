export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface Summary {
  overview: string;
  keyHighlights: string[];
  executiveBrief: string;
}

export interface Deadline {
  title: string;
  date: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface DocumentItem {
  _id: string;
  title: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  ownerId: string | User;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  summary?: Summary;
  deadlines?: Deadline[];
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  _id: string;
  documentId: string;
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: string;
  assignedTo?: User | null;
  createdBy: string;
  createdAt: string;
}

export interface TeamMemberItem {
  _id: string;
  documentId: string;
  userId: User;
  role: 'Owner' | 'Editor' | 'Viewer';
  createdAt: string;
}
