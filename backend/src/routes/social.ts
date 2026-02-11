import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Follow user
router.post('/follow/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const follow = await prisma.follow.create({
      data: {
        followerId: req.userId!,
        followingId: userId
      }
    });

    res.status(201).json(follow);
  } catch (error) {
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow user
router.delete('/follow/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: req.userId!,
          followingId: userId
        }
      }
    });

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get followers
router.get('/followers/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true
          }
        }
      }
    });

    res.json(followers.map(f => f.follower));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

// Like catch/post
router.post('/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const { catchId, postId } = req.body;

    if (!catchId && !postId) {
      return res.status(400).json({ error: 'Either catchId or postId required' });
    }

    const like = await prisma.like.create({
      data: {
        userId: req.userId!,
        catchId,
        postId
      }
    });

    res.status(201).json(like);
  } catch (error) {
    res.status(500).json({ error: 'Failed to like' });
  }
});

// Unlike
router.delete('/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const { catchId, postId } = req.body;

    await prisma.like.deleteMany({
      where: {
        userId: req.userId!,
        ...(catchId && { catchId }),
        ...(postId && { postId })
      }
    });

    res.json({ message: 'Unliked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unlike' });
  }
});

// Comment on catch/post
router.post('/comment', authenticate, async (req: AuthRequest, res) => {
  try {
    const { catchId, postId, content } = req.body;

    if (!catchId && !postId) {
      return res.status(400).json({ error: 'Either catchId or postId required' });
    }

    const comment = await prisma.comment.create({
      data: {
        userId: req.userId!,
        catchId,
        postId,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to comment' });
  }
});

// Get comments
router.get('/comments', authenticate, async (req: AuthRequest, res) => {
  try {
    const { catchId, postId } = req.query;

    const comments = await prisma.comment.findMany({
      where: {
        ...(catchId && { catchId: catchId as string }),
        ...(postId && { postId: postId as string })
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create post
router.post('/posts', authenticate, async (req: AuthRequest, res) => {
  try {
    const { content, type, media, latitude, longitude } = req.body;

    const post = await prisma.post.create({
      data: {
        userId: req.userId!,
        content,
        type: type || 'post',
        media: media || [],
        latitude,
        longitude
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get feed
router.get('/feed', authenticate, async (req: AuthRequest, res) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string)
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

export default router;
