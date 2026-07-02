import mongoose from 'mongoose';

const notesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  type: { type: String, enum: ['summary', 'detailed', 'keypoints', 'chapters', 'interview', 'revision'], default: 'summary' },
  title: String,
  content: String,
  isSaved: { type: Boolean, default: true }
}, { timestamps: true });

notesSchema.index({ userId: 1, videoId: 1 });

export default mongoose.model('Notes', notesSchema);
