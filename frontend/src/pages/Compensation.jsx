import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Button, ChartCard, DataTable, KpiCard, PageHeader } from '../components/UI';

export default function Compensation() {
  const { landowners, projects, updateLandowner } = useData();
  const { isAdmin } = useAuth();
  const [status, setStatus] = useState('All');
  const filtered = landowners.filter((item) => status === 'All' || item.paymentStatus === status);
  const paid = landowners.filter((l) => l.paymentStatus === 'Paid');
  const pending = landowners.filter((l) => l.paymentStatus === 'Pending');
  const disputed = landowners.filter((l) => l.paymentStatus === 'Disputed');
  const totalAmount = landowners.reduce((s, l) => s + l.compensationAmount, 0);
  const paidAmount = paid.reduce((s, l) => s + l.compensationAmount, 0);
  const pie = ['Paid', 'Pending', 'Disputed', 'Under Verification'].map((name) => ({ name, value: landowners.filter((l) => l.paymentStatus === name || l.verificationStatus === name).length }));
  const district = Object.values(landowners.reduce((acc, l) => {
    acc[l.district] ||= { district: l.district, pending: 0 };
    if (l.paymentStatus !== 'Paid') acc[l.district].pending += 1;
    return acc;
  }, {})).sort((a, b) => b.pending - a.pending).slice(0, 10);

  return (
    <>
      <PageHeader title="Compensation & Landowner Intelligence" subtitle="Payment progress, disputed records, pending days and district bottlenecks." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard title="Total Landowners" value={landowners.length} />
        <KpiCard title="Compensation Approved" value={`₹${Math.round(totalAmount)} Cr`} />
        <KpiCard title="Compensation Paid" value={`₹${Math.round(paidAmount)} Cr`} tone="green" />
        <KpiCard title="Payment Pending" value={pending.length} tone="amber" />
        <KpiCard title="Payment Disputed" value={disputed.length} tone="red" />
        <KpiCard title="Avg Processing Time" value={`${Math.round(landowners.reduce((s, l) => s + l.daysPending, 0) / landowners.length)} days`} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <ChartCard title="Compensation Status">
          <PieChart>
            <Pie data={pie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95}>
              {pie.map((_, i) => <Cell key={i} fill={['#16a34a', '#d97706', '#dc2626', '#2563eb'][i]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>
        <ChartCard title="District-wise Pending Payments">
          <BarChart data={district}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="district" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="pending" fill="#334155" />
          </BarChart>
        </ChartCard>
      </div>
      <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">Affected Landowners &rarr; Verified &rarr; Compensation Approved &rarr; Payment Processed &rarr; Payment Completed</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {[landowners.length, landowners.filter((l) => l.verificationStatus === 'Verified').length, Math.round(landowners.length * 0.83), Math.round(landowners.length * 0.76), paid.length].map((value, i) => <div key={i} className="rounded-md border border-slate-200 p-3 text-center"><p className="text-xl font-semibold">{value}</p></div>)}
        </div>
      </div>
      <div className="mt-5">
        <div className="mb-3 flex gap-3">
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
            {['All', 'Paid', 'Pending', 'Disputed'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <span className="text-sm text-slate-500">Admin updates recalculate linked project risk.</span>
        </div>
        <DataTable rows={filtered.slice(0, 100)} columns={[
          { key: 'landownerId', label: 'Landowner ID' },
          { key: 'district', label: 'District' },
          { key: 'landArea', label: 'Land Area', render: (row) => `${row.landArea} acre` },
          { key: 'compensationAmount', label: 'Compensation', render: (row) => `₹${row.compensationAmount} Cr` },
          { key: 'paymentStatus', label: 'Status' },
          { key: 'daysPending', label: 'Days Pending' },
          { key: 'action', label: 'Action', render: (row) => isAdmin && row.paymentStatus !== 'Paid' ? <Button variant="secondary" onClick={() => updateLandowner(row.landownerId, { paymentStatus: 'Paid', daysPending: 0, disputeStatus: 'None' })}>Mark Paid</Button> : 'View' }
        ]} />
      </div>
    </>
  );
}
