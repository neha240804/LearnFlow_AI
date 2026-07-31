export interface VideoResource {
  title: string;
  channel: string;
  url: string;
}

export interface LessonTopic {
  simpleExplanation: string;
  detailedExplanation: string;
  analogy: string;
  example: string;
  formulas: string[];
  commonMistakes: string[];
  summary: string;
  videos?: VideoResource[];
}

export interface RoadmapConcept {
  title: string;
  description: string;
}