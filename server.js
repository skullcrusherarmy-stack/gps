const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let latestLocation = {}; // store latest GPS data

// ---------------- RECEIVE GPS DATA ----------------
app.post("/gps", (req, res) => {
  const { deviceId, lat, lng } = req.body;

  if (!deviceId || !lat || !lng) {
    return res.status(400).json({ error: "Invalid data" });
  }

  latestLocation = {
    deviceId,
    lat,
    lng,
    time: new Date()
  };

  console.log("Received:", latestLocation);

  res.json({ status: "ok" });
});

// ---------------- GET LATEST LOCATION ----------------
app.get("/location", (req, res) => {
  res.json(latestLocation);
});

// ---------------- START SERVER ----------------
app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});