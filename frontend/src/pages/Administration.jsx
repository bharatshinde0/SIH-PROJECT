import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Button, Card, DataTable, PageHeader } from '../components/UI';

export default function Administration() {
  const [params] = useSearchParams();
  const { users, auditLogs, setUserRecord } = useData();
  const section = params.get('section') || 'users';
  return (
    <>
      <PageHeader title="Administration" subtitle="Admin-only user management, roles, system settings and audit trail." />
      <div className="mb-4 flex gap-2">
        <a className={`rounded-md px-3 py-2 text-sm font-semibold ${section === 'users' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white'}`} href="/administration?section=users">User Management</a>
        <a className={`rounded-md px-3 py-2 text-sm font-semibold ${section === 'audit' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white'}`} href="/administration?section=audit">Audit Logs</a>
      </div>
      {section === 'users' ? (
        <DataTable rows={users} columns={[
          { key: 'name', label: 'User' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' },
          { key: 'state', label: 'State' },
          { key: 'district', label: 'District' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: 'Actions', render: (row) => <Button variant="secondary" onClick={() => setUserRecord(row.id, { status: row.status === 'Active' ? 'Inactive' : 'Active' })}>{row.status === 'Active' ? 'Deactivate' : 'Activate'}</Button> }
        ]} />
      ) : (
        <DataTable rows={auditLogs} columns={[
          { key: 'timestamp', label: 'Timestamp', render: (row) => new Date(row.timestamp).toLocaleString() },
          { key: 'user', label: 'User' },
          { key: 'action', label: 'Action' },
          { key: 'entity', label: 'Entity' },
          { key: 'entityId', label: 'Entity ID' },
          { key: 'previousValue', label: 'Previous Value' },
          { key: 'newValue', label: 'New Value' }
        ]} />
      )}
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {['Data Management', 'System Management', 'Operations'].map((title) => <Card key={title}><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm text-slate-500">Clean admin controls for SIH demo operations without changing the core dashboard visual language.</p></Card>)}
      </div>
    </>
  );
}
