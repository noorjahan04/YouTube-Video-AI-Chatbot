import express from 'express';
import Chat from '../models/chat.model.js';
import Video from '../models/video.model.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { chatWithVideo } from '../services/ai.service.js';

const router = express.Router();
router.use(authenticate);

router.post('/:videoId/message', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question?.trim()) return res.status(400).json({ success: false, message: 'Question is required' });
    const video = await Video.findOne({ _id: req.params.videoId, userId: req.user._id });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    if (!video.transcript) return res.status(400).json({ success: false, message: 'No transcript available' });

    let chat = await Chat.findOne({ userId: req.user._id, videoId: req.params.videoId });
    if (!chat) chat = new Chat({ userId: req.user._id, videoId: req.params.videoId, messages: [], title: video.title });

    chat.messages.push({ role: 'user', content: question });
    const answer = await chatWithVideo({ question, transcript: video.transcript, videoTitle: video.title, conversationHistory: chat.messages.slice(-20) });
    chat.messages.push({ role: 'assistant', content: answer });
    await chat.save();

    res.json({ success: true, answer, chatId: chat._id, messageCount: chat.messages.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/:videoId', async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.user._id, videoId: req.params.videoId });
    res.json({ success: true, messages: chat?.messages || [], chatId: chat?._id });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/:videoId', async (req, res) => {
  try {
    await Chat.findOneAndDelete({ userId: req.user._id, videoId: req.params.videoId });
    res.json({ success: true, message: 'Chat cleared' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
