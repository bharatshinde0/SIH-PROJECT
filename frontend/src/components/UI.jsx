import { Link } from 'react-router-dom';
import { ResponsiveContainer } from 'recharts';

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal text-slate-950">{title}</h1>
        {subtitle && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return <section className={`rounded-lg border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ${className}`}>{children}</section>;
}

export function KpiCard({ title, value, icon: Icon, trend, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
    red: 'bg-red-50 text-red-700 ring-red-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    blue: 'bg-sky-50 text-sky-700 ring-sky-100'
  };
  const accents = {
    slate: 'from-slate-900 to-slate-500',
    red: 'from-red-600 to-rose-400',
    amber: 'from-amber-500 to-orange-400',
    green: 'from-emerald-500 to-teal-400',
    blue: 'from-sky-500 to-indigo-400'
  };
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accents[tone]}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
          {trend && <p className="mt-2 text-xs text-slate-500">{trend}</p>}
        </div>
        {Icon && <div className={`rounded-md p-2 ring-1 ${tones[tone]}`}><Icon size={20} /></div>}
      </div>
    </Card>
  );
}

export function ChartCard({ title, children, height = 290 }) {
  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-slate-950">{title}</h2>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </Card>
  );
}

export function RiskBadge({ level }) {
  const key = String(level || 'low').toLowerCase();
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold risk-${key}`}>{level}</span>;
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-slate-950 text-white hover:bg-slate-800 shadow-sm shadow-slate-950/15',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15'
  };
  return <button className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

export function LinkButton({ to, children, variant = 'primary' }) {
  const variants = {
    primary: 'bg-slate-950 text-white hover:bg-slate-800 shadow-sm shadow-slate-950/15',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
  };
  return <Link to={to} className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${variants[variant]}`}>{children}</Link>;
}

export function DataTable({ columns, rows, empty = 'No records found.' }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-950">
          <tr>{columns.map((column) => <th key={column.key} className="px-4 py-3 text-left font-semibold text-white">{column.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 && <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>{empty}</td></tr>}
          {rows.map((row, index) => (
            <tr key={row.id || row.projectId || index} className="hover:bg-slate-50">
              {columns.map((column) => <td key={column.key} className="whitespace-nowrap px-4 py-3 text-slate-700">{column.render ? column.render(row) : row[column.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Progress({ value, tone = 'slate' }) {
  const colors = { slate: 'bg-slate-800', red: 'bg-red-600', amber: 'bg-amber-500', green: 'bg-green-600', blue: 'bg-blue-600' };
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div className={`h-2 rounded-full ${colors[tone]}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Notice({ children }) {
  return <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{children}</div>;
}
