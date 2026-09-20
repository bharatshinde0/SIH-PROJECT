import express from 'express';
import Project from '../models/Project.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { calculateRisk } from '../utils/riskEngine.js';
import { writeAudit } from '../utils/audit.js';

const router = express.Router();
router.use(requireAuth);

router.get('/:projectId', async (req, res, next) => {
  try {
    const project = await Project.findOne({ projectId: req.params.projectId });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project.prediction || calculateRisk(project));
  } catch (error) {
    next(error);
  }
});

router.post('/predict', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const prediction = calculateRisk(req.body);
    await writeAudit(req, 'Generated risk prediction', 'RiskPrediction', req.body.projectId || 'ad-hoc', 'Input parameters', prediction);
    res.json(prediction);
  } catch (error) {
    next(error);
  }
});

export default router;
