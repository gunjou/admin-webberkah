import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

// Import Pages (Pastikan folder & file ini sudah Anda buat)
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AdminLayout from "./layouts/AdminLayout";
import Presensi from "./pages/absensi/Presensi";
import Rekapan from "./pages/absensi/Rekapan";
import Lembur from "./pages/absensi/Lembur";
import Gaji from "./pages/Gaji";
import Hutang from "./pages/Hutang";
import Pegawai from "./pages/Pegawai";
import Departemen from "./pages/master/Departemen";
import Jabatan from "./pages/master/Jabatan";
import Lokasi from "./pages/master/Lokasi";
import Jadwal from "./pages/master/Jadwal";
import Rules from "./pages/master/Rules";
import Kategori from "./pages/master/Kategori";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* === ROUTE PUBLIC === */}
        <Route path="/login" element={<Login />} />

        {/* === ROUTE PROTECTED (Hanya untuk yang sudah login) === */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/absensi/presensi" element={<Presensi />} />
            <Route path="/absensi/rekapan" element={<Rekapan />} />
            <Route path="/absensi/lembur" element={<Lembur />} />
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
          {/* Anda bisa menambah rute lain di sini nantinya */}
          {/* <Route path="/profile" element={<Profile />} /> */}
        </Route>

        {/* Redirect otomatis jika akses root (/) */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Fallback jika rute tidak ditemukan */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
