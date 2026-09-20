import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, BarChart3, Bell, BriefcaseBusiness, Building2, ChevronLeft, Database,
  FileBarChart, Gauge, Gavel, Home, Landmark, LayoutDashboard, LogOut, Map, Menu, Search, Settings,
  ShieldCheck, Users
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const baseLinks = [
  ['Home', '/home', Home],
  ['Dashboard', '/dashboard', LayoutDashboard],
  ['Projects', '/projects', BriefcaseBusiness],
  ['Risk Analysis', '/risk-analysis', Gauge],
  ['Delay Prediction', '/delay-prediction', AlertTriangle],
  ['Analytics', '/analytics', BarChart3],
  ['Compensation', '/compensation', Landmark],
  ['Rehabilitation', '/rehabilitation', Building2],
  ['Legal Disputes', '/legal-disputes', Gavel],
  ['GIS Map', '/gis-map', Map],
  ['Alerts', '/alerts', Bell],
  ['Reports', '/reports', FileBarChart],
  ['Settings', '/settings', Settings]
];

const adminLinks = [
  ['Home', '/home', Home],
  ['Dashboard', '/dashboard', LayoutDashboard],
  ['Projects', '/projects', BriefcaseBusiness],
  ['Landowners', '/data-management?tab=landowners', Users],
  ['Compensation', '/compensation', Landmark],
  ['Acquisition Stages', '/data-management?tab=acquisition%20stages', ChevronLeft],
  ['Rehabilitation', '/rehabilitation', Building2],
  ['Legal Disputes', '/legal-disputes', Gavel],
  ['Risk Analysis', '/risk-analysis', Gauge],
  ['Analytics', '/analytics', BarChart3],
  ['GIS Map', '/gis-map', Map],
  ['Alerts', '/alerts', Bell],
  ['Reports', '/reports', FileBarChart],
  ['Data Management', '/data-management', Database],
  ['User Management', '/administration?section=users', ShieldCheck],
  ['Audit Logs', '/administration?section=audit', FileBarChart],
  ['Settings', '/settings', Settings]
];

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const { projects } = useData();
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const links = isAdmin ? adminLinks : baseLinks;
  const result = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return null;
    return projects.find((p) =>
      p.projectId.toLowerCase().includes(term) ||
      p.projectName.toLowerCase().includes(term) ||
      p.district.toLowerCase().includes(term) ||
      p.state.toLowerCase().includes(term)
    );
  }, [projects, search]);

  const submit = (event) => {
    event.preventDefault();
    if (result) {
      navigate(`/projects/${result.projectId}`);
      setSearch('');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.10),transparent_34%),linear-gradient(180deg,#fafafa_0%,#f3f6fb_45%,#eef3f7_100%)] text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-30 hidden border-r border-white/10 bg-[#11131d] text-white shadow-[0_30px_90px_rgba(15,23,42,0.30)] lg:block ${collapsed ? 'w-20' : 'w-72'}`}>
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <img src="/ashok-stambha.svg" alt="Ashok Stambha inspired emblem" className="h-10 w-10 rounded-md bg-white p-1.5 shadow-sm" />
              <div>
                <p className="text-sm font-semibold text-white">Land Risk Intelligence</p>
                <p className="text-xs text-slate-400">Decision support demo</p>
              </div>
            </div>
          )}
          <button className="rounded-md border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
            <Menu size={18} />
          </button>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {links.map(([label, to, Icon]) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-red-600 text-white shadow-sm shadow-red-900/40' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
            >
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={collapsed ? 'lg:pl-20' : 'lg:pl-72'}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200/80 bg-white/85 px-4 shadow-sm backdrop-blur-xl">
          <form onSubmit={submit} className="relative max-w-xl flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
              placeholder="Search project ID, project name, district, state"
            />
          </form>
          <div className="hidden rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 md:block">India Demo Dataset</div>
          <div className={`rounded-md px-3 py-2 text-sm font-semibold ${isAdmin ? 'bg-red-600 text-white' : 'bg-sky-50 text-sky-800'}`}>
            {isAdmin ? 'Administrator' : 'VIEW MODE'}
          </div>
          <button onClick={logout} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-100" aria-label="Logout">
            <LogOut size={18} />
          </button>
        </header>
        {!isAdmin && (
          <div className="border-b border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-900">
            You're viewing read-only project intelligence. Editing and administration controls are hidden and blocked by backend authorization.
          </div>
        )}
        <main className="mx-auto max-w-[1500px] px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
