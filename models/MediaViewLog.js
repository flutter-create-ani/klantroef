const mongoose = require('mongoose');

const MediaViewLogSchema = new mongoose.Schema({
  media_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MediaAsset', required: true, index: true },
  viewed_by_ip: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('MediaViewLog', MediaViewLogSchema);
