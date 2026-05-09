import './App.css';
import { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from 'react-router-dom';
import { Toaster } from 'sonner';

import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { RepairFlow } from './components/RepairFlow';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Loader } from './components/Loader';
import { AdminLogin } from './admin/AdminLogin';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './components/LandingPage';

const LegacyRepairRedirect: React.FC = () => {
  const { location } = useParams<{ location?: string }>();

  return <Navigate to={location ? `/${location}/repair` : '/repair'} replace />;
};

function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}

      <div
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.5s ease',
          visibility: loaded ? 'visible' : 'hidden',
        }}
      >
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />

              <Route path="/mobile-repair-:location" element={<HomePage />} />
              <Route path="/mobile-repair-:location" element={<HomePage />} />
              <Route path="/mobile-repair-:location/repair" element={<RepairFlow />} />
              <Route path="/:location/repair" element={<RepairFlow />} />
              <Route path="/repair/:location" element={<LegacyRepairRedirect />} />

              <Route path="/dashboard/:bookingId" element={<Dashboard />} />
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