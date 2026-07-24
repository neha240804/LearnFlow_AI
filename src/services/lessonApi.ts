import { LessonTopic } from "../types/lesson";

export async function getLesson(
  topic: string,
  concept: string,
  conceptId: number
): Promise<LessonTopic> {

  const response = await fetch(
    `/api/concepts/${conceptId}/content?topic=${encodeURIComponent(
      topic
    )}&conceptTitle=${encodeURIComponent(concept)}`
  );

  if (!response.ok) {
    throw new Error("Failed to generate lesson.");
  }

  return await response.json();
}