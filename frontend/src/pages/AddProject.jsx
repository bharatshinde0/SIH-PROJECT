import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Button, Card, PageHeader } from '../components/UI';

const fields = [
  ['projectName', 'Project Name'], ['projectId', 'Project ID'], ['projectType', 'Project Type'], ['state', 'State'], ['district', 'District'], ['authority', 'Project Authority'],
  ['landRequired', 'Total Land Required'], ['landAcquired', 'Land Acquired'], ['affectedFamilies', 'Affected Families'], ['landowners', 'Total Landowners'], ['verifiedLandowners', 'Verified Landowners'],
  ['totalCompensation', 'Total Compensation (Cr)'], ['paidCompensation', 'Paid Compensation (Cr)'], ['activeLegalCases', 'Active Legal Cases'], ['rehabilitationProgress', 'Rehabilitation Progress'],
  ['pendingApprovals', 'Pending Approvals'], ['documentationCompletion', 'Documentation Completion'], ['stakeholderResponseTime', 'Stakeholder Response Time'], ['historicalPerformance', 'Historical Performance']
];

export default function AddProject() {
  const { projects, setProject } = useData();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const editing = projects.find((p) => p.projectId === params.get('projectId'));
  const [form, setForm] = useState(() => editing || {
    projectName: '', projectId: `PRJ-${String(projects.length + 1).padStart(3, '0')}`, projectType: 'Highway', state: 'Maharashtra', district: 'Nashik', authority: 'State Infrastructure Authority',
    landRequired: 1000, landAcquired: 620, affectedFamilies: 900, landowners: 1100, verifiedLandowners: 820, totalCompensation: 42, paidCompensation: 20,
    activeLegalCases: 8, rehabilitationProgress: 45, pendingApprovals: 3, documentationCompletion: 70, stakeholderResponseTime: 14, historicalPerformance: 64,
    currentStage: 'Compensation Payment', status: 'Active', location: { lat: 19.9975, lng: 73.7898 }, lifecycle: []
  });
  const steps = useMemo(() => ['Project Information', 'Land Information', 'Families / Landowners', 'Compensation', 'Legal Status', 'Rehabilitation', 'Approvals', 'Review & Submit'], []);

  const submit = (event) => {
    event.preventDefault();
    const total = Number(form.totalCompensation) || 0;
    const paid = Number(form.paidCompensation) || 0;
    const project = {
      ...form,
      landRequired: Number(form.landRequired),
      landAcquired: Number(form.landAcquired),
      remainingLand: Number(form.landRequired) - Number(form.landAcquired),
      affectedFamilies: Number(form.affectedFamilies),
      landowners: Number(form.landowners),
      verifiedLandowners: Number(form.verifiedLandowners),
      pendingLandowners: Math.max(0, Number(form.landowners) - Math.round(Number(form.landowners) * (paid / Math.max(total, 1)))),
      totalCompensation: total,
      paidCompensation: paid,
      approvedCompensation: Math.max(paid, total * 0.8),
      pendingCompensation: Math.max(0, total - paid),
      activeLegalCases: Number(form.activeLegalCases),
      rehabilitationProgress: Number(form.rehabilitationProgress),
      eligibleFamilies: Math.round(Number(form.affectedFamilies) * 0.6),
      rehabilitationCompleted: Math.round(Number(form.affectedFamilies) * 0.6 * Number(form.rehabilitationProgress) / 100),
      rehabilitationPending: Math.round(Number(form.affectedFamilies) * 0.6 * (100 - Number(form.rehabilitationProgress)) / 100),
      pendingApprovals: Number(form.pendingApprovals),
      documentationCompletion: Number(form.documentationCompletion),
      stakeholderResponseTime: Number(form.stakeholderResponseTime),
      historicalPerformance: Number(form.historicalPerformance),
      previousDelayMonths: Number(form.previousDelayMonths || 0),
      createdAt: form.createdAt || new Date().toISOString(),
      deleted: false
    };
    setProject(project);
    navigate(`/projects/${project.projectId}`);
  };

  return (
    <>
      <PageHeader title={editing ? 'Edit Project' : 'Add Project'} subtitle="Saving recalculates risk, updates analytics, and writes an audit record." />
      <div className="mb-5 grid gap-2 md:grid-cols-8">
        {steps.map((step, index) => <div key={step} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">Step {index + 1}: {step}</div>)}
      </div>
      <Card>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-3">
          {fields.map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={form[key] ?? ''} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
            </label>
          ))}
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Current Stage</span>
            <select className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={form.currentStage} onChange={(event) => setForm({ ...form, currentStage: event.target.value })}>
              {['Notification', 'Survey', 'Land Identification', 'Valuation', 'Compensation Approval', 'Compensation Payment', 'Possession', 'Rehabilitation', 'Final Handover'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <div className="md:col-span-3">
            <Button type="submit">Save Project</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
