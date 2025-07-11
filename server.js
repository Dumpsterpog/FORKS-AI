require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Use dynamic import for fetch (for Node.js compatibility)
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Serve static files from "public" directory
app.use(express.static(path.join(__dirname, 'public')));

const SHEETDB_URL = `https://sheetdb.io/api/v1/${process.env.SHEETDB_KEY}`;
const MAILBOXLAYER_API_KEY = process.env.MAILBOXLAYER_KEY;

// ✅ Route: Check for duplicate email
app.get('/check', async (req, res) => {
  const email = req.query.email?.trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: "Email is required for checking." });
  }

  try {
    const response = await fetch(`${SHEETDB_URL}/search?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error checking email:", err);
    res.status(500).json({ error: "Failed to check email in database." });
  }
});

// ✅ Route: Save new email after verifying
app.post('/subscribe', async (req, res) => {
  const email = req.body?.data?.[0]?.email?.trim().toLowerCase();
  console.log("Subscribing:", email);

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // 🔒 Step 1: Validate email with MailboxLayer API
    const verifyRes = await fetch(`http://apilayer.net/api/check?access_key=${MAILBOXLAYER_API_KEY}&email=${encodeURIComponent(email)}&smtp=0&format=1`);
    const verifyData = await verifyRes.json();

    console.log("Verification Result:", verifyData);

    if (!verifyData?.format_valid) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // ✅ Step 2: Save valid email to SheetDB
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

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
