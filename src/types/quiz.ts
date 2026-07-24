export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ConceptQuiz {
  questions: QuizQuestion[];
}