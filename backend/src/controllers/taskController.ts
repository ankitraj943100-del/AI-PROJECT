import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Task } from '../models/Task';
import { isDbConnected } from '../config/db';
import { inMemoryStore } from '../config/memoryStore';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    let tasks: any[];

    if (isDbConnected) {
      tasks = await Task.find({ documentId }).populate('assignedTo', 'name email avatar');
    } else {
      tasks = inMemoryStore.tasks
        .filter((t) => t.documentId === documentId)
        .map((t) => ({
          ...t,
          assignedTo: inMemoryStore.users.find((u) => u._id === t.assignedTo) || null,
        }));
    }

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { documentId, title, description, priority, dueDate, assignedTo } = req.body;

    if (!title || !documentId) {
      res.status(400).json({ message: 'Task title and documentId are required.' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    let populatedTask: any;

    if (isDbConnected) {
      const newTask = await Task.create({
        documentId,
        title,
        description,
        priority: priority || 'Medium',
        status: 'todo',
        dueDate,
        assignedTo: assignedTo || null,
        createdBy: req.user.userId,
      });
      populatedTask = await Task.findById(newTask._id).populate('assignedTo', 'name email avatar');
    } else {
      const memTask = {
        _id: `mem_tsk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        documentId,
        title,
        description: description || '',
        priority: priority || 'Medium',
        status: 'todo',
        dueDate: dueDate || '',
        assignedTo: assignedTo || null,
        createdBy: req.user.userId,
        createdAt: new Date(),
      };
      inMemoryStore.tasks.push(memTask);
      populatedTask = {
        ...memTask,
        assignedTo: inMemoryStore.users.find((u) => u._id === assignedTo) || null,
      };
    }

    res.status(201).json({ message: 'Task created.', task: populatedTask });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task.' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { status, priority, title, description, assignedTo, dueDate } = req.body;

    let updatedTask: any;

    if (isDbConnected) {
      const task = await Task.findById(taskId);
      if (!task) {
        res.status(404).json({ message: 'Task not found.' });
        return;
      }

      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (dueDate !== undefined) task.dueDate = dueDate;

      await task.save();
      updatedTask = await Task.findById(taskId).populate('assignedTo', 'name email avatar');
    } else {
      const taskIndex = inMemoryStore.tasks.findIndex((t) => t._id === taskId);
      if (taskIndex === -1) {
        res.status(404).json({ message: 'Task not found.' });
        return;
      }

      const task = inMemoryStore.tasks[taskIndex];
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (dueDate !== undefined) task.dueDate = dueDate;

      updatedTask = {
        ...task,
        assignedTo: inMemoryStore.users.find((u) => u._id === task.assignedTo) || null,
      };
    }

    res.json({ message: 'Task updated.', task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task.' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    if (isDbConnected) {
      await Task.findByIdAndDelete(taskId);
    } else {
      inMemoryStore.tasks = inMemoryStore.tasks.filter((t) => t._id !== taskId);
    }
    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task.' });
  }
};
