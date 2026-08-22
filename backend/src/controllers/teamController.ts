import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TeamMember } from '../models/TeamMember';
import { User } from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { isDbConnected } from '../config/db';
import { inMemoryStore } from '../config/memoryStore';

export const addTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId, email, role } = req.body;

    if (!documentId || !email) {
      res.status(400).json({ message: 'Document ID and user email are required.' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const normalizedEmail = email.toLowerCase();
    let targetUser: any;
    let populated: any;

    if (isDbConnected) {
      targetUser = await User.findOne({ email: normalizedEmail });
      if (!targetUser) {
        res.status(404).json({ message: 'User with this email does not exist.' });
        return;
      }

      const existingMember = await TeamMember.findOne({
        documentId,
        userId: targetUser._id,
      });

      if (existingMember) {
        res.status(400).json({ message: 'User is already a member of this document workspace.' });
        return;
      }

      const newMember = await TeamMember.create({
        documentId,
        userId: targetUser._id,
        role: role || 'Editor',
        invitedBy: req.user.userId,
      });

      await ActivityLog.create({
        documentId,
        userId: req.user.userId,
        action: 'ADD_TEAM_MEMBER',
        details: `Added ${targetUser.name} (${targetUser.email}) as ${role || 'Editor'}`,
      });

      populated = await TeamMember.findById(newMember._id).populate('userId', 'name email avatar');
    } else {
      targetUser = inMemoryStore.users.find((u) => u.email === normalizedEmail);
      if (!targetUser) {
        // Create user placeholder for local demo
        targetUser = {
          _id: `mem_usr_${Date.now()}`,
          name: email.split('@')[0],
          email: normalizedEmail,
          role: 'user',
        };
        inMemoryStore.users.push(targetUser);
      }

      const existing = inMemoryStore.teamMembers.find(
        (m) => m.documentId === documentId && m.userId === targetUser._id
      );
      if (existing) {
        res.status(400).json({ message: 'User is already a member of this document workspace.' });
        return;
      }

      const newMember = {
        _id: `mem_tm_${Date.now()}`,
        documentId,
        userId: targetUser._id,
        role: role || 'Editor',
        invitedBy: req.user.userId,
        createdAt: new Date(),
      };
      inMemoryStore.teamMembers.push(newMember);

      populated = {
        ...newMember,
        userId: targetUser,
      };
    }

    res.status(201).json({
      message: 'Team member added successfully.',
      member: populated,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add team member.', error: (error as Error).message });
  }
};

export const getTeamMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    let members: any[];

    if (isDbConnected) {
      members = await TeamMember.find({ documentId }).populate('userId', 'name email avatar');
    } else {
      members = inMemoryStore.teamMembers
        .filter((m) => m.documentId === documentId)
        .map((m) => ({
          ...m,
          userId: inMemoryStore.users.find((u) => u._id === m.userId) || { name: 'User', email: 'user@example.com' },
        }));
    }

    res.json({ members });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch team members.' });
  }
};

export const removeTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { memberId } = req.params;
    if (isDbConnected) {
      await TeamMember.findByIdAndDelete(memberId);
    } else {
      inMemoryStore.teamMembers = inMemoryStore.teamMembers.filter((m) => m._id !== memberId);
    }
    res.json({ message: 'Team member removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove team member.' });
  }
};
