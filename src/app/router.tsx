import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AdminRoute, ProtectedRoute } from '../features/auth/ProtectedRoute';

const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const SignupPage = lazy(() => import('../pages/SignupPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));

// Admin
const AdminPage = lazy(() => import('../pages/AdminPage'));
const AdminQuestionNewPage = lazy(() => import('../pages/AdminQuestionNewPage'));
const AdminTestConfigPage = lazy(() => import('../pages/admin/AdminTestConfigPage'));
const AdminTestConfigNewPage = lazy(() => import('../pages/admin/AdminTestConfigNewPage'));
const AdminsPage = lazy(() => import('../pages/admin/AdminsPage'));
const AdminTaxonomyPage = lazy(() => import('../pages/admin/AdminTaxonomyPage'));

// Tests + results + analytics
const TestsPage = lazy(() => import('../pages/TestsPage'));
const TestPage = lazy(() => import('../pages/TestPage'));
const ResultsListPage = lazy(() => import('../pages/ResultsListPage'));
const ResultPage = lazy(() => import('../pages/ResultPage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const AptitudePage = lazy(() => import('../pages/AptitudePage'));

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

      <Route
        path="/aptitude"
        element={
          <ProtectedRoute>
            <AptitudePage />
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
      <Route
        path="/admin/admins"
        element={
          <AdminRoute>
            <AdminsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/taxonomy"
        element={
          <AdminRoute>
            <AdminTaxonomyPage />
          </AdminRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
