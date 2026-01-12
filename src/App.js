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

  // Jika tidak ada token, langsung ke login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Opsional: Cek apakah token secara struktur valid (JWT sederhana)
  // Anda bisa menggunakan library 'jwt-decode' untuk cek exp date tanpa hit API
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiry = payload.exp;
    const now = Math.floor(Date.now() / 1000);

    if (expiry < now) {
      localStorage.clear();
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    // Jika token corrupt
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
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
