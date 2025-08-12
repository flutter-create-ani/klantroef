const express = require('express');
const mongoose = require('mongoose');
const MediaAsset = require('../models/MediaAsset');
const MediaViewLog = require('../models/MediaViewLog');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// helper: get client IP (works behind proxies too)
function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}
//  POST /media/:id/view  
router.post('/:id/view', async (req, res) => {
  try {
    const mediaId = req.params.id;
    const media = await MediaAsset.findById(mediaId);
    if (!media) return res.status(404).json({ message: 'Media not found' });

    await MediaViewLog.create({
      media_id: media._id,
      viewed_by_ip: getClientIp(req)
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /media/:id/analytics  
router.get('/:id/analytics', authMiddleware, async (req, res) => {
  try {
    const mediaId = req.params.id;
    const media = await MediaAsset.findById(mediaId);
    if (!media) return res.status(404).json({ message: 'Media not found' });

    const [totalViews, uniqueIpsArr, perDay] = await Promise.all([
      MediaViewLog.countDocuments({ media_id: media._id }),
      MediaViewLog.distinct('viewed_by_ip', { media_id: media._id }),
      MediaViewLog.aggregate([
        { $match: { media_id: new mongoose.Types.ObjectId(media._id) } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const views_per_day = {};
    for (const d of perDay) views_per_day[d._id] = d.count;

    res.json({
      total_views: totalViews,
      unique_ips: uniqueIpsArr.length,
      views_per_day
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
