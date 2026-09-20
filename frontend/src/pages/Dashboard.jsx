import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, BriefcaseBusiness, Database, Gavel, Landmark, MapPin, RotateCcw, TrendingUp, Users } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Button, Card, ChartCard, DataTable, KpiCard, LinkButton, Notice, PageHeader, Progress, RiskBadge } from '../components/UI';

const colors = { Low: '#10b981', Medium: '#f59e0b', High: '#f97316', Critical: '#dc2626' };
const riskOrder = ['Low', 'Medium', 'High', 'Critical'];

const monthLabel = (value, fallbackIndex) => {
  const date = value ? new Date(value) : null;
  if (date && !Number.isNaN(date.getTime())) {
    return {
      month: date.toLocaleString('en-IN', { month: 'short', year: '2-digit' }),
      sort: date.getTime()
    };
  }
  return { month: `Batch ${fallbackIndex + 1}`, sort: fallbackIndex };
};

export default function Dashboard() {
  const { projects, landowners, legalCases, auditLogs } = useData();
  const { isAdmin } = useAuth();
  const [filters, setFilters] = useState({ state: 'All', district: 'All', type: 'All', risk: 'All' });

  const activeProjects = useMemo(() => projects.filter((p) => !p.deleted), [projects]);
  const options = useMemo(() => ({
    state: ['All', ...new Set(activeProjects.map((p) => p.state).filter(Boolean))],
    district: ['All', ...new Set(activeProjects.map((p) => p.district).filter(Boolean))],
    type: ['All', ...new Set(activeProjects.map((p) => p.projectType).filter(Boolean))],
    risk: ['All', ...riskOrder]
  }), [activeProjects]);

  const visibleProjects = useMemo(() => activeProjects.filter((project) => (
    (filters.state === 'All' || project.state === filters.state) &&
    (filters.district === 'All' || project.district === filters.district) &&
    (filters.type === 'All' || project.projectType === filters.type) &&
    (filters.risk === 'All' || project.prediction.riskLevel === filters.risk)
  )), [activeProjects, filters]);

  const visibleProjectIds = new Set(visibleProjects.map((project) => project.projectId));
  const linkedLandowners = landowners.filter((item) => visibleProjectIds.has(item.projectId));
  const linkedCases = legalCases.filter((item) => visibleProjectIds.has(item.projectId));
  const projectCount = Math.max(visibleProjects.length, 1);
  const highRisk = visibleProjects.filter((p) => p.prediction.riskScore >= 61);
  const delayed = visibleProjects.filter((p) => p.prediction.delayProbability >= 55);
  const pendingComp = linkedLandowners.filter((l) => l.paymentStatus !== 'Paid');
  const avgRisk = visibleProjects.length ? Math.round(visibleProjects.reduce((sum, p) => sum + p.prediction.riskScore, 0) / visibleProjects.length) : 0;
  const rehabPending = visibleProjects.reduce((sum, p) => sum + p.rehabilitationPending, 0);
  const requiredLand = visibleProjects.reduce((sum, p) => sum + p.landRequired, 0);
  const acquiredLand = visibleProjects.reduce((sum, p) => sum + p.landAcquired, 0);
  const acquisitionPct = requiredLand ? Math.round((acquiredLand / requiredLand) * 100) : 0;
  const lastImport = auditLogs.find((log) => log.entity === 'Data Import');

  const riskDistribution = riskOrder.map((level) => ({
    name: level,
    value: visibleProjects.filter((p) => p.prediction.riskLevel === level).length
  }));

  const districtPending = Object.values(visibleProjects.reduce((acc, p) => {
    acc[p.district] ||= { district: p.district, pending: 0, risk: 0, projects: 0 };
    acc[p.district].pending += p.pendingLandowners;
    acc[p.district].risk += p.prediction.riskScore;
    acc[p.district].projects += 1;
    return acc;
  }, {})).map((item) => ({ ...item, avgRisk: Math.round(item.risk / item.projects) })).sort((a, b) => b.pending - a.pending).slice(0, 8);

  const trend = Object.values(visibleProjects.reduce((acc, project, index) => {
    const label = monthLabel(project.startDate || project.createdAt, index);
    acc[label.month] ||= { month: label.month, sort: label.sort, risk: 0, delay: 0, count: 0 };
    acc[label.month].risk += project.prediction.riskScore;
    acc[label.month].delay += project.prediction.delayProbability;
    acc[label.month].count += 1;
    return acc;
  }, {})).sort((a, b) => a.sort - b.sort).slice(-6).map((item) => ({
    month: item.month,
    risk: Math.round(item.risk / item.count),
    delay: Math.round(item.delay / item.count)
  }));

  const rows = [...highRisk].sort((a, b) => b.prediction.riskScore - a.prediction.riskScore).slice(0, 8);

  return (
    <>
      <PageHeader
        title={isAdmin ? 'Admin Control Center' : 'Land Acquisition Intelligence Dashboard'}
        subtitle="Live monitoring for project risk, acquisition progress, compensation bottlenecks and legal pressure."
        actions={isAdmin && <><LinkButton to="/add-project">+ Add Project</LinkButton><LinkButton to="/data-management" variant="secondary"><Database size={16} /> Import Data</LinkButton></>}
      />

      <Card className="mb-5 overflow-hidden border-0 bg-[linear-gradient(135deg,#11131d_0%,#262a42_58%,#b91c1c_125%)] p-0 text-white">
        <div className="grid gap-6 p-5 lg:grid-cols-[1.25fr_0.75fr] lg:p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-red-200">Operations cockpit</p>
            <h2 className="mt-3 text-3xl font-semibold">Every import reshapes the charts, risk score and action list.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">Use Excel or CSV files from Data Management, then filter this dashboard by state, district, project type or risk level to inspect exactly where intervention is needed.</p>
            {lastImport && <p className="mt-4 text-xs text-slate-300">Latest import: {lastImport.action} at {new Date(lastImport.timestamp).toLocaleString()}</p>}
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-lg bg-white/10 p-4 ring-1 ring-white/15"><p className="text-xs text-slate-300">Acquisition Progress</p><p className="mt-1 text-3xl font-semibold">{acquisitionPct}%</p><Progress value={acquisitionPct} tone="green" /></div>
            <div className="rounded-lg bg-white/10 p-4 ring-1 ring-white/15"><p className="text-xs text-slate-300">Filtered Projects</p><p className="mt-1 text-3xl font-semibold">{visibleProjects.length}</p></div>
            <div className="rounded-lg bg-white/10 p-4 ring-1 ring-white/15"><p className="text-xs text-slate-300">Avg Risk</p><p className="mt-1 text-3xl font-semibold">{avgRisk}/100</p></div>
          </div>
        </div>
      </Card>

      <Notice>Synthetic/demo data and prototype prediction logic are used. This interface does not claim access to official government datasets.</Notice>

      <div className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:grid-cols-5">
        {[
          ['state', 'State'],
          ['district', 'District'],
          ['type', 'Project type'],
          ['risk', 'Risk']
        ].map(([key, label]) => (
          <select
            key={key}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100"
            value={filters[key]}
            onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}
          >
            {options[key].map((option) => <option key={option} value={option}>{label}: {option}</option>)}
          </select>
        ))}
        <Button variant="secondary" onClick={() => setFilters({ state: 'All', district: 'All', type: 'All', risk: 'All' })}><RotateCcw size={16} /> Reset Filters</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total Projects" value={visibleProjects.length} icon={BriefcaseBusiness} trend={`${activeProjects.length} active projects in full dataset`} />
        <KpiCard title="High Risk Projects" value={highRisk.length} icon={AlertTriangle} tone="red" trend="Risk score above 60" />
        <KpiCard title="Projects Likely to be Delayed" value={delayed.length} icon={TrendingUp} tone="amber" trend="Delay probability above 55%" />
        <KpiCard title="Average Risk Score" value={`${avgRisk}/100`} icon={MapPin} tone="blue" trend="Weighted prototype score" />
        <KpiCard title="Affected Landowners" value={linkedLandowners.length.toLocaleString('en-IN')} icon={Users} />
        <KpiCard title="Pending Compensation" value={pendingComp.length.toLocaleString('en-IN')} icon={Landmark} tone="amber" />
        <KpiCard title="Legal Disputes" value={linkedCases.length} icon={Gavel} tone="red" />
        <KpiCard title="Rehabilitation Pending" value={rehabPending.toLocaleString('en-IN')} icon={Users} tone="blue" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <ChartCard title="Project Risk Distribution">
          <PieChart>
            <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100} paddingAngle={3}>
              {riskDistribution.map((item) => <Cell key={item.name} fill={colors[item.name]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>
        <Card>
          <h2 className="text-base font-semibold text-slate-950">Risk Summary</h2>
          <div className="mt-5 space-y-4">
            {riskDistribution.map((item) => (
              <button key={item.name} onClick={() => setFilters((current) => ({ ...current, risk: item.name }))} className="block w-full rounded-md border border-slate-100 p-3 text-left transition hover:border-red-200 hover:bg-red-50/40">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span>{item.value} projects</span>
                </div>
                <Progress value={(item.value / projectCount) * 100} tone={item.name === 'Critical' ? 'red' : item.name === 'High' ? 'amber' : item.name === 'Low' ? 'green' : 'blue'} />
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <ChartCard title="District-wise Pending Payments">
          <BarChart data={districtPending}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="district" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="pending" fill="#dc2626" name="Pending landowners" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Risk and Delay Trend From Loaded Data">
          <AreaChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="risk" stroke="#111827" fill="#cbd5e1" name="Avg risk score" />
            <Area type="monotone" dataKey="delay" stroke="#dc2626" fill="#fecaca" name="Avg delay probability" />
          </AreaChart>
        </ChartCard>
      </div>

      <div className="mt-5">
        <h2 className="mb-3 text-lg font-semibold text-slate-950">High-risk Projects</h2>
        <DataTable
          rows={rows}
          columns={[
            { key: 'projectId', label: 'Project ID' },
            { key: 'projectName', label: 'Project Name' },
            { key: 'district', label: 'District' },
            { key: 'currentStage', label: 'Stage' },
            { key: 'risk', label: 'Risk Score', render: (row) => row.prediction.riskScore },
            { key: 'delay', label: 'Delay Probability', render: (row) => `${row.prediction.delayProbability}%` },
            { key: 'level', label: 'Risk Level', render: (row) => <RiskBadge level={row.prediction.riskLevel} /> },
            { key: 'action', label: 'Action', render: (row) => <Link className="font-semibold text-slate-950 underline" to={`/projects/${row.projectId}`}>View Details</Link> }
          ]}
        />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-5">
        {[
          ['Compensation Bottleneck', `${pendingComp.length} landowners have pending or disputed payments.`],
          ['Legal Risk', `${linkedCases.filter((c) => !['Resolved', 'Closed'].includes(c.status)).length} active legal records need monitoring.`],
          ['Acquisition Progress', `Filtered acquisition is ${acquisitionPct}% complete.`],
          ['High-Risk Projects', `${highRisk.length} projects currently exceed the high-risk threshold.`],
          ['Intervention Opportunity', `${highRisk.slice(0, 12).length} projects could reduce delay by addressing top factors.`]
        ].map(([title, body]) => (
          <Card key={title}><p className="font-semibold text-slate-950">{title}</p><p className="mt-2 text-sm text-slate-600">{body}</p></Card>
        ))}
      </div>
    </>
  );
}
