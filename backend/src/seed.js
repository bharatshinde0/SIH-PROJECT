import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({ email: { $in: ['admin@landrisk.demo', 'viewer@landrisk.demo'] } });
  await User.insertMany([
    {
      name: 'Admin User',
      email: 'admin@landrisk.demo',
      passwordHash: await bcrypt.hash('Admin@123', 12),
      role: 'ADMIN',
      department: 'Demo Administration',
      state: 'All',
      district: 'All'
    },
    {
      name: 'Viewer User',
      email: 'viewer@landrisk.demo',
      passwordHash: await bcrypt.hash('Viewer@123', 12),
      role: 'VIEWER',
      department: 'Demo Monitoring',
      state: 'Maharashtra',
      district: 'Nashik'
    }
  ]);
  console.log('Seeded demo users. Import synthetic operational data through frontend demo or CSV pipeline.');
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
