import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth";

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user!.id,
      },
      include: {
        progress: {
          orderBy: { updatedAt: "desc" },
        },
        quizzes: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        notes: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            identifiedTopic: true,
            subject: true,
            difficulty: true,
            summary: true,
            keyConcepts: true,
            quizScore: true,
            quizTotal: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const completedTopics = user.progress.filter(
      (p) => p.completed
    ).length;

    const averageConfidence =
      user.progress.length === 0
        ? 0
        : Math.round(
            user.progress.reduce(
              (sum, p) => sum + p.confidence,
              0
            ) / user.progress.length
          );

    // Compute total notes uploaded and average quiz score across uploads
    const totalNotesUploaded = user.notes.length;
    const notesWithQuiz = user.notes.filter((n) => n.quizTotal > 0);
    const averageNoteQuizScore =
      notesWithQuiz.length === 0
        ? 0
        : Math.round(
            notesWithQuiz.reduce(
              (sum, n) => sum + Math.round((n.quizScore / n.quizTotal) * 100),
              0
            ) / notesWithQuiz.length
          );

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      xp: user.xp,
      streak: user.streak,
      completedTopics,
      averageConfidence,
      totalNotesUploaded,
      averageNoteQuizScore,
      progress: user.progress,
      quizzes: user.quizzes,
      uploadedNotes: user.notes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};