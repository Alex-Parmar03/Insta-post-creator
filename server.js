require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const mediaRoutes = require('./src/routes/media');
const fs = require('fs');

// Ensure temporary upload folder exists for server-side conversions
const tmpDir = path.join(__dirname, 'tmp_uploads');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/media', mediaRoutes);

// Fallback Route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 StudioEngine Node.js Server running at http://localhost:${PORT}`);
});