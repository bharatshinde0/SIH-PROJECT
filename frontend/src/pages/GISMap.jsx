import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { LocateFixed, MapPinned, Navigation, Search } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Button, Card, PageHeader, Progress, RiskBadge } from '../components/UI';

const colorByRisk = { Low: '#10b981', Medium: '#f59e0b', High: '#f97316', Critical: '#dc2626' };

function icon(level) {
  const color = colorByRisk[level] || '#334155';
  return L.divIcon({
    html: `<span style="display:block;width:22px;height:22px;border-radius:999px;background:${color};border:4px solid white;box-shadow:0 12px 28px rgba(15,23,42,.35);transform:translateY(-4px)"></span>`,
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
}

function MapFocus({ project }) {
  const map = useMap();
  useEffect(() => {
    if (project?.location) {
      map.flyTo([project.location.lat, project.location.lng], 8, { duration: 0.8 });
    }
  }, [map, project]);
  return null;
}

export default function GISMap() {
  const { projects } = useData();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [risk, setRisk] = useState('All');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const active = projects.filter((p) => !p.deleted);
  const filtered = useMemo(() => active.filter((project) => {
    const text = `${project.projectId} ${project.projectName} ${project.state} ${project.district} ${project.projectType}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (risk === 'All' || project.prediction.riskLevel === risk);
  }), [active, query, risk]);

  const selectedProject = active.find((project) => project.projectId === selectedProjectId);
  const visibleProjects = filtered.slice(0, 7);

  const openProject = (projectId) => navigate(`/projects/${projectId}`);

  return (
    <>
      <PageHeader title="GIS Map" subtitle="Risk-colored project map with direct navigation into every project file." />

      <Card className="mb-5 overflow-hidden border-0 bg-[linear-gradient(135deg,#11131d_0%,#27314f_58%,#b91c1c_128%)] p-0 text-white">
        <div className="grid gap-5 p-5 lg:grid-cols-[1.1fr_0.9fr] lg:p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-normal text-red-100 ring-1 ring-white/15">
              <MapPinned size={14} /> Spatial risk intelligence
            </div>
            <h2 className="mt-4 text-2xl font-semibold">Click any marker to open the exact project.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
              Use the filters to narrow the field view, select a project to focus the map, or open its full risk profile in one click.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Mapped projects', filtered.length],
              ['High risk', filtered.filter((p) => p.prediction.riskScore >= 61).length],
              ['Pending payments', filtered.reduce((sum, p) => sum + p.pendingLandowners, 0).toLocaleString('en-IN')]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white/10 p-4 ring-1 ring-white/15">
                <p className="text-xs text-slate-300">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
        <Card className="h-fit">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
            <input
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100"
              placeholder="Search project, district, state"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <select value={risk} onChange={(event) => setRisk(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100">
              {['All', 'Low', 'Medium', 'High', 'Critical'].map((item) => <option key={item}>{item}</option>)}
            </select>
            <Button variant="secondary" onClick={() => { setQuery(''); setRisk('All'); setSelectedProjectId(''); }}>Reset</Button>
          </div>

          <div className="mt-5 space-y-3">
            {visibleProjects.map((project) => (
              <button
                key={project.projectId}
                onMouseEnter={() => setSelectedProjectId(project.projectId)}
                onClick={() => openProject(project.projectId)}
                className={`w-full rounded-lg border p-3 text-left transition hover:border-red-200 hover:bg-red-50 ${selectedProjectId === project.projectId ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{project.projectName}</p>
                    <p className="mt-1 text-xs text-slate-500">{project.projectId} • {project.district}, {project.state}</p>
                  </div>
                  <RiskBadge level={project.prediction.riskLevel} />
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>Acquisition</span>
                    <span>{Math.round((project.landAcquired / Math.max(project.landRequired, 1)) * 100)}%</span>
                  </div>
                  <Progress value={(project.landAcquired / Math.max(project.landRequired, 1)) * 100} tone="green" />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Click to open project details</span>
                  <Navigation size={15} />
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Project geography</p>
              <p className="text-xs text-slate-500">Marker click opens project details directly.</p>
            </div>
            {selectedProject && <Button variant="secondary" onClick={() => openProject(selectedProject.projectId)}><LocateFixed size={16} /> Open Selected</Button>}
          </div>
          <MapContainer center={[22.9734, 78.6569]} zoom={5} scrollWheelZoom>
            <MapFocus project={selectedProject} />
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filtered.map((project) => (
              <Marker
                key={project.projectId}
                position={[project.location.lat, project.location.lng]}
                icon={icon(project.prediction.riskLevel)}
                eventHandlers={{
                  click: () => openProject(project.projectId),
                  mouseover: () => setSelectedProjectId(project.projectId)
                }}
              >
                <Popup>
                  <div className="min-w-56">
                    <strong>{project.projectName}</strong>
                    <p>{project.district}, {project.state}</p>
                    <p>Risk: {project.prediction.riskScore}/100 ({project.prediction.riskLevel})</p>
                    <p>Delay: {project.prediction.delayProbability}%</p>
                    <p>Acquisition: {Math.round((project.landAcquired / Math.max(project.landRequired, 1)) * 100)}%</p>
                    <button onClick={() => openProject(project.projectId)} style={{ color: '#dc2626', fontWeight: 700 }}>Open Project Details</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Card>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {Object.keys(colorByRisk).map((level) => <div key={level} className="flex items-center gap-2 text-sm"><RiskBadge level={level} /></div>)}
      </div>
    </>
  );
}
