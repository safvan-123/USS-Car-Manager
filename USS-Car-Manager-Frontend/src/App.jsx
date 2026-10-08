import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useParams } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import AppShell from "./layout/AppShell";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CarsPage from "./pages/CarsPage";
import CarFormPage from "./pages/CarFormPage";
import CarDetailPage from "./pages/CarDetailPage";
import PartnersPage from "./pages/PartnersPage";
import PartnerFormPage from "./pages/PartnerFormPage";
import TransactionListPage from "./pages/TransactionListPage";
import TransactionFormPage from "./pages/TransactionFormPage";
import MaintenancePage from "./pages/MaintenancePage";
import ReportsPage from "./pages/ReportsPage";
import AuditPage from "./pages/AuditPage";
import NotFoundPage from "./pages/NotFoundPage";
import QuickAddPage from "./pages/QuickAddPage";

function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="app-boot"><div className="brand-mark large">U</div><span className="spinner" /><strong>Opening USS Car Manager…</strong></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

function LegacyCarRedirect({ target }) {
  const { carId, id } = useParams();
  const value = carId || id;
  if (target === "car") return <Navigate replace to={`/cars/${value}`} />;
  if (target === "car-edit") return <Navigate replace to={`/cars/${value}/edit`} />;
  if (target === "earning-edit") return <Navigate replace to={`/earnings/${value}/edit`} />;
  if (target === "expense-edit") return <Navigate replace to={`/expenses/${value}/edit`} />;
  if (target === "partner-edit") return <Navigate replace to={`/partners/${value}/edit`} />;
  if (target === "report") return <Navigate replace to={`/reports?car=${value}`} />;
  return <Navigate replace to={`/${target}?car=${value}`} />;
}

export default function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="cars" element={<CarsPage />} />
          <Route path="cars/new" element={<CarFormPage />} />
          <Route path="cars/:id" element={<CarDetailPage />} />
          <Route path="cars/:id/edit" element={<CarFormPage />} />

          <Route path="earnings" element={<TransactionListPage kind="earning" />} />
          <Route path="earnings/new" element={<TransactionFormPage kind="earning" />} />
          <Route path="earnings/:id/edit" element={<TransactionFormPage kind="earning" />} />
          <Route path="expenses" element={<TransactionListPage kind="expense" />} />
          <Route path="expenses/new" element={<TransactionFormPage kind="expense" />} />
          <Route path="expenses/:id/edit" element={<TransactionFormPage kind="expense" />} />

          <Route path="partners" element={<PartnersPage />} />
          <Route path="partners/new" element={<PartnerFormPage />} />
          <Route path="partners/:id/edit" element={<PartnerFormPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="quick-add" element={<QuickAddPage />} />

          {/* Compatibility with the original frontend URLs. */}
          <Route path="add" element={<Navigate replace to="/cars/new" />} />
          <Route path="edit/:id" element={<LegacyCarRedirect target="car-edit" />} />
          <Route path="car/:id" element={<LegacyCarRedirect target="car" />} />
          <Route path="summary/:carId" element={<LegacyCarRedirect target="report" />} />
          <Route path="add-earning" element={<Navigate replace to="/earnings/new" />} />
          <Route path="earnings/:carId" element={<LegacyCarRedirect target="earnings" />} />
          <Route path="edit-earning/:id" element={<LegacyCarRedirect target="earning-edit" />} />
          <Route path="add-expense" element={<Navigate replace to="/expenses/new" />} />
          <Route path="expenses/:carId" element={<LegacyCarRedirect target="expenses" />} />
          <Route path="edit-expense/:id" element={<LegacyCarRedirect target="expense-edit" />} />
          <Route path="add-partner" element={<Navigate replace to="/partners/new" />} />
          <Route path="edit-partner/:id" element={<LegacyCarRedirect target="partner-edit" />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>;
}
