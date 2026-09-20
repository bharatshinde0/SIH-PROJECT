import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Download, FileDown, FileSpreadsheet, FileUp, UploadCloud } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Button, Card, DataTable, PageHeader, RiskBadge } from '../components/UI';

const tabs = ['projects', 'landowners', 'compensation', 'legal cases', 'rehabilitation', 'acquisition stages'];
const templates = {
  projects: ['projectId', 'projectName', 'projectType', 'state', 'district', 'authority', 'landRequired', 'landAcquired', 'affectedFamilies', 'landowners', 'totalCompensation', 'paidCompensation', 'activeLegalCases', 'rehabilitationProgress', 'pendingApprovals', 'documentationCompletion', 'stakeholderResponseTime', 'historicalPerformance', 'currentStage', 'startDate', 'targetCompletionDate'],
  landowners: ['landownerId', 'projectId', 'name', 'district', 'village', 'landArea', 'surveyNumber', 'compensationAmount', 'paymentStatus', 'verificationStatus', 'disputeStatus', 'daysPending'],
  compensation: ['landownerId', 'projectId', 'name', 'district', 'compensationAmount', 'paymentStatus', 'disputeStatus', 'daysPending'],
  'legal cases': ['caseId', 'projectId', 'projectName', 'district', 'issueType', 'filedDate', 'status', 'pendingDays', 'impactLevel'],
  rehabilitation: ['projectId', 'eligibleFamilies', 'rehabilitationCompleted', 'rehabilitationPending', 'rehabilitationProgress', 'housingProgress', 'livelihoodProgress', 'infrastructureProgress'],
  'acquisition stages': ['projectId', 'stageName', 'status', 'startDate', 'expectedDate', 'completionDate', 'delayDays']
};

const requiredFields = {
  projects: ['projectId', 'projectName'],
  landowners: ['landownerId', 'projectId'],
  compensation: ['landownerId', 'projectId'],
  'legal cases': ['caseId', 'projectId'],
  rehabilitation: ['projectId'],
  'acquisition stages': ['projectId', 'stageName']
};

const headerAliases = {
  projectid: 'projectId',
  prjid: 'projectId',
  projectcode: 'projectId',
  projectname: 'projectName',
  projecttitle: 'projectName',
  projecttype: 'projectType',
  requiredland: 'landRequired',
  totalland: 'landRequired',
  landrequired: 'landRequired',
  acquiredland: 'landAcquired',
  landacquired: 'landAcquired',
  affectedfamilies: 'affectedFamilies',
  totalfamilies: 'affectedFamilies',
  totallandowners: 'landowners',
  verifiedlandowners: 'verifiedLandowners',
  totalcompensation: 'totalCompensation',
  compensationtotal: 'totalCompensation',
  paidcompensation: 'paidCompensation',
  compensationpaid: 'paidCompensation',
  activelegalcases: 'activeLegalCases',
  legalcases: 'activeLegalCases',
  rehabilitationprogress: 'rehabilitationProgress',
  rehabprogress: 'rehabilitationProgress',
  pendingapprovals: 'pendingApprovals',
  documentationcompletion: 'documentationCompletion',
  documentcompletion: 'documentationCompletion',
  stakeholderresponsetime: 'stakeholderResponseTime',
  responsetime: 'stakeholderResponseTime',
  historicalperformance: 'historicalPerformance',
  currentstage: 'currentStage',
  stage: 'stageName',
  stagename: 'stageName',
  targetcompletiondate: 'targetCompletionDate',
  landownerid: 'landownerId',
  farmerid: 'landownerId',
  landownername: 'name',
  farmername: 'name',
  landarea: 'landArea',
  surveynumber: 'surveyNumber',
  surveyno: 'surveyNumber',
  compensationamount: 'compensationAmount',
  amount: 'compensationAmount',
  paymentstatus: 'paymentStatus',
  verificationstatus: 'verificationStatus',
  disputestatus: 'disputeStatus',
  dayspending: 'daysPending',
  pendingdays: 'pendingDays',
  caseid: 'caseId',
  issuetype: 'issueType',
  issuedescription: 'issueType',
  fileddate: 'filedDate',
  impactlevel: 'impactLevel',
  severity: 'impactLevel',
  eligiblefamilies: 'eligibleFamilies',
  rehabilitationcompleted: 'rehabilitationCompleted',
  completedfamilies: 'rehabilitationCompleted',
  rehabilitationpending: 'rehabilitationPending',
  pendingfamilies: 'rehabilitationPending',
  housingprogress: 'housingProgress',
  livelihoodprogress: 'livelihoodProgress',
  infrastructureprogress: 'infrastructureProgress',
  startdate: 'startDate',
  expecteddate: 'expectedDate',
  completiondate: 'completionDate',
  delaydays: 'delayDays'
};

