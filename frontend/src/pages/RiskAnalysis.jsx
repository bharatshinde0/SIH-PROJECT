import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useData } from '../context/DataContext';
import { Card, ChartCard, DataTable, PageHeader, Progress, RiskBadge } from '../components/UI';

const colors = { Low: '#16a34a', Medium: '#d97706', High: '#ea580c', Critical: '#dc2626' };

export default function RiskAnalysis() {
  const { projects } = useData();
  const active = projects.filter((p) => !p.deleted);
  const distribution = ['Low', 'Medium', 'High', 'Critical'].map((name) => ({ name, value: active.filter((p) => p.prediction.riskLevel === name).length }));
  const factorTotals = active.flatMap((p) => p.prediction.contributingFactors).reduce((acc, factor) => {
    acc[factor.name] = (acc[factor.name] || 0) + factor.contribution;
    return acc;
  }, {});
  const factors = Object.entries(factorTotals).map(([name, value]) => ({ name, value: Math.round(value / active.length) })).sort((a, b) => b.value - a.value);

  return (
    <>
      <PageHeader title="Risk Analysis" subtitle="Project-wise risk scores, explainability factors and prototype model monitoring." />
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Risk Distribution">
          <PieChart>
            <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100}>
              {distribution.map((item) => <Cell key={item.name} fill={colors[item.name]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>
        <ChartCard title="Average Contributing Factors">
          <BarChart data={factors} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Bar dataKey="value" fill="#334155" name="Average contribution %" />
          </BarChart>
        </ChartCard>
      </div>
      <Card className="mt-5">
        <h2 className="text-lg font-semibold text-slate-950">Model Monitoring</h2>
        <p className="mt-1 text-sm text-slate-500">Demo/prototype values for architecture presentation. Replace with real metrics after model training.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            ['Model Version', 'prototype-v1.4'],
            ['Training Records', '12,540 demo'],
            ['Last Updated', '20 Sep 2026'],
            ['Accuracy', '82% demo'],
            ['Precision', '78% demo'],
            ['Recall', '74% demo'],
            ['F1 Score', '76% demo'],
            ['Data Records Added', '590 synthetic']
          ].map(([label, value]) => <div key={label} className="rounded-md border border-slate-200 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>)}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          {['New Project Data', 'Data Validation', 'Database', 'Feature Engineering', 'Model Training', 'Model Evaluation', 'Model Versioning', 'Prediction API', 'Dashboard'].map((step) => <span key={step} className="rounded-md border border-slate-200 px-3 py-2">{step}</span>)}
        </div>
      </Card>
      <div className="mt-5">
        <DataTable rows={active.sort((a, b) => b.prediction.riskScore - a.prediction.riskScore).slice(0, 20)} columns={[
          { key: 'projectId', label: 'Project' },
          { key: 'district', label: 'District' },
          { key: 'score', label: 'Risk Score', render: (row) => <div className="w-28"><p className="mb-1">{row.prediction.riskScore}/100</p><Progress value={row.prediction.riskScore} tone={row.prediction.riskScore > 80 ? 'red' : 'amber'} /></div> },
          { key: 'probability', label: 'Delay Probability', render: (row) => `${row.prediction.delayProbability}%` },
          { key: 'level', label: 'Level', render: (row) => <RiskBadge level={row.prediction.riskLevel} /> },
          { key: 'factor', label: 'Top Factor', render: (row) => row.prediction.contributingFactors[0]?.name }
        ]} />
      </div>
    </>
  );
}
