require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

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
    // Step 1: Verify email using MailboxLayer API
    const verifyRes = await fetch(`http://apilayer.net/api/check?access_key=${process.env.MAILBOXLAYER_KEY}&email=${encodeURIComponent(email)}&smtp=1&format=1`);
    const verifyData = await verifyRes.json();

    console.log("Verification Result:", verifyData);

    if (!verifyData.format_valid || !verifyData.smtp_check) {
      return res.status(400).json({ error: "Invalid or unreachable email address." });
    }

    // Step 2: Store the valid email
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