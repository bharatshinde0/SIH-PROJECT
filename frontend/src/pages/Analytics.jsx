import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useData } from '../context/DataContext';
import { Card, ChartCard, DataTable, KpiCard, PageHeader, Progress } from '../components/UI';

function group(projects, key) {
  return Object.values(projects.reduce((acc, p) => {
    acc[p[key]] ||= { name: p[key], projects: 0, highRisk: 0, risk: 0, pendingPayments: 0, delay: 0, landRequired: 0, landAcquired: 0, families: 0, disputes: 0 };
    acc[p[key]].projects += 1;
    acc[p[key]].highRisk += p.prediction.riskScore >= 61 ? 1 : 0;
    acc[p[key]].risk += p.prediction.riskScore;
    acc[p[key]].pendingPayments += p.pendingLandowners;
    acc[p[key]].delay += Number(p.prediction.expectedDelay[0]) || 1;
    acc[p[key]].landRequired += p.landRequired;
    acc[p[key]].landAcquired += p.landAcquired;
    acc[p[key]].families += p.affectedFamilies;
    acc[p[key]].disputes += p.activeLegalCases;
    return acc;
  }, {})).map((item) => ({ ...item, avgRisk: Math.round(item.risk / item.projects), avgDelay: Number((item.delay / item.projects).toFixed(1)) }));
}

export default function Analytics() {
  const { projects, landowners } = useData();
  const active = projects.filter((p) => !p.deleted);
  const stateData = group(active, 'state');
  const districtData = group(active, 'district').sort((a, b) => b.pendingPayments - a.pendingPayments);
  const typeData = group(active, 'projectType');
  const required = active.reduce((s, p) => s + p.landRequired, 0);
  const acquired = active.reduce((s, p) => s + p.landAcquired, 0);
  const paid = landowners.filter((l) => l.paymentStatus === 'Paid').reduce((s, l) => s + l.compensationAmount, 0);
  const pending = landowners.filter((l) => l.paymentStatus !== 'Paid').reduce((s, l) => s + l.compensationAmount, 0);
  const delayReasons = ['Legal disputes', 'Compensation delay', 'Approval delay', 'Documentation', 'Landowner verification', 'Rehabilitation', 'Administrative bottlenecks', 'Stakeholder response'].map((name, i) => ({ name, value: 88 - i * 8 }));

  return (
    <>
      <PageHeader title="Land Acquisition Analytics" subtitle="Data-driven insights into acquisition progress, compensation, delays and project performance." />
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard title="Total Projects" value={active.length} />
        <KpiCard title="Land Acquired" value={`${Math.round(acquired / required * 100)}%`} tone="green" />
        <KpiCard title="Compensation Paid" value={`₹${Math.round(paid)} Cr`} />
        <KpiCard title="Compensation Pending" value={`₹${Math.round(pending)} Cr`} tone="amber" />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <ChartCard title="Projects by State"><BarChart data={stateData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="projects" fill="#334155" /></BarChart></ChartCard>
        <ChartCard title="Projects by Project Type"><BarChart data={typeData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="projects" fill="#2563eb" /></BarChart></ChartCard>
      </div>
      <Card className="mt-5">
        <h2 className="text-lg font-semibold">Land Required vs Land Acquired</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div><p className="text-sm text-slate-500">Required</p><p className="text-2xl font-semibold">{required.toLocaleString('en-IN')} acres</p></div>
          <div><p className="text-sm text-slate-500">Acquired</p><p className="text-2xl font-semibold">{acquired.toLocaleString('en-IN')} acres</p></div>
          <div><p className="text-sm text-slate-500">Remaining</p><p className="text-2xl font-semibold">{(required - acquired).toLocaleString('en-IN')} acres</p></div>
        </div>
        <div className="mt-4"><Progress value={acquired / required * 100} tone="green" /></div>
      </Card>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <ChartCard title="Delay Trend Over Time"><LineChart data={['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((m, i) => ({ month: m, delay: 2.2 + i * 0.4 }))}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Line dataKey="delay" stroke="#dc2626" name="Avg delay months" /></LineChart></ChartCard>
        <ChartCard title="Delay Reasons"><BarChart data={delayReasons} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={165} /><Tooltip /><Bar dataKey="value" fill="#334155" /></BarChart></ChartCard>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold">District Analytics</h2>
          <DataTable rows={districtData.slice(0, 15)} columns={[
            { key: 'name', label: 'District' },
            { key: 'projects', label: 'Projects' },
            { key: 'highRisk', label: 'High Risk' },
            { key: 'avgRisk', label: 'Avg Risk' },
            { key: 'pendingPayments', label: 'Pending Payments' },
            { key: 'avgDelay', label: 'Avg Delay', render: (row) => `${row.avgDelay} months` }
          ]} />
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold">State Analytics</h2>
          <DataTable rows={stateData} columns={[
            { key: 'name', label: 'State' },
            { key: 'projects', label: 'Projects' },
            { key: 'landRequired', label: 'Land Required' },
            { key: 'landAcquired', label: 'Land Acquired' },
            { key: 'families', label: 'Families' },
            { key: 'disputes', label: 'Legal Disputes' }
          ]} />
        </div>
      </div>
    </>
  );
}
