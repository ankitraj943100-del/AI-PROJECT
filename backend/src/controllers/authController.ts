import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/env';
import { AuthRequest } from '../middleware/auth';
import { isDbConnected } from '../config/db';
import { inMemoryStore } from '../config/memoryStore';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase();
    const passwordHash = await bcrypt.hash(password, 10);

    let newUser: any;

    if (isDbConnected) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        res.status(400).json({ message: 'An account with this email already exists.' });
        return;
      }
      newUser = await User.create({
        name,
        email: normalizedEmail,
        passwordHash,
      });
    } else {
      // In-Memory store fallback
      const existing = inMemoryStore.users.find((u) => u.email === normalizedEmail);
      if (existing) {
        res.status(400).json({ message: 'An account with this email already exists.' });
        return;
      }
      newUser = {
        _id: `mem_usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name,
        email: normalizedEmail,
        passwordHash,
        role: 'user',
        createdAt: new Date(),
      };
      inMemoryStore.users.push(newUser);
    }

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('[authController] Register error:', error);
    res.status(500).json({ message: 'Registration failed.', error: (error as Error).message });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase();
    let user: any;

    if (isDbConnected) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = inMemoryStore.users.find((u) => u.email === normalizedEmail);
    }

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[authController] Login error:', error);
    res.status(500).json({ message: 'Login failed.', error: (error as Error).message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    let user: any;
    if (isDbConnected) {
      user = await User.findById(req.user.userId).select('-passwordHash');
    } else {
      user = inMemoryStore.users.find((u) => u._id === req.user?.userId);
    }

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
};
