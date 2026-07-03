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

// ── Metadata ──────────────────────────────────────────────────────────────────

const scrapeYouTubeMetadata = async (videoId) => {
  try {
    const res = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
      timeout: 12000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    const html = res.data;
    const title    = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1]
                  || html.match(/<title>([^<]+)<\/title>/)?.[1]?.replace(' - YouTube','').trim();
    const channel  = html.match(/"ownerChannelName":"([^"]+)"/)?.[1];
    const thumbUrl = html.match(/"thumbnailUrl":"([^"]+)"/)?.[1];
    const lenSecs  = html.match(/"lengthSeconds":"(\d+)"/)?.[1];
    let duration = null;
    if (lenSecs) {
      const s = parseInt(lenSecs), h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
      duration = h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`;
    }
    if (title) return { title, channelName: channel||'Unknown', thumbnail: thumbUrl||`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, duration, tags:[], description:'', publishedAt:null };
    return null;
  } catch(e) { console.warn('Scrape metadata failed:', e.message); return null; }
};

export const getVideoMetadata = async (videoId) => {
  if (process.env.YOUTUBE_API_KEY) {
    try {
      const res = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails`, { timeout: 8000 });
      if (res.data.items?.length > 0) {
        const { snippet, contentDetails } = res.data.items[0];
        return { title: snippet.title, description: snippet.description?.slice(0,500)||'', thumbnail: snippet.thumbnails?.high?.url||`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, channelName: snippet.channelTitle, publishedAt: snippet.publishedAt, duration: formatDuration(contentDetails?.duration), tags: snippet.tags?.slice(0,10)||[] };
      }
    } catch(e) { console.warn('YouTube API failed:', e.message); }
  }
  const scraped = await scrapeYouTubeMetadata(videoId);
  if (scraped) return scraped;
  return { title:`YouTube Video (${videoId})`, description:'', thumbnail:`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, channelName:'Unknown', publishedAt:null, duration:null, tags:[] };
};

// ── Transcript ────────────────────────────────────────────────────────────────

/**
 * Method 1: YouTube Data API v3 captions list + direct fetch
 * Requires YOUTUBE_API_KEY. Most reliable, bypasses IP blocks.
 */
const getTranscriptViaYouTubeAPI = async (videoId) => {
  if (!process.env.YOUTUBE_API_KEY) throw new Error('No YouTube API key configured');

  // Get list of caption tracks for this video
  const listRes = await axios.get(
    `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${process.env.YOUTUBE_API_KEY}`,
    { timeout: 8000 }
  );

  const tracks = listRes.data.items || [];
  if (tracks.length === 0) throw new Error('No caption tracks found via API');

  // Prefer English auto-generated, then English manual, then any
  const track = tracks.find(t => t.snippet.trackKind === 'asr' && t.snippet.language?.startsWith('en'))
             || tracks.find(t => t.snippet.language?.startsWith('en'))
             || tracks[0];

  // Note: Downloading caption content via API requires OAuth, not just API key.
  // So we use the track info to confirm captions exist, then fetch via timedtext.
  console.log(`[transcript] API found track: ${track.snippet.language} (${track.snippet.trackKind})`);

  // Use timedtext with confirmed track info
  const lang = track.snippet.language || 'en';
  const kind = track.snippet.trackKind === 'asr' ? '&kind=asr' : '';
  const url  = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}${kind}&fmt=json3`;

  const captionRes = await axios.get(url, {
    timeout: 10000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });

  return parseTimedTextJson(captionRes.data);
};

/**
 * Method 2: Scrape YouTube page for caption track URLs, then fetch timedtext XML
 * No API key needed. Works when YouTube hasn't blocked the server IP for page scraping.
 */
