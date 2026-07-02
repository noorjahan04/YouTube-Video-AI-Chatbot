import { YoutubeTranscript } from 'youtube-transcript';
import axios from 'axios';

export const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

// Scrape YouTube page HTML to extract title and channel without an API key
const scrapeYouTubeMetadata = async (videoId) => {
  try {
    const res = await axios.get(
      `https://www.youtube.com/watch?v=${videoId}`,
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      }
    );

    const html = res.data;

    // Extract title from <title> tag  e.g.  "Video Name - YouTube"
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    let title = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : null;

    // Also try og:title meta tag which is cleaner
    const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    if (ogTitleMatch) title = ogTitleMatch[1].trim();

    // Extract channel name
    const channelMatch = html.match(/"ownerChannelName":"([^"]+)"/);
    const channel = channelMatch ? channelMatch[1] : null;

    // Extract thumbnail
    const thumbMatch = html.match(/"thumbnailUrl":"([^"]+)"/);
    let thumbnail = thumbMatch ? thumbMatch[1] : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // Extract duration in seconds
    const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
    let duration = null;
    if (durationMatch) {
      const secs = parseInt(durationMatch[1]);
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      duration = h > 0
        ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
        : `${m}:${String(s).padStart(2,'0')}`;
    }

    if (title) {
      return { title, channelName: channel || 'Unknown', thumbnail, duration, tags: [], description: '', publishedAt: null };
    }
    return null;
  } catch (e) {
    console.warn('YouTube page scrape failed:', e.message);
    return null;
  }
};

export const getVideoMetadata = async (videoId) => {
  // Try 1: YouTube Data API v3 (best, needs YOUTUBE_API_KEY)
  if (process.env.YOUTUBE_API_KEY) {
    try {
      const res = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails`,
        { timeout: 8000 }
      );
      if (res.data.items?.length > 0) {
        const { snippet, contentDetails } = res.data.items[0];
        return {
          title: snippet.title,
          description: snippet.description?.slice(0, 500) || '',
          thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          channelName: snippet.channelTitle,
          publishedAt: snippet.publishedAt,
          duration: formatDuration(contentDetails?.duration),
          tags: snippet.tags?.slice(0, 10) || []
        };
      }
    } catch (e) {
      console.warn('YouTube Data API failed:', e.message);
    }
  }

  // Try 2: Scrape YouTube page (no API key needed)
  const scraped = await scrapeYouTubeMetadata(videoId);
  if (scraped) return scraped;

  // Try 3: oEmbed
  try {
    const res = await axios.get(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (res.data?.title) {
      return {
        title: res.data.title,
        description: '',
        thumbnail: res.data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        channelName: res.data.author_name || 'Unknown',
        publishedAt: null, duration: null, tags: []
      };
    }
  } catch (e) {
    console.warn('oEmbed failed:', e.message);
  }

  // Try 4: noembed.com
  try {
    const res = await axios.get(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`,
      { timeout: 8000 }
    );
    if (res.data?.title) {
      return {
        title: res.data.title,
        description: '',
        thumbnail: res.data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        channelName: res.data.author_name || 'Unknown',
        publishedAt: null, duration: null, tags: []
      };
    }
  } catch (e) {
    console.warn('noembed failed:', e.message);
  }

  // Final fallback
  console.warn(`All metadata sources failed for ${videoId}`);
  return {
    title: `YouTube Video (${videoId})`,
    description: '',
    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    channelName: 'Unknown',
    publishedAt: null, duration: null, tags: []
  };
};

export const getVideoTranscript = async (videoId) => {
  try {
    const items = await YoutubeTranscript.fetchTranscript(videoId);
    if (!items?.length) throw new Error('No transcript available for this video');
    const segments = items
      .map(i => ({ text: i.text.replace(/\[.*?\]/g, '').trim(), start: i.offset / 1000, duration: i.duration / 1000 }))
      .filter(s => s.text.length > 0);
    const fullText = segments.map(s => s.text).join(' ');
    return { segments, fullText, wordCount: fullText.split(/\s+/).length };
  } catch (e) {
    throw new Error(`Could not extract transcript: ${e.message}`);
  }
};

export const formatDuration = (iso) => {
  if (!iso) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = parseInt(m[1] || 0), min = parseInt(m[2] || 0), s = parseInt(m[3] || 0);
  return h > 0
    ? `${h}:${String(min).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    : `${min}:${String(s).padStart(2,'0')}`;
};
