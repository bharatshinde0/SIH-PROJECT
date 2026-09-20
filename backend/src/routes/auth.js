import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

function tokenFor(user) {
  return jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET || 'development-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
}

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase(), status: 'Active' });
    if (!user || !await bcrypt.compare(password, user.passwordHash)) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: tokenFor(user), user: { name: user.name, email: user.email, role: user.role, state: user.state, district: user.district } });
  } catch (error) {
    next(error);
  }
});

router.post('/register', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({ ...req.body, passwordHash });
    res.status(201).json({ id: user._id, email: user.email, role: user.role });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
