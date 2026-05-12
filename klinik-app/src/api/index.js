const BASE = 'http://localhost:3001/api';

const get  = (url) => fetch(BASE + url).then(r => r.json());
const post = (url, body) => fetch(BASE + url, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
}).then(r => r.json());
const put  = (url, body) => fetch(BASE + url, {
  method: 'PUT', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
}).then(r => r.json());

export const api = {
  // Pasien
  getPasien:       (search = '') => get(`/pasien?search=${search}`),
  getPasienById:   (id)          => get(`/pasien/${id}`),
  createPasien:    (data)        => post('/pasien', data),
  updatePasien:    (id, data)    => put(`/pasien/${id}`, data),

  // Dokter
  getDokter:       ()     => get('/dokter'),
  createDokter:    (data) => post('/dokter', data),
  updateDokter: (id, data) => put(`/dokter/${id}`, data),

  // Layanan
  getLayanan:      (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/layanan${q ? '?' + q : ''}`);
  },
  getLayananById:  (id)   => get(`/layanan/${id}`),
  createLayanan:   (data) => post('/layanan', data),

  // Obat
  getObat:         ()          => get('/obat'),
  getObatById:     (id)        => get(`/obat/${id}`),
  createObat:      (data)      => post('/obat', data),
  updateHargaObat: (id, data)  => put(`/obat/${id}/harga`, data),
  tambahStok:      (id, data)  => post(`/obat/${id}/stok`, data),
};