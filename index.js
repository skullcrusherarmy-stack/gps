const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ---------------- MIDDLEWARE ----------------
app.use(cors());
app.use(express.json());

// ---------------- ENV ----------------
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

// ---------------- CHECK ENV ----------------
if (!MONGO_URL) {
  console.error("❌ MONGO_URL is missing");
  process.exit(1);
}

// ---------------- MONGODB ----------------
mongoose.connect(MONGO_URL)

.then(() => console.log("✅ MongoDB connected"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

// ---------------- SCHEMA ----------------
const gpsSchema = new mongoose.Schema({
  deviceId: String,
  lat: Number,
  lng: Number,
  time: { type: Date, default: Date.now }
});

const GPS = mongoose.model("GPS", gpsSchema);

// ---------------- ROUTES ----------------

// Health check (IMPORTANT for debugging)
app.get("/", (req, res) => {
  res.send("Server is running");
});

// POST GPS data
app.post("/gps", async (req, res) => {
  try {
    const { deviceId, lat, lng } = req.body;

    if (!deviceId || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const data = new GPS({ deviceId, lat, lng });
    await data.save();

    console.log("📍 Saved:", data);

    res.json({ status: "saved" });

  } catch (err) {
    console.error("❌ POST /gps error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET latest location
app.get("/location", async (req, res) => {
  try {
    const latest = await GPS.findOne().sort({ time: -1 });

    if (!latest) {
      return res.json({});
    }

    res.json(latest);

  } catch (err) {
    console.error("❌ GET /location error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------- START SERVER ----------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});