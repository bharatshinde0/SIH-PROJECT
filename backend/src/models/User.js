import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'PROJECT_MANAGER', 'DISTRICT_OFFICER', 'ANALYST', 'VIEWER'], default: 'VIEWER' },
  department: String,
  state: String,
  district: String,
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
