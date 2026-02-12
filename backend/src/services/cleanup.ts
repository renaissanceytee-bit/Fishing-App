import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function cleanupExpiredSessions() {
  console.log('Running cleanup tasks...');

  try {
    // Clean up expired weather cache
    await prisma.weatherCache.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    });

    // Update tournament statuses
    await prisma.tournament.updateMany({
      where: {
        status: 'UPCOMING',
        startDate: { lte: new Date() }
      },
      data: { status: 'ACTIVE' }
    });

    await prisma.tournament.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: { lte: new Date() }
      },
      data: { status: 'COMPLETED' }
    });

    // Update expired subscriptions
    await prisma.user.updateMany({
      where: {
        subscriptionExpiry: { lt: new Date() },
        subscriptionTier: { not: 'FREE' }
      },
      data: {
        subscriptionTier: 'FREE',
        subscriptionExpiry: null
      }
    });

    console.log('Cleanup tasks completed');
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

export async function checkAchievements(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      catches: true,
      achievements: true
    }
  });

  if (!user) return;

  const achievements = await prisma.achievement.findMany();

  for (const achievement of achievements) {
    // Check if user already has this achievement
    const hasAchievement = user.achievements.some(
      ua => ua.achievementId === achievement.id
    );

    if (hasAchievement) continue;

    // Check if user meets requirements
    let unlocked = false;

    switch (achievement.category) {
      case 'catch':
        if (achievement.requirement.type === 'total_catches') {
          unlocked = user.catches.length >= achievement.requirement.count;
        } else if (achievement.requirement.type === 'species_count') {
          const uniqueSpecies = new Set(user.catches.map(c => c.speciesId)).size;
          unlocked = uniqueSpecies >= achievement.requirement.count;
        }
        break;

      case 'conservation':
        if (achievement.requirement.type === 'release_count') {
          const released = user.catches.filter(c => c.isReleased).length;
          unlocked = released >= achievement.requirement.count;
        }
        break;
    }

    if (unlocked) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id
        }
      });
    }
  }
}
