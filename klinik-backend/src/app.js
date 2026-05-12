const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pasienRouter   = require('./routes/pasien');
const dokterRouter   = require('./routes/dokter');
const layananRouter  = require('./routes/layanan');
const obatRouter     = require('./routes/obat');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/pasien',  pasienRouter);
app.use('/api/dokter',  dokterRouter);
app.use('/api/layanan', layananRouter);
app.use('/api/obat',    obatRouter);

module.exports = app;