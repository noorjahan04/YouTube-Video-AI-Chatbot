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

// ── Metadata ─────────────────────────────────────────────────────────────

const scrapeYouTubeMetadata = async (videoId) => {
  try {
    const res = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    const html = res.data;
    const ogTitle  = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1];
    const title    = ogTitle || html.match(/<title>([^<]+)<\/title>/)?.[1]?.replace(' - YouTube', '').trim();
    const channel  = html.match(/"ownerChannelName":"([^"]+)"/)?.[1];
    const thumbUrl = html.match(/"thumbnailUrl":"([^"]+)"/)?.[1];
    const lenSecs  = html.match(/"lengthSeconds":"(\d+)"/)?.[1];
    let duration = null;
    if (lenSecs) {
      const s = parseInt(lenSecs), h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
      duration = h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`;
    }
    if (title) return { title, channelName: channel || 'Unknown', thumbnail: thumbUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, duration, tags: [], description: '', publishedAt: null };
    return null;
  } catch (e) { console.warn('Scrape metadata failed:', e.message); return null; }
};

export const getVideoMetadata = async (videoId) => {
  if (process.env.YOUTUBE_API_KEY) {
    try {
      const res = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails`, { timeout: 8000 });
      if (res.data.items?.length > 0) {
        const { snippet, contentDetails } = res.data.items[0];
        return { title: snippet.title, description: snippet.description?.slice(0, 500) || '', thumbnail: snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, channelName: snippet.channelTitle, publishedAt: snippet.publishedAt, duration: formatDuration(contentDetails?.duration), tags: snippet.tags?.slice(0, 10) || [] };
      }
    } catch (e) { console.warn('YouTube API failed:', e.message); }
  }

  const scraped = await scrapeYouTubeMetadata(videoId);
  if (scraped) return scraped;

  try {
    const res = await axios.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, { timeout: 8000 });
    if (res.data?.title) return { title: res.data.title, description: '', thumbnail: res.data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, channelName: res.data.author_name || 'Unknown', publishedAt: null, duration: null, tags: [] };
  } catch (e) { console.warn('oEmbed failed:', e.message); }

  return { title: `YouTube Video (${videoId})`, description: '', thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, channelName: 'Unknown', publishedAt: null, duration: null, tags: [] };
};

// ── Transcript — 3-method fallback chain ─────────────────────────────────

/**
 * Method 1: Fetch captions directly from YouTube's timedtext API.
 * This scrapes the video page for the caption track URL, then fetches the XML.
 * Works without any npm package and is the most reliable on deployed servers.
 */
const getTranscriptViaTiledText = async (videoId) => {
  // Step 1: get the video page to find caption track URLs
  const pageRes = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
    timeout: 12000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    }
  });

  const html = pageRes.data;

  // Extract captions data from ytInitialPlayerResponse
  const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?})\s*;/s);
  if (!playerMatch) throw new Error('Could not parse YouTube player response');

  let playerData;
  try {
    playerData = JSON.parse(playerMatch[1]);
  } catch {
    throw new Error('Could not parse YouTube player JSON');
  }

  const captions = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!captions || captions.length === 0) {
    throw new Error('Transcript is disabled on this video');
  }

  // Prefer English, fall back to first available
  const track = captions.find(t => t.languageCode === 'en' || t.languageCode?.startsWith('en')) || captions[0];
  const captionUrl = track.baseUrl + '&fmt=json3';

  // Step 2: fetch the actual caption data
  const captionRes = await axios.get(captionUrl, {
    timeout: 10000,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const events = captionRes.data?.events || [];
  const segments = events
    .filter(e => e.segs)
    .map(e => ({
      text: e.segs.map(s => s.utf8 || '').join('').replace(/\n/g, ' ').trim(),
      start: (e.tStartMs || 0) / 1000,
      duration: (e.dDurationMs || 0) / 1000,
    }))
    .filter(s => s.text.length > 0);

  if (segments.length === 0) throw new Error('No transcript segments found');

  const fullText = segments.map(s => s.text).join(' ');
  return { segments, fullText, wordCount: fullText.split(/\s+/).length };
};

/**
 * Method 2: youtube-captions-scraper npm package (backup)
 */
const getTranscriptViaScraper = async (videoId) => {
  const { getSubtitles } = await import('youtube-captions-scraper');
  const captions = await getSubtitles({ videoID: videoId, lang: 'en' });
  if (!captions?.length) throw new Error('No captions returned');
  const segments = captions.map(c => ({ text: c.text.replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim(), start: parseFloat(c.start), duration: parseFloat(c.dur) })).filter(s => s.text.length > 0);
  const fullText = segments.map(s => s.text).join(' ');
  return { segments, fullText, wordCount: fullText.split(/\s+/).length };
};

/**
 * Method 3: youtube-transcript npm package (original, least reliable on servers)
 */
const getTranscriptViaPackage = async (videoId) => {
  const { YoutubeTranscript } = await import('youtube-transcript');
  const items = await YoutubeTranscript.fetchTranscript(videoId);
  if (!items?.length) throw new Error('No transcript available');
  const segments = items.map(i => ({ text: i.text.replace(/\[.*?\]/g, '').trim(), start: i.offset / 1000, duration: i.duration / 1000 })).filter(s => s.text.length > 0);
  const fullText = segments.map(s => s.text).join(' ');
  return { segments, fullText, wordCount: fullText.split(/\s+/).length };
};

export const getVideoTranscript = async (videoId) => {
  const methods = [
    { name: 'timedtext-api',  fn: () => getTranscriptViaTiledText(videoId) },
    { name: 'captions-scraper', fn: () => getTranscriptViaScraper(videoId) },
    { name: 'youtube-transcript', fn: () => getTranscriptViaPackage(videoId) },
  ];

  let lastError = null;
  for (const method of methods) {
    try {
      console.log(`[transcript] Trying method: ${method.name} for ${videoId}`);
      const result = await method.fn();
      console.log(`[transcript] Success with: ${method.name} (${result.wordCount} words)`);
      return result;
    } catch (e) {
      console.warn(`[transcript] Method ${method.name} failed:`, e.message);
      lastError = e;

      // If any method explicitly says transcript is disabled, stop trying
      if (e.message?.toLowerCase().includes('disabled') || e.message?.toLowerCase().includes('no captions')) {
        throw new Error('This video does not have transcripts/captions enabled. Please try a video that has subtitles or auto-generated captions.');
      }
    }
  }

  throw new Error(`Could not extract transcript after trying all methods. Last error: ${lastError?.message}`);
};

export const formatDuration = (iso) => {
  if (!iso) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = parseInt(m[1] || 0), min = parseInt(m[2] || 0), s = parseInt(m[3] || 0);
  return h > 0 ? `${h}:${String(min).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${min}:${String(s).padStart(2,'0')}`;
};