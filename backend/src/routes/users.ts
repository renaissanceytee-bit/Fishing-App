import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        bio: true,
        avatar: true,
        role: true,
        subscriptionTier: true,
        location: true,
        createdAt: true,
        environmentScore: true,
        _count: {
          select: {
            catches: true,
            followers: true,
            following: true
          }
        }
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get user profile
router.get('/:username', authenticate, async (req: AuthRequest, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        fullName: true,
        bio: true,
        avatar: true,
        location: true,
        createdAt: true,
        environmentScore: true,
        _count: {
          select: {
            catches: true,
            followers: true,
            following: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if current user follows this user
    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.userId!,
          followingId: user.id
        }
      }
    });

    res.json({ ...user, isFollowing: !!isFollowing });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update profile
router.patch('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const { fullName, bio, location, latitude, longitude } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.userId! },
      data: {
        fullName,
        bio,
        location,
        latitude,
        longitude
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        bio: true,
        avatar: true,
        location: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Search users
router.get('/search/query', authenticate, async (req: AuthRequest, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query required' });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q as string, mode: 'insensitive' } },
          { fullName: { contains: q as string, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatar: true,
        bio: true
      },
      take: 20
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
