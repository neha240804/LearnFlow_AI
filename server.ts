import dotenv from "dotenv";

dotenv.config();
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import fs from "fs";
import multer from "multer";
import {
  aiGenerateRoadmap,
  aiGenerateConceptContent,
  aiGenerateDiagnosticQuiz,
  aiGenerateConceptQuiz,
  aiIdentifyTopicFromNotes,
  aiAnalyzeStudyNotes,
} from "./src/server/ai.ts";
import { extractTextFromFile } from "./src/server/services/fileExtractor.ts";
import OpenAI from "openai";
import prisma from "./src/server/config/prisma";
import authRoutes from "./src/server/routes/auth";
import profileRoutes from "./src/server/routes/profile";
import progressRoutes from "./src/server/routes/progress";
import { authenticate } from "./src/server/middleware/auth";
const PORT = 3000;

async function startServer() {
  
  const app = express();

  // Multer — file uploads for the notes feature (multi-page PDFs supported)
  if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
  const upload = multer({ dest: "uploads/", limits: { fileSize: 25 * 1024 * 1024 } });

  // Middleware to parse incoming JSON
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));
  app.use("/api/auth", authRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/progress", progressRoutes);
  
  // Request logger helper
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  app.post("/api/quiz", authenticate, async (req: any, res) => {
    try {
      const {
        topic,
        score,
        confidence,
        answers,
      } = req.body;
      const userId = req.user?.id || req.body.userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const quiz = await prisma.quizAttempt.create({
        data: {
          topic,
          score,
          confidence,
          answers: answers || [],
          userId,
        },
      });

      res.json(quiz);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to record quiz attempt" });
    }
  });

  // ── Upload Notes ──────────────────────────────────────────────────────────
  app.post("/api/upload-notes", upload.single("file"), async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
      }

      const fileBuffer = fs.readFileSync(req.file.path);
      try { fs.unlinkSync(req.file.path); } catch (_) {}

      console.log(`[/api/upload-notes] Received file: "${req.file.originalname}" (${req.file.mimetype})`);

      const extraction = await extractTextFromFile(
        fileBuffer,
        req.file.mimetype,
        req.file.originalname
      );

      console.log(`[/api/upload-notes] method=${extraction.method}, confidence=${extraction.confidence}, chars=${extraction.text.length}`);

      const analysis = await aiAnalyzeStudyNotes(extraction.text);

      // ── Persist to DB if user is authenticated ────────────────────────────
      // Try to read JWT from Authorization header (optional — works for guests too)
      let userId: string | null = null;
      const authHeader = req.headers.authorization as string | undefined;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.slice(7);
          const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
          userId = payload?.id ?? payload?.userId ?? null;
        } catch (_) {}
      }

      if (userId) {
        // 1. Save the uploaded note record
        const noteRecord = await prisma.uploadedNote.create({
          data: {
            userId,
            fileName:        req.file.originalname,
            fileType:        req.file.mimetype,
            fileSize:        req.file.size,
            extractedText:   extraction.text.slice(0, 10000), // cap stored text at 10k chars
            identifiedTopic: analysis.topic,
            subject:         analysis.subject,
            keyConcepts:     analysis.keyPoints ?? [],
            summary:         analysis.summary ?? "",
            difficulty:      analysis.difficulty ?? "Intermediate",
            quizScore:       0, // will be updated when the student submits the quiz
            quizTotal:       analysis.questions?.length ?? 0,
            quizAnswers:     [],
          },
        });

        // 2. Record a QuizAttempt placeholder (score=0 until quiz is submitted)
        await prisma.quizAttempt.create({
          data: {
            userId,
            topic:      analysis.topic,
            score:      0,
            confidence: 0,
            answers:    [],
          },
        });

        // 3. Award 20 XP for uploading and analysing a document
        await prisma.user.update({
          where: { id: userId },
          data:  { xp: { increment: 20 } },
        }).catch(console.error);

        console.log(`[/api/upload-notes] Saved note (id=${noteRecord.id}) and quiz attempt for user ${userId}`);

        return res.json({
          type:             "notes",
          noteId:           noteRecord.id,
          fileName:         req.file.originalname,
          extractionMethod: extraction.method,
          confidence:       extraction.confidence,
          ...analysis,
        });
      }

      // Guest (no token) — return analysis only, no DB save
      return res.json({
        type:             "notes",
        fileName:         req.file.originalname,
        extractionMethod: extraction.method,
        confidence:       extraction.confidence,
        ...analysis,
      });

    } catch (error) {
      console.error("[/api/upload-notes]", error);
      return res.status(500).json({ error: "Failed to analyse uploaded note. Please try again." });
    }
  });

  // ── Save quiz result after student submits the upload quiz ────────────────
  app.post("/api/upload-notes/:noteId/quiz-result", async (req: any, res: any) => {
    try {
      const { noteId } = req.params;
      const { score, total, answers } = req.body as { score: number; total: number; answers: any[] };

      // Verify JWT
      const authHeader = req.headers.authorization as string | undefined;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      let userId: string;
      try {
        const token = authHeader.slice(7);
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        userId = payload?.id ?? payload?.userId;
      } catch {
        return res.status(401).json({ error: "Invalid token" });
      }

      // Update the UploadedNote with real quiz results
      const note = await prisma.uploadedNote.update({
        where: { id: noteId },
        data: {
          quizScore:   score,
          quizTotal:   total,
          quizAnswers: answers ?? [],
        },
      });

      // Award XP based on performance: 10 per correct + 20 bonus for ≥70%
      const xpEarned = score * 10 + (score / total >= 0.7 ? 20 : 0);
      await prisma.user.update({
        where: { id: userId },
        data:  { xp: { increment: xpEarned } },
      }).catch(console.error);

      // Update the most recent QuizAttempt for this topic with the real score
      const attempt = await prisma.quizAttempt.findFirst({
        where: { userId, topic: note.identifiedTopic ?? "" },
        orderBy: { createdAt: "desc" },
      });
      if (attempt) {
        await prisma.quizAttempt.update({
          where: { id: attempt.id },
          data:  { score, confidence: Math.round((score / total) * 100), answers: answers ?? [] },
        });
      }

      return res.json({ success: true, xpEarned });
    } catch (error) {
      console.error("[/api/upload-notes/:noteId/quiz-result]", error);
      return res.status(500).json({ error: "Failed to save quiz result." });
    }
  });

  app.post("/api/analyze", async (req: any, res: any) => {
    try {
      const { topic, notes } = req.body || {};
      let identifiedTopic = topic;

      if ((!identifiedTopic || !identifiedTopic.trim()) && notes) {
        const identified = await aiIdentifyTopicFromNotes(notes);
        identifiedTopic = identified.topic;
      }

      if (!identifiedTopic || !identifiedTopic.trim()) {
        return res.status(400).json({
          error: "Please enter a topic to analyze.",
        });
      }

      const roadmapResult = await aiGenerateRoadmap(identifiedTopic, notes);
      const quizResult = await aiGenerateDiagnosticQuiz(
        identifiedTopic,
        roadmapResult.concepts
      );

      return res.json({
        type: "roadmap",
        success: true,
        topic: identifiedTopic,
        roadmap: roadmapResult.concepts,
        difficulty: roadmapResult.difficulty,
        estimatedTime: roadmapResult.estimatedTime,
        questions: quizResult.questions,
      });

    } catch (error) {
      console.error("[/api/analyze]", error);
      return res.status(500).json({ error: "Failed to analyze. Please try again." });
    }
  });

  // ==========================================
  // LESSON MODULE APIS
  // ==========================================

  /**
   * GET /api/concepts/:conceptId/content
   * Query params: topic, conceptTitle
   * Returns full lesson content for a concept.
   */
  app.get("/api/concepts/:conceptId/content", async (req, res) => {
    try {
      const { topic = "", conceptTitle = "" } = req.query as Record<string, string>;
      if (!topic || !conceptTitle) {
        return res.status(400).json({ error: "topic and conceptTitle query params are required" });
      }
      const content = await aiGenerateConceptContent(topic, conceptTitle, "");
      return res.json(content);
    } catch (error) {
      console.error("[/api/concepts/:id/content]", error);
      return res.status(500).json({ error: "Failed to generate lesson content" });
    }
  });
  /**
 * GET /api/concepts/:conceptId/quiz
 * Query params:
 * topic
 * conceptTitle
 *
 * Returns AI-generated quiz for one concept.
 */
