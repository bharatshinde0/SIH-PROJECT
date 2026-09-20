import { calculateRisk } from '../utils/riskEngine';

const states = {
  Maharashtra: ['Nashik', 'Pune', 'Nagpur', 'Thane', 'Aurangabad'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Kutch'],
  Karnataka: ['Bengaluru Rural', 'Mysuru', 'Belagavi', 'Dharwad', 'Mangaluru'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Noida', 'Agra'],
  Telangana: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli']
};

const coords = {
  Nashik: [19.9975, 73.7898], Pune: [18.5204, 73.8567], Nagpur: [21.1458, 79.0882], Thane: [19.2183, 72.9781], Aurangabad: [19.8762, 75.3433],
  Ahmedabad: [23.0225, 72.5714], Surat: [21.1702, 72.8311], Vadodara: [22.3072, 73.1812], Rajkot: [22.3039, 70.8022], Kutch: [23.7337, 69.8597],
  'Bengaluru Rural': [13.2847, 77.6078], Mysuru: [12.2958, 76.6394], Belagavi: [15.8497, 74.4977], Dharwad: [15.4589, 75.0078], Mangaluru: [12.9141, 74.856],
  Indore: [22.7196, 75.8577], Bhopal: [23.2599, 77.4126], Jabalpur: [23.1815, 79.9864], Gwalior: [26.2183, 78.1828], Ujjain: [23.1765, 75.7885],
  Jaipur: [26.9124, 75.7873], Jodhpur: [26.2389, 73.0243], Udaipur: [24.5854, 73.7125], Kota: [25.2138, 75.8648], Ajmer: [26.4499, 74.6399],
  Lucknow: [26.8467, 80.9462], Kanpur: [26.4499, 80.3319], Varanasi: [25.3176, 82.9739], Noida: [28.5355, 77.391], Agra: [27.1767, 78.0081],
  Hyderabad: [17.385, 78.4867], Warangal: [17.9689, 79.5941], Nizamabad: [18.6725, 78.0941], Karimnagar: [18.4386, 79.1288], Khammam: [17.2473, 80.1514],
  Chennai: [13.0827, 80.2707], Coimbatore: [11.0168, 76.9558], Madurai: [9.9252, 78.1198], Salem: [11.6643, 78.146], Tiruchirappalli: [10.7905, 78.7047]
};

const projectTypes = ['Highway', 'Railway', 'Metro', 'Industrial Corridor', 'Airport', 'Irrigation', 'Power', 'Urban Development'];
const stages = ['Notification', 'Survey', 'Land Identification', 'Valuation', 'Compensation Approval', 'Compensation Payment', 'Possession', 'Rehabilitation', 'Final Handover'];
const authorities = ['NHAI Regional Office', 'State Infrastructure Authority', 'Metro Rail Corporation', 'Industrial Development Board', 'Irrigation Department', 'Urban Development Mission'];
const firstNames = ['Aarav', 'Meera', 'Rohan', 'Sanjay', 'Kavita', 'Nisha', 'Vikram', 'Anita', 'Prakash', 'Farhan', 'Suresh', 'Lata'];
const lastNames = ['Patil', 'Sharma', 'Reddy', 'Iyer', 'Khan', 'Yadav', 'Mehta', 'Joshi', 'Deshmukh', 'Singh', 'Rao', 'Nair'];

const pick = (arr, i) => arr[i % arr.length];
const currencyCr = (value) => Math.round(value * 10) / 10;

function makeLifecycle(seed) {
  return stages.map((stage, index) => {
    const status = index < seed % 7 ? 'Completed' : index === seed % 7 ? 'In Progress' : 'Pending';
    return {
      stageName: stage,
      status,
      startDate: `2025-${String((index % 9) + 1).padStart(2, '0')}-05`,
      expectedDate: `2025-${String((index % 9) + 2).padStart(2, '0')}-20`,
      completionDate: status === 'Completed' ? `2025-${String((index % 9) + 2).padStart(2, '0')}-28` : '',
      delayDays: status === 'Pending' ? 0 : (seed * (index + 3)) % 56
    };
  });
}

function makeProject(i) {
  const state = pick(Object.keys(states), i);
  const district = pick(states[state], Math.floor(i / 2) + i);
  const projectType = pick(projectTypes, i * 3);
  const landRequired = 420 + ((i * 83) % 2200);
  const acquisitionPct = 42 + ((i * 7) % 57);
  const landAcquired = Math.round(landRequired * acquisitionPct / 100);
  const affectedFamilies = 180 + ((i * 137) % 2450);
  const landowners = affectedFamilies + 45 + ((i * 29) % 460);
  const paymentPct = 36 + ((i * 11) % 63);
  const totalCompensation = currencyCr(landRequired * (0.035 + (i % 8) * 0.004));
  const paidCompensation = currencyCr(totalCompensation * paymentPct / 100);
  const activeLegalCases = (i * 5) % 19;
  const rehabilitationProgress = 28 + ((i * 9) % 70);
  const pendingApprovals = (i * 2) % 8;
  const project = {
    id: `PRJ-${String(i + 1).padStart(3, '0')}`,
    projectId: `PRJ-${String(i + 1).padStart(3, '0')}`,
    projectName: `${district} ${projectType} ${i % 3 === 0 ? 'Expansion' : i % 3 === 1 ? 'Corridor' : 'Development'} Phase ${((i % 4) + 1)}`,
    projectType,
    state,
    district,
    location: { lat: coords[district][0] + ((i % 5) * 0.05), lng: coords[district][1] + ((i % 4) * 0.05) },
    authority: pick(authorities, i),
    landRequired,
    landAcquired,
    remainingLand: landRequired - landAcquired,
    affectedFamilies,
    landowners,
    verifiedLandowners: Math.round(landowners * (0.68 + (i % 4) * 0.06)),
    pendingLandowners: Math.round(landowners * (1 - paymentPct / 100)),
    currentStage: pick(stages, i + 2),
    startDate: `2024-${String((i % 9) + 1).padStart(2, '0')}-12`,
    targetCompletionDate: `2027-${String((i % 9) + 1).padStart(2, '0')}-28`,
    status: i % 12 === 0 ? 'Under Review' : 'Active',
    totalCompensation,
    approvedCompensation: currencyCr(totalCompensation * (0.72 + (i % 4) * 0.05)),
    paidCompensation,
    pendingCompensation: currencyCr(totalCompensation - paidCompensation),
    activeLegalCases,
    resolvedCases: (i * 3) % 11,
    disputedLandArea: Math.round(landRequired * ((i % 9) / 100)),
    eligibleFamilies: Math.round(affectedFamilies * 0.58),
    rehabilitationCompleted: Math.round(affectedFamilies * rehabilitationProgress / 100 * 0.58),
    rehabilitationPending: Math.max(0, Math.round(affectedFamilies * 0.58) - Math.round(affectedFamilies * rehabilitationProgress / 100 * 0.58)),
    rehabilitationProgress,
    housingProgress: 25 + ((i * 8) % 75),
    livelihoodProgress: 22 + ((i * 7) % 74),
    infrastructureProgress: 26 + ((i * 6) % 72),
    pendingApprovals,
    documentationCompletion: 44 + ((i * 9) % 55),
    stakeholderResponseTime: 4 + ((i * 7) % 29),
    historicalPerformance: 45 + ((i * 8) % 53),
    previousDelayMonths: (i * 4) % 19,
    lifecycle: makeLifecycle(i),
    createdAt: '2026-09-20T09:00:00.000Z',
    deleted: false
  };
  return { ...project, prediction: calculateRisk(project) };
}

export function buildDemoData() {
  const projects = Array.from({ length: 50 }, (_, i) => makeProject(i));
  const landowners = Array.from({ length: 540 }, (_, i) => {
    const project = projects[i % projects.length];
    const status = i % 9 === 0 ? 'Disputed' : i % 4 === 0 ? 'Pending' : 'Paid';
    return {
      id: `LND-${String(i + 1001).padStart(4, '0')}`,
      landownerId: `LND-${String(i + 1001).padStart(4, '0')}`,
      projectId: project.projectId,
      name: `${pick(firstNames, i)} ${pick(lastNames, i * 2)}`,
      district: project.district,
      village: `${project.district} Village ${((i % 18) + 1)}`,
      landArea: Number((0.4 + ((i * 17) % 48) / 10).toFixed(1)),
      surveyNumber: `SV-${project.district.slice(0, 3).toUpperCase()}-${100 + i}`,
      compensationAmount: Number((1.8 + ((i * 13) % 140) / 10).toFixed(1)),
      paymentStatus: status,
      verificationStatus: i % 5 === 0 ? 'Under Verification' : 'Verified',
      disputeStatus: status === 'Disputed' ? 'Active' : 'None',
      daysPending: status === 'Paid' ? 0 : 21 + ((i * 11) % 170)
    };
  });

  const legalCases = projects.flatMap((project, i) => Array.from({ length: Math.min(4, project.activeLegalCases % 5) }, (_, j) => ({
    id: `CASE-${String(i * 4 + j + 1).padStart(4, '0')}`,
    caseId: `CASE-${String(i * 4 + j + 1).padStart(4, '0')}`,
    projectId: project.projectId,
    projectName: project.projectName,
    district: project.district,
    issueType: pick(['Title dispute', 'Compensation objection', 'Boundary mismatch', 'Consent challenge', 'Forest clearance'], i + j),
    filedDate: `2025-${String(((i + j) % 11) + 1).padStart(2, '0')}-15`,
    status: j % 3 === 0 ? 'Under Hearing' : 'Active',
    pendingDays: 35 + ((i + j) * 23) % 420,
    impactLevel: pick(['Medium', 'High', 'Critical'], i + j)
  })));

  const alerts = projects.filter((p) => p.prediction.riskScore > 60).slice(0, 28).map((project, i) => ({
    id: `ALT-${String(i + 1).padStart(3, '0')}`,
    projectId: project.projectId,
    alertType: project.prediction.riskLevel === 'Critical' ? 'Critical Risk Alert' : 'High Risk Alert',
    severity: project.prediction.riskLevel,
    message: `${project.projectName} has crossed ${project.prediction.delayProbability}% delay probability.`,
    status: i % 4 === 0 ? 'Read' : 'Open',
    createdAt: '2026-09-20T10:30:00.000Z',
    assignedTo: i % 3 === 0 ? 'District Officer' : ''
  }));

  const users = [
    { id: 'USR-001', name: 'Admin User', email: 'admin@landrisk.demo', role: 'ADMIN', state: 'All', district: 'All', status: 'Active' },
    { id: 'USR-002', name: 'Viewer User', email: 'viewer@landrisk.demo', role: 'VIEWER', state: 'Maharashtra', district: 'Nashik', status: 'Active' }
  ];

  return {
    projects,
    landowners,
    legalCases,
    alerts,
    users,
    auditLogs: [
      {
        id: 'AUD-001',
        user: 'Admin User',
        action: 'Generated prototype risk predictions',
        entity: 'RiskPrediction',
        entityId: 'ALL',
        previousValue: 'Not available',
        newValue: 'prototype-v1.4',
        timestamp: '2026-09-20T10:32:00.000Z'
      }
    ]
  };
}

export const demoUsers = [
  { name: 'Administrator', email: 'admin@landrisk.demo', aliases: ['admin'], password: 'admin@123', role: 'ADMIN' },
  { name: 'User', email: 'user@landrisk.demo', aliases: ['user', 'viewer@landrisk.demo', 'viewer'], password: 'user@adn', role: 'VIEWER' }
];

export const availableStates = Object.keys(states);
export const availableDistricts = states;
export const availableProjectTypes = projectTypes;
