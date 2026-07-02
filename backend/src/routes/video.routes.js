import express from 'express';
import Video from '../models/video.model.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { extractVideoId, getVideoMetadata, getVideoTranscript, formatDuration } from '../services/youtube.service.js';
import { generateSummary, extractKeyPoints } from '../services/ai.service.js';

const router = express.Router();
router.use(authenticate);

router.post('/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'YouTube URL is required' });
    const videoId = extractVideoId(url);
    if (!videoId) return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });

    let video = await Video.findOne({ userId: req.user._id, youtubeId: videoId });
    if (video?.isProcessed) { video.viewCount += 1; await video.save(); return res.json({ success: true, video, cached: true }); }

    const [metadata, transcriptData] = await Promise.all([getVideoMetadata(videoId), getVideoTranscript(videoId)]);
    const [summary, keyPoints] = await Promise.all([generateSummary(transcriptData.fullText, metadata.title), extractKeyPoints(transcriptData.fullText, metadata.title)]);

    const data = { userId: req.user._id, youtubeId: videoId, url, title: metadata.title, description: metadata.description, thumbnail: metadata.thumbnail, channelName: metadata.channelName, duration: formatDuration(metadata.duration), publishedAt: metadata.publishedAt, transcript: transcriptData.fullText, transcriptSegments: transcriptData.segments.slice(0, 300), summary, keyPoints, tags: metadata.tags, isProcessed: true, processedAt: new Date() };

    if (video) { Object.assign(video, data); video.viewCount += 1; } else { video = new Video({ ...data, viewCount: 1 }); }
    await video.save();
    res.json({ success: true, video, cached: false });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { userId: req.user._id };
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { channelName: { $regex: search, $options: 'i' } }];
    const [videos, total] = await Promise.all([
      Video.find(query).select('-transcript -transcriptSegments').sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)),
      Video.countDocuments(query)
    ]);
    res.json({ success: true, videos, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, userId: req.user._id });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, video });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/:id/favorite', async (req, res) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, userId: req.user._id });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    video.isFavorite = !video.isFavorite;
    await video.save();
    res.json({ success: true, isFavorite: video.isFavorite });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Video.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Video removed' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
