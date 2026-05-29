import './App.css';
import { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { Toaster } from 'sonner';

import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { TechnicianDashboard } from './components/TechnicianDashboard';
import { MarketingDashboard } from './components/MarketingDashboard';
import { Loader } from './components/Loader';
import { AdminLogin } from './admin/AdminLogin';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './components/LandingPage';

import { BrandSelection } from './components/steps/BrandSelection';
import { ModelSelection } from './components/steps/ModelSelection';
import { IssueSelection } from './components/steps/IssueSelection';
import { PricingDisplay } from './components/steps/PricingDisplay';
import { LeadCapture } from './components/steps/LeadCapture';
import { Confirmation } from './components/steps/Confirmation';

import type { FormData } from './types';

// ─── Repair step config ───────────────────────────────────────────────────────
const REPAIR_STEPS = [
  { slug: '',             label: 'Brand',        Component: BrandSelection },
  { slug: 'model',        label: 'Model',        Component: ModelSelection },
  { slug: 'issue',        label: 'Issue',        Component: IssueSelection },
  { slug: 'pricing',      label: 'Pricing',      Component: PricingDisplay },
  { slug: 'contact',      label: 'Contact',      Component: LeadCapture },
  { slug: 'confirmation', label: 'Confirmation', Component: Confirmation },
] as const;

type StepSlug = (typeof REPAIR_STEPS)[number]['slug'];

// Module-level shared form data (survives route changes in same session)
let sharedFormData: FormData = {} as FormData;

// ─── RepairStepPage ───────────────────────────────────────────────────────────
const RepairStepPage: React.FC<{ slug: StepSlug }> = ({ slug }) => {
  const navigate = useNavigate();
  const { location } = useParams<{ location?: string }>();
  const [formData, setFormData] = useState<FormData>(sharedFormData);

  const base = location ? `/${location}/repair` : '/repair';
  const stepIndex = REPAIR_STEPS.findIndex((s) => s.slug === slug);
  const { Component } = REPAIR_STEPS[stepIndex];

  const updateFormData = (partial: Partial<FormData>) => {
    sharedFormData = { ...sharedFormData, ...partial };
    setFormData({ ...sharedFormData });
  };

  const goToNextStep = () => {
    const next = REPAIR_STEPS[stepIndex + 1];
    if (!next) return;
    navigate(next.slug ? `${base}/${next.slug}` : base);
  };

  const goToPreviousStep = () => {
    if (stepIndex === 0) {
      navigate(location ? `/${location}` : '/');
      return;
    }
    const prev = REPAIR_STEPS[stepIndex - 1];
    navigate(prev.slug ? `${base}/${prev.slug}` : base);
  };

  return (
    <Component
      formData={formData}
      updateFormData={updateFormData}
      goToNextStep={goToNextStep}
      goToPreviousStep={goToPreviousStep}
    />
  );
};

// ─── Legacy redirect ──────────────────────────────────────────────────────────
const LegacyRepairRedirect: React.FC = () => {
  const { location } = useParams<{ location?: string }>();
  return <Navigate to={location ? `/${location}/repair` : '/repair'} replace />;
};

// ─── RepairFlowShell ──────────────────────────────────────────────────────────
const RepairFlowShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="repair-flow-shell">{children}</div>
);

// ─── Helper: build repair routes ──────────────────────────────────────────────
const repairRoutes = (prefix: string) =>
  REPAIR_STEPS.map(({ slug }) => {
    const path = slug
      ? `${prefix}/repair/${slug}`
      : `${prefix}/repair`;
    return (
      <Route
        key={path}
        path={path}
        element={
          <RepairFlowShell>
            <RepairStepPage slug={slug} />
          </RepairFlowShell>
        }
      />
    );
  });

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}

      <div
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: loaded ? 'auto' : 'none',
        }}
      >
        <BrowserRouter>
          <Routes>
            {/* ── Staff portals — NO Layout wrapper ── */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/technician"
              element={
                <ProtectedRoute role="technician">
                  <TechnicianDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/marketing"
              element={
                <ProtectedRoute role="marketing">
                  <MarketingDashboard />
                </ProtectedRoute>
              }
            />

            {/* ── Public routes — inside Layout ── */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    {/* Marketing / home */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/:location" element={<HomePage />} />

                    {/* Repair flow — /repair/* */}
                    {repairRoutes('')}

                    {/* Repair flow — /:location/repair/* */}
                    {repairRoutes('/:location')}

                    {/* Legacy redirect */}
                    <Route path="/repair/:location" element={<LegacyRepairRedirect />} />

                    {/* Customer booking tracker */}
                    <Route path="/dashboard/:bookingId" element={<Dashboard />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </BrowserRouter>

        <Toaster position="top-center" richColors />
      </div>
    </>
  );
}

export default App;
