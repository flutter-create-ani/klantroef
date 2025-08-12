const express = require('express');
const MediaAsset = require('../models/MediaAsset');
const MediaViewLog = require('../models/MediaViewLog');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// POST /media (Add Media Metadata)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, type, file_url } = req.body;
    const media = new MediaAsset({ title, type, file_url });
    await media.save();
    res.json(media);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /media/:id/stream-url
router.get('/:id/stream-url', async (req, res) => {
  try {
    const mediaId = req.params.id;
    const media = await MediaAsset.findById(mediaId);
    if (!media) return res.status(404).json({ message: 'Media not found' });

    const secureLink = `${media.file_url}?expires_in=600`;
    res.json({ secureLink });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
