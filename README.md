<div align="center">

# 🧠 LearnFlow AI

### *Adaptive, Hyper-Personalized STEM Learning Powered by AI*

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-learnflow--ai--vbmo.onrender.com-46E3B7?style=for-the-badge&logo=render)](https://learnflow-ai-vbmo.onrender.com/)
[![React](https://img.shields.io/badge/Frontend-React_19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_(Neon)-4169E1?style=for-the-badge&logo=postgresql)](https://neon.tech/)

[🌐 Live Website](https://learnflow-ai-vbmo.onrender.com/) • [Key Features](#-key-features) • [System Architecture](#-system-architecture) • [Getting Started](#-getting-started-locally) • [API Documentation](#-api-endpoints)

---

</div>


## 💡 The Problem & Solution

### ❌ The Challenge
Traditional online learning follows a rigid, "one-size-fits-all" path. Students struggling with prerequisite concepts (e.g., calculus foundations before quantum physics) get left behind, while advanced learners waste time re-learning material they've already mastered. Furthermore, static study notes and PDFs lack interactive feedback.

### ✨ The LearnFlow Solution
**LearnFlow AI** acts as a 24/7 personal STEM mentor. It dynamically diagnoses student knowledge gaps, extracts key insights from raw study notes/PDFs via OCR, generates targeted micro-lessons, and builds adaptive practice quizzes—rewarding student progress with gamified XP and streak counters.

---

## 🔥 Key Features

| Feature | Description |
| :--- | :--- |
| 🎯 **Diagnostic Assessment** | Evaluates current knowledge to detect weak foundation concepts before tailoring a roadmap. |
| 📚 **OCR & PDF Note Parser** | Upload handwritten/photo notes or multi-page PDFs to extract text, key points, and auto-generate tests. |
| 🗺️ **Adaptive Roadmaps** | Generates sequenced, step-by-step learning modules based on target difficulty and mastery. |
| 📊 **Learning Dashboard** | Complete analytics on total XP, daily streaks, average confidence scores, and topic mastery. |
| 👤 **User Profile & History** | Persists uploaded notes, summary cards, and quiz attempts with full historical tracking. |
| 🔐 **JWT Auth & Data Persistence** | Secure authentication with encrypted passwords and relational database storage via Prisma. |

---

## 🏗️ System Architecture

```
                       ┌─────────────────────────┐
                       │   React 19 Frontend     │
                       │ (Vite + Tailwind CSS)   │
                       └────────────┬────────────┘
                                    │  HTTP / REST
                                    ▼
                       ┌─────────────────────────┐
                       │    Express API Server   │
                       └─────┬─────────────┬─────┘
                             │             │
              ┌──────────────┴─┐         ┌─┴──────────────┐
              ▼                ▼         ▼                ▼
       ┌─────────────┐  ┌───────────┐ ┌─────────────┐  ┌───────────────┐
       │ PostgreSQL  │  │ Groq AI   │ │ Google GenAI│  │ Tesseract.js  │
       │ (Neon DB)   │  │ (Llama 3) │ │ (Gemini)    │  │  (OCR Engine) │
       └─────────────┘  └───────────┘ └─────────────┘  └───────────────┘
```

---

## 🛠️ Tech Stack Matrix

- **Frontend**: React 19, TypeScript, React Router v7, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend API**: Node.js, Express.js, JWT, Bcrypt, Multer
- **Database & ORM**: PostgreSQL (hosted on Neon DB), Prisma ORM v6
- **AI & ML Integration**:
  - **Groq SDK** (`llama-3.1-8b-instant`, `llama-3.3-70b-versatile`) — Fast LLM inference for custom roadmap generation.
  - **Google GenAI** (`@google/genai`) — Analytical evaluation.
  - **OCR & Document Extraction**: `tesseract.js` for image parsing + `pdf-parse` for multi-page documents.

---

## 📡 API Endpoints

### 🔑 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new student account
- `POST /api/auth/login` — Authenticate and receive a JWT Bearer token

### 👤 Profile & Progress (`/api/profile` & `/api/progress`)
- `GET /api/profile` — Fetch student stats (XP, streak, completed topics, notes history)
- `GET /api/progress` — Get progress records across all topics
- `POST /api/progress` — Save or update mastery levels & concept performance
- `PATCH /api/progress/:topic` — Modify specific topic progress details

### 🧠 AI & Note Analytics
- `POST /api/analyze` — Generate custom concept roadmaps & diagnostic tests
- `POST /api/upload-notes` — Upload PDF/Image study notes for OCR parsing & AI summary
- `POST /api/upload-notes/:noteId/quiz-result` — Save quiz score & award XP for note quizzes
- `GET /api/concepts/:id/content` — Fetch full micro-lesson content for a concept
- `GET /api/concepts/:id/quiz` — Fetch concept-specific practice quiz


---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL Database** (local instance or free [Neon DB](https://neon.tech) account)

### 1. Clone Repository
```bash
git clone https://github.com/neha240804/LearnFlow_AI.git
cd LearnFlow_AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
GROQ_API_KEY="your_groq_api_key_here"
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
JWT_SECRET="your_custom_64_character_secret_key"
PORT=3000
```

### 4. Push Database Schema
```bash
npx prisma db push
```

### 5. Launch Application
```bash
# Start backend server + Vite frontend
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🌐 Deployment & Live Link

The application is deployed live on **Render**:

- **🚀 Live Application**: **[https://learnflow-ai-vbmo.onrender.com/](https://learnflow-ai-vbmo.onrender.com/)**
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm start`


---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built for Hackathon presentation by team LearnFlow AI. 🚀</sub>
</div>

