const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- ENV ----------------
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

// ---------------- MONGODB ----------------
mongoose.connect(MONGO_URL)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("Mongo error:", err));

// ---------------- SCHEMA ----------------
const gpsSchema = new mongoose.Schema({
  deviceId: String,
  lat: Number,
  lng: Number,
  time: { type: Date, default: Date.now }
});

const GPS = mongoose.model("GPS", gpsSchema);

// ---------------- ROUTES ----------------
app.post("/gps", async (req, res) => {
  const { deviceId, lat, lng } = req.body;

  if (!deviceId || !lat || !lng) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const data = new GPS({ deviceId, lat, lng });
  await data.save();

  res.json({ status: "saved" });
});

app.get("/location", async (req, res) => {
  const latest = await GPS.findOne().sort({ time: -1 });
  res.json(latest || {});
});

// ---------------- START ----------------
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});