const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Pricing = require('./models/Pricing');
const Booking = require('./models/Booking');
const Match = require('./models/Match');

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected. Starting database seed...');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Pricing.deleteMany({});
    await Booking.deleteMany({});
    await Match.deleteMany({});

    // Seed Pricing
    console.log('Seeding pricing data...');
    const pricingData = [
      {
        gameType: 'pool',
        pricePerHour: 90,
        currency: '₹',
        isActive: true
      },
      {
        gameType: 'snooker',
        pricePerHour: 180,
        currency: '₹',
        isActive: true
      }
    ];

    await Pricing.insertMany(pricingData);
    console.log('✓ Pricing data seeded');

    // Seed Demo Users
    console.log('Seeding demo users...');
    const users = [
      {
        mobile: '9876543210',
        name: 'Demo User',
        role: 'customer',
        isActive: true
      },
      {
        mobile: '9876543211',
        name: 'John Doe',
        role: 'customer',
        isActive: true
      },
      {
        mobile: '9876543212',
        name: 'Jane Smith',
        role: 'customer',
        isActive: true
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('✓ Demo users seeded');

    // Seed Sample Bookings and Matches
    console.log('Seeding sample bookings and matches...');
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Past completed matches
    const pastBookings = [
      {
        user: createdUsers[0]._id,
        gameType: 'pool',
        bookingDate: twoDaysAgo,
        startTime: '14:00',
        duration: 2,
        endTime: '16:00',
        pricePerHour: 90,
        totalAmount: 180,
        status: 'completed',
        playerName: 'Demo User'
      },
      {
        user: createdUsers[0]._id,
        gameType: 'snooker',
        bookingDate: yesterday,
        startTime: '18:00',
        duration: 1,
        endTime: '19:00',
        pricePerHour: 180,
        totalAmount: 180,
        status: 'completed',
        playerName: 'Demo User'
      }
    ];

    const createdBookings = await Booking.insertMany(pastBookings);

    // Create corresponding matches
    const pastMatches = [
      {
        booking: createdBookings[0]._id,
        user: createdUsers[0]._id,
        playerName: 'Demo User',
        gameType: 'pool',
        startTime: new Date(twoDaysAgo.setHours(14, 0, 0, 0)),
        endTime: new Date(twoDaysAgo.setHours(16, 0, 0, 0)),
        duration: 2,
        amountPaid: 180,
        status: 'completed'
      },
      {
        booking: createdBookings[1]._id,
        user: createdUsers[0]._id,
        playerName: 'Demo User',
        gameType: 'snooker',
        startTime: new Date(yesterday.setHours(18, 0, 0, 0)),
        endTime: new Date(yesterday.setHours(19, 0, 0, 0)),
        duration: 1,
        amountPaid: 180,
        status: 'completed'
      }
    ];

    await Match.insertMany(pastMatches);

    // Ongoing match
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const ongoingBooking = new Booking({
      user: createdUsers[1]._id,
      gameType: 'pool',
      bookingDate: today,
      startTime: `${String(now.getHours()).padStart(2, '0')}:00`,
      duration: 1,
      endTime: `${String(oneHourLater.getHours()).padStart(2, '0')}:00`,
      pricePerHour: 90,
      totalAmount: 90,
      status: 'ongoing',
      playerName: 'John Doe'
    });

    await ongoingBooking.save();

    const ongoingMatch = new Match({
      booking: ongoingBooking._id,
      user: createdUsers[1]._id,
      playerName: 'John Doe',
      gameType: 'pool',
      startTime: now,
      endTime: oneHourLater,
      duration: 1,
      amountPaid: 90,
      status: 'ongoing'
    });

    await ongoingMatch.save();

    console.log('✓ Sample bookings and matches seeded');

    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║   Database seeded successfully! 🎉   ║');
    console.log('╚═══════════════════════════════════════╝\n');

    console.log('Demo Credentials:');
    console.log('─────────────────────────────────────');
    console.log('Mobile: 9876543210');
    console.log('OTP: 1234 (mock OTP)');
    console.log('─────────────────────────────────────\n');

    console.log('Pricing:');
    console.log('Pool Table: ₹90/hour');
    console.log('Snooker Table: ₹180/hour\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedDatabase();
