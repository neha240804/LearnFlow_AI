import { Request, Response } from "express";
import prisma from "../config/prisma";

export const saveProgress = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const {
      subject = "General STEM",
      topic,
      confidence = 0,
      mastery = 0,
      weakConcepts = [],
      strongConcepts = [],
      completed = false,
      attempts = 1,
      timeSpent = 0,
    } = req.body;

    const progress = await prisma.progress.upsert({
      where: {
        userId_topic: {
          userId,
          topic,
        },
      },
      update: {
        confidence,
        mastery,
        weakConcepts,
        strongConcepts,
        attempts: { increment: 1 },
        completed,
        timeSpent: { increment: timeSpent },
      },
      create: {
        userId,
        subject: subject || "General STEM",
        topic,
        confidence,
        mastery,
        weakConcepts,
        strongConcepts,
        attempts: attempts || 1,
        completed,
        timeSpent: timeSpent || 0,
      },
    });

    // Award XP to user in PostgreSQL
    const earnedXP = 50 + (mastery ?? 0) + (completed ? 30 : 0);
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: earnedXP },
      },
    }).catch(console.error);

    res.json({ success: true, progress });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Error saving progress" });
  }
};

export const getProgress = async (req: any, res: Response) => {
  const userId = req.user.id;

  const progress = await prisma.progress.findMany({
    where: {
      userId,
    },
  });

  res.json(progress);
};

export const updateProgress = async (req: any, res: Response) => {
  const userId = req.user.id;

  const { topic } = req.params;

  const progress = await prisma.progress.update({
    where: {
      userId_topic: {
        userId,
        topic,
      },
    },
    data: req.body,
  });

  res.json(progress);
};