import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Room } from '../models/Room.js';
import { Like } from '../models/Like.js';
import { Match } from '../models/Match.js';
import { Chat } from '../models/Chat.js';
import { connectDB, closeDB } from '../config/db.js';
import { getWeekCycleDate } from '../services/cronService.js';

dotenv.config();

export const runSeed = async () => {
  console.log('Seeding Mismatch database...');
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Room.deleteMany({}),
    Like.deleteMany({}),
    Match.deleteMany({}),
    Chat.deleteMany({}),
  ]);

  console.log('Cleared existing data.');

  // 1. Create Admin
  const admin = await User.create({
    name: 'Admin Moderator',
    email: 'admin@mismatch.com',
    password: 'admin123',
    gender: 'boy',
    role: 'admin',
    interests: ['Community', 'Moderation'],
    bio: 'Platform Overseer & Quality Curator',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminModerator',
    verificationStatus: 'verified',
    likesRemaining: 99,
    likesCarryOver: true,
  });

  // 2. Create Female Users
  const girlUsersData = [
    {
      name: 'Maya Lin',
      email: 'maya@mismatch.com',
      password: 'password123',
      gender: 'girl',
      interests: ['Gym', 'Cinephile', 'Coffee'],
      bio: 'Powerlifter by morning, A24 film marathoner by night. Looking for someone with dry humor and good coffee taste.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      likesCarryOver: true,
    },
    {
      name: 'Chloe Bennett',
      email: 'chloe@mismatch.com',
      password: 'password123',
      gender: 'girl',
      interests: ['Travel', 'Art', 'Tech'],
      bio: 'Solo traveler (28 countries and counting). Frontend designer fascinated by brutalist architecture.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      likesCarryOver: false,
    },
    {
      name: 'Sophia Zhang',
      email: 'sophia@mismatch.com',
      password: 'password123',
      gender: 'girl',
      interests: ['Cinephile', 'Tech', 'Music'],
      bio: 'Can talk for 3 hours about Villeneuve cinematography. Synthesizer enthusiast.',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
      likesCarryOver: true,
    },
    {
      name: 'Emma Watson',
      email: 'emma@mismatch.com',
      password: 'password123',
      gender: 'girl',
      interests: ['Gym', 'Travel', 'Foodie'],
      bio: 'HIIT workouts, finding hidden hole-in-the-wall ramen joints, and weekend road trips.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      likesCarryOver: false,
    },
    {
      name: 'Elena Rossi',
      email: 'elena@mismatch.com',
      password: 'password123',
      gender: 'girl',
      interests: ['Art', 'Design', 'Coffee'],
      bio: 'Ceramics maker and espresso snob. Slow mornings > loud nights.',
      avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80',
      likesCarryOver: true,
    },
  ];

  // 3. Create Male Users
  const boyUsersData = [
    {
      name: 'Alex Rivera',
      email: 'alex@mismatch.com',
      password: 'password123',
      gender: 'boy',
      interests: ['Gym', 'Travel', 'Tech'],
      bio: 'Software engineer who loves lifting heavy weights, trail running, and exploring street markets.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      likesCarryOver: false,
    },
    {
      name: 'Liam Vance',
      email: 'liam@mismatch.com',
      password: 'password123',
      gender: 'boy',
      interests: ['Cinephile', 'Art', 'Music'],
      bio: 'Scriptwriter & analog photographer. Collecting vinyl and Criterion collection films.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      likesCarryOver: true,
    },
    {
      name: 'Noah Miller',
      email: 'noah@mismatch.com',
      password: 'password123',
      gender: 'boy',
      interests: ['Tech', 'Gaming', 'Coffee'],
      bio: 'Building indie web apps, brewing pourovers, and playing competitive strategy games.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      likesCarryOver: false,
    },
    {
      name: 'Marcus Cole',
      email: 'marcus@mismatch.com',
      password: 'password123',
      gender: 'boy',
      interests: ['Gym', 'Fitness', 'Foodie'],
      bio: 'Strength coach and sourdough baker. Big believer in 8 hours of sleep and high protein meals.',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
      likesCarryOver: true,
    },
    {
      name: 'Julian Thorne',
      email: 'julian@mismatch.com',
      password: 'password123',
      gender: 'boy',
      interests: ['Travel', 'Cinephile', 'Art'],
      bio: 'Documentary maker, backcountry hiker, and landscape sketcher.',
      avatar: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=400&auto=format&fit=crop&q=80',
      likesCarryOver: true,
    },
  ];

  const girls = await User.create(girlUsersData);
  const boys = await User.create(boyUsersData);

  console.log(`Created ${girls.length} female users and ${boys.length} male users.`);

  // 4. Create Rooms
  const roomsData = [
    {
      name: 'Gym Rats & Iron Lovers',
      interestCategory: 'Gym',
      description: 'Dedicated to early morning PRs, barbell therapy, and active lifestyle discussions.',
      capacity: { girls: 25, boys: 25 },
      createdBy: admin._id,
      members: [
        { userId: girls[0]._id, gender: 'girl' }, // Maya
        { userId: girls[3]._id, gender: 'girl' }, // Emma
        { userId: boys[0]._id, gender: 'boy' },   // Alex
        { userId: boys[3]._id, gender: 'boy' },   // Marcus
      ],
    },
    {
      name: 'Cinephile Society',
      interestCategory: 'Cinephile',
      description: 'For those who appreciate 35mm film, festival screenings, and auteur directors.',
      capacity: { girls: 25, boys: 25 },
      createdBy: admin._id,
      members: [
        { userId: girls[0]._id, gender: 'girl' }, // Maya
        { userId: girls[2]._id, gender: 'girl' }, // Sophia
        { userId: boys[1]._id, gender: 'boy' },   // Liam
        { userId: boys[4]._id, gender: 'boy' },   // Julian
      ],
    },
    {
      name: 'Global Wanderers & Nomads',
      interestCategory: 'Travel',
      description: 'Exchange flight hacks, passport stamps, and off-the-beaten-path adventures.',
      capacity: { girls: 25, boys: 25 },
      createdBy: admin._id,
      members: [
        { userId: girls[1]._id, gender: 'girl' }, // Chloe
        { userId: girls[3]._id, gender: 'girl' }, // Emma
        { userId: boys[0]._id, gender: 'boy' },   // Alex
        { userId: boys[4]._id, gender: 'boy' },   // Julian
      ],
    },
    {
      name: 'Tech Founders & Builders',
      interestCategory: 'Tech',
      description: 'Late night shipping, system architecture, startups, and open source craft.',
      capacity: { girls: 25, boys: 25 },
      createdBy: admin._id,
      members: [
        { userId: girls[1]._id, gender: 'girl' }, // Chloe
        { userId: girls[2]._id, gender: 'girl' }, // Sophia
        { userId: boys[0]._id, gender: 'boy' },   // Alex
        { userId: boys[2]._id, gender: 'boy' },   // Noah
      ],
    },
    {
      name: 'Modern Art & Contemporary Design',
      interestCategory: 'Art',
      description: 'Gallery openings, visual aesthetics, industrial design, and creative sparks.',
      capacity: { girls: 25, boys: 25 },
      createdBy: admin._id,
      members: [
        { userId: girls[4]._id, gender: 'girl' }, // Elena
        { userId: boys[1]._id, gender: 'boy' },   // Liam
      ],
    },
  ];

  const rooms = await Room.create(roomsData);

  // Update users currentRoomIds
  for (const room of rooms) {
    for (const member of room.members) {
      await User.findByIdAndUpdate(member.userId, {
        $addToSet: { currentRoomIds: room._id },
      });
    }
  }

  console.log(`Created ${rooms.length} themed rooms with active member allocations.`);

  // 5. Seed a blind like from Maya to Alex in the Gym room!
  // This allows the user to log in as Alex, like Maya in Gym room, and trigger an immediate Match!
  const gymRoom = rooms[0];
  const maya = girls[0];
  const alex = boys[0];
  const weekOf = getWeekCycleDate();

  await Like.create({
    fromUserId: maya._id,
    toUserId: alex._id,
    roomId: gymRoom._id,
    weekOf,
  });
  // Decrement Maya's likesRemaining
  maya.likesRemaining = 2;
  await maya.save();

  console.log(`Pre-seeded blind like: Maya -> Alex in "${gymRoom.name}".`);
  console.log(`When you log in as Alex and like Maya, a MATCH will be triggered instantly!`);
  console.log('\n--- Demo Accounts ---');
  console.log('Admin: admin@mismatch.com / admin123');
  console.log('Boy:   alex@mismatch.com  / password123');
  console.log('Girl:  maya@mismatch.com  / password123');
  console.log('---------------------\n');
};

// If run directly via node
if (process.argv[1]?.endsWith('seed.js')) {
  runSeed()
    .then(async () => {
      console.log('Database seeding complete!');
      await closeDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Database seeding failed:', err);
      await closeDB();
      process.exit(1);
    });
}
