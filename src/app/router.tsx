import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AdminRoute, ProtectedRoute } from '../features/auth/ProtectedRoute';

const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const SignupPage = lazy(() => import('../pages/SignupPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage'));

// Admin
const AdminPage = lazy(() => import('../pages/AdminPage'));
const AdminQuestionNewPage = lazy(() => import('../pages/AdminQuestionNewPage'));
const AdminTestConfigPage = lazy(() => import('../pages/admin/AdminTestConfigPage'));
const AdminTestConfigNewPage = lazy(() => import('../pages/admin/AdminTestConfigNewPage'));

// Tests + results + analytics
const TestsPage = lazy(() => import('../pages/TestsPage'));
const TestPage = lazy(() => import('../pages/TestPage'));
const ResultsListPage = lazy(() => import('../pages/ResultsListPage'));
const ResultPage = lazy(() => import('../pages/ResultPage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verify-email"
        element={
          <ProtectedRoute>
            <VerifyEmailPage />
          </ProtectedRoute>
        }
      />

      {/* Tests */}
      <Route
        path="/tests"
        element={
          <ProtectedRoute>
            <TestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tests/:sessionId"
        element={
          <ProtectedRoute>
            <TestPage />
          </ProtectedRoute>
        }
      />

      {/* Results */}
      <Route
        path="/results"
        element={
          <ProtectedRoute>
            <ResultsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results/:resultId"
        element={
          <ProtectedRoute>
            <ResultPage />
          </ProtectedRoute>
        }
      />

      {/* Analytics */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
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
      <Route
        path="/admin/test-configs"
        element={
          <AdminRoute>
            <AdminTestConfigPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/test-configs/new"
        element={
          <AdminRoute>
            <AdminTestConfigNewPage />
          </AdminRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
