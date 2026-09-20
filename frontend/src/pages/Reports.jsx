import { Download, FileText, Printer } from 'lucide-react';
import { Button, Card, PageHeader } from '../components/UI';

export default function Reports() {
  const reports = ['Project Risk Report', 'District Performance Report', 'State Analytics Report', 'Compensation Report', 'Legal Dispute Report', 'Rehabilitation Report', 'Delay Prediction Report'];
  return (
    <>
      <PageHeader title="Reports" subtitle="Generate SIH demo reports and export analytical datasets." />
      <div className="grid gap-4 md:grid-cols-3">
        {reports.map((report) => (
          <Card key={report}>
            <FileText className="text-slate-600" />
            <h2 className="mt-3 font-semibold">{report}</h2>
            <p className="mt-2 text-sm text-slate-500">Includes synthetic data disclosure, current filters and latest prototype risk predictions.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary"><Download size={16} /> Export CSV</Button>
              <Button variant="secondary"><Download size={16} /> Download PDF</Button>
              <Button variant="secondary"><Printer size={16} /> Print</Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
