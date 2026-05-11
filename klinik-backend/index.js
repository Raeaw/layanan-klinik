// index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Untuk parsing JSON body

// Basic route test
app.get("/", (req, res) => {
	res.json({ message: "Welcome to Klinik API" });
});

// Jalankan server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
