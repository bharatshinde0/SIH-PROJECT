import { createContext, useContext, useMemo, useState } from 'react';
import { buildDemoData } from '../data/demoData';
import { calculateRisk } from '../utils/riskEngine';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

const initialData = () => {
  try {
    const saved = localStorage.getItem('landrisk-data');
    return saved ? JSON.parse(saved) : buildDemoData();
  } catch {
    return buildDemoData();
  }
};

const numeric = (value, fallback = 0) => {
  if (value === undefined || value === null || value === '') return Number(fallback) || 0;
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : Number(fallback) || 0;
};

const firstValue = (row, keys, fallback = '') => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') return row[key];
  }
  return fallback;
};

const activeCase = (item) => !['resolved', 'closed', 'dismissed'].includes(String(item.status || '').toLowerCase());

const withProjectMetrics = (project) => {
  const landRequired = numeric(project.landRequired);
  const landAcquired = numeric(project.landAcquired);
  const totalCompensation = numeric(project.totalCompensation);
  const paidCompensation = numeric(project.paidCompensation);
  const affectedFamilies = numeric(project.affectedFamilies);
  const eligibleFamilies = numeric(project.eligibleFamilies, Math.round(affectedFamilies * 0.6));
  const rehabilitationProgress = numeric(project.rehabilitationProgress);
  const rehabilitationCompleted = numeric(
    project.rehabilitationCompleted,
    Math.round((eligibleFamilies * rehabilitationProgress) / 100)
  );

  const next = {
    ...project,
    landRequired,
    landAcquired,
    totalCompensation,
    paidCompensation,
    affectedFamilies,
    landowners: numeric(project.landowners),
    verifiedLandowners: numeric(project.verifiedLandowners),
    activeLegalCases: numeric(project.activeLegalCases),
    rehabilitationProgress,
    pendingApprovals: numeric(project.pendingApprovals),
    documentationCompletion: numeric(project.documentationCompletion, 70),
    stakeholderResponseTime: numeric(project.stakeholderResponseTime, 10),
    historicalPerformance: numeric(project.historicalPerformance, 65),
    remainingLand: Math.max(0, landRequired - landAcquired),
    pendingCompensation: Math.max(0, Number((totalCompensation - paidCompensation).toFixed(1))),
    eligibleFamilies,
    rehabilitationCompleted,
    rehabilitationPending: numeric(
      project.rehabilitationPending,
      Math.max(0, eligibleFamilies - rehabilitationCompleted)
    )
  };

  const prediction = calculateRisk(next);
  return { ...next, prediction, riskScore: prediction.riskScore };
};

