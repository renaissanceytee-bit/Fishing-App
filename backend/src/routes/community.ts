import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get clubs
router.get('/clubs', authenticate, async (req: AuthRequest, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    let clubs;

    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);
      const radiusKm = parseFloat((radius as string) || '50');

      const latDelta = radiusKm / 111;
      const lonDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

      clubs = await prisma.club.findMany({
        where: {
          latitude: { gte: lat - latDelta, lte: lat + latDelta },
          longitude: { gte: lon - lonDelta, lte: lon + lonDelta }
        },
        include: {
          _count: {
            select: { members: true }
          }
        }
      });
    } else {
      clubs = await prisma.club.findMany({
        include: {
          _count: {
            select: { members: true }
          }
        },
        take: 50
      });
    }

    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
});

// Create club
router.post('/clubs', authenticate, async (req: AuthRequest, res) => {
  try {
    const {
      name,
      description,
      location,
      latitude,
      longitude,
      isPublic
    } = req.body;

    const club = await prisma.club.create({
      data: {
        name,
        description,
        location,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        isPublic: isPublic !== false,
        members: {
          create: {
            userId: req.userId!,
            role: 'admin'
          }
        }
      }
    });

    res.status(201).json(club);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create club' });
  }
});

// Join club
router.post('/clubs/:id/join', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const membership = await prisma.clubMember.create({
      data: {
        userId: req.userId!,
        clubId: id
      }
    });

    res.status(201).json(membership);
  } catch (error) {
    res.status(500).json({ error: 'Failed to join club' });
  }
});

// Get events
router.get('/events', authenticate, async (req: AuthRequest, res) => {
  try {
    const { type, upcoming } = req.query;

    const events = await prisma.event.findMany({
      where: {
        ...(type && { eventType: type as string }),
        ...(upcoming === 'true' && { startDate: { gte: new Date() } })
      },
      include: {
        club: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create event
router.post('/events', authenticate, async (req: AuthRequest, res) => {
  try {
    const {
      clubId,
      title,
      description,
      eventType,
      startDate,
      endDate,
      location,
      latitude,
      longitude,
      maxParticipants
    } = req.body;

    const event = await prisma.event.create({
      data: {
        clubId,
        title,
        description,
        eventType,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        location,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined
      }
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Get mentorship opportunities
router.get('/mentorship', authenticate, async (req: AuthRequest, res) => {
  try {
    const mentorships = await prisma.mentorship.findMany({
      where: {
        OR: [
          { mentorId: req.userId! },
          { menteeId: req.userId! }
        ]
      },
      include: {
        mentor: {
          select: {
            id: true,
            username: true,
            avatar: true,
            fullName: true
          }
        },
        mentee: {
          select: {
            id: true,
            username: true,
            avatar: true,
            fullName: true
          }
        }
      }
    });

    res.json(mentorships);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentorships' });
  }
});

// Request mentorship
router.post('/mentorship/request', authenticate, async (req: AuthRequest, res) => {
  try {
    const { mentorId, specialty } = req.body;

    const mentorship = await prisma.mentorship.create({
      data: {
        mentorId,
        menteeId: req.userId!,
        specialty,
        status: 'pending'
      },
      include: {
        mentor: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(mentorship);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mentorship request' });
  }
});

export default router;