const getTranscriptViaPageScrape = async (videoId) => {
  const pageRes = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
    timeout: 12000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    }
  });

  const html = pageRes.data;

  // Try to extract captionTracks from ytInitialPlayerResponse
  const playerMatch = html.match(/"captionTracks":(\[.*?\])/s);
  if (!playerMatch) {
    // Double check — maybe the video has no captions at all
    if (html.includes('"isLive":true')) throw new Error('Live streams do not have transcripts');
    throw new Error('No caption tracks found in page. This video may not have subtitles.');
  }

  let tracks;
  try {
    tracks = JSON.parse(playerMatch[1]);
  } catch {
    throw new Error('Could not parse caption tracks from page');
  }

  if (!tracks.length) throw new Error('No caption tracks available');

  // Prefer English auto-generated, then English, then first available
  const track = tracks.find(t => t.kind === 'asr' && t.languageCode?.startsWith('en'))
             || tracks.find(t => t.languageCode?.startsWith('en'))
             || tracks[0];

  const baseUrl = track.baseUrl;
  const captionRes = await axios.get(`${baseUrl}&fmt=json3`, {
    timeout: 10000,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  return parseTimedTextJson(captionRes.data);
};

/**
 * Method 3: youtube-captions-scraper package
 */
const getTranscriptViaScraper = async (videoId) => {
  const { getSubtitles } = await import('youtube-captions-scraper');
  const captions = await getSubtitles({ videoID: videoId, lang: 'en' });
  if (!captions?.length) throw new Error('No captions returned');
  const segments = captions.map(c => ({
    text: c.text.replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim(),
    start: parseFloat(c.start),
    duration: parseFloat(c.dur)
  })).filter(s => s.text.length > 0);
  const fullText = segments.map(s => s.text).join(' ');
  return { segments, fullText, wordCount: fullText.split(/\s+/).length };
};

/**
 * Method 4: youtube-transcript package (original fallback)
 */
const getTranscriptViaPackage = async (videoId) => {
  const { YoutubeTranscript } = await import('youtube-transcript');
  const items = await YoutubeTranscript.fetchTranscript(videoId);
  if (!items?.length) throw new Error('No transcript items returned');
  const segments = items.map(i => ({ text: i.text.replace(/\[.*?\]/g,'').trim(), start: i.offset/1000, duration: i.duration/1000 })).filter(s => s.text.length > 0);
  const fullText = segments.map(s => s.text).join(' ');
  return { segments, fullText, wordCount: fullText.split(/\s+/).length };
};

/**
 * Parse YouTube's json3 caption format into our segment structure
 */
const parseTimedTextJson = (data) => {
  const events = data?.events || [];
  const segments = events
    .filter(e => e.segs)
    .map(e => ({
      text: e.segs.map(s => s.utf8||'').join('').replace(/\n/g,' ').trim(),
      start: (e.tStartMs||0)/1000,
      duration: (e.dDurationMs||0)/1000,
    }))
    .filter(s => s.text.length > 0);

  if (!segments.length) throw new Error('Caption data was empty');

  const fullText = segments.map(s => s.text).join(' ');
  return { segments, fullText, wordCount: fullText.split(/\s+/).length };
};

/**
 * Main transcript function — tries all methods in order, stops on first success.
 */
export const getVideoTranscript = async (videoId) => {
  const methods = [
    { name: 'youtube-api-v3',      fn: () => getTranscriptViaYouTubeAPI(videoId) },
    { name: 'page-scrape-timedtext', fn: () => getTranscriptViaPageScrape(videoId) },
    { name: 'captions-scraper',    fn: () => getTranscriptViaScraper(videoId) },
    { name: 'youtube-transcript',  fn: () => getTranscriptViaPackage(videoId) },
  ];

  const errors = [];

  for (const method of methods) {
    try {
      console.log(`[transcript] Trying: ${method.name} for video ${videoId}`);
      const result = await method.fn();
      console.log(`[transcript] ✅ Success: ${method.name} — ${result.wordCount} words`);
      return result;
    } catch (e) {
      console.warn(`[transcript] ❌ ${method.name}: ${e.message}`);
      errors.push(`${method.name}: ${e.message}`);

      // If captions are explicitly disabled, no point trying other methods
      if (
        e.message?.includes('disabled on this video') ||
        e.message?.includes('No caption tracks') ||
        e.message?.includes('not have subtitles') ||
        e.message?.includes('no captions') ||
        e.message?.toLowerCase().includes('transcript disabled')
      ) {
        throw new Error(
          'This video does not have captions or transcripts enabled. ' +
          'Please try a video that has subtitles — on YouTube, click the "..." menu below the video and look for "Show transcript".'
        );
      }
    }
  }

  throw new Error(
    'Could not extract transcript. This usually means:\n' +
    '1. The video has transcripts disabled\n' +
    '2. The video is private or geo-restricted\n' +
    '3. A temporary server-side block from YouTube\n\n' +
    `Details: ${errors.join(' | ')}`
  );
};

export const formatDuration = (iso) => {
  if (!iso) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = parseInt(m[1]||0), min = parseInt(m[2]||0), s = parseInt(m[3]||0);
  return h > 0 ? `${h}:${String(min).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${min}:${String(s).padStart(2,'0')}`;
};