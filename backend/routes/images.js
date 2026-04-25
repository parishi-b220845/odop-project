const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const CACHE_DIR = path.join(__dirname, '../uploads/img-cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

// GET /api/images/:fileId  — serves a Google Drive image, caching locally on first fetch
router.get('/:fileId', (req, res) => {
  const { fileId } = req.params;
  // Only allow safe file ID characters
  if (!/^[a-zA-Z0-9_=-]+$/.test(fileId)) return res.status(400).end();

  const cachePath = path.join(CACHE_DIR, `${fileId}.jpg`);

  if (fs.existsSync(cachePath)) {
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return fs.createReadStream(cachePath).pipe(res);
  }

  // Fetch from Google and cache
  const driveUrl = `https://lh3.googleusercontent.com/d/${fileId}=w600-h600`;
  const req2 = https.get(driveUrl, { timeout: 10000 }, (upstream) => {
    const ct = upstream.headers['content-type'] || '';
    if (upstream.statusCode !== 200 || !ct.includes('image')) {
      upstream.resume();
      return res.status(502).end();
    }
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const writeStream = fs.createWriteStream(cachePath);
    upstream.pipe(writeStream);
    upstream.pipe(res, { end: false });
    writeStream.on('finish', () => upstream.unpipe(res));
    upstream.on('end', () => res.end());
    upstream.on('error', () => { fs.unlink(cachePath, () => {}); res.end(); });
  });
  req2.on('timeout', () => { req2.destroy(); res.status(504).end(); });
  req2.on('error', () => res.status(502).end());
});

module.exports = router;
