import { ConceptQuiz } from "../types/quiz";

export async function getConceptQuiz(
  topic: string,
  concept: string,
  conceptId: number
): Promise<ConceptQuiz> {

  const response = await fetch(

    `/api/concepts/${conceptId}/quiz?topic=${encodeURIComponent(topic)}&conceptTitle=${encodeURIComponent(concept)}`

  );

  if (!response.ok) {

    throw new Error("Failed to load quiz.");

  }

  return response.json();

}