app.get("/api/concepts/:conceptId/quiz", async (req, res) => {
  try {

    const {
      topic = "",
      conceptTitle = "",
    } = req.query as Record<string, string>;

    if (!topic || !conceptTitle) {
      return res.status(400).json({
        error: "topic and conceptTitle are required",
      });
    }

    const quiz = await aiGenerateConceptQuiz(
      topic,
      conceptTitle,
      ""
    );

    return res.json(quiz);

  } catch (error) {

    console.error("[/api/concepts/:id/quiz]", error);

    return res.status(500).json({
      error: "Failed to generate quiz.",
    });

  }
});

  
  /**
   * POST /api/ask-ai
   * Body: { topic, concept, question }
   * Returns: { answer }
   * Used by both TutorChat (Welcome stage) and AskAI (Recall stage).
   */
  app.post("/api/ask-ai", async (req, res) => {
    try {
      const { topic = "", concept = "", question = "" } = req.body as Record<string, string>;
      if (!question) {
        return res.status(400).json({ error: "question is required" });
      }

      const groqClient = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
      });

      // Lighter, faster model for simple tutoring questions to prevent 429 Rate Limits on 70B model
      const model = "llama-3.1-8b-instant";

      const executeCall = async () => {
        return await groqClient.chat.completions.create({
          model: model,
          messages: [
            {
              role: "system",
              content: `You are a friendly, encouraging STEM tutor for LearnFlow AI. The student is studying "${concept}" as part of "${topic}". Answer clearly and concisely in 2-4 sentences. Use plain language. Be warm and motivating.`,
            },
            { role: "user", content: question },
          ],
          temperature: 0.7,
          max_tokens: 400,
        });
      };

      // Retry helper with exponential backoff
      const retryWithBackoff = async <T>(fn: () => Promise<T>, retries = 4, delay = 1000): Promise<T> => {
        try {
          return await fn();
        } catch (error: any) {
          const isRateLimit =
            error.status === 429 ||
            error.statusCode === 429 ||
            (error.message && (error.message.includes("Rate limit") || error.message.includes("429"))) ||
            error.code === "rate_limit_exceeded";

          if (isRateLimit && retries > 0) {
            console.warn(`[Groq Rate Limit] Hit 429. Retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return retryWithBackoff(fn, retries - 1, delay * 1.5 + Math.random() * 500);
          }
          throw error;
        }
      };

      const response = await retryWithBackoff(executeCall);
      const answer = response.choices[0]?.message?.content?.trim() ?? "I'm unable to answer right now. Please try again.";
      return res.json({ answer });
    } catch (error) {
      console.error("[/api/ask-ai]", error);
      return res.status(500).json({ error: "Failed to get AI response" });
    }
  });



  // ==========================================
  // VITE DEVELOPMENT MIDDLEWARE & STATIC ASSETS
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LearnFlow AI Server] running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server", err);
});