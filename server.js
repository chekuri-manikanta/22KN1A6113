const express = require("express");
const { v4: uuidv4 } = require("uuid");
const logger = require("./logger");
const app = express();
app.use(express.json());
app.use(logger); // Mandatory logging middleware
// In-memory store for short URLs
const urlDatabase = {};
// Helper function to validate URLs
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
}
// POST /shorturls
app.post("/shorturls", (req, res) => {
    const { url, validity, shortcode } = req.body;
    // Validate URL
    if (!url || !isValidUrl(url)) {
        return res.status(400).json({ error: "Invalid or missing URL" });
    }
    // Determine shortcode
    let finalCode = shortcode;
    if (!finalCode) {
        finalCode = uuidv4().slice(0, 6); // Generate random 6-char code
    }
    // Ensure uniqueness
    if (urlDatabase[finalCode]) {
        return res.status(400).json({ error: "Shortcode already exists" });
    }
    // Validity in minutes (default 30)
    const expiryMinutes = validity && Number.isInteger(validity) ? validity : 30;
    const expiryTime = new Date(Date.now() + expiryMinutes * 60000).toISOString();
    // Store
    urlDatabase[finalCode] = { url, expiryTime };
    // Build short link dynamically
    const shortLink = `${req.protocol}://${req.get("host")}/${finalCode}`;
    res.status(201).json({
        shortLink,
        expiry: expiryTime
    });
});
// Redirect handler (optional)
app.get("/:code", (req, res) => {
    const record = urlDatabase[req.params.code];
    if (!record) return res.status(404).json({ error: "Not found" });
    const now = new Date();
    if (now > new Date(record.expiryTime)) {
        return res.status(410).json({ error: "Link expired" });
    }
    res.redirect(record.url);
});
// Start server
const PORT = 3000;
app.listen(PORT, () => {
    process.stdout.write(`Server running on port ${PORT}\n`);
});
