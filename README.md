# VidChat AI

VidChat AI is a full-stack web application that lets users paste any YouTube video URL and turn it into an interactive learning experience. The app extracts video metadata and transcripts, generates AI-powered summaries and notes, and enables users to chat with the video content as if it were a knowledgeable tutor.

Built with React on the frontend, Express and MongoDB on the backend, and Groq-powered LLM responses, VidChat AI is designed for students, developers, researchers, and anyone who wants to learn faster from video content.

## ✨ Features

- Paste a YouTube URL and analyze a video instantly
- Extract transcript-based content and store video history
- Generate AI summaries and key points
- Create multiple note formats such as:
  - Summary
  - Detailed notes
  - Key points
  - Chapter-wise breakdowns
  - Interview prep notes
  - Revision notes
- Chat with the analyzed video using conversational AI
- Mark videos as favorites and manage saved history
- Export generated notes as text files
- Authentication with JWT-based signup/signin
- Responsive modern dashboard UI

## 🧠 How it Works

1. User pastes a YouTube link.
2. The backend extracts the video ID, metadata, and transcript.
3. AI generates a summary, key points, and structured notes.
4. Users can ask questions about the video and receive answers based on the transcript content.
5. Everything is stored per user for later access.

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- React Router
- Lucide icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Groq SDK for AI responses
- YouTube transcript extraction

## 📁 Project Structure

text
YouTube-Video-AI-Chatbot/
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md


## ✅ Prerequisites

Before running the project locally, make sure you have:

- Node.js 18+
- npm or pnpm
- MongoDB running locally or a MongoDB Atlas connection string
- A Groq API key

## 🔐 Environment Variables

Create a .env file inside the backend folder with the following variables:

env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/vidchat-ai
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=http://localhost:5173

# Optional
YOUTUBE_API_KEY=your_youtube_data_api_key


### Frontend environment

Create a .env file inside the frontend folder if you want to override the API base URL:

env
VITE_API_URL=http://localhost:5000/api


## ▶️ Installation & Setup

### 1. Clone the repository

bash
git clone <your-repo-url>
cd YouTube-Video-AI-Chatbot


### 2. Install backend dependencies

bash
cd backend
npm install


### 3. Install frontend dependencies

bash
cd ../frontend
npm install


## 🚀 Running the Project

### Start the backend

bash
cd backend
npm run dev


The backend will run at:

text
http://localhost:5000


### Start the frontend

bash
cd frontend
npm run dev


The frontend will run at:

text
http://localhost:5173


## 📖 Usage

1. Open the app in your browser.
2. Create an account or sign in.
3. Paste a YouTube URL on the dashboard.
4. Analyze the video.
5. Explore the generated summary, key points, and notes.
6. Ask questions about the video in the chat panel.
7. Save favorite videos and keep a personal learning history.

## 🔧 API Overview

The backend exposes REST APIs for:

- Authentication: /api/auth/signup, /api/auth/signin
- Video analysis: /api/videos/analyze
- Video history: /api/videos
- Chat with video: /api/chat/:videoId/message
- Notes generation: /api/notes/generate
- User stats and preferences: /api/user/*

## ⚠️ Notes

- Transcript extraction depends on the availability of captions for the target video.
- Some videos may not have transcripts available, which can limit AI analysis.
- A valid Groq API key is required for AI-generated summaries and chat responses.

## 🤝 Contributing

Contributions are welcome. If you would like to improve the project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is currently unlicensed. If you want, you can add an MIT or Apache license before publishing it publicly.

## 🙏 Acknowledgements

- Groq for fast AI inference
- YouTube transcript tooling for transcript extraction
- React and Express communities for excellent developer tooling