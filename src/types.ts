export type QuestionType = 'multiple-choice' | 'descriptive' | 'short-answer' | 'fill-blank';

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[]; // For 'multiple-choice'
  correctAnswer?: string; // Optional reference or auto-grading key
  maxScore: number;
}

export interface Exam {
  id: string; // The access code (e.g. "EX-9832")
  title: string;
  teacherId: string;
  teacherName: string;
  schoolName?: string;
  durationMinutes?: number; // Optional limit
  active: boolean;
  createdAt: string;
  questions: ExamQuestion[];
}

export interface Teacher {
  id: string;
  username: string;
  fullName: string;
}

export interface StudentSubmission {
  id: string;
  examId: string;
  examTitle: string;
  studentName: string;
  studentCode: string; // extra metadata
  answers: Record<string, string>; // questionId -> answer
  submittedAt: string;
  score: number; // calculated score
  maxPossibleScore: number;
  isDescriptiveGraded: Record<string, boolean>; // questionId -> graded state
  descriptiveScores: Record<string, number>; // questionId -> teacher score
}
