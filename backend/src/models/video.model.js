import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  youtubeId: { type: String, required: true },
  url: { type: String, required: true },
  title: String,
  description: String,
  thumbnail: String,
  channelName: String,
  duration: String,
  publishedAt: Date,
  transcript: { type: String, maxlength: 500000 },
  transcriptSegments: [{ text: String, start: Number, duration: Number }],
  summary: String,
  keyPoints: [String],
  tags: [String],
  processedAt: Date,
  isProcessed: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

videoSchema.index({ userId: 1, youtubeId: 1 }, { unique: true });
videoSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Video', videoSchema);
