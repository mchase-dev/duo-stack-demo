import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { RealtimeProvider } from "./adapters";
import { useEffect } from "react";
import { authApi } from "./api";
import { useAuthStore } from "./store/authStore";

// Layout
import { MainLayout } from "./components/layout/MainLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { CookieConsent } from "./components/CookieConsent";

// Pages
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CalendarPage } from "./pages/CalendarPage";
import { MessagesPage } from "./pages/MessagesPage";
import { RoomsPage } from "./pages/RoomsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PagesListPage } from "./pages/PagesListPage";
import { PageViewPage } from "./pages/PageViewPage";
import { PageEditorPage } from "./pages/PageEditorPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// Guards
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleGuard } from "./components/auth/RoleGuard";

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Get backend configuration from environment
const BACKEND = (import.meta.env.VITE_BACKEND || "node") as "node" | "dotnet";
const API_URL =
  BACKEND === "dotnet"
    ? import.meta.env.VITE_API_URL_DOTNET || "http://localhost:5000"
    : import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  const { setUser, setLoading } = useAuthStore();

  // Initialize auth state on app load (runs only once)
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const response = await authApi.refresh();
        setUser(response.data.user);
      } catch (error) {
        // Not authenticated, that's fine
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []); // Empty deps - only run once on app mount

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RealtimeProvider backend={BACKEND} apiUrl={API_URL}>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="rooms" element={<RoomsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="pages" element={<PagesListPage />} />
                <Route path="pages/:slug" element={<PageViewPage />} />

                {/* Superuser routes */}
                <Route
                  path="pages/new"
                  element={
                    <RoleGuard roles={["Superuser"]}>
                      <PageEditorPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="pages/edit/:pageSlug"
                  element={
                    <RoleGuard roles={["Superuser"]}>
                      <PageEditorPage />
                    </RoleGuard>
                  }
                />

                {/* Admin routes */}
                <Route
                  path="admin/users"
                  element={
                    <RoleGuard roles={["Admin", "Superuser"]}>
                      <AdminUsersPage />
                    </RoleGuard>
                  }
                />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" />
          <CookieConsent />
        </RealtimeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
