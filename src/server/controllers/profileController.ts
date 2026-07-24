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
        progress: true,
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

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      xp: user.xp,
      streak: user.streak,
      completedTopics,
      averageConfidence,
      progress: user.progress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};