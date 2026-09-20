const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export function riskLevelFromScore(score) {
  if (score >= 81) return 'Critical';
  if (score >= 61) return 'High';
  if (score >= 31) return 'Medium';
  return 'Low';
}

export function calculateRisk(project) {
  const landProgress = project.landRequired ? (project.landAcquired / project.landRequired) * 100 : 0;
  const paymentProgress = project.totalCompensation ? (project.paidCompensation / project.totalCompensation) * 100 : 0;
  const compensationDelay = clamp(100 - paymentProgress);
  const legalPressure = clamp(((project.activeLegalCases || 0) / 18) * 100);
  const approvalPressure = clamp(((project.pendingApprovals || 0) / 7) * 100);
  const docsGap = clamp(100 - (project.documentationCompletion || 0));
  const acquisitionGap = clamp(100 - landProgress);
  const rehabGap = clamp(100 - (project.rehabilitationProgress || 0));
  const stakeholderLag = clamp(((project.stakeholderResponseTime || 0) / 30) * 100);
  const historicalWeakness = clamp(100 - (project.historicalPerformance || 0));
  const weighted = compensationDelay * 0.21 + legalPressure * 0.17 + approvalPressure * 0.12 + docsGap * 0.09 + acquisitionGap * 0.1 + rehabGap * 0.1 + stakeholderLag * 0.07 + historicalWeakness * 0.06;
  const riskScore = Math.round(clamp(weighted));
  const delayProbability = Math.round(clamp(riskScore * 0.72 + legalPressure * 0.12 + compensationDelay * 0.1 + approvalPressure * 0.06));
  const raw = [
    ['Compensation pending', compensationDelay, `${project.pendingLandowners || 0} landowners still have pending payments.`],
    ['Legal disputes', legalPressure, `${project.activeLegalCases || 0} active legal cases are associated with the project.`],
    ['Pending approvals', approvalPressure, `${project.pendingApprovals || 0} administrative approvals remain open.`],
    ['Documentation completeness', docsGap, `${project.documentationCompletion || 0}% of documentation is complete.`],
    ['Rehabilitation progress', rehabGap, `${project.rehabilitationProgress || 0}% rehabilitation completion reported.`],
    ['Stakeholder responsiveness', stakeholderLag, `Average response time is ${project.stakeholderResponseTime || 0} days.`]
  ];
  const total = raw.reduce((sum, [, value]) => sum + value, 0) || 1;
  const contributingFactors = raw.map(([name, impact, reason]) => ({ name, impact, reason, contribution: Math.round((impact / total) * 100) })).sort((a, b) => b.contribution - a.contribution);
  const recommendations = contributingFactors.slice(0, 3).map((factor, index) => ({
    title: `${index + 1}. ${factor.name}`,
    priority: factor.contribution >= 24 ? 'High' : 'Medium',
    detail: factor.reason,
    action: `Prioritize ${factor.name.toLowerCase()} through time-bound district review and escalation.`
  }));
  return {
    riskScore,
    riskLevel: riskLevelFromScore(riskScore),
    delayProbability,
    expectedDelay: delayProbability >= 76 ? '4-7 months' : delayProbability >= 61 ? '3-5 months' : delayProbability >= 36 ? '1-3 months' : '0-1 month',
    contributingFactors,
    recommendations,
    modelVersion: 'prototype-v1.4',
    prototype: true,
    predictedAt: new Date()
  };
}
