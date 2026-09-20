import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import AddProject from './pages/AddProject';
import RiskAnalysis from './pages/RiskAnalysis';
import DelayPrediction from './pages/DelayPrediction';
import Compensation from './pages/Compensation';
import Rehabilitation from './pages/Rehabilitation';
import LegalDisputes from './pages/LegalDisputes';
import GISMap from './pages/GISMap';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Administration from './pages/Administration';
import DataManagement from './pages/DataManagement';
import Settings from './pages/Settings';
import AccessDenied from './pages/AccessDenied';
import { useAuth } from './context/AuthContext';

function Protected({ children, adminOnly = false }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/access-denied" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<HomePage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId" element={<ProjectDetails />} />
        <Route path="add-project" element={<Protected adminOnly><AddProject /></Protected>} />
        <Route path="risk-analysis" element={<RiskAnalysis />} />
        <Route path="delay-prediction" element={<DelayPrediction />} />
        <Route path="compensation" element={<Compensation />} />
        <Route path="rehabilitation" element={<Rehabilitation />} />
        <Route path="legal-disputes" element={<LegalDisputes />} />
        <Route path="gis-map" element={<GISMap />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="reports" element={<Reports />} />
        <Route path="administration" element={<Protected adminOnly><Administration /></Protected>} />
        <Route path="data-management" element={<Protected adminOnly><DataManagement /></Protected>} />
        <Route path="settings" element={<Settings />} />
        <Route path="access-denied" element={<AccessDenied />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
