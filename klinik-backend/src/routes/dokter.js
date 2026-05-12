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

// PUT update dokter
router.put('/:id', async (req, res) => {
  const { name, specialization } = req.body;
  const doctor = await prisma.doctor.update({
    where: { id: Number(req.params.id) },
    data: { name, specialization },
  });
  res.json(doctor);
});

module.exports = router;