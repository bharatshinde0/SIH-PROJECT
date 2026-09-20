import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Button, DataTable, LinkButton, PageHeader, Progress, RiskBadge } from '../components/UI';

export default function Projects() {
  const { projects, softDeleteProject } = useData();
  const { isAdmin } = useAuth();
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
  const [risk, setRisk] = useState(params.get('risk') || 'All');

  const filtered = useMemo(() => projects.filter((p) => !p.deleted)
    .filter((p) => risk === 'All' || p.prediction.riskLevel === risk)
    .filter((p) => {
      const text = `${p.projectId} ${p.projectName} ${p.state} ${p.district} ${p.projectType} ${p.currentStage}`.toLowerCase();
      return text.includes(query.toLowerCase());
    }), [projects, query, risk]);

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Search, filter and inspect acquisition projects across lifecycle, risk and compensation dimensions."
        actions={isAdmin && <LinkButton to="/add-project"><Plus size={16} /> Add Project</LinkButton>}
      />
      <div className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
        <input className="rounded-md border border-slate-200 px-3 py-2 text-sm md:col-span-2" placeholder="Search projects" value={query} onChange={(event) => setQuery(event.target.value)} />
        {['State', 'District', 'Project type', 'Stage'].map((item) => <select key={item} className="rounded-md border border-slate-200 px-3 py-2 text-sm"><option>{item}: All</option></select>)}
        <select value={risk} onChange={(event) => setRisk(event.target.value)} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
          {['All', 'Low', 'Medium', 'High', 'Critical'].map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <DataTable
        rows={filtered}
        columns={[
          { key: 'projectId', label: 'Project ID', render: (row) => <Link className="font-semibold text-slate-950 underline" to={`/projects/${row.projectId}`}>{row.projectId}</Link> },
          { key: 'projectName', label: 'Project Name', render: (row) => <Link className="font-semibold text-slate-950 hover:text-red-700" to={`/projects/${row.projectId}`}>{row.projectName}</Link> },
          { key: 'location', label: 'Location', render: (row) => `${row.district}, ${row.state}` },
          { key: 'land', label: 'Land Required', render: (row) => `${row.landRequired.toLocaleString('en-IN')} acre` },
          { key: 'progress', label: 'Land Acquired', render: (row) => <div className="w-36"><p className="mb-1 text-xs">{Math.round(row.landAcquired / row.landRequired * 100)}%</p><Progress value={row.landAcquired / row.landRequired * 100} /></div> },
          { key: 'families', label: 'Families' },
          { key: 'comp', label: 'Compensation', render: (row) => `${Math.round(row.paidCompensation / row.totalCompensation * 100)}%` },
          { key: 'stage', label: 'Stage', render: (row) => row.currentStage },
          { key: 'risk', label: 'Risk', render: (row) => `${row.prediction.riskScore}/100` },
          { key: 'delay', label: 'Delay', render: (row) => `${row.prediction.delayProbability}%` },
          { key: 'level', label: 'Level', render: (row) => <RiskBadge level={row.prediction.riskLevel} /> },
          { key: 'action', label: 'Action', render: (row) => (
            <div className="flex gap-2">
              <Link className="font-semibold text-slate-950 underline" to={`/projects/${row.projectId}`}>Details</Link>
              {isAdmin && <Button variant="secondary" onClick={() => window.confirm(`Delete ${row.projectId}?`) && softDeleteProject(row.projectId)}>Delete</Button>}
            </div>
          ) }
        ]}
      />
    </>
  );
}
