import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AdminRoute, ProtectedRoute } from '../features/auth/ProtectedRoute';

const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));

// Admin
const AdminPage = lazy(() => import('../pages/AdminPage'));
const AdminQuestionNewPage = lazy(() => import('../pages/AdminQuestionNewPage'));
const AdminResultDetailPage = lazy(() => import('../pages/admin/AdminResultDetailPage'));
const AdminResultsPage = lazy(() => import('../pages/admin/AdminResultsPage'));
const AdminTestConfigPage = lazy(() => import('../pages/admin/AdminTestConfigPage'));
const AdminTestConfigNewPage = lazy(() => import('../pages/admin/AdminTestConfigNewPage'));
const AdminsPage = lazy(() => import('../pages/admin/AdminsPage'));
const AdminStudentsPage = lazy(() => import('../pages/admin/AdminStudentsPage'));
const AdminTaxonomyPage = lazy(() => import('../pages/admin/AdminTaxonomyPage'));

// Tests + results + analytics
const ResultsListPage = lazy(() => import('../pages/ResultsListPage'));
const ResultPage = lazy(() => import('../pages/ResultPage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const AptitudePage = lazy(() => import('../pages/AptitudePage'));

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
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
        path="/admin/students"
        element={
          <AdminRoute>
            <AdminStudentsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/results"
        element={
          <AdminRoute>
            <AdminResultsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/results/:resultId"
        element={
          <AdminRoute>
            <AdminResultDetailPage />
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
