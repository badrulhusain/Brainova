import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AdminRoute, StudentRoute } from '../features/auth/ProtectedRoute';

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
const AdminPreviewPage = lazy(() => import('../pages/admin/AdminPreviewPage'));
const AdminAptitudePage = lazy(() => import('../pages/admin/AdminAptitudePage'));

const AptitudePage = lazy(() => import('../pages/AptitudePage'));

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <StudentRoute>
            <DashboardPage />
          </StudentRoute>
        }
      />
      <Route
        path="/aptitude"
        element={
          <StudentRoute>
            <AptitudePage />
          </StudentRoute>
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
      <Route
        path="/admin/preview/:configId"
        element={
          <AdminRoute>
            <AdminPreviewPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/aptitude"
        element={
          <AdminRoute>
            <AdminAptitudePage />
          </AdminRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
