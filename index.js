const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

// ---------- DEBUG GLOBAL ----------
app.use((req, res, next) => {
  console.log("➡️ Incoming:", req.method, req.url);
  next();
});

// ---------- MONGODB ----------
mongoose.connect(MONGO_URL)
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.log("❌ Mongo error:", err));

// ---------- SCHEMA ----------
const gpsSchema = new mongoose.Schema({
  deviceId: String,
  lat: Number,
  lng: Number,
  time: { type: Date, default: Date.now }
});

const GPS = mongoose.model("GPS", gpsSchema);

// ---------- ROOT ----------
app.get("/", (req, res) => {
  console.log("ROOT HIT");
  res.send("Server is alive");
});

// ---------- POST ----------
app.post("/gps", async (req, res) => {
  try {
    console.log("POST /gps body:", req.body);

    const { deviceId, lat, lng } = req.body;

    const data = new GPS({ deviceId, lat, lng });
    await data.save();

    res.json({ status: "saved" });

  } catch (err) {
    console.error("🔥 POST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- GET ----------
app.get("/location", async (req, res) => {
  try {
    console.log("GET /location called");

    const latest = await GPS.findOne().sort({ time: -1 });

    console.log("Latest:", latest);

    res.json(latest || {});

  } catch (err) {
    console.error("🔥 GET ERROR:", err);
    res.status(200).json({ error: err.message });
  }
});

// ---------- START ----------
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
});