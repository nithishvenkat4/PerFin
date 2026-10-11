import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppSidebar } from './components/layout/AppSidebar';
import { AppTopBar } from './components/layout/AppTopBar';

// User & Feature Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { IncomePage } from './pages/IncomePage';
import { ExpensesPage } from './pages/ExpensesPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { GoalsPage } from './pages/GoalsPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { CalendarPage } from './pages/CalendarPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AIAdvisorPage } from './pages/AIAdvisorPage';
import { DecisionsPage } from './pages/DecisionsPage';
import { CSVImportPage } from './pages/CSVImportPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { NotesPage } from './pages/NotesPage';
import { ProfilePage } from './pages/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

/**
 * Route protection for authenticated FinMate users
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center justify-center font-sans p-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#5E4AE3] rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-semibold text-slate-500">
          Loading PerFin...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Route protection for Admin console
 */
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center justify-center font-sans p-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#5E4AE3] rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Verifying Admin Credentials...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * Modern Application Layout with Left-Side Vertical Grouped Sidebar
 * Solves the congested navigation requirement completely!
 */
const AppLayout: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleGlobalRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-900 flex antialiased">
      {/* Left-Side Vertical Sidebar with Categorized Sub-groups */}
      <AppSidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sleek Top Bar with Breadcrumbs & Actions */}
        <AppTopBar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onRefresh={handleGlobalRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Scrollable Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto">
            <Outlet context={{ refreshKey, onRefresh: handleGlobalRefresh }} />
          </div>
        </main>

        {/* Educational & Decision-Support Mandatory Disclaimer (Requirement 43) */}
        <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500">
          <p className="max-w-4xl mx-auto">
            <span className="font-bold text-[#5E4AE3]">PerFin Notice: </span>
            PerFin provides financial insights and decision-support modeling for educational and analytical purposes.
            It does not provide certified financial advice, execute trades, or transfer money.
          </p>
        </footer>
      </div>
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated User Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="income" element={<IncomePage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="budgets" element={<BudgetsPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="investments" element={<InvestmentsPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="advisor" element={<AIAdvisorPage />} />
            <Route path="simulator" element={<DecisionsPage />} />
            <Route path="imports" element={<CSVImportPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Administrator Workspace Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AppLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminDashboardPage />} />
            <Route path="audit-logs" element={<AdminDashboardPage />} />
            <Route path="system" element={<AdminDashboardPage />} />
          </Route>

          {/* 404 / Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
