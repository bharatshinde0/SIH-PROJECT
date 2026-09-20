import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, LockKeyhole, Mail, MapPinned, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Card } from '../components/UI';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = (event) => {
    event.preventDefault();
    setError('');
    try {
      login(form.email, form.password);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-stage relative min-h-screen overflow-hidden bg-[#11131d] px-4 py-8 text-white">
      <div className="login-scanline" />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative z-10">
          <div className="login-reveal inline-flex items-center gap-3 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-black/20 backdrop-blur">
            <img src="/ashok-stambha.svg" alt="Ashok Stambha inspired emblem" className="h-10 w-10 rounded-md bg-white p-1.5" />
            <span>Land Acquisition Governance Intelligence</span>
          </div>

          <h1 className="login-reveal mt-7 max-w-3xl text-5xl font-semibold leading-tight tracking-normal text-white [animation-delay:120ms]">
            Predict land delays with a calm, official command center.
          </h1>
          <p className="login-reveal mt-5 max-w-2xl text-base leading-7 text-slate-300 [animation-delay:220ms]">
            Monitor projects, compensation, legal pressure, rehabilitation progress and GIS risk in one secure decision-support workspace.
          </p>

          <div className="login-reveal mt-8 grid gap-3 sm:grid-cols-3 [animation-delay:320ms]">
            {[
              [BarChart3, 'Live analytics', 'Risk, delay and payment signals update after imports.'],
              [MapPinned, 'GIS aware', 'Every project can be inspected directly from the map.'],
              [ShieldCheck, 'Role based', 'Admin and user views stay cleanly separated.']
            ].map(([Icon, title, body]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur transition hover:-translate-y-1 hover:bg-white/15">
                <Icon className="text-red-300" size={22} />
                <p className="mt-3 text-sm font-semibold">{title}</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="login-card relative z-10 overflow-hidden border-white/10 bg-white/95 p-0 text-slate-950 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
          <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_58%,#fee2e2_100%)] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">Sign in</h2>
                <p className="mt-1 text-sm text-slate-500">Access is assigned by account role.</p>
              </div>
              <img src="/ashok-stambha.svg" alt="Ashok Stambha inspired emblem" className="h-16 w-16 rounded-lg border border-slate-200 bg-white p-2 shadow-sm" />
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4 p-6">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <span className="mt-1 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 transition focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-100">
                <Mail size={18} className="text-slate-400" />
                <input className="w-full bg-transparent text-sm outline-none" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Enter registered email" />
              </span>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <span className="mt-1 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 transition focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-100">
                <LockKeyhole size={18} className="text-slate-400" />
                <input type="password" className="w-full bg-transparent text-sm outline-none" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter password" />
              </span>
            </label>
            {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            <Button className="w-full py-3" type="submit">Login <ArrowRight size={17} /></Button>
          </form>

          <div className="grid grid-cols-3 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
            {['Protected access', 'Verified records', 'Live dashboard'].map((item) => (
              <div key={item} className="border-r border-slate-200 px-2 py-3 last:border-r-0">{item}</div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
