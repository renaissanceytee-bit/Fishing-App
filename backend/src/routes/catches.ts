import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { uploadMedia } from '../services/upload';

const router = express.Router();
const prisma = new PrismaClient();

// Create catch
router.post('/', authenticate, uploadMedia.array('media', 10), async (req: AuthRequest, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const photos = files?.filter(f => f.mimetype.startsWith('image/')).map(f => f.path) || [];
    const videos = files?.filter(f => f.mimetype.startsWith('video/')).map(f => f.path) || [];

    const catchData = {
      userId: req.userId!,
      speciesId: req.body.speciesId,
      customSpecies: req.body.customSpecies,
      weight: req.body.weight ? parseFloat(req.body.weight) : undefined,
      length: req.body.length ? parseFloat(req.body.length) : undefined,
      latitude: parseFloat(req.body.latitude),
      longitude: parseFloat(req.body.longitude),
      locationName: req.body.locationName,
      waterBody: req.body.waterBody,
      waterDepth: req.body.waterDepth ? parseFloat(req.body.waterDepth) : undefined,
      waterTemp: req.body.waterTemp ? parseFloat(req.body.waterTemp) : undefined,
      technique: req.body.technique,
      bait: req.body.bait,
      lure: req.body.lure,
      weather: req.body.weather ? JSON.parse(req.body.weather) : undefined,
      moonPhase: req.body.moonPhase,
      visibility: req.body.visibility || 'PUBLIC',
      description: req.body.description,
      isReleased: req.body.isReleased === 'true',
      photos,
      videos
    };

    const newCatch = await prisma.catch.create({
      data: catchData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        species: true
      }
    });

    // Update conservation score if released
    if (catchData.isReleased) {
      await prisma.user.update({
        where: { id: req.userId! },
        data: { environmentScore: { increment: 10 } }
      });
    }

    res.status(201).json(newCatch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create catch' });
  }
});

// Get catches feed
router.get('/feed', authenticate, async (req: AuthRequest, res) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const catches = await prisma.catch.findMany({
      where: { visibility: 'PUBLIC' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        species: true,
        likes: {
          where: { userId: req.userId! },
          select: { id: true }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      skip,
      take: parseInt(limit as string)
    });

    res.json(catches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch catches' });
  }
});

// Get nearby catches
router.get('/nearby', authenticate, async (req: AuthRequest, res) => {
  try {
    const { latitude, longitude, radius = '50' } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location required' });
    }

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    const radiusKm = parseFloat(radius as string);

    // Simple bounding box search (for production, use PostGIS)
    const latDelta = radiusKm / 111; // Approximate km per degree
    const lonDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    const catches = await prisma.catch.findMany({
      where: {
        visibility: 'PUBLIC',
        latitude: {
          gte: lat - latDelta,
          lte: lat + latDelta
        },
        longitude: {
          gte: lon - lonDelta,
          lte: lon + lonDelta
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        species: true
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    res.json(catches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nearby catches' });
  }
});

// Get user's catches
router.get('/user/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const isOwnProfile = userId === req.userId;

    const catches = await prisma.catch.findMany({
      where: {
        userId,
        ...(isOwnProfile ? {} : { visibility: 'PUBLIC' })
      },
      include: {
        species: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    res.json(catches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user catches' });
  }
});

// Get catch statistics
router.get('/stats', authenticate, async (req: AuthRequest, res) => {
  try {
    const stats = await prisma.catch.aggregate({
      where: { userId: req.userId! },
      _count: true,
      _avg: {
        weight: true,
        length: true
      },
      _max: {
        weight: true,
        length: true
      }
    });

    const speciesCount = await prisma.catch.groupBy({
      by: ['speciesId'],
      where: { userId: req.userId! },
      _count: true
    });

    const releasedCount = await prisma.catch.count({
      where: {
        userId: req.userId!,
        isReleased: true
      }
    });

    res.json({
      totalCatches: stats._count,
      averageWeight: stats._avg.weight,
      averageLength: stats._avg.length,
      biggestWeight: stats._max.weight,
      biggestLength: stats._max.length,
      uniqueSpecies: speciesCount.length,
      releasedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Delete catch
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const catchRecord = await prisma.catch.findUnique({
      where: { id }
    });

    if (!catchRecord) {
      return res.status(404).json({ error: 'Catch not found' });
    }

    if (catchRecord.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.catch.delete({
      where: { id }
    });

    res.json({ message: 'Catch deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete catch' });
  }
});

export default router;
