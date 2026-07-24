import {
  ADAPTIVE_HIGH_THRESHOLD,
  ADAPTIVE_LOW_THRESHOLD,
  XP_BONUS_EXCELLENCE,
  XP_PER_CORRECT_QUIZ,
  XP_PER_STAGE_COMPLETE,
} from '../constants/lessonStages';
import type { RoadmapConcept } from '../types/lesson';

// ─── Concept ID ────────────────────────────────────────────────────────────

/**
 * Converts a human-readable concept title into a URL-safe slug.
 * Example: "Newton's First Law" → "newtons-first-law"
 */
export function slugifyConcept(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ─── Progress ──────────────────────────────────────────────────────────────

/**
 * Returns the percentage progress through the lesson stages (0–100).
 */
export function calculateProgress(currentStage: number, totalStages: number): number {
  if (totalStages === 0) return 0;
  return Math.min(100, Math.round((currentStage / totalStages) * 100));
}

/**
 * Returns the overall completion percentage (0–100).
 * Alias of calculateProgress kept for semantic clarity at call sites.
 */
export function calculateCompletion(stagesCompleted: number, totalStages: number): number {
  return calculateProgress(stagesCompleted, totalStages);
}

// ─── XP ────────────────────────────────────────────────────────────────────

/**
 * Calculates the total XP earned for a concept session.
 *
 * @param stagesCompleted  How many stages the student has advanced through
 * @param quizCorrect      Whether the student answered the quiz correctly
 * @param quizScore        Normalised quiz score (0–1)
 */
export function calculateXP(
  stagesCompleted: number,
  quizCorrect: boolean,
  quizScore: number,
): number {
  let xp = stagesCompleted * XP_PER_STAGE_COMPLETE;
  if (quizCorrect) xp += XP_PER_CORRECT_QUIZ;
  if (quizScore >= ADAPTIVE_HIGH_THRESHOLD) xp += XP_BONUS_EXCELLENCE;
  return xp;
}

// ─── Mastery ───────────────────────────────────────────────────────────────

/**
 * Blends the pre-existing mastery score with the current session's
 * stage completion and quiz performance to produce an updated mastery value.
 *
 * Returns an integer in the range [0, 100].
 */
export function calculateMastery(
  previousMastery: number,
  quizScore: number,
  stagesCompleted: number,
  totalStages: number,
): number {
  const stageContribution = (stagesCompleted / totalStages) * 100 * 0.3;
  const quizContribution = quizScore * 100 * 0.7;
  const sessionScore = stageContribution + quizContribution;
  const blended = Math.round(previousMastery * 0.3 + sessionScore * 0.7);
  return Math.min(100, Math.max(0, blended));
}

// ─── Formatting ────────────────────────────────────────────────────────────

/**
 * Normalises an estimated-time string for display.
 * Passes through values that already contain "min" or "hour".
 */
export function formatEstimatedTime(time?: string): string {
  if (!time) return 'Est. 20 min';
  if (time.includes('min') || time.includes('hour')) return time;
  return `${time} min`;
}

/**
 * Estimates reading time for a block of text and returns a human-friendly
 * label such as "3 min read" or "< 1 min read".
 */
export function estimateReadingTime(text: string): string {
  const WORDS_PER_MINUTE = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / WORDS_PER_MINUTE);
  return minutes <= 1 ? '< 1 min read' : `${minutes} min read`;
}

// ─── Adaptive Learning ─────────────────────────────────────────────────────

/** Returns true when the quiz score indicates the student needs extra support. */
export function isAdaptiveLowScore(score: number): boolean {
  return score < ADAPTIVE_LOW_THRESHOLD;
}

/** Returns true when the quiz score qualifies for excellence rewards. */
export function isAdaptiveHighScore(score: number): boolean {
  return score >= ADAPTIVE_HIGH_THRESHOLD;
}

// ─── Concept Navigation ────────────────────────────────────────────────────

/** Returns the zero-based index of a concept in the roadmap, or -1. */
export function getConceptIndex(
  roadmap: RoadmapConcept[],
  conceptTitle: string,
): number {
  return roadmap.findIndex((c) => c.title === conceptTitle);
}

/**
 * Returns the concept that follows `currentTitle` in the roadmap,
 * or null if the current concept is the last one.
 */
export function getNextConcept(
  roadmap: RoadmapConcept[],
  currentTitle: string,
): RoadmapConcept | null {
  const idx = getConceptIndex(roadmap, currentTitle);
  return idx >= 0 && idx < roadmap.length - 1 ? roadmap[idx + 1] : null;
}

/**
 * Returns the concept that precedes `currentTitle` in the roadmap,
 * or null if the current concept is the first one.
 */
export function getPrevConcept(
  roadmap: RoadmapConcept[],
  currentTitle: string,
): RoadmapConcept | null {
  const idx = getConceptIndex(roadmap, currentTitle);
  return idx > 0 ? roadmap[idx - 1] : null;
}

// ─── ID Generation ─────────────────────────────────────────────────────────

/** Generates a unique message ID for the chat history. */
export function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
