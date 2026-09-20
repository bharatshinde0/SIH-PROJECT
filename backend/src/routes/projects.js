import express from 'express';
import Project from '../models/Project.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { calculateRisk } from '../utils/riskEngine.js';
import { writeAudit } from '../utils/audit.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const query = { deleted: { $ne: true } };
    for (const key of ['state', 'district', 'projectType', 'currentStage']) if (req.query[key]) query[key] = req.query[key];
    const projects = await Project.find(query).sort({ updatedAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const project = await Project.findOne({ projectId: req.params.id, deleted: { $ne: true } });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.post('/', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const payload = { ...req.body, prediction: calculateRisk(req.body) };
    const project = await Project.create(payload);
    await writeAudit(req, 'Created project and calculated risk', 'Project', project.projectId, 'New record', project);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const existing = await Project.findOne({ projectId: req.params.id });
    if (!existing) return res.status(404).json({ message: 'Project not found' });
    const update = { ...req.body, prediction: calculateRisk({ ...existing.toObject(), ...req.body }) };
    const project = await Project.findOneAndUpdate({ projectId: req.params.id }, update, { new: true });
    await writeAudit(req, 'Updated project and recalculated risk', 'Project', req.params.id, existing, project);
    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate({ projectId: req.params.id }, { deleted: true, status: 'Deleted' }, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await writeAudit(req, 'Soft deleted project', 'Project', req.params.id, 'Active', 'Deleted');
    res.json({ message: 'Project soft deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
