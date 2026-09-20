import express from 'express';
import Project from '../models/Project.js';
import { Compensation, LegalCase, Rehabilitation } from '../models/Records.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/overview', async (_req, res, next) => {
  try {
    const [projects, compensation, legalCases] = await Promise.all([
      Project.find({ deleted: { $ne: true } }),
      Compensation.find(),
      LegalCase.find()
    ]);
    res.json({
      totalProjects: projects.length,
      highRiskProjects: projects.filter((p) => p.prediction?.riskScore >= 61).length,
      delayedProjects: projects.filter((p) => p.prediction?.delayProbability >= 55).length,
      averageRiskScore: Math.round(projects.reduce((s, p) => s + (p.prediction?.riskScore || 0), 0) / Math.max(projects.length, 1)),
      totalAffectedLandowners: compensation.length,
      pendingCompensation: compensation.filter((c) => c.status !== 'Paid').length,
      legalDisputes: legalCases.length,
      rehabilitationPending: projects.reduce((s, p) => s + (p.rehabilitationPending || 0), 0)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/compensation', async (_req, res, next) => {
  try {
    const records = await Compensation.find();
    res.json({ records, paid: records.filter((r) => r.status === 'Paid').length, pending: records.filter((r) => r.status !== 'Paid').length });
  } catch (error) {
    next(error);
  }
});

router.get('/delays', async (_req, res, next) => {
  try {
    const projects = await Project.find({ deleted: { $ne: true } });
    res.json(projects.map((p) => ({ projectId: p.projectId, riskScore: p.prediction?.riskScore, delayProbability: p.prediction?.delayProbability, expectedDelay: p.prediction?.expectedDelay })));
  } catch (error) {
    next(error);
  }
});

router.get('/districts', async (_req, res, next) => {
  try {
    const projects = await Project.find({ deleted: { $ne: true } });
    const rows = Object.values(projects.reduce((acc, p) => {
      acc[p.district] ||= { district: p.district, projects: 0, highRisk: 0, risk: 0, pendingPayments: 0 };
      acc[p.district].projects += 1;
      acc[p.district].highRisk += p.prediction?.riskScore >= 61 ? 1 : 0;
      acc[p.district].risk += p.prediction?.riskScore || 0;
      acc[p.district].pendingPayments += p.pendingLandowners || 0;
      return acc;
    }, {}));
    res.json(rows.map((row) => ({ ...row, avgRisk: Math.round(row.risk / row.projects) })));
  } catch (error) {
    next(error);
  }
});

router.get('/states', async (_req, res, next) => {
  try {
    const projects = await Project.find({ deleted: { $ne: true } });
    const rows = Object.values(projects.reduce((acc, p) => {
      acc[p.state] ||= { state: p.state, projects: 0, landRequired: 0, landAcquired: 0, affectedFamilies: 0, compensationPending: 0, highRiskProjects: 0, legalDisputes: 0 };
      acc[p.state].projects += 1;
      acc[p.state].landRequired += p.landRequired || 0;
      acc[p.state].landAcquired += p.landAcquired || 0;
      acc[p.state].affectedFamilies += p.affectedFamilies || 0;
      acc[p.state].compensationPending += p.pendingCompensation || 0;
      acc[p.state].highRiskProjects += p.prediction?.riskScore >= 61 ? 1 : 0;
      acc[p.state].legalDisputes += p.activeLegalCases || 0;
      return acc;
    }, {}));
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

export default router;
