import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get locations
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { latitude, longitude, radius, type } = req.query;

    let locations;

    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);
      const radiusKm = parseFloat((radius as string) || '50');

      const latDelta = radiusKm / 111;
      const lonDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

      locations = await prisma.location.findMany({
        where: {
          latitude: { gte: lat - latDelta, lte: lat + latDelta },
          longitude: { gte: lon - lonDelta, lte: lon + lonDelta },
          ...(type && { locationType: type as string })
        },
        orderBy: { averageRating: 'desc' }
      });
    } else {
      locations = await prisma.location.findMany({
        where: type ? { locationType: type as string } : {},
        orderBy: { averageRating: 'desc' },
        take: 50
      });
    }

    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Create location
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const {
      name,
      description,
      latitude,
      longitude,
      waterBody,
      locationType,
      facilities,
      accessibility,
      photos,
      regulations
    } = req.body;

    const location = await prisma.location.create({
      data: {
        name,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        waterBody,
        locationType,
        facilities,
        accessibility,
        photos,
        regulations
      }
    });

    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// Rate location
router.post('/:id/rate', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { rating, review, photos } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const ratingRecord = await prisma.rating.upsert({
      where: {
        userId_targetType_targetId: {
          userId: req.userId!,
          targetType: 'location',
          targetId: id
        }
      },
      update: { rating, review, photos },
      create: {
        userId: req.userId!,
        targetType: 'location',
        targetId: id,
        rating,
        review,
        photos
      }
    });

    // Update location average rating
    const allRatings = await prisma.rating.findMany({
      where: {
        targetType: 'location',
        targetId: id
      }
    });

    const avgRating = allRatings.reduce((acc, r) => acc + r.rating, 0) / allRatings.length;

    await prisma.location.update({
      where: { id },
      data: {
        averageRating: avgRating,
        totalRatings: allRatings.length
      }
    });

    res.json(ratingRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to rate location' });
  }
});

// Get location ratings
router.get('/:id/ratings', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const ratings = await prisma.rating.findMany({
      where: {
        targetType: 'location',
        targetId: id
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

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

export default router;
