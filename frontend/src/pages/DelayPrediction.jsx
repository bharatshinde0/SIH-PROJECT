import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useData } from '../context/DataContext';
import { calculateRisk, stagePredictions } from '../utils/riskEngine';
import { Button, Card, ChartCard, DataTable, PageHeader, RiskBadge } from '../components/UI';

export default function DelayPrediction() {
  const { projects } = useData();
  const [projectId, setProjectId] = useState(projects[0]?.projectId);
  const project = projects.find((p) => p.projectId === projectId) || projects[0];
  const [input, setInput] = useState({ ...project });
  const [prediction, setPrediction] = useState(project.prediction);
  const stages = stagePredictions({ ...input, prediction });

  const run = () => setPrediction(calculateRisk({ ...input, landRequired: Number(input.landRequired), landAcquired: Number(input.landAcquired), totalCompensation: Number(input.totalCompensation), paidCompensation: Number(input.paidCompensation) }));

  return (
    <>
      <PageHeader title="Delay Prediction" subtitle="Run prototype prediction logic and view lifecycle-stage delay probabilities." />
      <div className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
        <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" value={projectId} onChange={(event) => { const next = projects.find((p) => p.projectId === event.target.value); setProjectId(next.projectId); setInput(next); setPrediction(next.prediction); }}>
          {projects.filter((p) => !p.deleted).map((p) => <option key={p.projectId} value={p.projectId}>{p.projectId} - {p.projectName}</option>)}
        </select>
        <div className="rounded-md border border-slate-200 px-3 py-2 text-sm">Risk Score: {prediction.riskScore}/100</div>
        <div className="rounded-md border border-slate-200 px-3 py-2 text-sm">Delay Probability: {prediction.delayProbability}%</div>
        <div className="rounded-md border border-slate-200 px-3 py-2 text-sm"><RiskBadge level={prediction.riskLevel} /></div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">Prediction Input Panel</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              ['landRequired', 'Total land area'], ['affectedFamilies', 'Affected families'], ['landowners', 'Landowners'], ['landAcquired', 'Land acquired'],
              ['paidCompensation', 'Compensation paid'], ['pendingApprovals', 'Pending approvals'], ['activeLegalCases', 'Legal disputes'], ['documentationCompletion', 'Documentation completeness'],
              ['rehabilitationProgress', 'Rehabilitation progress'], ['stakeholderResponseTime', 'Stakeholder response time'], ['historicalPerformance', 'Historical performance'], ['previousDelayMonths', 'Previous delay history']
            ].map(([key, label]) => <label key={key} className="block"><span className="text-xs font-medium text-slate-600">{label}</span><input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={input[key] ?? 0} onChange={(event) => setInput({ ...input, [key]: event.target.value })} /></label>)}
          </div>
          <Button className="mt-4" onClick={run}>Run Risk Prediction</Button>
          <div className="mt-5 space-y-3">
            {prediction.recommendations.map((rec) => <div key={rec.title} className="rounded-md border border-slate-200 p-3"><p className="font-semibold">{rec.title}</p><p className="mt-1 text-sm text-slate-600">{rec.action}</p></div>)}
          </div>
        </Card>
        <div className="space-y-5">
          <ChartCard title="Stage-level Delay Probability">
            <LineChart data={stages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" hide />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="delayProbability" stroke="#dc2626" name="Delay probability %" />
            </LineChart>
          </ChartCard>
          <DataTable rows={stages} columns={[
            { key: 'stage', label: 'Stage' },
            { key: 'delayProbability', label: 'Delay Probability', render: (row) => `${row.delayProbability}%` },
            { key: 'expectedDelay', label: 'Expected Delay' }
          ]} />
        </div>
      </div>
    </>
  );
}
