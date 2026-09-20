import { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useData } from '../context/DataContext';
import { ChartCard, DataTable, KpiCard, PageHeader, RiskBadge } from '../components/UI';

export default function LegalDisputes() {
  const { legalCases } = useData();
  const active = legalCases.filter((c) => c.status !== 'Resolved');
  const district = Object.values(legalCases.reduce((acc, c) => {
    acc[c.district] ||= { district: c.district, cases: 0 };
    acc[c.district].cases += 1;
    return acc;
  }, {})).sort((a, b) => b.cases - a.cases).slice(0, 10);
  const years = [2022, 2023, 2024, 2025, 2026].map((year, i) => ({ year, disputes: 28 + i * 14 }));
  return (
    <>
      <PageHeader title="Legal Disputes" subtitle="Track case volume, pending days, impact levels and project exposure." />
      <div className="grid gap-4 md:grid-cols-5">
        <KpiCard title="Total Disputes" value={legalCases.length} />
        <KpiCard title="Active Disputes" value={active.length} tone="red" />
        <KpiCard title="Resolved Disputes" value={legalCases.length - active.length} tone="green" />
        <KpiCard title="Avg Resolution Time" value={`${Math.round(legalCases.reduce((s, c) => s + c.pendingDays, 0) / legalCases.length)} days`} />
        <KpiCard title="Projects Affected" value={new Set(legalCases.map((c) => c.projectId)).size} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <ChartCard title="Disputes by District"><BarChart data={district}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="district" /><YAxis /><Tooltip /><Bar dataKey="cases" fill="#334155" /></BarChart></ChartCard>
        <ChartCard title="Disputes by Year"><LineChart data={years}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis /><Tooltip /><Line dataKey="disputes" stroke="#dc2626" /></LineChart></ChartCard>
      </div>
      <div className="mt-5">
        <DataTable rows={legalCases} columns={[
          { key: 'caseId', label: 'Case ID' },
          { key: 'projectName', label: 'Project' },
          { key: 'district', label: 'District' },
          { key: 'issueType', label: 'Issue Type' },
          { key: 'filedDate', label: 'Filed Date' },
          { key: 'status', label: 'Current Status' },
          { key: 'pendingDays', label: 'Days Pending' },
          { key: 'impactLevel', label: 'Risk Impact', render: (row) => <RiskBadge level={row.impactLevel === 'Critical' ? 'Critical' : row.impactLevel} /> }
        ]} />
      </div>
    </>
  );
}
