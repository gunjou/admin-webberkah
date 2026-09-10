import "./App.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

// =========================================================
// EXISTING PAGES
// =========================================================

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

import AdminLayout from "./layouts/AdminLayout";

import Presensi from "./pages/absensi/Presensi";
import Rekapan from "./pages/absensi/Rekapan";
import Lembur from "./pages/absensi/Lembur";
import Perizinan from "./pages/absensi/Perizinan";

import Pengajuan from "./pages/Pengajuan";
import Leaderboard from "./pages/Leaderboard";
import Gaji from "./pages/Gaji";
import Hutang from "./pages/Hutang";
import Pegawai from "./pages/Pegawai";

import Departemen from "./pages/master/Departemen";
import Jabatan from "./pages/master/Jabatan";
import Lokasi from "./pages/master/Lokasi";
import Jadwal from "./pages/master/Jadwal";
import Rules from "./pages/master/Rules";
import Kategori from "./pages/master/Kategori";
import Client from "./pages/master/Client";

import DashboardContract from "./pages/DashboardContract";
import WorkItem from "./pages/WorkItem";
import Contract from "./pages/Contract";

import DashboardInvoice from "./pages/DashboardInvoice";
import Invoice from "./pages/Invoice";

// =========================================================
// RBAC
// =========================================================

import { ROLE_GROUPS, getUserFromToken } from "./utils/rbac";

// =========================================================
// PROTECTED ROUTE
// =========================================================

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const payload = getUserFromToken();

    if (!payload) {
      throw new Error("Invalid token");
    }

    const expiry = payload.exp;
    const now = Math.floor(Date.now() / 1000);

    if (expiry && expiry < now) {
      localStorage.clear();

      return <Navigate to="/login" replace />;
    }

    return <Outlet />;
  } catch (error) {
    console.error("Invalid JWT:", error);

    localStorage.clear();

    return <Navigate to="/login" replace />;
  }
};

// =========================================================
// ROLE ROUTE
// =========================================================

const RoleRoute = ({ allowedRoles }) => {
  const user = getUserFromToken();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role;

  const isAllowed = role === "SUPER_ADMIN" || allowedRoles.includes(role);

  if (!isAllowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

// =========================================================
// APP
// =========================================================

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC */}

        <Route path="/login" element={<Login />} />

        {/* AUTHENTICATED */}

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            {/* =========================
                HRIS
            ========================== */}

            <Route element={<RoleRoute allowedRoles={ROLE_GROUPS.HRIS} />}>
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/absensi/presensi" element={<Presensi />} />

              <Route path="/absensi/rekapan" element={<Rekapan />} />

              <Route path="/absensi/perizinan" element={<Perizinan />} />

              <Route path="/absensi/lembur" element={<Lembur />} />

              <Route path="/pengajuan" element={<Pengajuan />} />

              <Route path="/leaderboard" element={<Leaderboard />} />

              <Route path="/gaji" element={<Gaji />} />

              <Route path="/hutang" element={<Hutang />} />

              <Route path="/pegawai" element={<Pegawai />} />

              <Route path="/master/departemen" element={<Departemen />} />

              <Route path="/master/jabatan" element={<Jabatan />} />

              <Route path="/master/lokasi" element={<Lokasi />} />

              <Route path="/master/jadwal" element={<Jadwal />} />

              <Route path="/master/rules" element={<Rules />} />

              <Route path="/master/kategori" element={<Kategori />} />
            </Route>

            {/* =========================
                CONTRACT
            ========================== */}

            <Route element={<RoleRoute allowedRoles={ROLE_GROUPS.CONTRACT} />}>
              <Route
                path="/dashboard-contract"
                element={<DashboardContract />}
              />

              <Route path="/work-item" element={<WorkItem />} />

              <Route path="/contract" element={<Contract />} />
            </Route>

            {/* =========================
                INVOICE
            ========================== */}

            <Route element={<RoleRoute allowedRoles={ROLE_GROUPS.INVOICE} />}>
              <Route path="/dashboard-invoice" element={<DashboardInvoice />} />

              <Route path="/invoice" element={<Invoice />} />
            </Route>

            {/* =========================
                SHARED MASTER
            ========================== */}

            <Route element={<RoleRoute allowedRoles={ROLE_GROUPS.CLIENT} />}>
              <Route path="/master/client" element={<Client />} />
            </Route>
          </Route>

          {/* 403 */}

          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>

        {/* ROOT */}

        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
