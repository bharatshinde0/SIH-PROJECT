import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useData } from '../context/DataContext';
import { Card, ChartCard, KpiCard, PageHeader, Progress } from '../components/UI';

export default function Rehabilitation() {
  const { projects } = useData();
  const totalFamilies = projects.reduce((s, p) => s + p.affectedFamilies, 0);
  const eligible = projects.reduce((s, p) => s + p.eligibleFamilies, 0);
  const completed = projects.reduce((s, p) => s + p.rehabilitationCompleted, 0);
  const pending = projects.reduce((s, p) => s + p.rehabilitationPending, 0);
  const district = Object.values(projects.reduce((acc, p) => {
    acc[p.district] ||= { district: p.district, pending: 0 };
    acc[p.district].pending += p.rehabilitationPending;
    return acc;
  }, {})).sort((a, b) => b.pending - a.pending).slice(0, 10);
  const trend = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((month, i) => ({ month, completed: 42 + i * 8, pending: 58 - i * 7 }));

  return (
    <>
      <PageHeader title="Rehabilitation & Resettlement" subtitle="Eligibility, completion, pending families and resettlement support progress." />
      <div className="grid gap-4 md:grid-cols-5">
        <KpiCard title="Total Affected Families" value={totalFamilies.toLocaleString('en-IN')} />
        <KpiCard title="Rehabilitation Eligible" value={eligible.toLocaleString('en-IN')} />
        <KpiCard title="Completed" value={completed.toLocaleString('en-IN')} tone="green" />
        <KpiCard title="Pending" value={pending.toLocaleString('en-IN')} tone="amber" />
        <KpiCard title="Resettlement Pending" value={Math.round(pending * 0.42).toLocaleString('en-IN')} tone="red" />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <ChartCard title="District-wise Pending Families">
          <BarChart data={district}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="district" /><YAxis /><Tooltip /><Bar dataKey="pending" fill="#334155" /></BarChart>
        </ChartCard>
        <ChartCard title="Rehabilitation Completion Trend">
          <LineChart data={trend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Line dataKey="completed" stroke="#16a34a" /><Line dataKey="pending" stroke="#dc2626" /></LineChart>
        </ChartCard>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        {['Housing', 'Livelihood', 'Infrastructure'].map((label, index) => {
          const key = ['housingProgress', 'livelihoodProgress', 'infrastructureProgress'][index];
          const value = Math.round(projects.reduce((s, p) => s + p[key], 0) / projects.length);
          return <Card key={label}><p className="font-semibold">{label} Status</p><p className="mt-2 text-2xl font-semibold">{value}%</p><Progress value={value} tone={value > 70 ? 'green' : 'amber'} /></Card>;
        })}
      </div>
    </>
  );
}
