import mongoose from 'mongoose';

export const Compensation = mongoose.model('Compensation', new mongoose.Schema({
  projectId: String,
  landownerId: String,
  name: String,
  district: String,
  village: String,
  landArea: Number,
  surveyNumber: String,
  amount: Number,
  approvedAmount: Number,
  paidAmount: Number,
  status: String,
  pendingDays: Number,
  disputeStatus: String,
  verificationStatus: String
}, { timestamps: true }));

export const LegalCase = mongoose.model('LegalCase', new mongoose.Schema({
  caseId: { type: String, unique: true },
  projectId: String,
  projectName: String,
  district: String,
  issueType: String,
  filedDate: Date,
  status: String,
  pendingDays: Number,
  impactLevel: String
}, { timestamps: true }));

export const Rehabilitation = mongoose.model('Rehabilitation', new mongoose.Schema({
  projectId: String,
  eligibleFamilies: Number,
  completedFamilies: Number,
  pendingFamilies: Number,
  housingProgress: Number,
  livelihoodProgress: Number,
  infrastructureProgress: Number
}, { timestamps: true }));

export const Alert = mongoose.model('Alert', new mongoose.Schema({
  projectId: String,
  alertType: String,
  severity: String,
  message: String,
  status: { type: String, default: 'Open' },
  assignedTo: String
}, { timestamps: true }));

export const AuditLog = mongoose.model('AuditLog', new mongoose.Schema({
  user: String,
  action: String,
  entity: String,
  entityId: String,
  previousValue: String,
  newValue: String
}, { timestamps: true }));
