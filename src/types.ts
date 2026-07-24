export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  currentStreak: number;
  xp: number;
  badges: string[];
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  subject: string;
  isCustom?: boolean;
  conceptsCount: number;
  overallMastery: number;
  progressPercent: number;
  weakConceptsCount: number;
  completedCount: number;
  concepts?: Concept[];
}

export interface Concept {
  id: string;
  topicId: string;
  title: string;
  description: string;
  orderIndex: number;
}

export interface Lesson {
  id: string;
  conceptId: string;
  simpleExplanation: string;
  detailedExplanation: string;
  analogy: string;
  example: string;
  diagramDescription: string;
  formulas: string[];
  commonMistakes: string[];
  summary: string;
}

export interface Flashcard {
  id: string;
  conceptId: string;
  front: string;
  back: string;
}

export interface Question {
  id: string;
  conceptId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ConceptProgress {
  userId: string;
  conceptId: string;
  accuracy: number;
  attempts: number;
  confidence: 'low' | 'medium' | 'high';
  responseTimeSec: number;
  masteryScore: number;
  status: 'Learning' | 'Weak' | 'Mastered';
  updatedAt: string;
}

export interface Recommendation {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'weak_concept' | 'next_unlock' | 'streak' | 'general';
  conceptId?: string;
  topicId?: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  xp: number;
  streak: number;
}

export interface DashboardStats {
  streak: number;
  xp: number;
  badges: string[];
  averageMastery: number;
  timeSpent: number;
  totalConceptsLearned: number;
  masteredCount: number;
  weakCount: number;
  recommendations: Recommendation[];
  weakConcepts: {
    conceptId: string;
    title: string;
    topicTitle: string;
    masteryScore: number;
  }[];
  masteredConcepts: {
    conceptId: string;
    title: string;
    topicTitle: string;
    masteryScore: number;
  }[];
  leaderboard: LeaderboardUser[];
}

export interface StudentAnalytics {
  id: string;
  name: string;
  email: string;
  streak: number;
  xp: number;
  masteredCount: number;
  averageMastery: number;
  timeSpent: number;
}

export interface TeacherDashboardStats {
  totalStudents: number;
  activeRoadmaps: number;
  classAverageMastery: number;
  weakConcepts: {
    conceptTitle: string;
    topicTitle: string;
    weakCount: number;
  }[];
  students: StudentAnalytics[];
  uploadedPDFs: {
    id: string;
    title: string;
    text: string;
    uploadedBy: string;
    timestamp: string;
  }[];
}
