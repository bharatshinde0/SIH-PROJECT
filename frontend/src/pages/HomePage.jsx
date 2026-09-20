import { Link } from 'react-router-dom';
import { Activity, ArrowRight, BrainCircuit, Database, FileUp, Gauge, Landmark, Map, ShieldCheck, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Card, ChartCard, KpiCard, Notice, Progress, RiskBadge } from '../components/UI';

const colors = { Low: '#16a34a', Medium: '#d97706', High: '#ea580c', Critical: '#dc2626' };

export default function HomePage() {
  const { isAdmin, user } = useAuth();
  const { projects, landowners, legalCases } = useData();
  const active = projects.filter((p) => !p.deleted);
  const highRisk = active.filter((p) => p.prediction.riskScore >= 61);
  const critical = active.filter((p) => p.prediction.riskLevel === 'Critical');
  const pendingPayments = landowners.filter((l) => l.paymentStatus !== 'Paid');
  const topProject = [...active].sort((a, b) => b.prediction.riskScore - a.prediction.riskScore)[0];
  const distribution = ['Low', 'Medium', 'High', 'Critical'].map((name) => ({ name, value: active.filter((p) => p.prediction.riskLevel === name).length }));
  const priorityDistricts = Object.values(active.reduce((acc, project) => {
    acc[project.district] ||= { district: project.district, pending: 0, risk: 0, count: 0 };
    acc[project.district].pending += project.pendingLandowners;
    acc[project.district].risk += project.prediction.riskScore;
    acc[project.district].count += 1;
    return acc;
  }, {})).map((row) => ({ ...row, avgRisk: Math.round(row.risk / row.count) })).sort((a, b) => b.pending - a.pending).slice(0, 6);

  const flow = [
    ['Admin enters data', 'Projects, farmers, compensation, legal cases and rehabilitation records.', Database],
    ['AI analyzes risk', 'Prototype engine calculates separate risk score and delay probability.', BrainCircuit],
    ['System explains why', 'Top factors show compensation, legal, approvals and documentation impact.', Gauge],
    ['Teams take action', 'Recommendations guide payments, escalation, approvals and monitoring.', Activity]
  ];

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="grid gap-0 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="p-6 md:p-8 xl:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
              <ShieldCheck size={16} /> SIH prototype with synthetic demo data
            </div>
            <h1 className="mt-5 max-w-4xl text-3xl font-semibold leading-tight tracking-normal text-slate-950 md:text-5xl">
              Predict land acquisition delays before they become infrastructure bottlenecks.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              A practical decision-support workspace for administrators: import field data, monitor acquisition progress, understand risk drivers, and act before delays escalate.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
                Open intelligence dashboard <ArrowRight size={17} />
              </Link>
              {isAdmin && (
                <Link to="/data-management" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                  Import or manage CSV data <FileUp size={17} />
                </Link>
              )}
              <Link to="/gis-map" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                View GIS map <Map size={17} />
              </Link>
            </div>
            <div className="mt-8 grid gap-3 md:grid-cols-4">
              <KpiCard title="Projects monitored" value={active.length} icon={Landmark} />
              <KpiCard title="High-risk projects" value={highRisk.length} icon={Gauge} tone="red" />
              <KpiCard title="Pending farmer payments" value={pendingPayments.length} icon={Users} tone="amber" />
              <KpiCard title="Legal cases tracked" value={legalCases.length} icon={ShieldCheck} tone="blue" />
            </div>
          </div>
          <div className="border-t border-slate-200 bg-slate-950 p-6 text-white xl:border-l xl:border-t-0">
            <p className="text-sm font-semibold text-slate-300">Most urgent project</p>
            <h2 className="mt-3 text-2xl font-semibold">{topProject.projectName}</h2>
            <p className="mt-2 text-sm text-slate-300">{topProject.district}, {topProject.state} • {topProject.currentStage}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-slate-300">Risk score</p>
                <p className="mt-2 text-4xl font-semibold">{topProject.prediction.riskScore}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-slate-300">Delay probability</p>
                <p className="mt-2 text-4xl font-semibold">{topProject.prediction.delayProbability}%</p>
              </div>
            </div>
            <div className="mt-5 rounded-lg border border-white/10 bg-white/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-slate-300">Current status</span>
                <RiskBadge level={topProject.prediction.riskLevel} />
              </div>
              <Progress value={topProject.prediction.riskScore} tone="red" />
              <p className="mt-4 text-sm leading-6 text-slate-300">{topProject.prediction.recommendations[0]?.action}</p>
            </div>
            <Link to={`/projects/${topProject.projectId}`} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100">
              Review project intelligence <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <Notice>
        Logged in as {user?.role === 'ADMIN' ? 'Administrator' : 'Viewer'}. {isAdmin ? 'You can import CSV data, update records and recalculate risk.' : 'You can monitor dashboards and reports in read-only mode.'}
      </Notice>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">How the platform works</h2>
          <div className="mt-5 grid gap-3">
            {flow.map(([title, text, Icon], index) => (
              <div key={title} className="grid grid-cols-[40px_1fr] gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-800 shadow-sm"><Icon size={19} /></div>
                <div>
                  <p className="font-semibold text-slate-950">{index + 1}. {title}</p>
                  <p className="mt-1 text-sm text-slate-600">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="grid gap-5 md:grid-cols-2">
          <ChartCard title="Risk mix at a glance">
            <PieChart>
              <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92}>
                {distribution.map((item) => <Cell key={item.name} fill={colors[item.name]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ChartCard>
          <ChartCard title="Priority districts by pending payments">
            <BarChart data={priorityDistricts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="district" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pending" fill="#334155" />
            </BarChart>
          </ChartCard>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          ['For administrators', 'Import CSV files, correct records, update compensation, and watch risk scores change.', '/data-management'],
          ['For decision makers', 'Open the dashboard to understand total risk, bottlenecks and district priorities quickly.', '/dashboard'],
          ['For field review', 'Use GIS and project pages to inspect location, stage, farmers, legal cases and recommendations.', '/gis-map']
        ].map(([title, text, to]) => (
          <Link key={title} to={to} className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(15,23,42,0.09)]">
            <p className="font-semibold text-slate-950">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">Open <ArrowRight size={16} /></span>
          </Link>
        ))}
      </div>
    </>
  );
}
