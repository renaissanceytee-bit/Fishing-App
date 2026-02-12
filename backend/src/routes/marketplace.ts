import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get marketplace items
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { category, isRental, latitude, longitude, radius } = req.query;

    let items;

    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);
      const radiusKm = parseFloat((radius as string) || '50');

      const latDelta = radiusKm / 111;
      const lonDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

      items = await prisma.marketplaceItem.findMany({
        where: {
          isSold: false,
          ...(category && { category: category as string }),
          ...(isRental && { isRental: isRental === 'true' }),
          latitude: { gte: lat - latDelta, lte: lat + latDelta },
          longitude: { gte: lon - lonDelta, lte: lon + lonDelta }
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
    } else {
      items = await prisma.marketplaceItem.findMany({
        where: {
          isSold: false,
          ...(category && { category: category as string }),
          ...(isRental && { isRental: isRental === 'true' })
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
        orderBy: { createdAt: 'desc' },
        take: 50
      });
    }

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch marketplace items' });
  }
});

// Create listing
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const {
      title,
      description,
      category,
      condition,
      price,
      isRental,
      rentalPrice,
      rentalPeriod,
      photos,
      location,
      latitude,
      longitude
    } = req.body;

    const item = await prisma.marketplaceItem.create({
      data: {
        userId: req.userId!,
        title,
        description,
        category,
        condition,
        price: parseFloat(price),
        isRental: isRental || false,
        rentalPrice: rentalPrice ? parseFloat(rentalPrice) : undefined,
        rentalPeriod,
        photos,
        location,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined
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

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Mark as sold
router.patch('/:id/sold', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.marketplaceItem.findUnique({
      where: { id }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.marketplaceItem.update({
      where: { id },
      data: { isSold: true }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete listing
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.marketplaceItem.findUnique({
      where: { id }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.marketplaceItem.delete({
      where: { id }
    });

    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

export default router;
