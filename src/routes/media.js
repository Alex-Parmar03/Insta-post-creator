const express = require('express');
const router = express.Router();
const { fetchBackgroundImages, fetchCreativeImages } = require('../services/mediaService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

const upload = multer({ dest: path.join(__dirname, '../../tmp_uploads') });

router.post('/suggest-media', async (req, res) => {
  try {
    const { text } = req.body;
    const result = await fetchBackgroundImages(text);
    
    res.json({
      success: true,
      topic: result.topic,
      assets: result.assets
    });
  } catch (error) {
    console.error('Route handler error:', error);
    res.status(500).json({ success: false, message: 'Server error processing media' });
  }
});

module.exports = router;

// Convert uploaded WebM to MP4
router.post('/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const quality = (req.body && req.body.quality) || 'medium';
    const fileNameBase = (req.body && req.body.fileName) || 'quote-Animated-Reel';
    const qualityMap = {
      low: 28,
      medium: 23,
      high: 18,
      ultra: 15
    };
    const crf = qualityMap[quality] || qualityMap.medium;

    const inputPath = req.file.path;
    const outputPath = `${inputPath}.mp4`;

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',
          '-preset veryfast',
          `-crf ${crf}`,
          '-pix_fmt yuv420p',
          '-movflags +faststart'
        ])
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outputPath);
    });

    res.setHeader('Content-Type', 'video/mp4');
    const downloadName = `${fileNameBase}-${quality}.mp4`;
    res.download(outputPath, downloadName, (err) => {
      // cleanup temp files
      try { fs.unlinkSync(inputPath); } catch (e) {}
      try { fs.unlinkSync(outputPath); } catch (e) {}
      if (err) console.error('Download error:', err);
    });
  } catch (error) {
    console.error('Conversion error:', error);
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(500).json({ success: false, message: 'Conversion failed' });
  }
});

router.post('/creative-media', async (req, res) => {
  try {
    const result = await fetchCreativeImages(req.body || {});
    res.json({ success: true, topic: result.topic, assets: result.assets });
  } catch (error) {
    console.error('Creative media route error:', error);
    res.status(500).json({ success: false, message: 'Server error processing creative media' });
  }
});