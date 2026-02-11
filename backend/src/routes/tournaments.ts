import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get tournaments
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status } = req.query;

    const tournaments = await prisma.tournament.findMany({
      where: status ? { status: status as any } : {},
      include: {
        _count: {
          select: { entries: true }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Create tournament (admin only)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      rules,
      prizes,
      entryFee,
      location
    } = req.body;

    const tournament = await prisma.tournament.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rules,
        prizes,
        entryFee: parseFloat(entryFee || '0'),
        location
      }
    });

    res.status(201).json(tournament);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

// Join tournament
router.post('/:id/join', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const tournament = await prisma.tournament.findUnique({
      where: { id }
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.status !== 'UPCOMING') {
      return res.status(400).json({ error: 'Tournament is not open for entries' });
    }

    const entry = await prisma.tournamentEntry.create({
      data: {
        userId: req.userId!,
        tournamentId: id
      }
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to join tournament' });
  }
});

// Get tournament leaderboard
router.get('/:id/leaderboard', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const entries = await prisma.tournamentEntry.findMany({
      where: { tournamentId: id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: [
        { score: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    // Assign ranks
    const leaderboard = entries.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
