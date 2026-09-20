import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Button, Card, DataTable, PageHeader, RiskBadge } from '../components/UI';

export default function Alerts() {
  const { alerts, updateAlert } = useData();
  const { isAdmin } = useAuth();
  return (
    <>
      <PageHeader title="Alerts & Recommendations" subtitle="Configurable operational alerts based on delay probability, compensation, legal and rehabilitation rules." />
      <div className="mb-5 grid gap-4 md:grid-cols-4">
        {[
          ['Delay probability > 75%', 'Critical Risk Alert'],
          ['Compensation pending > 60 days', 'Compensation Delay Alert'],
          ['Legal disputes above threshold', 'Legal Risk Alert'],
          ['Rehabilitation progress below target', 'Rehabilitation Alert']
        ].map(([rule, alert]) => <Card key={rule}><p className="text-sm font-semibold">{rule}</p><p className="mt-2 text-sm text-slate-600">Generate: {alert}</p></Card>)}
      </div>
      <DataTable rows={alerts} columns={[
        { key: 'severity', label: 'Severity', render: (row) => <RiskBadge level={row.severity} /> },
        { key: 'alertType', label: 'Alert Type' },
        { key: 'message', label: 'Message' },
        { key: 'status', label: 'Status' },
        { key: 'assignedTo', label: 'Assigned Action' },
        { key: 'action', label: 'Action', render: (row) => isAdmin ? <div className="flex gap-2"><Button variant="secondary" onClick={() => updateAlert(row.id, { status: 'Read' })}>Mark read</Button><Button variant="secondary" onClick={() => updateAlert(row.id, { assignedTo: 'Project Manager' })}>Assign</Button></div> : 'View' }
      ]} />
    </>
  );
}
