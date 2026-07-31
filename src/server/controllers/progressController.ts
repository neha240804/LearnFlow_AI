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

    // Check if this topic already has a progress record (i.e., it's a revisit)
    const existing = await prisma.progress.findUnique({
      where: { userId_topic: { userId, topic } },
    });

    const isRevisit = !!existing;
    const prevMastery = existing?.mastery ?? 0;
    const masteryImprovement = Math.max(0, mastery - prevMastery);

    const progress = await prisma.progress.upsert({
      where: {
        userId_topic: { userId, topic },
      },
      update: {
        confidence,
        mastery,
        // Only overwrite weak/strong concepts if non-empty (i.e., sent by quiz)
        ...(weakConcepts.length > 0 ? { weakConcepts } : {}),
        ...(strongConcepts.length > 0 ? { strongConcepts } : {}),
        attempts: { increment: 1 },
        // Mark completed if mastery >= 80%
        completed: mastery >= 80 ? true : completed,
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
        completed: mastery >= 80 ? true : completed,
        timeSpent: timeSpent || 0,
      },
    });

    // XP logic:
    // - First attempt: full XP (base + mastery + completion bonus)
    // - Revisit: only award XP for measurable improvement in mastery
    let earnedXP = 0;
    if (!isRevisit) {
      earnedXP = 50 + (mastery ?? 0) + (completed || mastery >= 80 ? 30 : 0);
    } else if (masteryImprovement > 0) {
      // Award XP proportional to improvement (max 60 XP per revisit)
      earnedXP = Math.min(60, Math.round(masteryImprovement * 0.6));
      if (mastery >= 80 && !existing?.completed) {
        earnedXP += 30; // Completion bonus for first time reaching mastery
      }
    }

    if (earnedXP > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: earnedXP } },
      }).catch(console.error);
    }

    res.json({ success: true, progress, earnedXP, isRevisit });
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