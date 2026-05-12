const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET semua dokter
router.get('/', async (req, res) => {
  const doctors = await prisma.doctor.findMany({ orderBy: { name: 'asc' } });
  res.json(doctors);
});

// POST tambah dokter
router.post('/', async (req, res) => {
  const { name, specialization } = req.body;
  const doctor = await prisma.doctor.create({ data: { name, specialization } });
  res.status(201).json(doctor);
});

router.get('/', async (req, res) => {
  const doctors = await prisma.doctor.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { services: true } } },
  });
  res.json(doctors);
});

// PUT update dokter
router.put('/:id', async (req, res) => {
  const { name, specialization } = req.body;
  const doctor = await prisma.doctor.update({
    where: { id: Number(req.params.id) },
    data: { name, specialization },
  });
  res.json(doctor);
});

// GET satu dokter + riwayat layanan
router.get('/:id', async (req, res) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      services: {
        include: {
          patient: true,
          details: true,
        },
        orderBy: { service_date: 'desc' },
      },
    },
  });
  if (!doctor) return res.status(404).json({ error: 'Dokter tidak ditemukan' });
  res.json(doctor);
});

module.exports = router;