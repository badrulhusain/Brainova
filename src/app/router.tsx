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
const AdminPage = lazy(() => import('../pages/AdminPage'));
const AdminQuestionNewPage = lazy(() => import('../pages/AdminQuestionNewPage'));

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
            <AdminPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/questions/new"
        element={
          <AdminRoute>
            <AdminQuestionNewPage />
          </AdminRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
