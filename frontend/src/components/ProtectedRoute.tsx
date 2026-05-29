import { Navigate } from 'react-router-dom';

type GuardRole = 'admin' | 'technician' | 'marketing';

const ROLE_KEYS: Record<GuardRole, string> = {
  admin:      'adminAuth',
  technician: 'techAuth',
  marketing:  'mktAuth',
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: GuardRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  role = 'admin',
}) => {
  const key = ROLE_KEYS[role];
  const isAuth = localStorage.getItem(key) === 'true';

  if (!isAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
