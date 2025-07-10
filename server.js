require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
const path = require('path');

// Serve static files from the "public" folder (you can rename if needed)
app.use(express.static(path.join(__dirname, 'public')));
const SHEETDB_URL = `https://sheetdb.io/api/v1/${process.env.SHEETDB_KEY}`;

// Check for duplicate email
app.get('/check', async (req, res) => {
  const email = req.query.email;
  const response = await fetch(`${SHEETDB_URL}/search?email=${encodeURIComponent(email)}`);
  const data = await response.json();
  res.json(data);
});

// Save new email
app.post('/subscribe', async (req, res) => {
  const email = req.body?.data?.[0]?.email;
  console.log("Subscribing:", email);

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const response = await fetch(SHEETDB_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [{ email }] })
    });

    const data = await response.json();
    console.log("SheetDB response:", data);
    res.json(data);
  } catch (err) {
    console.error("Error subscribing:", err);
    res.status(500).json({ error: "Something went wrong on server." });
  }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});