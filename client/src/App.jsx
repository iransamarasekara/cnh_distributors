import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import InventoryManagementPage from "./pages/InventoryManagementPage";
import LoadingManagementPage from "./pages/LoadingManagementPage";
import InventoryReportsPage from "./pages/InventoryReportsPage";
import ManagePage from "./pages/ManagePage";

const AppLayout = ({ children }) => (
  <div className="flex h-screen bg-blue-1">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4">
        {children}
      </main>
    </div>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes with layout */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              }
            />
            <Route
              path="/inventory-management"
              element={
                <AppLayout>
                  <InventoryManagementPage />
                </AppLayout>
              }
            />
            <Route
              path="/loading-management"
              element={
                <AppLayout>
                  <LoadingManagementPage />
                </AppLayout>
              }
            />
            <Route
              path="/reports"
              element={
                <AppLayout>
                  <InventoryReportsPage />
                </AppLayout>
              }
            />
            <Route
              path="/manage"
              element={
                <AppLayout>
                  <ManagePage />
                </AppLayout>
              }
            />
            {/* Add more protected routes here */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Not found route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
