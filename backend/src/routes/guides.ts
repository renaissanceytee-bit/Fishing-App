import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get guides
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { location, specialty, latitude, longitude, radius } = req.query;

    let guides;

    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);
      const radiusKm = parseFloat((radius as string) || '100');

      const latDelta = radiusKm / 111;
      const lonDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

      guides = await prisma.guide.findMany({
        where: {
          latitude: { gte: lat - latDelta, lte: lat + latDelta },
          longitude: { gte: lon - lonDelta, lte: lon + lonDelta },
          ...(specialty && { specialty: { has: specialty as string } })
        },
        orderBy: { rating: 'desc' }
      });
    } else {
      guides = await prisma.guide.findMany({
        where: {
          ...(location && { location: { contains: location as string, mode: 'insensitive' } }),
          ...(specialty && { specialty: { has: specialty as string } })
        },
        orderBy: { rating: 'desc' },
        take: 50
      });
    }

    res.json(guides);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch guides' });
  }
});

// Book guide
router.post('/:id/book', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { date, duration } = req.body;

    const guide = await prisma.guide.findUnique({
      where: { id }
    });

    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    const totalPrice = guide.hourlyRate * parseInt(duration);

    const booking = await prisma.booking.create({
      data: {
        userId: req.userId!,
        guideId: id,
        date: new Date(date),
        duration: parseInt(duration),
        totalPrice,
        status: 'pending'
      },
      include: {
        guide: true
      }
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user bookings
router.get('/bookings/my', authenticate, async (req: AuthRequest, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.userId! },
      include: {
        guide: true
      },
      orderBy: { date: 'desc' }
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Rate guide
router.post('/:id/rate', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { rating, review, photos } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user has a completed booking with this guide
    const booking = await prisma.booking.findFirst({
      where: {
        userId: req.userId!,
        guideId: id,
        status: 'completed'
      }
    });

    if (!booking) {
      return res.status(403).json({ error: 'Must complete a booking before rating' });
    }

    const ratingRecord = await prisma.rating.upsert({
      where: {
        userId_targetType_targetId: {
          userId: req.userId!,
          targetType: 'guide',
          targetId: id
        }
      },
      update: { rating, review, photos },
      create: {
        userId: req.userId!,
        targetType: 'guide',
        targetId: id,
        rating,
        review,
        photos
      }
    });

    // Update guide average rating
    const allRatings = await prisma.rating.findMany({
      where: {
        targetType: 'guide',
        targetId: id
      }
    });

    const avgRating = allRatings.reduce((acc, r) => acc + r.rating, 0) / allRatings.length;

    await prisma.guide.update({
      where: { id },
      data: { rating: avgRating }
    });

    res.json(ratingRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to rate guide' });
  }
});

export default router;
