import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AdminRoute, ProtectedRoute } from '../features/auth/ProtectedRoute';

const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const SignupPage = lazy(() => import('../pages/SignupPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const UpcomingPage = lazy(() => import('../pages/UpcomingPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage'));

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/verify-email"
        element={
          <ProtectedRoute>
            <VerifyEmailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tests"
        element={
          <ProtectedRoute>
            <UpcomingPage page="tests" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results"
        element={
          <ProtectedRoute>
            <UpcomingPage page="results" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <UpcomingPage page="admin" />
          </AdminRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
