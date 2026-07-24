import dotenv from "dotenv";

dotenv.config();
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import fs from "fs";
import {
  aiGenerateRoadmap,
  aiGenerateConceptContent,
  aiGenerateDiagnosticQuiz,
  aiGenerateConceptQuiz,
} from "./src/server/ai.ts";
import OpenAI from "openai";
import prisma from "./src/server/config/prisma";
import authRoutes from "./src/server/routes/auth";
import profileRoutes from "./src/server/routes/profile";
import progressRoutes from "./src/server/routes/progress";
import { authenticate } from "./src/server/middleware/auth";
const PORT = 3000;

async function startServer() {
  
  const app = express();
  const upload = multer({
    dest: "uploads/",
  });

  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
  }

  // Middleware to parse incoming JSON with high limits for documents/notes
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
  app.post("/api/analyze", async (req, res) => {
    try {
      const { topic, notes } = req.body;

      if (!topic) {
        return res.status(400).json({
          error: "Topic is required.",
        });
      }

      // Generate roadmap
      const roadmapResult = await aiGenerateRoadmap(
        topic,
        notes
      );

      // Generate diagnostic quiz
      const quizResult = await aiGenerateDiagnosticQuiz(
        topic,
        roadmapResult.concepts
      );

      return res.json({
        success: true,
        topic,
        roadmap: roadmapResult.concepts,
        difficulty: roadmapResult.difficulty,
        estimatedTime: roadmapResult.estimatedTime,
        questions: quizResult.questions,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        error: "Failed to analyze topic."
      });

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