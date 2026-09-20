import { useData } from '../context/DataContext';
import { Button, Card, PageHeader } from '../components/UI';

export default function Settings() {
  const { resetDemoData } = useData();
  return (
    <>
      <PageHeader title="Profile / Settings" subtitle="Demo profile, risk thresholds, notification preferences and prototype disclosure." />
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Prediction Disclosure</h2>
          <p className="mt-2 text-sm text-slate-600">This prototype uses configurable scoring logic and synthetic records. A real deployment should connect audited datasets and trained models through the ML service.</p>
        </Card>
        <Card>
          <h2 className="font-semibold">Demo Controls</h2>
          <p className="mt-2 text-sm text-slate-600">Reset local browser data to restore the original SIH demo dataset.</p>
          <Button className="mt-4" variant="secondary" onClick={resetDemoData}>Reset Demo Data</Button>
        </Card>
      </div>
    </>
  );
}