const normalizeHeader = (header) => headerAliases[String(header).toLowerCase().replace(/[^a-z0-9]/g, '')] || String(header).trim();
const normalizeRows = (rows) => rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeHeader(key), typeof value === 'string' ? value.trim() : value])));

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  if (!rows.length) return [];
  const headers = rows[0].map(normalizeHeader);
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

async function parseFile(file) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'xlsx' || extension === 'xls') {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '', raw: false });
    return { rows: normalizeRows(rows), sheetName };
  }
  return { rows: normalizeRows(parseCsv(await file.text())), sheetName: 'CSV' };
}

function inferDataset(rows, currentTab) {
  const keys = new Set(Object.keys(rows[0] || {}));
  if (keys.has('caseId') || keys.has('issueType')) return 'legal cases';
  if (keys.has('stageName') || keys.has('delayDays')) return 'acquisition stages';
  if (keys.has('rehabilitationCompleted') || keys.has('housingProgress')) return 'rehabilitation';
  if (keys.has('landownerId') && keys.has('compensationAmount')) return keys.has('landArea') || keys.has('surveyNumber') ? 'landowners' : 'compensation';
  if (keys.has('landownerId')) return 'landowners';
  if (keys.has('projectName') || keys.has('landRequired') || keys.has('currentStage')) return 'projects';
  return currentTab;
}

