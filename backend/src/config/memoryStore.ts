import { IUser } from '../models/User';
import { IDocument } from '../models/Document';
import { ITask } from '../models/Task';
import { ITeamMember } from '../models/TeamMember';

export const inMemoryStore = {
  users: [] as any[],
  documents: [] as any[],
  tasks: [] as any[],
  teamMembers: [] as any[],
  activityLogs: [] as any[],
};
