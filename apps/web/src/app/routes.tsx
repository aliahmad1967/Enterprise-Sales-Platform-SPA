import { Suspense, lazy } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useAuthStore } from "@/state/auth";
import { RootLayout } from "./RootLayout";
import { PageLoader } from "@/components/PageHeader";

const LoginPage = lazy(() => import("@/modules/auth/LoginPage").then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import("@/modules/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })));

const CustomersPage = lazy(() => import("@/modules/crm/CustomersPage").then((m) => ({ default: m.CustomersPage })));
const CustomerDetailPage = lazy(() => import("@/modules/crm/CustomerDetailPage").then((m) => ({ default: m.CustomerDetailPage })));
const LeadsPage = lazy(() => import("@/modules/crm/LeadsPage").then((m) => ({ default: m.LeadsPage })));
const LeadPipelinePage = lazy(() => import("@/modules/crm/LeadPipelinePage").then((m) => ({ default: m.LeadPipelinePage })));
const LeadDetailPage = lazy(() => import("@/modules/crm/LeadDetailPage").then((m) => ({ default: m.LeadDetailPage })));
const ContactsPage = lazy(() => import("@/modules/crm/ContactsPage").then((m) => ({ default: m.ContactsPage })));

const QuotationsPage = lazy(() => import("@/modules/sales/QuotationsPage").then((m) => ({ default: m.QuotationsPage })));
const QuotationDetailPage = lazy(() => import("@/modules/sales/QuotationDetailPage").then((m) => ({ default: m.QuotationDetailPage })));
const OrdersPage = lazy(() => import("@/modules/sales/OrdersPage").then((m) => ({ default: m.OrdersPage })));
const OrderDetailPage = lazy(() => import("@/modules/sales/OrderDetailPage").then((m) => ({ default: m.OrderDetailPage })));
const InvoicesPage = lazy(() => import("@/modules/sales/InvoicesPage").then((m) => ({ default: m.InvoicesPage })));
const InvoiceDetailPage = lazy(() => import("@/modules/sales/InvoiceDetailPage").then((m) => ({ default: m.InvoiceDetailPage })));

const ProductsPage = lazy(() => import("@/modules/inventory/ProductsPage").then((m) => ({ default: m.ProductsPage })));
const ProductDetailPage = lazy(() => import("@/modules/inventory/ProductDetailPage").then((m) => ({ default: m.ProductDetailPage })));
const WarehousesPage = lazy(() => import("@/modules/inventory/WarehousesPage").then((m) => ({ default: m.WarehousesPage })));
const StockMovesPage = lazy(() => import("@/modules/inventory/StockMovesPage").then((m) => ({ default: m.StockMovesPage })));

const SuppliersPage = lazy(() => import("@/modules/purchasing/SuppliersPage").then((m) => ({ default: m.SuppliersPage })));
const PurchaseOrdersPage = lazy(() => import("@/modules/purchasing/PurchaseOrdersPage").then((m) => ({ default: m.PurchaseOrdersPage })));
const BillsPage = lazy(() => import("@/modules/purchasing/BillsPage").then((m) => ({ default: m.BillsPage })));

const JournalPage = lazy(() => import("@/modules/accounting/JournalPage").then((m) => ({ default: m.JournalPage })));
const AccountsPage = lazy(() => import("@/modules/accounting/AccountsPage").then((m) => ({ default: m.AccountsPage })));

const ReportsPage = lazy(() => import("@/modules/reports/ReportsPage").then((m) => ({ default: m.ReportsPage })));
const PosPage = lazy(() => import("@/modules/pos/PosPage").then((m) => ({ default: m.PosPage })));

const UsersPage = lazy(() => import("@/modules/admin/UsersPage").then((m) => ({ default: m.UsersPage })));
const RolesPage = lazy(() => import("@/modules/admin/RolesPage").then((m) => ({ default: m.RolesPage })));
const AuditPage = lazy(() => import("@/modules/admin/AuditPage").then((m) => ({ default: m.AuditPage })));

const SettingsPage = lazy(() => import("@/modules/settings/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const WorkflowPage = lazy(() => import("@/modules/workflow/WorkflowPage").then((m) => ({ default: m.WorkflowPage })));
const ApiCenterPage = lazy(() => import("@/modules/api/ApiCenterPage").then((m) => ({ default: m.ApiCenterPage })));
const MonitoringPage = lazy(() => import("@/modules/monitoring/MonitoringPage").then((m) => ({ default: m.MonitoringPage })));

function RequireAuth() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

function PublicOnly() {
  const user = useAuthStore((s) => s.user);
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}

function lazyElement(node: React.ReactNode) {
  return <Suspense fallback={<PageLoader rows={5} />}>{node}</Suspense>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path="/login" element={lazyElement(<LoginPage />)} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<RootLayout />}>
          <Route index element={lazyElement(<DashboardPage />)} />
          <Route path="/crm/customers" element={lazyElement(<CustomersPage />)} />
          <Route path="/crm/customers/:id" element={lazyElement(<CustomerDetailPage />)} />
          <Route path="/crm/leads" element={lazyElement(<LeadsPage />)} />
          <Route path="/crm/leads/pipeline" element={lazyElement(<LeadPipelinePage />)} />
          <Route path="/crm/leads/:id" element={lazyElement(<LeadDetailPage />)} />
          <Route path="/crm/contacts" element={lazyElement(<ContactsPage />)} />

          <Route path="/sales/quotations" element={lazyElement(<QuotationsPage />)} />
          <Route path="/sales/quotations/:id" element={lazyElement(<QuotationDetailPage />)} />
          <Route path="/sales/orders" element={lazyElement(<OrdersPage />)} />
          <Route path="/sales/orders/:id" element={lazyElement(<OrderDetailPage />)} />
          <Route path="/sales/invoices" element={lazyElement(<InvoicesPage />)} />
          <Route path="/sales/invoices/:id" element={lazyElement(<InvoiceDetailPage />)} />
          <Route path="/pos" element={lazyElement(<PosPage />)} />

          <Route path="/inventory/products" element={lazyElement(<ProductsPage />)} />
          <Route path="/inventory/products/:id" element={lazyElement(<ProductDetailPage />)} />
          <Route path="/inventory/warehouses" element={lazyElement(<WarehousesPage />)} />
          <Route path="/inventory/stock-moves" element={lazyElement(<StockMovesPage />)} />

          <Route path="/purchasing/suppliers" element={lazyElement(<SuppliersPage />)} />
          <Route path="/purchasing/orders" element={lazyElement(<PurchaseOrdersPage />)} />
          <Route path="/purchasing/bills" element={lazyElement(<BillsPage />)} />

          <Route path="/accounting/journal" element={lazyElement(<JournalPage />)} />
          <Route path="/accounting/accounts" element={lazyElement(<AccountsPage />)} />

          <Route path="/reports" element={lazyElement(<ReportsPage />)} />

          <Route path="/admin/users" element={lazyElement(<UsersPage />)} />
          <Route path="/admin/roles" element={lazyElement(<RolesPage />)} />
          <Route path="/admin/audit" element={lazyElement(<AuditPage />)} />

          <Route path="/settings" element={lazyElement(<SettingsPage />)} />
          <Route path="/workflow" element={lazyElement(<WorkflowPage />)} />
          <Route path="/api-center" element={lazyElement(<ApiCenterPage />)} />
          <Route path="/monitoring" element={lazyElement(<MonitoringPage />)} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
