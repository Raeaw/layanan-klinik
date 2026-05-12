const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET semua obat (+ stok total + nearest expiry)
router.get('/', async (req, res) => {
  const medicines = await prisma.medicine.findMany({
    include: { batches: true },
    orderBy: { name: 'asc' },
  });
  const result = medicines.map(m => {
    const totalStock = m.batches.reduce((s, b) => s + b.stock_quantity, 0);
    const nearestExpiry = m.batches.length
      ? m.batches.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date))[0].expiry_date
      : null;
    return { ...m, totalStock, nearestExpiry };
  });
  res.json(result);
});

// GET satu obat + batch + riwayat harga
router.get('/:id', async (req, res) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      batches:      { orderBy: { expiry_date: 'asc' } },
      price_histories: { orderBy: { changed_at:  'desc' } },
    },
  });
  if (!medicine) return res.status(404).json({ error: 'Obat tidak ditemukan' });
  res.json(medicine);
});

// POST tambah obat baru
router.post('/', async (req, res) => {
  const { name, category, current_price } = req.body;
  const medicine = await prisma.medicine.create({
    data: { name, category, current_price: Number(current_price) },
  });
  res.status(201).json(medicine);
});

// PUT ubah harga obat (otomatis catat riwayat harga)
router.put('/:id/harga', async (req, res) => {
  const { new_price } = req.body;
  const medicine = await prisma.medicine.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!medicine) return res.status(404).json({ error: 'Obat tidak ditemukan' });

  await prisma.medicinePriceHistory.create({
    data: {
      medicineId: medicine.id,
      old_price:  medicine.current_price,
      new_price:  Number(new_price),
    },
  });

  const updated = await prisma.medicine.update({
    where: { id: medicine.id },
    data:  { current_price: Number(new_price) },
  });
  res.json(updated);
});

// POST tambah stok (batch baru)
// Body: { stock_quantity, expiry_date }
router.post('/:id/stok', async (req, res) => {
  const { stock_quantity, expiry_date } = req.body;
  const batch = await prisma.medicineBatch.create({
    data: {
      medicineId:    Number(req.params.id),
      stock_quantity: Number(stock_quantity),
      expiry_date:   new Date(expiry_date),
    },
  });
  res.status(201).json(batch);
});

module.exports = router;