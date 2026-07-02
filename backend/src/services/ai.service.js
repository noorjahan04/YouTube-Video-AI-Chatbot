import Groq from 'groq-sdk';

const getClient = () => {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not set in .env');
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const MODEL = 'llama-3.3-70b-versatile';

const truncate = (text, max = 12000) => {
  if (text.length <= max) return text;
  const half = max / 2;
  return text.slice(0, half) + '\n...[middle omitted]...\n' + text.slice(-half);
};

export const generateSummary = async (transcript, videoTitle) => {
  const client = getClient();
  const res = await client.chat.completions.create({
    model: MODEL, max_tokens: 1024,
    messages: [
      { role: 'system', content: 'You are an expert at summarizing YouTube video content clearly and concisely.' },
      { role: 'user', content: `Video Title: "${videoTitle}"\n\nTranscript:\n${truncate(transcript)}\n\nWrite a comprehensive summary covering: main topic, key concepts, important takeaways, and who benefits from watching. Format as clear paragraphs.` }
    ]
  });
  return res.choices[0].message.content;
};

export const generateDetailedNotes = async (transcript, videoTitle, type = 'detailed') => {
  const client = getClient();
  const prompts = {
    summary:   'Write a concise 3-4 paragraph summary covering the main topic, key concepts, and takeaways.',
    detailed:  'Create comprehensive structured notes with ## headings, bullet points, key definitions, and examples. Use **bold** for key terms.',
    keypoints: 'Extract the 8-10 most important key points. Use ## headers to group them. For each: **Point**, detail, and example if applicable.',
    chapters:  'Identify natural topic breaks and create ## Chapter [N]: [Title] summaries, each with key points and a 2-3 sentence summary.',
    interview: 'Generate interview Q&A notes. Format: ### Q: [question] then **A:** [detailed answer with examples]. Include ## Key Definitions section.',
    revision:  'Create a concise revision sheet with bullet points, most important facts first. Include a 5-point quick-review checklist at the end.'
  };
  const res = await client.chat.completions.create({
    model: MODEL, max_tokens: 2048,
    messages: [
      { role: 'system', content: 'You are an expert educational content creator. Write clear, well-structured notes in markdown.' },
      { role: 'user', content: `Video Title: "${videoTitle}"\n\nTranscript:\n${truncate(transcript)}\n\n${prompts[type] || prompts.detailed}` }
    ]
  });
  return res.choices[0].message.content;
};

export const chatWithVideo = async ({ question, transcript, videoTitle, conversationHistory = [] }) => {
  const client = getClient();
  const res = await client.chat.completions.create({
    model: MODEL, max_tokens: 1024,
    messages: [
      {
        role: 'system',
        content: `You are an intelligent assistant that has analyzed a YouTube video and answers questions about it.\n\nVideo Title: "${videoTitle}"\n\nTranscript:\n${truncate(transcript)}\n\nAnswer ONLY based on video content. If not covered, say so. Be clear and concise.`
      },
      ...conversationHistory.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: question }
    ]
  });
  return res.choices[0].message.content;
};

export const extractKeyPoints = async (transcript, videoTitle) => {
  const client = getClient();
  const res = await client.chat.completions.create({
    model: MODEL, max_tokens: 512,
    messages: [
      { role: 'system', content: 'Extract key points from video transcripts. Respond with ONLY a valid JSON array of strings, no markdown, no explanation.' },
      { role: 'user', content: `Extract exactly 8 key points as a JSON array.\n\nVideo: "${videoTitle}"\nTranscript: ${truncate(transcript, 6000)}\n\nFormat: ["point 1", "point 2", ..., "point 8"]` }
    ]
  });
  try {
    const text = res.choices[0].message.content.trim();
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : text.split('\n').filter(Boolean).slice(0, 8);
  } catch {
    return ['Key points could not be extracted automatically'];
  }
};
