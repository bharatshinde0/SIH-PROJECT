export const riskLevelFromScore = (score) => {
  if (score >= 81) return 'Critical';
  if (score >= 61) return 'High';
  if (score >= 31) return 'Medium';
  return 'Low';
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export function calculateRisk(project) {
  const landProgress = project.landRequired ? (project.landAcquired / project.landRequired) * 100 : 0;
  const paymentProgress = project.totalCompensation ? (project.paidCompensation / project.totalCompensation) * 100 : 0;
  const docsGap = 100 - Number(project.documentationCompletion || 0);
  const rehabGap = 100 - Number(project.rehabilitationProgress || 0);
  const compensationDelay = clamp(100 - paymentProgress);
  const legalPressure = clamp((Number(project.activeLegalCases || 0) / 18) * 100);
  const approvalPressure = clamp((Number(project.pendingApprovals || 0) / 7) * 100);
  const acquisitionGap = clamp(100 - landProgress);
  const stakeholderLag = clamp((Number(project.stakeholderResponseTime || 0) / 30) * 100);
  const familyScale = clamp((Number(project.affectedFamilies || 0) / 2600) * 100);
  const landScale = clamp((Number(project.landRequired || 0) / 2600) * 100);
  const priorDelay = clamp((Number(project.previousDelayMonths || 0) / 18) * 100);
  const historicalWeakness = clamp(100 - Number(project.historicalPerformance || 0));

  const weighted =
    compensationDelay * 0.21 +
    legalPressure * 0.17 +
    approvalPressure * 0.12 +
    docsGap * 0.09 +
    acquisitionGap * 0.1 +
    rehabGap * 0.1 +
    stakeholderLag * 0.07 +
    historicalWeakness * 0.06 +
    familyScale * 0.04 +
    landScale * 0.02 +
    priorDelay * 0.02;

  const riskScore = Math.round(clamp(weighted));
  const delayProbability = Math.round(clamp(riskScore * 0.72 + legalPressure * 0.12 + compensationDelay * 0.1 + approvalPressure * 0.06));
  const expectedDelay =
    delayProbability >= 76 ? '4-7 months' :
    delayProbability >= 61 ? '3-5 months' :
    delayProbability >= 36 ? '1-3 months' : '0-1 month';

  const rawFactors = [
    { name: 'Compensation pending', impact: compensationDelay, reason: `${project.pendingLandowners || 0} landowners still have pending payments.` },
    { name: 'Legal disputes', impact: legalPressure, reason: `${project.activeLegalCases || 0} active legal cases are associated with the project.` },
    { name: 'Pending approvals', impact: approvalPressure, reason: `${project.pendingApprovals || 0} administrative approvals remain open.` },
    { name: 'Documentation completeness', impact: docsGap, reason: `${project.documentationCompletion || 0}% of documentation is complete.` },
    { name: 'Rehabilitation progress', impact: rehabGap, reason: `${project.rehabilitationProgress || 0}% rehabilitation completion reported.` },
    { name: 'Stakeholder responsiveness', impact: stakeholderLag, reason: `Average response time is ${project.stakeholderResponseTime || 0} days.` }
  ];

  const totalImpact = rawFactors.reduce((sum, item) => sum + item.impact, 0) || 1;
  const contributingFactors = rawFactors
    .map((item) => ({ ...item, contribution: Math.round((item.impact / totalImpact) * 100) }))
    .sort((a, b) => b.contribution - a.contribution);

  const recommendations = contributingFactors.slice(0, 3).map((factor, index) => {
    const priority = factor.contribution >= 24 ? 'High' : factor.contribution >= 14 ? 'Medium' : 'Low';
    const actions = {
      'Compensation pending': 'Assign a verification and payment team to cases pending beyond 60 days.',
      'Legal disputes': 'Escalate long-pending cases to the appropriate legal authority and track resolution deadlines.',
      'Pending approvals': 'Notify responsible departments and set time-bound escalation milestones.',
      'Documentation completeness': 'Create a document completion drive for missing survey, valuation and consent records.',
      'Rehabilitation progress': 'Prioritize housing, livelihood and infrastructure packages for eligible families.',
      'Stakeholder responsiveness': 'Schedule weekly district-level review meetings for delayed responses.'
    };
    return {
      title: `${index + 1}. ${factor.name}`,
      priority,
      detail: factor.reason,
      action: actions[factor.name]
    };
  });

  return {
    riskScore,
    riskLevel: riskLevelFromScore(riskScore),
    delayProbability,
    expectedDelay,
    contributingFactors,
    recommendations,
    modelVersion: 'prototype-v1.4',
    prototype: true,
    predictedAt: new Date().toISOString()
  };
}

export function stagePredictions(project) {
  const base = calculateRisk(project);
  const stages = [
    ['Notification', -48, '0-1 month'],
    ['Survey', -34, '1-2 months'],
    ['Land Identification', -28, '1-2 months'],
    ['Valuation', -18, '1-3 months'],
    ['Compensation Approval', 4, '2-4 months'],
    ['Compensation Payment', 13, '3-5 months'],
    ['Possession', 7, '2-4 months'],
    ['Rehabilitation', -2, '2-3 months'],
    ['Final Handover', -20, '1-2 months']
  ];
  return stages.map(([stage, modifier, delay]) => ({
    stage,
    delayProbability: clamp(base.delayProbability + modifier),
    expectedDelay: delay
  }));
}
