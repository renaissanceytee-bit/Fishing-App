import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean up existing data
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.catch.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tournamentEntry.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.marketplaceItem.deleteMany();
  await prisma.message.deleteMany();
  await prisma.clubMember.deleteMany();
  await prisma.club.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('🧹 Cleaned existing data');

  // Create users
  const password = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        fullName: 'John Fisher',
        username: 'johnfisher',
        email: 'john@example.com',
        password,
        bio: 'Passionate angler from Florida. Love bass fishing!',
        location: 'Miami, FL',
        subscriptionTier: 'PRO',
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'Sarah Waters',
        username: 'sarahwaters',
        email: 'sarah@example.com',
        password,
        bio: 'Fishing guide and conservationist. Catch & release advocate.',
        location: 'Seattle, WA',
        subscriptionTier: 'ELITE',
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'Mike Bass',
        username: 'mikebass',
        email: 'mike@example.com',
        password,
        bio: 'Tournament fisher. Always looking for the next big catch!',
        location: 'Austin, TX',
        subscriptionTier: 'BASIC',
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'Emily Lake',
        username: 'emilylake',
        email: 'emily@example.com',
        password,
        bio: 'Weekend warrior. Love fly fishing in mountain streams.',
        location: 'Denver, CO',
        subscriptionTier: 'FREE',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create follows
  await prisma.follow.createMany({
    data: [
      { followerId: users[0].id, followingId: users[1].id },
      { followerId: users[0].id, followingId: users[2].id },
      { followerId: users[1].id, followingId: users[0].id },
      { followerId: users[2].id, followingId: users[0].id },
      { followerId: users[3].id, followingId: users[1].id },
    ],
  });

  console.log('✅ Created follow relationships');

  // Create catches
  const catches = await Promise.all([
    prisma.catch.create({
      data: {
        userId: users[0].id,
        customSpecies: 'Largemouth Bass',
        weight: 8.5,
        length: 22,
        latitude: 25.7617,
        longitude: -80.1918,
        locationName: 'Lake Okeechobee',
        waterTemp: 75,
        bait: 'Plastic worm',
        lure: 'Texas rig',
        technique: 'Flipping',
        isReleased: true,
        photos: ['https://images.unsplash.com/photo-1545450660-42ce8da56a59?w=800'],
        visibility: 'PUBLIC',
      },
    }),
    prisma.catch.create({
      data: {
        userId: users[1].id,
        customSpecies: 'Rainbow Trout',
        weight: 3.2,
        length: 18,
        latitude: 47.6062,
        longitude: -122.3321,
        locationName: 'Green River',
        waterTemp: 55,
        bait: 'Salmon eggs',
        technique: 'Drift fishing',
        isReleased: true,
        photos: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'],
        visibility: 'PUBLIC',
      },
    }),
    prisma.catch.create({
      data: {
        userId: users[2].id,
        customSpecies: 'Striped Bass',
        weight: 15.3,
        length: 32,
        latitude: 30.2672,
        longitude: -97.7431,
        locationName: 'Lake Travis',
        waterTemp: 68,
        lure: 'Swimbait',
        technique: 'Trolling',
        isReleased: false,
        photos: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
        visibility: 'PUBLIC',
      },
    }),
    prisma.catch.create({
      data: {
        userId: users[3].id,
        customSpecies: 'Brook Trout',
        weight: 1.8,
        length: 14,
        latitude: 39.7392,
        longitude: -104.9903,
        locationName: 'Clear Creek',
        waterTemp: 52,
        technique: 'Fly fishing',
        isReleased: true,
        photos: ['https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?w=800'],
        visibility: 'PUBLIC',
      },
    }),
  ]);

  console.log(`✅ Created ${catches.length} catches`);

  // Create likes
  await prisma.like.createMany({
    data: [
      { userId: users[1].id, catchId: catches[0].id },
      { userId: users[2].id, catchId: catches[0].id },
      { userId: users[3].id, catchId: catches[0].id },
      { userId: users[0].id, catchId: catches[1].id },
      { userId: users[2].id, catchId: catches[1].id },
    ],
  });

  console.log('✅ Created likes');

  // Create comments
  await prisma.comment.createMany({
    data: [
      {
        userId: users[1].id,
        catchId: catches[0].id,
        content: 'Awesome catch! That\'s a monster bass! 🎣',
      },
      {
        userId: users[2].id,
        catchId: catches[0].id,
        content: 'Great technique! Texas rig is my go-to for bass.',
      },
      {
        userId: users[0].id,
        catchId: catches[1].id,
        content: 'Beautiful trout! Love fishing the Green River.',
      },
    ],
  });

  console.log('✅ Created comments');

  // Create posts
  await prisma.post.createMany({
    data: [
      {
        userId: users[0].id,
        content: 'Perfect morning for fishing! The water is calm and the fish are biting. 🌅🎣',
        photos: ['https://images.unsplash.com/photo-1533371452382-d45a9da51ad9?w=800'],
      },
      {
        userId: users[1].id,
        content: 'Just got back from an amazing fishing trip in Alaska. Caught my first salmon! #bucketlist',
        photos: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'],
      },
    ],
  });

  console.log('✅ Created posts');

  // Create tournaments
  const tournaments = await Promise.all([
    prisma.tournament.create({
      data: {
        title: 'Spring Bass Classic',
        description: 'Annual bass fishing tournament. Biggest catch wins!',
        startDate: new Date('2026-04-15'),
        endDate: new Date('2026-04-17'),
        status: 'UPCOMING',
        entryFee: 50,
        rules: {
          species: 'Largemouth and smallmouth bass only',
          minSize: 12,
          catchAndRelease: true
        },
        prizes: {
          first: 5000,
          second: 2500,
          third: 1000
        },
        location: 'Lake Okeechobee, FL',
      },
    }),
    prisma.tournament.create({
      data: {
        title: 'Summer Trout Challenge',
        description: 'Mountain stream trout fishing competition',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-06-30'),
        status: 'UPCOMING',
        entryFee: 0,
        rules: {
          species: 'Any trout species',
          catchAndRelease: true,
          photoRequired: true
        },
        prizes: {
          description: 'Trophy and recognition'
        },
        location: 'Colorado Rockies',
      },
    }),
  ]);

  console.log(`✅ Created ${tournaments.length} tournaments`);

  // Create tournament entries
  await prisma.tournamentEntry.createMany({
    data: [
      { tournamentId: tournaments[0].id, userId: users[0].id },
      { tournamentId: tournaments[0].id, userId: users[2].id },
      { tournamentId: tournaments[1].id, userId: users[1].id },
      { tournamentId: tournaments[1].id, userId: users[3].id },
    ],
  });

  console.log('✅ Created tournament entries');

  // Create marketplace items
  await prisma.marketplaceItem.createMany({
    data: [
      {
        sellerId: users[0].id,
        title: 'Shimano Baitcasting Reel',
        description: 'Barely used Shimano Curado DC. Perfect condition, includes case.',
        price: 249.99,
        isRental: false,
        category: 'Reels',
        condition: 'EXCELLENT',
        latitude: 25.7617,
        longitude: -80.1918,
        images: ['https://images.unsplash.com/photo-1544551763-77ef2d0cfc6d?w=800'],
      },
      {
        sellerId: users[1].id,
        title: 'Fly Fishing Rod - 9ft 5wt',
        description: 'Orvis Clearwater fly rod. Great for trout fishing.',
        price: 150,
        isRental: false,
        category: 'Rods',
        condition: 'GOOD',
        latitude: 47.6062,
        longitude: -122.3321,
        images: ['https://images.unsplash.com/photo-1535135335798-2aa587d66b1f?w=800'],
      },
      {
        sellerId: users[2].id,
        title: 'Bass Boat Rental',
        description: '18ft bass boat with trolling motor. Includes life jackets and fish finder.',
        price: 0,
        isRental: true,
        rentalPrice: 150,
        rentalPeriod: 'daily',
        category: 'Boats',
        condition: 'EXCELLENT',
        latitude: 30.2672,
        longitude: -97.7431,
        images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
      },
    ],
  });

  console.log('✅ Created marketplace items');

  // Create fishing clubs
  const clubs = await Promise.all([
    prisma.club.create({
      data: {
        name: 'Miami Bass Club',
        description: 'South Florida\'s premier bass fishing club. Monthly tournaments and meetups.',
        location: 'Miami, FL',
        isPublic: true,
      },
    }),
    prisma.club.create({
      data: {
        name: 'PNW Fly Fishers',
        description: 'Pacific Northwest fly fishing community. Conservation focused.',
        location: 'Seattle, WA',
        isPublic: true,
      },
    }),
  ]);

  console.log(`✅ Created ${clubs.length} clubs`);

  // Create club members
  await prisma.clubMember.createMany({
    data: [
      { clubId: clubs[0].id, userId: users[0].id, role: 'admin' },
      { clubId: clubs[0].id, userId: users[2].id, role: 'member' },
      { clubId: clubs[1].id, userId: users[1].id, role: 'admin' },
      { clubId: clubs[1].id, userId: users[3].id, role: 'member' },
    ],
  });

  console.log('✅ Created club memberships');

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📧 Test user credentials:');
  console.log('   Email: john@example.com');
  console.log('   Email: sarah@example.com');
  console.log('   Email: mike@example.com');
  console.log('   Email: emily@example.com');
  console.log('   Password (all): password123');
  console.log('');
  console.log('📊 Created:');
  console.log(`   • ${users.length} users`);
  console.log(`   • ${catches.length} catches`);
  console.log(`   • ${tournaments.length} tournaments`);
  console.log(`   • ${clubs.length} fishing clubs`);
  console.log('   • Likes, comments, follows, and more!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
