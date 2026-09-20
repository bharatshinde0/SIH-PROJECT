import { Link, useParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { stagePredictions } from '../utils/riskEngine';
import { Card, ChartCard, KpiCard, LinkButton, Notice, PageHeader, Progress, RiskBadge } from '../components/UI';

export default function ProjectDetails() {
  const { projectId } = useParams();
  const { projects } = useData();
  const { isAdmin } = useAuth();
  const project = projects.find((item) => item.projectId === projectId);
  if (!project) return <PageHeader title="Project not found" subtitle="The requested project could not be located." />;
  const factors = project.prediction.contributingFactors;
  const stageData = stagePredictions(project);

  return (
    <>
      <PageHeader
        title={`Project: ${project.projectName}`}
        subtitle={`${project.projectId} • ${project.district}, ${project.state} • ${project.projectType}`}
        actions={isAdmin && <LinkButton to={`/add-project?projectId=${project.projectId}`}>Edit Project</LinkButton>}
      />
      <Notice>Prediction results are prototype estimates based on project parameters. The scoring engine can be replaced by a trained ML model later.</Notice>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Risk Score" value={`${project.prediction.riskScore}/100`} tone="red" />
        <KpiCard title="Delay Probability" value={`${project.prediction.delayProbability}%`} tone="amber" />
        <KpiCard title="Expected Delay" value={project.prediction.expectedDelay} />
        <KpiCard title="Current Stage" value={project.currentStage} tone="blue" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">AI Project Risk Score</h2>
              <p className="mt-2 text-5xl font-semibold text-slate-950">{project.prediction.riskScore}</p>
              <div className="mt-3"><RiskBadge level={project.prediction.riskLevel} /></div>
              <p className="mt-4 text-sm text-slate-600">Risk score and delay probability are separate outputs. Top risk drivers are explained below.</p>
            </div>
            <div className="w-48">
              <Progress value={project.prediction.riskScore} tone={project.prediction.riskScore > 80 ? 'red' : 'amber'} />
              <p className="mt-2 text-sm text-slate-500">{project.prediction.delayProbability}% predicted delay probability</p>
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">Project Identity</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {[
              ['Authority', project.authority],
              ['Land Required', `${project.landRequired} acre`],
              ['Land Acquired', `${project.landAcquired} acre`],
              ['Remaining Land', `${project.remainingLand} acre`],
              ['Affected Families', project.affectedFamilies],
              ['Landowners', project.landowners],
              ['Start Date', project.startDate],
              ['Target Completion', project.targetCompletionDate]
            ].map(([label, value]) => <div key={label}><dt className="text-slate-500">{label}</dt><dd className="font-semibold text-slate-900">{value}</dd></div>)}
          </dl>
        </Card>
      </div>

      <Card className="mt-5">
        <h2 className="text-lg font-semibold text-slate-950">Acquisition Lifecycle</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-9">
          {project.lifecycle.map((stage) => (
            <div key={stage.stageName} className={`rounded-lg border p-3 ${stage.stageName === project.currentStage ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'}`}>
              <p className="text-sm font-semibold">{stage.stageName}</p>
              <p className="mt-2 text-xs opacity-80">{stage.status}</p>
              <p className="mt-2 text-xs opacity-80">Delay: {stage.delayDays} days</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">Why is this project at risk?</h2>
          <div className="mt-5 space-y-4">
            {factors.map((factor) => (
              <div key={factor.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{factor.name}</span>
                  <span>{factor.contribution}%</span>
                </div>
                <Progress value={factor.contribution} tone={factor.contribution > 24 ? 'red' : 'amber'} />
                <p className="mt-1 text-xs text-slate-500">{factor.reason}</p>
              </div>
            ))}
          </div>
        </Card>
        <ChartCard title="Stage-level Delay Prediction">
          <BarChart data={stageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" hide />
            <YAxis />
            <Tooltip />
            <Bar dataKey="delayProbability" fill="#334155" name="Delay probability %" />
          </BarChart>
        </ChartCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        {project.prediction.recommendations.map((rec) => (
          <Card key={rec.title}>
            <p className="text-sm font-semibold text-slate-950">{rec.title}</p>
            <p className="mt-2 text-xs font-semibold text-red-700">Priority: {rec.priority}</p>
            <p className="mt-3 text-sm text-slate-600">{rec.detail}</p>
            <p className="mt-3 text-sm text-slate-900">{rec.action}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-5">
        <h2 className="text-lg font-semibold text-slate-950">Presentation Flow</h2>
        <p className="mt-2 text-sm text-slate-600">Open <Link className="font-semibold underline" to="/data-management?tab=landowners">Data Management</Link>, mark pending payments as paid, then return here to see risk, factors and recommendations update automatically.</p>
      </Card>
    </>
  );
}
