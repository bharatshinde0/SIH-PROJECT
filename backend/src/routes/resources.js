import express from 'express';
import { Alert, AuditLog, Compensation, LegalCase, Rehabilitation } from '../models/Records.js';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { writeAudit } from '../utils/audit.js';

const router = express.Router();
router.use(requireAuth);

router.get('/landowners', async (_req, res, next) => {
  try { res.json(await Compensation.find().sort({ updatedAt: -1 })); } catch (error) { next(error); }
});
router.get('/landowners/:id', async (req, res, next) => {
  try { res.json(await Compensation.findOne({ landownerId: req.params.id })); } catch (error) { next(error); }
});
router.get('/compensation', async (_req, res, next) => {
  try { res.json(await Compensation.find().sort({ updatedAt: -1 })); } catch (error) { next(error); }
});
router.put('/compensation/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const previous = await Compensation.findById(req.params.id);
    const updated = await Compensation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await writeAudit(req, 'Updated compensation record', 'Compensation', req.params.id, previous, updated);
    res.json(updated);
  } catch (error) { next(error); }
});
router.get('/legal-cases', async (_req, res, next) => {
  try { res.json(await LegalCase.find().sort({ pendingDays: -1 })); } catch (error) { next(error); }
});
router.get('/rehabilitation', async (_req, res, next) => {
  try { res.json(await Rehabilitation.find()); } catch (error) { next(error); }
});
router.get('/alerts', async (_req, res, next) => {
  try { res.json(await Alert.find().sort({ createdAt: -1 })); } catch (error) { next(error); }
});
router.put('/alerts/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const previous = await Alert.findById(req.params.id);
    const updated = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await writeAudit(req, 'Updated alert', 'Alert', req.params.id, previous, updated);
    res.json(updated);
  } catch (error) { next(error); }
});
router.get('/users', requireRole('ADMIN'), async (_req, res, next) => {
  try { res.json(await User.find().select('-passwordHash')); } catch (error) { next(error); }
});
router.put('/users/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const previous = await User.findById(req.params.id).select('-passwordHash');
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-passwordHash');
    await writeAudit(req, 'Updated user account', 'User', req.params.id, previous, updated);
    res.json(updated);
  } catch (error) { next(error); }
});
router.get('/audit-logs', requireRole('ADMIN'), async (_req, res, next) => {
  try { res.json(await AuditLog.find().sort({ createdAt: -1 })); } catch (error) { next(error); }
});

export default router;
