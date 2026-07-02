import express from 'express';
import Notes from '../models/notes.model.js';
import Video from '../models/video.model.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { generateDetailedNotes } from '../services/ai.service.js';

const router = express.Router();
router.use(authenticate);

router.post('/generate', async (req, res) => {
  try {
    const { videoId, type = 'summary' } = req.body;
    const video = await Video.findOne({ _id: videoId, userId: req.user._id });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    if (!video.transcript) return res.status(400).json({ success: false, message: 'No transcript available' });

    const labels = { summary: 'Summary', detailed: 'Detailed Notes', keypoints: 'Key Points', chapters: 'Chapter Summaries', interview: 'Interview Prep', revision: 'Revision Notes' };
    const content = await generateDetailedNotes(video.transcript, video.title, type);
    const notes = new Notes({ userId: req.user._id, videoId, type, title: `${labels[type]} — ${video.title}`, content });
    await notes.save();
    res.json({ success: true, notes });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/all/saved', async (req, res) => {
  try {
    const notes = await Notes.find({ userId: req.user._id, isSaved: true }).populate('videoId', 'title thumbnail channelName').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, notes });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/:videoId', async (req, res) => {
  try {
    const notes = await Notes.find({ userId: req.user._id, videoId: req.params.videoId }).sort({ createdAt: -1 });
    res.json({ success: true, notes });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Notes.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Notes deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