const recalculateLinkedProjects = (projects, landowners, legalCases, projectIds) => {
  if (!projectIds.size) return projects;
  return projects.map((project) => {
    if (!projectIds.has(project.projectId)) return project;

    const linkedLandowners = landowners.filter((item) => item.projectId === project.projectId);
    const linkedCases = legalCases.filter((item) => item.projectId === project.projectId);
    const paidLandowners = linkedLandowners.filter((item) => String(item.paymentStatus).toLowerCase() === 'paid');
    const disputedLandowners = linkedLandowners.filter((item) => String(item.paymentStatus).toLowerCase() === 'disputed' || String(item.disputeStatus).toLowerCase() === 'active');
    const paidAmount = paidLandowners.reduce((sum, item) => sum + numeric(item.compensationAmount), 0);
    const importedCompensationCr = Number((paidAmount / 100).toFixed(1));

    const next = {
      ...project,
      landowners: linkedLandowners.length || project.landowners,
      verifiedLandowners: linkedLandowners.length
        ? linkedLandowners.filter((item) => String(item.verificationStatus).toLowerCase() === 'verified').length
        : project.verifiedLandowners,
      pendingLandowners: linkedLandowners.length
        ? linkedLandowners.filter((item) => String(item.paymentStatus).toLowerCase() !== 'paid').length
        : project.pendingLandowners,
      paidCompensation: linkedLandowners.length
        ? Math.min(numeric(project.totalCompensation), importedCompensationCr || numeric(project.paidCompensation))
        : project.paidCompensation,
      activeLegalCases: linkedCases.length ? linkedCases.filter(activeCase).length : project.activeLegalCases,
      disputedLandArea: disputedLandowners.length ? Math.max(numeric(project.disputedLandArea), disputedLandowners.length) : project.disputedLandArea
    };

    return withProjectMetrics(next);
  });
};

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState(initialData);

  const persist = (next) => {
    localStorage.setItem('landrisk-data', JSON.stringify(next));
    return next;
  };

  const audit = (base, action, entity, entityId, previousValue, newValue) => ({
    ...base,
    auditLogs: [
      {
        id: `AUD-${String(base.auditLogs.length + 1).padStart(3, '0')}`,
        user: user?.name || 'Demo User',
        action,
        entity,
        entityId,
        previousValue,
        newValue,
        timestamp: new Date().toISOString()
      },
      ...base.auditLogs
    ]
  });

  const value = useMemo(() => ({
    ...data,
    importRows(dataset, rows) {
      setData((current) => {
        const normalizedDataset = dataset.toLowerCase();
        const changedProjectIds = new Set();

        if (normalizedDataset === 'projects') {
          const importedProjects = rows.map((row, index) => {
            const projectId = firstValue(row, ['projectId', 'id'], `PRJ-IMP-${Date.now()}-${index}`);
            const existing = current.projects.find((item) => item.projectId === projectId);
            const project = {
              ...existing,
              id: projectId,
              projectId,
              projectName: firstValue(row, ['projectName', 'name', 'title'], existing?.projectName || `Imported Project ${index + 1}`),
              projectType: firstValue(row, ['projectType', 'type'], existing?.projectType || 'Highway'),
              state: firstValue(row, ['state'], existing?.state || 'Maharashtra'),
              district: firstValue(row, ['district'], existing?.district || 'Nashik'),
              authority: firstValue(row, ['authority', 'agency'], existing?.authority || 'State Infrastructure Authority'),
              landRequired: numeric(firstValue(row, ['landRequired', 'requiredLand', 'totalLand'], existing?.landRequired)),
              landAcquired: numeric(firstValue(row, ['landAcquired', 'acquiredLand'], existing?.landAcquired)),
              affectedFamilies: numeric(firstValue(row, ['affectedFamilies', 'families'], existing?.affectedFamilies)),
              landowners: numeric(firstValue(row, ['landowners', 'totalLandowners'], existing?.landowners)),
              verifiedLandowners: numeric(firstValue(row, ['verifiedLandowners'], existing?.verifiedLandowners)),
              totalCompensation: numeric(firstValue(row, ['totalCompensation', 'compensationTotal'], existing?.totalCompensation)),
              paidCompensation: numeric(firstValue(row, ['paidCompensation', 'compensationPaid'], existing?.paidCompensation)),
              activeLegalCases: numeric(firstValue(row, ['activeLegalCases', 'legalCases'], existing?.activeLegalCases)),
              rehabilitationProgress: numeric(firstValue(row, ['rehabilitationProgress', 'rehabProgress'], existing?.rehabilitationProgress)),
              pendingApprovals: numeric(firstValue(row, ['pendingApprovals'], existing?.pendingApprovals)),
              documentationCompletion: numeric(firstValue(row, ['documentationCompletion', 'documentCompletion'], existing?.documentationCompletion || 70)),
              stakeholderResponseTime: numeric(firstValue(row, ['stakeholderResponseTime', 'responseTime'], existing?.stakeholderResponseTime || 10)),
              historicalPerformance: numeric(firstValue(row, ['historicalPerformance'], existing?.historicalPerformance || 65)),
              currentStage: firstValue(row, ['currentStage', 'stage'], existing?.currentStage || 'Compensation Payment'),
              status: firstValue(row, ['status'], existing?.status || 'Active'),
              startDate: firstValue(row, ['startDate'], existing?.startDate || ''),
              targetCompletionDate: firstValue(row, ['targetCompletionDate', 'completionDate'], existing?.targetCompletionDate || ''),
              location: existing?.location || { lat: 19.9975 + index * 0.02, lng: 73.7898 + index * 0.02 },
              lifecycle: existing?.lifecycle || [],
              deleted: false
            };
            changedProjectIds.add(projectId);
            return withProjectMetrics(project);
          });
          const importedIds = new Set(importedProjects.map((item) => item.projectId));
          const projects = recalculateLinkedProjects(
            [...importedProjects, ...current.projects.filter((item) => !importedIds.has(item.projectId))],
            current.landowners,
            current.legalCases,
            changedProjectIds
          );
          return persist(audit({ ...current, projects }, 'Imported project rows and recalculated live analytics', 'Data Import', 'projects', `${rows.length} rows`, `${importedProjects.length} projects saved`));
        }

        if (normalizedDataset === 'landowners' || normalizedDataset === 'compensation') {
          const importedLandowners = rows.map((row, index) => {
            const landownerId = firstValue(row, ['landownerId', 'id'], `LND-IMP-${Date.now()}-${index}`);
            const projectId = firstValue(row, ['projectId'], '');
            changedProjectIds.add(projectId);
            return {
              id: landownerId,
              landownerId,
              projectId,
              name: firstValue(row, ['name', 'landownerName'], 'Imported Landowner'),
              district: firstValue(row, ['district'], 'Nashik'),
              village: firstValue(row, ['village'], 'Imported Village'),
              landArea: numeric(firstValue(row, ['landArea', 'area'])),
              surveyNumber: firstValue(row, ['surveyNumber', 'surveyNo'], ''),
              compensationAmount: numeric(firstValue(row, ['compensationAmount', 'amount'])),
              paymentStatus: firstValue(row, ['paymentStatus', 'status'], 'Pending'),
              verificationStatus: firstValue(row, ['verificationStatus'], 'Verified'),
              disputeStatus: firstValue(row, ['disputeStatus'], 'None'),
              daysPending: numeric(firstValue(row, ['daysPending', 'pendingDays']))
            };
          });
          const importedIds = new Set(importedLandowners.map((item) => item.landownerId));
          const landowners = [...importedLandowners, ...current.landowners.filter((item) => !importedIds.has(item.landownerId))];
          const projects = recalculateLinkedProjects(current.projects, landowners, current.legalCases, changedProjectIds);
          return persist(audit({ ...current, landowners, projects }, 'Imported landowner/compensation rows and refreshed project totals', 'Data Import', normalizedDataset, `${rows.length} rows`, `${importedLandowners.length} records saved`));
        }

        if (normalizedDataset === 'legal cases') {
          const importedCases = rows.map((row, index) => {
            const caseId = firstValue(row, ['caseId', 'id'], `CASE-IMP-${Date.now()}-${index}`);
            const projectId = firstValue(row, ['projectId'], '');
            changedProjectIds.add(projectId);
            return {
              id: caseId,
              caseId,
              projectId,
              projectName: firstValue(row, ['projectName'], projectId || 'Imported project'),
              district: firstValue(row, ['district'], 'Nashik'),
              issueType: firstValue(row, ['issueType', 'issue'], 'Compensation objection'),
              filedDate: firstValue(row, ['filedDate', 'date'], new Date().toISOString().slice(0, 10)),
              status: firstValue(row, ['status'], 'Active'),
              pendingDays: numeric(firstValue(row, ['pendingDays', 'daysPending'])),
              impactLevel: firstValue(row, ['impactLevel', 'severity'], 'Medium')
            };
          });
          const importedIds = new Set(importedCases.map((item) => item.caseId));
          const legalCases = [...importedCases, ...current.legalCases.filter((item) => !importedIds.has(item.caseId))];
          const projects = recalculateLinkedProjects(current.projects, current.landowners, legalCases, changedProjectIds);
          return persist(audit({ ...current, legalCases, projects }, 'Imported legal case rows and recalculated project legal risk', 'Data Import', 'legal cases', `${rows.length} rows`, `${importedCases.length} cases saved`));
        }

        if (normalizedDataset === 'rehabilitation') {
          const patchByProject = new Map(rows.map((row) => {
            const projectId = firstValue(row, ['projectId'], '');
            return [projectId, {
              eligibleFamilies: numeric(firstValue(row, ['eligibleFamilies'])),
              rehabilitationCompleted: numeric(firstValue(row, ['rehabilitationCompleted', 'completedFamilies'])),
              rehabilitationPending: numeric(firstValue(row, ['rehabilitationPending', 'pendingFamilies'])),
              rehabilitationProgress: numeric(firstValue(row, ['rehabilitationProgress', 'progress'])),
              housingProgress: numeric(firstValue(row, ['housingProgress'])),
              livelihoodProgress: numeric(firstValue(row, ['livelihoodProgress'])),
              infrastructureProgress: numeric(firstValue(row, ['infrastructureProgress']))
            }];
          }));
          const projects = current.projects.map((project) => patchByProject.has(project.projectId) ? withProjectMetrics({ ...project, ...patchByProject.get(project.projectId) }) : project);
          return persist(audit({ ...current, projects }, 'Imported rehabilitation rows and refreshed progress metrics', 'Data Import', 'rehabilitation', `${rows.length} rows`, `${patchByProject.size} projects updated`));
        }

        if (normalizedDataset === 'acquisition stages') {
          const lifecycleByProject = rows.reduce((acc, row) => {
            const projectId = firstValue(row, ['projectId'], '');
            changedProjectIds.add(projectId);
            acc[projectId] ||= [];
            acc[projectId].push({
              stageName: firstValue(row, ['stageName', 'stage'], 'Imported Stage'),
              status: firstValue(row, ['status'], 'Pending'),
              startDate: firstValue(row, ['startDate'], ''),
              expectedDate: firstValue(row, ['expectedDate'], ''),
              completionDate: firstValue(row, ['completionDate'], ''),
              delayDays: numeric(firstValue(row, ['delayDays']))
            });
            return acc;
          }, {});
          const projects = current.projects.map((project) => {
            const lifecycle = lifecycleByProject[project.projectId];
            if (!lifecycle) return project;
            const activeStage = [...lifecycle].reverse().find((stage) => String(stage.status).toLowerCase() !== 'completed') || lifecycle.at(-1);
            return withProjectMetrics({ ...project, lifecycle, currentStage: activeStage?.stageName || project.currentStage });
          });
          return persist(audit({ ...current, projects }, 'Imported acquisition stage rows and refreshed lifecycle status', 'Data Import', 'acquisition stages', `${rows.length} rows`, `${changedProjectIds.size} projects updated`));
        }

        return current;
      });
    },
    setProject(project) {
      setData((current) => {
        const existing = current.projects.find((item) => item.projectId === project.projectId);
        const updated = withProjectMetrics({ ...existing, ...project });
        const projects = existing
          ? current.projects.map((item) => item.projectId === project.projectId ? updated : item)
          : [{ ...updated, id: project.projectId, lifecycle: project.lifecycle || [] }, ...current.projects];
        return persist(audit({ ...current, projects }, existing ? 'Updated project and recalculated risk' : 'Created project and calculated risk', 'Project', project.projectId, existing ? JSON.stringify(existing) : 'New record', JSON.stringify(updated)));
      });
    },
    softDeleteProject(projectId) {
      setData((current) => {
        const projects = current.projects.map((item) => item.projectId === projectId ? { ...item, deleted: true, status: 'Deleted' } : item);
        return persist(audit({ ...current, projects }, 'Soft deleted project', 'Project', projectId, 'Active', 'Deleted'));
      });
    },
    updateLandowner(landownerId, patch) {
      setData((current) => {
        let linkedProjectId = '';
        const landowners = current.landowners.map((item) => {
          if (item.landownerId !== landownerId) return item;
          linkedProjectId = item.projectId;
          return { ...item, ...patch };
        });
        const projects = recalculateLinkedProjects(current.projects, landowners, current.legalCases, new Set([linkedProjectId]));
        return persist(audit({ ...current, landowners, projects }, 'Updated landowner compensation status', 'Landowner', landownerId, 'Previous payment state', JSON.stringify(patch)));
      });
    },
    updateAlert(alertId, patch) {
      setData((current) => {
        const alerts = current.alerts.map((item) => item.id === alertId ? { ...item, ...patch } : item);
        return persist(audit({ ...current, alerts }, 'Updated alert', 'Alert', alertId, 'Previous alert state', JSON.stringify(patch)));
      });
    },
    setUserRecord(userId, patch) {
      setData((current) => {
        const users = current.users.map((item) => item.id === userId ? { ...item, ...patch } : item);
        return persist(audit({ ...current, users }, 'Updated user account', 'User', userId, 'Previous user state', JSON.stringify(patch)));
      });
    },
    resetDemoData() {
      const fresh = buildDemoData();
      localStorage.setItem('landrisk-data', JSON.stringify(fresh));
      setData(fresh);
    }
  }), [data, user]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
