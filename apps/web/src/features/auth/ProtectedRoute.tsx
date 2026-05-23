import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { useAuth } from './AuthProvider';

function RouteLoader() {
  return (
    <main className="bg-background px-4 py-12 text-foreground sm:px-6">
      <div className="mx-auto w-full max-w-xl">
        <Card className="p-8 text-center">
          <p className="text-sm font-medium text-muted">Checking your session</p>
        </Card>
      </div>
    </main>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
