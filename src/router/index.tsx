import { createBrowserRouter, Navigate } from "react-router-dom";

import AppShell from "../components/AppShell/AppShell";
import { useAuth } from "../hooks/useAuth";

import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";

import VehicleCreatePage from "../pages/VehicleCreatePage/VehicleCreatePage";
import VehicleDetailPage from "../pages/VehicleDetailPage/VehicleDetailPage";
import VehicleEditPage from "../pages/VehicleEditPage/VehicleEditPage";
import VehicleListPage from "../pages/VehicleListPage/VehicleListPage";

import ContractListPage from "../pages/ContractListPage/ContractListPage";
import ContractCreatePage from "../pages/ContractCreatePage/ContractCreatePage";
import ContractDetailPage from "../pages/ContractDetailPage/ContractDetailPage";

import CheckCreatePage from "../pages/CheckCreatePage/CheckCreatePage";
import CheckDetailPage from "../pages/CheckDetailPage/CheckDetailPage";


function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ padding: "24px", color: "#f3f4f6" }}>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppShell />;
}

function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ padding: "24px", color: "#f3f4f6" }}>Chargement...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <PublicOnlyRoute />,
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <HomePage /> },

      // VEHICLES
      { path: "vehicles", element: <VehicleListPage /> },
      { path: "vehicles/new", element: <VehicleCreatePage /> },
      { path: "vehicles/:vehicleId", element: <VehicleDetailPage /> },
      { path: "vehicles/:vehicleId/edit", element: <VehicleEditPage /> },

      // CONTRACTS
      { path: "contracts", element: <ContractListPage /> },
      { path: "contracts/new", element: <ContractCreatePage /> },
      { path: "contracts/:contractId", element: <ContractDetailPage /> },

      // CHECKS
      { path: "contracts/:contractId/check", element: <CheckCreatePage /> },
      { path: "checks/:checkId", element: <CheckDetailPage /> },
    ],
  },
]);