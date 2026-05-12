import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout     from './components/Layout';
import Dashboard  from './pages/Dashboard';
import Layanan    from './pages/Layanan';
import Dokter from './pages/Dokter';
import Pasien     from './pages/Pasien';
import Obat       from './pages/Obat';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"        element={<Navigate to="/layanan" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/layanan" element={<Layanan />} />
          <Route path="/dokter"  element={<Dokter />} />
          <Route path="/pasien"  element={<Pasien />} />
          <Route path="/obat"    element={<Obat />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}