function toCsv(rows, keys) {
  const escape = (value) => {
    const text = String(value ?? '');
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return [keys.join(','), ...rows.map((row) => keys.map((key) => escape(row[key])).join(','))].join('\n');
}

function downloadCsv(filename, rows, keys) {
  const blob = new Blob([toCsv(rows, keys)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function DataManagement() {
  const [params] = useSearchParams();
  const initial = tabs.includes(params.get('tab')) ? params.get('tab') : 'projects';
  const [tab, setTab] = useState(initial);
  const [query, setQuery] = useState('');
  const [importPreview, setImportPreview] = useState(null);
  const fileInputRef = useRef(null);
  const { projects, landowners, legalCases, updateLandowner, softDeleteProject, importRows, auditLogs } = useData();

  const rows = useMemo(() => {
    const source = tab.includes('landowner') || tab === 'compensation' ? landowners : tab.includes('legal') ? legalCases : projects.filter((p) => !p.deleted);
    return source.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())).slice(0, 100);
  }, [tab, landowners, legalCases, projects, query]);

  const templateKeys = templates[tab] || templates.projects;
  const lastImport = auditLogs.find((log) => log.entity === 'Data Import');

  const validateRows = (dataset, parsedRows) => {
    const required = requiredFields[dataset] || [];
    const errors = [];
    const validRows = [];
    parsedRows.forEach((row, index) => {
      const missing = required.filter((field) => !row[field]);
      if (missing.length) errors.push(`Row ${index + 2}: missing ${missing.join(', ')}`);
      else validRows.push(row);
    });
    return { validRows, errors };
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const { rows: parsedRows, sheetName } = await parseFile(file);
      const detectedDataset = inferDataset(parsedRows, tab);
      const { validRows, errors } = validateRows(detectedDataset, parsedRows);
      setTab(detectedDataset);
      setImportPreview({ fileName: file.name, sheetName, dataset: detectedDataset, validRows, errors, totalRows: parsedRows.length });
    } catch (error) {
      setImportPreview({ fileName: file.name, sheetName: '', dataset: tab, validRows: [], errors: [`Could not read file: ${error.message}`], totalRows: 0 });
    }
    event.target.value = '';
  };

  const confirmImport = () => {
    if (!importPreview?.validRows.length) return;
    importRows(importPreview.dataset, importPreview.validRows);
    setImportPreview(null);
  };

  const exportActiveRows = () => {
    downloadCsv(`land-risk-${tab.replaceAll(' ', '-')}.csv`, rows, templateKeys);
  };

  const downloadTemplate = () => {
    const sample = Object.fromEntries(templateKeys.map((key) => [key, key.includes('Id') ? 'PRJ-001' : '']));
    downloadCsv(`template-${tab.replaceAll(' ', '-')}.csv`, [sample], templateKeys);
  };

  const columns = tab.includes('landowner') || tab === 'compensation'
    ? [
      { key: 'landownerId', label: 'Landowner ID' }, { key: 'name', label: 'Name' }, { key: 'district', label: 'District' }, { key: 'landArea', label: 'Land Area' }, { key: 'compensationAmount', label: 'Compensation' }, { key: 'paymentStatus', label: 'Payment Status' },
      { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><Button variant="secondary" onClick={() => updateLandowner(row.landownerId, { paymentStatus: 'Paid', daysPending: 0 })}>Mark Paid</Button><Button variant="secondary">Edit</Button></div> }
    ]
    : tab.includes('legal')
      ? [{ key: 'caseId', label: 'Case ID' }, { key: 'projectName', label: 'Project' }, { key: 'district', label: 'District' }, { key: 'issueType', label: 'Issue Type' }, { key: 'status', label: 'Status' }, { key: 'pendingDays', label: 'Days Pending' }, { key: 'actions', label: 'Actions', render: () => <Button variant="secondary">Edit</Button> }]
      : [{ key: 'projectId', label: 'Project ID', render: (row) => <Link className="font-semibold text-slate-950 underline" to={`/projects/${row.projectId}`}>{row.projectId}</Link> }, { key: 'projectName', label: 'Project Name', render: (row) => <Link className="font-semibold text-slate-950 hover:text-red-700" to={`/projects/${row.projectId}`}>{row.projectName}</Link> }, { key: 'state', label: 'State' }, { key: 'district', label: 'District' }, { key: 'landRequired', label: 'Land Required' }, { key: 'status', label: 'Status' }, { key: 'risk', label: 'Risk', render: (row) => <RiskBadge level={row.prediction?.riskLevel} /> }, { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><a className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold" href={`/add-project?projectId=${row.projectId}`}>Edit</a><Button variant="danger" onClick={() => window.confirm(`Delete ${row.projectId}?`) && softDeleteProject(row.projectId)}>Delete</Button></div> }];

  return (
    <>
      <PageHeader
        title="Data Management"
        subtitle="Import Excel or CSV records and the dashboard recalculates project risk, compensation, legal pressure and progress automatically."
      />

      <Card className="mb-4 overflow-hidden border-0 bg-[linear-gradient(135deg,#151827_0%,#242843_52%,#991b1b_130%)] p-0 text-white">
        <div className="grid gap-5 p-5 lg:grid-cols-[1.2fr_0.8fr] lg:p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-normal text-red-100 ring-1 ring-white/15">
              <FileSpreadsheet size={14} /> Live data pipeline
            </div>
            <h2 className="mt-4 text-2xl font-semibold">Drop in real project data. The app reacts instantly.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">Excel and CSV uploads are validated, column names are normalized, and related project totals are recalculated before the dashboards render.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button className="bg-red-600 hover:bg-red-500" onClick={() => fileInputRef.current?.click()}><UploadCloud size={17} /> Import Excel/CSV</Button>
              <Button variant="ghost" onClick={downloadTemplate}><FileDown size={17} /> Download Template</Button>
              <Button variant="ghost" onClick={exportActiveRows}><Download size={17} /> Export Current View</Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ['Projects', projects.filter((p) => !p.deleted).length.toLocaleString('en-IN')],
              ['Landowner rows', landowners.length.toLocaleString('en-IN')],
              ['Legal cases', legalCases.length.toLocaleString('en-IN')]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white/10 p-4 ring-1 ring-white/15">
                <p className="text-xs uppercase tracking-normal text-slate-300">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept=".csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" className="hidden" onChange={handleFile} />
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((item) => <button key={item} onClick={() => { setTab(item); setImportPreview(null); }} className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize transition ${tab === item ? 'bg-red-600 text-white shadow-sm shadow-red-600/20' : 'border border-slate-200 bg-white hover:bg-slate-50'}`}>{item}</button>)}
      </div>

      <Card className="mb-4">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_repeat(3,auto)]">
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100" placeholder="Search / filter records" value={query} onChange={(event) => setQuery(event.target.value)} />
          <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option>Sort: Recently updated</option></select>
          <Button>+ Add</Button>
          <Button variant="secondary" onClick={downloadTemplate}><FileDown size={16} /> Template</Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}><UploadCloud size={16} /> Import</Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            ['1', 'Choose a sheet', 'CSV, XLS or XLSX with a header row.'],
            ['2', 'Auto-detect data type', 'Projects, compensation, legal, rehab or stages.'],
            ['3', 'Validate rows', 'Missing IDs are caught before import.'],
            ['4', 'Refresh analytics', 'Risk, charts and totals update from context.']
          ].map(([step, title, body]) => (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={step}>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">{step}</span>
              <p className="mt-2 text-sm font-semibold text-slate-950">{title}</p>
              <p className="mt-1 text-xs text-slate-500">{body}</p>
            </div>
          ))}
        </div>
        {lastImport && <p className="mt-3 text-xs text-slate-500">Last import: {lastImport.action} ({new Date(lastImport.timestamp).toLocaleString()})</p>}
      </Card>

      {importPreview && (
        <Card className={`mb-4 ${importPreview.errors.length ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-900">
                <FileUp size={16} /> {importPreview.fileName}
              </div>
              <p className="mt-3 text-sm text-slate-700">
                Detected <strong className="capitalize">{importPreview.dataset}</strong> from {importPreview.sheetName}. {importPreview.validRows.length} valid rows, {importPreview.errors.length} rows with errors, {importPreview.totalRows} total data rows.
              </p>
              {importPreview.errors.length > 0 && (
                <div className="mt-3 max-h-28 overflow-auto rounded-lg border border-red-200 bg-white p-3 text-sm text-red-700">
                  {importPreview.errors.slice(0, 8).map((error) => <p key={error} className="flex gap-2"><AlertCircle size={16} /> {error}</p>)}
                  {importPreview.errors.length > 8 && <p>...and {importPreview.errors.length - 8} more errors.</p>}
                </div>
              )}
              {!importPreview.errors.length && <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 size={17} /> Ready to import and refresh dashboards.</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setImportPreview(null)}>Cancel</Button>
              <Button disabled={!importPreview.validRows.length} onClick={confirmImport}>Confirm Import</Button>
            </div>
          </div>
          {importPreview.validRows.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-lg border border-white/70 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>{(templates[importPreview.dataset] || templateKeys).slice(0, 8).map((key) => <th className="px-3 py-2 text-left font-semibold text-slate-600" key={key}>{key}</th>)}</tr>
                </thead>
                <tbody>
                  {importPreview.validRows.slice(0, 5).map((row, index) => <tr className="border-t border-slate-100" key={index}>{(templates[importPreview.dataset] || templateKeys).slice(0, 8).map((key) => <td className="px-3 py-2 text-slate-700" key={key}>{row[key]}</td>)}</tr>)}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <DataTable rows={rows} columns={columns} />
    </>
  );
}
