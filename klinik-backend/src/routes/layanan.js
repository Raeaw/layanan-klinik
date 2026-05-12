const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET semua layanan (dengan filter opsional)
router.get('/', async (req, res) => {
  const { patientId, from, to } = req.query;
  const where = {};
  if (patientId) where.patientId = Number(patientId);
  if (from || to) {
    where.service_date = {};
    if (from) where.service_date.gte = new Date(from);
    if (to)   where.service_date.lte = new Date(to);
  }
  const services = await prisma.service.findMany({
    where,
    include: {
      patient: true,
      doctor: true,
      details: { include: { medicine: true } },
    },
    orderBy: { service_date: 'desc' },
  });
  res.json(services);
});

// GET satu layanan detail
router.get('/:id', async (req, res) => {
  const service = await prisma.service.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      patient: true,
      doctor: true,
      details: { include: { medicine: true } },
    },
  });
  if (!service) return res.status(404).json({ error: 'Layanan tidak ditemukan' });
  res.json(service);
});

// POST buat layanan baru (beserta detail)
// Body: { patientId, doctorId, service_date, notes, details: [{ item_name, medicineId?, quantity, price_at_the_time }] }
router.post('/', async (req, res) => {
  const { patientId, doctorId, service_date, notes, details } = req.body;

  // ── Cek stok dulu sebelum simpan ──────────────────────────
  for (const d of details) {
    if (!d.medicineId) continue;
    const batches = await prisma.medicineBatch.findMany({
      where: { medicineId: Number(d.medicineId), stock_quantity: { gt: 0 } },
    });
    const totalStok = batches.reduce((s, b) => s + b.stock_quantity, 0);
    if (totalStok < Number(d.quantity)) {
      const obat = await prisma.medicine.findUnique({ where: { id: Number(d.medicineId) } });
      return res.status(400).json({
        error: `Stok ${obat.name} tidak cukup. Tersedia: ${totalStok}, dibutuhkan: ${d.quantity}`,
      });
    }
  }
  // ──────────────────────────────────────────────────────────

  const total_cost = details.reduce(
    (sum, d) => sum + Number(d.price_at_the_time) * Number(d.quantity), 0
  );

  const service = await prisma.service.create({
    data: {
      patientId: Number(patientId),
      doctorId:  Number(doctorId),
      service_date: new Date(service_date),
      total_cost,
      notes,
      details: {
        create: details.map(d => ({
        item_name:         d.item_name,
        quantity:          Number(d.quantity),
        price_at_the_time: Number(d.price_at_the_time),
        medicineId:        d.medicineId ? Number(d.medicineId) : null,
        })),
      },
    },
    include: { patient: true, doctor: true, details: true },
  });

  // Kurangi stok obat jika ada medicineId (FIFO berdasarkan expiry_date)
  for (const d of details) {
    if (!d.medicineId) continue;
    let remaining = d.quantity;
    const batches = await prisma.medicineBatch.findMany({
      where: { medicineId: Number(d.medicineId), stock_quantity: { gt: 0 } },
      orderBy: { expiry_date: 'asc' },
    });
    for (const batch of batches) {
      if (remaining <= 0) break;
      const deduct = Math.min(batch.stock_quantity, remaining);
      await prisma.medicineBatch.update({
        where: { id: batch.id },
        data:  { stock_quantity: batch.stock_quantity - deduct },
      });
      remaining -= deduct;
    }
  }

  res.status(201).json(service);
});

module.exports = router;