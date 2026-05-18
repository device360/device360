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
import { Loader } from './components/Loader';
import { AdminLogin } from './admin/AdminLogin';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './components/LandingPage';

// Step components
import { BrandSelection } from './components/steps/BrandSelection';
import { ModelSelection } from './components/steps/ModelSelection';
import { IssueSelection } from './components/steps/IssueSelection';
import { PricingDisplay } from './components/steps/PricingDisplay';
import { LeadCapture } from './components/steps/LeadCapture';
import { Confirmation } from './components/steps/Confirmation';

import type { FormData } from './types';

// ─── Repair step order ────────────────────────────────────────────────────────
// Each slug maps to a step component. The order here drives prev/next navigation.
const REPAIR_STEPS = [
  { slug: '',            label: 'Brand',        Component: BrandSelection },
  { slug: 'model',       label: 'Model',        Component: ModelSelection },
  { slug: 'issue',       label: 'Issue',        Component: IssueSelection },
  { slug: 'pricing',     label: 'Pricing',      Component: PricingDisplay },
  { slug: 'contact',     label: 'Contact',      Component: LeadCapture },
  { slug: 'confirmation',label: 'Confirmation', Component: Confirmation },
] as const;

type StepSlug = (typeof REPAIR_STEPS)[number]['slug'];

// ─── Shared form-data store (lifted above the router) ─────────────────────────
// We keep this outside components so it survives route changes inside the same
// BrowserRouter session. For multi-tab / refresh persistence you could swap
// this for sessionStorage, but for in-session tracking this is enough.
let sharedFormData: FormData = {} as FormData;

// ─── RepairStepPage ────────────────────────────────────────────────────────────
// Renders the correct step component based on the current URL, and wires
// goToNextStep / goToPreviousStep to push the matching route.
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
    const path = next.slug ? `${base}/${next.slug}` : base;
    navigate(path);
  };

  const goToPreviousStep = () => {
    if (stepIndex === 0) {
      navigate(location ? `/${location}` : '/');
      return;
    }
    const prev = REPAIR_STEPS[stepIndex - 1];
    const path = prev.slug ? `${base}/${prev.slug}` : base;
    navigate(path);
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

// ─── RepairFlowShell (optional: shared progress bar / header for repair steps) ─
// Wrap the repair routes in a common shell so you can add a stepper UI later.
const RepairFlowShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();

  // Derive active step index from URL so you can render a progress bar here
  const activeSlug = pathname.split('/repair')[1]?.replace(/^\//, '') ?? '' as StepSlug;
  const activeIndex = REPAIR_STEPS.findIndex((s) => s.slug === activeSlug);

  return (
    <div className="repair-flow-shell">
      {/* Optional: uncomment to add a top progress bar
      <div className="progress-bar-container">
        {REPAIR_STEPS.map((s, i) => (
          <div
            key={s.slug}
            className={`progress-step ${i <= activeIndex ? 'active' : ''}`}
          >
            {s.label}
          </div>
        ))}
      </div>
      */}
      {children}
    </div>
  );
};

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
          <Layout>
            <Routes>
              {/* ── Marketing / home ── */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/:location" element={<HomePage />} />

              {/* ── Repair flow — each step gets its own URL ── */}
              {/*
               *  /repair                   → Brand selection
               *  /repair/model             → Model selection
               *  /repair/issue             → Issue selection
               *  /repair/pricing           → Pricing
               *  /repair/contact           → Lead capture (phone → OTP → name → address → declaration)
               *  /repair/confirmation      → Booking confirmed
               *
               *  All repeated under /:location/repair/* for city-specific entry points.
               */}
              <Route
                path="/repair"
                element={
                  <RepairFlowShell>
                    <RepairStepPage slug="" />
                  </RepairFlowShell>
                }
              />
              <Route
                path="/repair/model"
                element={
                  <RepairFlowShell>
                    <RepairStepPage slug="model" />
                  </RepairFlowShell>
                }
              />
              <Route
                path="/repair/issue"
                element={
                  <RepairFlowShell>
                    <RepairStepPage slug="issue" />
                  </RepairFlowShell>
                }
              />
              <Route
                path="/repair/pricing"
                element={
                  <RepairFlowShell>
                    <RepairStepPage slug="pricing" />
                  </RepairFlowShell>
                }
              />
              <Route
                path="/repair/contact"
                element={
                  <RepairFlowShell>
                    <RepairStepPage slug="contact" />
                  </RepairFlowShell>
                }
              />
              <Route
                path="/repair/confirmation"
                element={
                  <RepairFlowShell>
                    <RepairStepPage slug="confirmation" />
                  </RepairFlowShell>
                }
              />

              {/* ── Location-prefixed repair routes (mirrors above) ── */}
              <Route
                path="/:location/repair"
                element={
                  <RepairFlowShell>
                    <RepairStepPage slug="" />
                  </RepairFlowShell>
                }
              />
              <Route
                path="/:location/repair/model"
                element={
                  <RepairFlowShell>
                    <RepairStepPage slug="model" />
                  </RepairFlowShell>
                }
              />
              <Route
                path="/:location/repair/issue"
                element={
                  <RepairFlowShell>
                    <RepairStepPage slug="issue" />
                  </RepairFlowShell>
                }
              />
              <Route
                path="/:location/repair/pricing"
                element={
                  <RepairFlowShell>
                    <RepairStepPage slug="pricing" />
                  </RepairFlowShell>
                }
              />
              <Route
                path="/:location/repair/contact"
                element={
                  <RepairFlowShell>
                    <RepairStepPage slug="contact" />
                  </RepairFlowShell>
                }
              />
              <Route
                path="/:location/repair/confirmation"
                element={
                  <RepairFlowShell>
                    <RepairStepPage slug="confirmation" />
                  </RepairFlowShell>
                }
              />

              {/* ── Legacy: /repair/:location → /:location/repair ── */}
              <Route path="/repair/:location" element={<LegacyRepairRedirect />} />

              {/* ── Booking tracker ── */}
              <Route path="/dashboard/:bookingId" element={<Dashboard />} />

              {/* ── Admin ── */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </BrowserRouter>

        <Toaster position="top-center" richColors />
      </div>
    </>
  );
}

export default App;