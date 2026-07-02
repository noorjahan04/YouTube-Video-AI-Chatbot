import express from 'express';
import User from '../models/user.model.js';
import Video from '../models/video.model.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/profile', async (req, res) => res.json({ success: true, user: req.user }));

router.patch('/preferences', async (req, res) => {
  try {
    const { theme, language } = req.body;
    const user = await User.findById(req.user._id);
    if (theme) user.preferences.theme = theme;
    if (language) user.preferences.language = language;
    await user.save();
    res.json({ success: true, preferences: user.preferences });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const [totalVideos, favoriteVideos] = await Promise.all([
      Video.countDocuments({ userId: req.user._id }),
      Video.countDocuments({ userId: req.user._id, isFavorite: true })
    ]);
    res.json({ success: true, stats: { totalVideos, favoriteVideos } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
