import './App.css';
import { useState, useCallback, useRef } from 'react';
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
import AdLandingPage from './components/AdlandingPage';

import { BrandSelection } from './components/steps/BrandSelection';
import { ModelSelection } from './components/steps/ModelSelection';
import { IssueSelection } from './components/steps/IssueSelection';
import { PricingDisplay } from './components/steps/PricingDisplay';
import { LeadCapture } from './components/steps/LeadCapture';
import { Confirmation } from './components/steps/Confirmation';

import type { FormData } from './types';

// ─── Step config ──────────────────────────────────────────────────
const SERVICE_STEPS = [
  { slug: '',             label: 'Brand',        Component: BrandSelection },
  { slug: 'model',        label: 'Model',        Component: ModelSelection },
  { slug: 'issue',        label: 'Issue',        Component: IssueSelection },
  { slug: 'pricing',      label: 'Pricing',      Component: PricingDisplay },
  { slug: 'contact',      label: 'Contact',      Component: LeadCapture },
  { slug: 'confirmation', label: 'Confirmation', Component: Confirmation },
] as const;

type StepSlug = (typeof SERVICE_STEPS)[number]['slug'];

// ─── URL helpers ──────────────────────────────────────────────────
//
// URL patterns:
//   No location:   /service, /service/model, /service/issue ...
//   With location: /mobile-repair-whitefield, /mobile-repair-whitefield/model ...
//
// The location prefix is "mobile-repair-{location}" so that:
//   /:locationSlug  matches  "mobile-repair-whitefield"
//   and we extract the raw location by stripping "mobile-repair-" prefix.

const LOCATION_PREFIX = 'mobile-repair-';

/** Build the base URL for the service flow */
function getServiceBase(location: string | undefined): string {
  return location ? `/${LOCATION_PREFIX}${location}` : '/service';
}

/** Extract raw location name from a slug like "mobile-repair-whitefield" */
function extractLocation(slug: string): string {
  return slug.startsWith(LOCATION_PREFIX) ? slug.slice(LOCATION_PREFIX.length) : slug;
}

const RepairRedirect: React.FC = () => <Navigate to="/service" replace />;

const LocationRepairRedirect: React.FC = () => {
  const { location } = useParams<{ location: string }>();

  if (!location) {
    return <Navigate to="/service" replace />;
  }

  return <Navigate to={`/${LOCATION_PREFIX}${location}`} replace />;
};

// ─── ServiceStepPage ──────────────────────────────────────────────
const ServiceStepPage: React.FC<{
  slug:           StepSlug;
  location:       string | undefined;
  formData:       FormData;
  updateFormData: (partial: Partial<FormData>) => void;
  resetFormData:  () => void;
}> = ({ slug, location, formData, updateFormData, resetFormData }) => {
  const navigate  = useNavigate();
  const base      = getServiceBase(location);
  const stepIndex = SERVICE_STEPS.findIndex((s) => s.slug === slug);
  const { Component } = SERVICE_STEPS[stepIndex];

  const goToNextStep = useCallback(() => {
    const next = SERVICE_STEPS[stepIndex + 1];
    if (!next) return;
    navigate(next.slug ? `${base}/${next.slug}` : base);
  }, [stepIndex, base, navigate]);

  const goToPreviousStep = useCallback(() => {
    if (stepIndex === 0) {
      resetFormData();
      // Go back to location home or site root
      navigate(location ? `/${LOCATION_PREFIX}${location}` : '/');
      return;
    }
    const prev = SERVICE_STEPS[stepIndex - 1];
    navigate(prev.slug ? `${base}/${prev.slug}` : base);
  }, [stepIndex, base, location, navigate, resetFormData]);

  return (
    <Component
      formData={formData}
      updateFormData={updateFormData}
      goToNextStep={goToNextStep}
      goToPreviousStep={goToPreviousStep}
    />
  );
};

// ─── ServiceFlowShell ─────────────────────────────────────────────
const ServiceFlowShell: React.FC<{
  slug:     StepSlug;
  location: string | undefined;
}> = ({ slug, location }) => {
  const initialData = useRef<FormData>({} as FormData);
  const [formData, setFormData] = useState<FormData>(initialData.current);

  const updateFormData = useCallback((partial: Partial<FormData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...partial };
      initialData.current = next;
      return next;
    });
  }, []);

  const resetFormData = useCallback(() => {
    initialData.current = {} as FormData;
    setFormData({} as FormData);
  }, []);

  return (
    <ServiceStepPage
      slug={slug}
      location={location}
      formData={formData}
      updateFormData={updateFormData}
      resetFormData={resetFormData}
    />
  );
};

