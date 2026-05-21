import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import { useAuthStore } from '@utils/store';

// Pages
import LoginPage from '@pages/LoginPage';
import RegisterPage from '@pages/RegisterPage';
import OnboardingPage from '@pages/OnboardingPage';
import DashboardPage from '@pages/DashboardPage';
import CasesPage from '@pages/CasesPage';
import CaseDetailPage from '@pages/CaseDetailPage';
import AlertsPage from '@pages/AlertsPage';
import LogExplorerPage from '@pages/LogExplorerPage';
import DetectionRulesPage from '@pages/DetectionRulesPage';
import EvidenceVaultPage from '@pages/EvidenceVaultPage';
import ForensicsPage from '@pages/ForensicsPage';
import TimelinePage from '@pages/TimelinePage';
import MitrePage from '@pages/MitrePage';
import ReportsPage from '@pages/ReportsPage';
import AuditLogsPage from '@pages/AuditLogsPage';
import SettingsPage from '@pages/SettingsPage';
import NotFoundPage from '@pages/NotFoundPage';
import PublicSearchPage from '@pages/PublicSearchPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const Routes: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return useRoutes([
    {
      path: '/',
      element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />,
    },
    {
      path: '/login',
      element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />,
    },
    {
      path: '/register',
      element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />,
    },
    {
      path: '/onboarding',
      element: (
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/public/search',
      element: <PublicSearchPage />,
    },
    {
      path: '/logs',
      element: (
        <ProtectedRoute>
          <LogExplorerPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/detection-rules',
      element: (
        <ProtectedRoute>
          <DetectionRulesPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/evidence',
      element: (
        <ProtectedRoute>
          <EvidenceVaultPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/forensics',
      element: (
        <ProtectedRoute>
          <ForensicsPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/timeline',
      element: (
        <ProtectedRoute>
          <TimelinePage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/mitre',
      element: (
        <ProtectedRoute>
          <MitrePage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/dashboard',
      element: (
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/cases',
      element: (
        <ProtectedRoute>
          <CasesPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/cases/:id',
      element: (
        <ProtectedRoute>
          <CaseDetailPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/alerts',
      element: (
        <ProtectedRoute>
          <AlertsPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/reports',
      element: (
        <ProtectedRoute>
          <ReportsPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/audit',
      element: (
        <ProtectedRoute>
          <AuditLogsPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/settings',
      element: (
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ]);
};

export default Routes;
