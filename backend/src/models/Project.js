import mongoose from 'mongoose';

const stageSchema = new mongoose.Schema({
  stageName: String,
  status: String,
  startDate: Date,
  expectedDate: Date,
  completionDate: Date,
  delayDays: Number
}, { _id: false });

const factorSchema = new mongoose.Schema({
  name: String,
  impact: Number,
  contribution: Number,
  reason: String
}, { _id: false });

const recommendationSchema = new mongoose.Schema({
  title: String,
  priority: String,
  detail: String,
  action: String
}, { _id: false });

const predictionSchema = new mongoose.Schema({
  riskScore: Number,
  riskLevel: String,
  delayProbability: Number,
  expectedDelay: String,
  contributingFactors: [factorSchema],
  recommendations: [recommendationSchema],
  modelVersion: String,
  predictedAt: Date,
  prototype: Boolean
}, { _id: false });

const projectSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },
  projectName: { type: String, required: true },
  projectType: String,
  state: String,
  district: String,
  location: { lat: Number, lng: Number },
  authority: String,
  landRequired: Number,
  landAcquired: Number,
  remainingLand: Number,
  affectedFamilies: Number,
  landowners: Number,
  verifiedLandowners: Number,
  pendingLandowners: Number,
  currentStage: String,
  startDate: Date,
  targetCompletionDate: Date,
  status: String,
  totalCompensation: Number,
  approvedCompensation: Number,
  paidCompensation: Number,
  pendingCompensation: Number,
  activeLegalCases: Number,
  resolvedCases: Number,
  disputedLandArea: Number,
  eligibleFamilies: Number,
  rehabilitationCompleted: Number,
  rehabilitationPending: Number,
  rehabilitationProgress: Number,
  housingProgress: Number,
  livelihoodProgress: Number,
  infrastructureProgress: Number,
  pendingApprovals: Number,
  documentationCompletion: Number,
  stakeholderResponseTime: Number,
  historicalPerformance: Number,
  previousDelayMonths: Number,
  lifecycle: [stageSchema],
  prediction: predictionSchema,
  deleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
