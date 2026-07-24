import { Request, Response } from "express";
import prisma from "../config/prisma";

export const saveProgress = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const {
      subject,
      topic,
      confidence,
      mastery,
      weakConcepts,
      strongConcepts,
      completed,
      attempts,
      timeSpent,
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
        attempts,
        completed,
      },
      create: {
        userId,
        subject,
        topic,
        confidence,
        mastery,
        weakConcepts,
        strongConcepts,
        attempts,
        completed,
        timeSpent,
      },
    });

    res.json(progress);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error saving progress" });
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