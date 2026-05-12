const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET semua pasien (dengan pencarian nama)
router.get('/', async (req, res) => {
  const { search } = req.query;
  const patients = await prisma.patient.findMany({
    where: search ? { name: { contains: search } } : {},
    orderBy: { created_at: 'desc' },
  });
  res.json(patients);
});

// GET satu pasien + semua riwayat layanannya
router.get('/:id', async (req, res) => {
  const patient = await prisma.patient.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      services: {
        include: {
          doctor: true,
          details: { include: { medicine: true } },
        },
        orderBy: { service_date: 'desc' },
      },
    },
  });
  if (!patient) return res.status(404).json({ error: 'Pasien tidak ditemukan' });
  res.json(patient);
});

// POST buat pasien baru
router.post('/', async (req, res) => {
  const { name, contact, address } = req.body;
  const patient = await prisma.patient.create({
    data: { name, contact, address },
  });
  res.status(201).json(patient);
});

// PUT update pasien
router.put('/:id', async (req, res) => {
  const { name, contact, address } = req.body;
  const patient = await prisma.patient.update({
    where: { id: Number(req.params.id) },
    data: { name, contact, address },
  });
  res.json(patient);
});

module.exports = router;