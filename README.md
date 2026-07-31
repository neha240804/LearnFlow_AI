# 🚀 LearnFlow AI

> **Adaptive STEM Learning Platform Powered by AI**

LearnFlow AI generates custom learning roadmaps, analyzes uploaded study notes/PDFs with OCR, and builds dynamic diagnostic quizzes tailored to each student's pace and mastery level.

---

## ✨ Features

- 🎯 **Diagnostic Knowledge Assessment**: Pinpoint weak & strong concepts before building a custom curriculum.
- 📚 **AI Note & PDF Parser**: Upload study notes or multi-page PDFs to get instant structured explanations and auto-generated quizzes.
- 🗺️ **Personalized Concept Roadmaps**: Step-by-step micro-modules designed for optimal understanding.
- 🤖 **Interactive AI Tutor Chat**: Instant concept assistance available at every step of your lesson.
- 🔥 **Gamified Progress Tracking**: Earn XP points, maintain daily streaks, track mastery levels, and monitor confidence stats on a personal dashboard.
- 🔐 **Secure Authentication**: JWT-based user authentication and progress persistence with PostgreSQL.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL (Neon DB)
- **AI & Processing**: Groq SDK (Llama 3 models), Google GenAI, Tesseract.js (OCR), PDF-Parse

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL Database (or Neon PostgreSQL connection string)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

Set the following in `.env`:
- `GROQ_API_KEY`: Your Groq API Key
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Random 64-character secret key

### 3. Setup Database Schema
```bash
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License
MIT License. Created for Hackathon presentation.

