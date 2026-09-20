import { Link } from 'react-router-dom';
import { Card, PageHeader } from '../components/UI';

export default function AccessDenied() {
  return (
    <>
      <PageHeader title="Access Denied" subtitle="You do not have permission to access this page." />
      <Card>
        <p className="text-sm text-slate-600">Viewer accounts are read-only. Admin-only screens such as Data Management, User Management and Audit Logs require an Administrator role.</p>
        <Link className="mt-4 inline-flex rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white" to="/dashboard">Return to Dashboard</Link>
      </Card>
    </>
  );
}