// ─── Route wrappers ───────────────────────────────────────────────

/**
 * Handles routes like /mobile-repair-whitefield/model
 * :locationSlug = "mobile-repair-whitefield"
 * we strip the prefix to get raw location = "whitefield"
 */
const LocationServiceStep: React.FC<{ slug: StepSlug }> = ({ slug }) => {
  const { locationSlug } = useParams<{ locationSlug: string }>();
  const location = locationSlug ? extractLocation(locationSlug) : undefined;
  return <ServiceFlowShell slug={slug} location={location} />;
};

/** Handles routes with no location prefix: /service, /service/model ... */
const RootServiceStep: React.FC<{ slug: StepSlug }> = ({ slug }) => (
  <ServiceFlowShell slug={slug} location={undefined} />
);

// ─── Route builders ───────────────────────────────────────────────

/**
 * Builds service step routes.
 *
 * withLocation = false → /service, /service/model, /service/issue ...
 * withLocation = true  → /:locationSlug, /:locationSlug/model, /:locationSlug/issue ...
 *
 * /:locationSlug will match "mobile-repair-whitefield" etc.
 * We use a specific prefix pattern so it doesn't swallow unrelated routes.
 */
function buildServiceRoutes(withLocation: boolean) {
  return SERVICE_STEPS.map(({ slug }) => {
    const path = withLocation
      ? (slug ? `/:locationSlug/${slug}` : '/:locationSlug')
      : (slug ? `/service/${slug}` : '/service');

    const Element = withLocation
      ? <LocationServiceStep slug={slug} />
      : <RootServiceStep slug={slug} />;

    return <Route key={path} path={path} element={Element} />;
  });
}

// ─── Progress bar ─────────────────────────────────────────────────
const ServiceProgressBar: React.FC = () => {
  const { pathname } = useLocation();

  const stepIndex = SERVICE_STEPS.findIndex(({ slug }) => {
    if (slug === '') {
      // Matches /service or /mobile-repair-{location}
      return (
        pathname === '/service' ||
        pathname === '/service/' ||
        (pathname.startsWith(`/${LOCATION_PREFIX}`) && !pathname.split('/')[2])
      );
    }
    return pathname.endsWith(`/${slug}`);
  });

  if (stepIndex === -1) return null;

  const pct = Math.round(((stepIndex + 1) / SERVICE_STEPS.length) * 100);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-100">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────
function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}

      <div
        style={{
          opacity:       loaded ? 1 : 0,
          transition:    'opacity 0.5s ease',
          pointerEvents: loaded ? 'auto' : 'none',
        }}
      >
        <BrowserRouter>
          <ServiceProgressBar />

          <Routes>
            {/* ── Staff portals — no Layout ── */}
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

            {/* Ad landing — outside Layout */}
            <Route path="/adlanding"                        element={<AdLandingPage />} />
            <Route path={`/${LOCATION_PREFIX}:location/adlanding`} element={<AdLandingPage />} />

            {/* Backward-compatible pricing links */}
            <Route path="/repair" element={<RepairRedirect />} />
            <Route path="/:location/repair" element={<LocationRepairRedirect />} />

            {/* ── All public routes — inside Layout ── */}
            <Route path="/*" element={<Layout><PublicRoutes /></Layout>} />
          </Routes>
        </BrowserRouter>

        <Toaster position="top-center" richColors />
      </div>
    </>
  );
}

// ─── PublicRoutes ─────────────────────────────────────────────────
const PublicRoutes: React.FC = () => (
  <Routes>
    {/* Landing page */}
    <Route path="/" element={<LandingPage />} />

    {/* Root service flow: /service, /service/model ... */}
    {buildServiceRoutes(false)}

    {/* Location service flow: /mobile-repair-whitefield, /mobile-repair-whitefield/model ... */}
    {buildServiceRoutes(true)}

    {/* Customer booking tracker */}
    <Route path="/dashboard/:bookingId" element={<Dashboard />} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;