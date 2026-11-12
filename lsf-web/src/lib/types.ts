// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'User' | 'Admin';
  createdAt: string;
}


export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

// ─── Categories ──────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  iconUrl: string | null;
  sortOrder: number;
  signCount: number;
}

// ─── Modules ─────────────────────────────────────────────────────────────────

export interface Module {
  id: number;
  title: string;
  description: string | null;
  level: number;
  sortOrder: number;
  lessonCount: number;
  hasPhraseLessons: boolean;
}

export interface LessonSummary {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  xpReward: number;
  signCount: number;
  lessonType: 'signs' | 'phrases';
  phraseCount: number;
}

export interface ModuleDetail extends Module {
  lessons: LessonSummary[];
}

// ─── Lessons ─────────────────────────────────────────────────────────────────

export interface SignInLesson {
  id: string;
  word: string;
  slug: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  gifUrl: string | null;
  difficulty: number;
}

export interface LessonDetail {
  id: string;
  moduleId: number;
  title: string;
  description: string | null;
  sortOrder: number;
  xpReward: number;
  lessonType: 'signs' | 'phrases';
  signs: SignInLesson[];
}

// ─── Signs ───────────────────────────────────────────────────────────────────

export interface SignSummary {
  id: string;
  word: string;
  slug: string;
  thumbnailUrl: string | null;
  difficulty: number;
  categoryName: string;
}

export interface SignDetail {
  id: string;
  word: string;
  slug: string;
  definition: string | null;
  videoUrl: string | null;
  gifUrl: string | null;
  thumbnailUrl: string | null;
  difficulty: number;
  tags: string[];
  categoryId: number;
  categoryName: string;
  meanings: SignMeaning[];
}

export interface SignVideo {
  videoUrl: string;
  thumbnailUrl: string | null;
  author: string | null;
}

// Sens du mot (source Elix) : le principal porte les variantes du signe, les autres sont des homonymes
export interface SignMeaning {
  isPrimary: boolean;
  definition: string | null;
  definitionVideoUrl: string | null;
  definitionThumbnailUrl: string | null;
  videos: SignVideo[];
}

// ─── Elix ────────────────────────────────────────────────────────────────────

export interface ElixSignVideo {
  uri: string;
  image: string | null;
  author: string | null;
}

export interface ElixWordResult {
  word: string;
  definition: string | null;
  videos: ElixSignVideo[];
}

// ─── Phrases ─────────────────────────────────────────────────────────────────

export interface SignInPhrase {
  id: string;
  word: string;
  slug: string;
  videoUrl: string | null;
  gifUrl: string | null;
  thumbnailUrl: string | null;
}

export interface Phrase {
  id: string;
  textFr: string;   // "Tu veux du café ?"
  textLsf: string;  // "CAFÉ TU VOULOIR" (gloss)
  videoUrl: string | null;
  signs: SignInPhrase[]; // dans l'ordre LSF correct
}

export interface PhraseLesson {
  id: string;
  title: string;
  xpReward: number;
  phrases: Phrase[];
}

// ─── Revision & SRS ──────────────────────────────────────────────────────────

export interface SignStat {
  correctCount: number;
  wrongCount: number;
  lastAttemptAt: string | null;
  srsInterval: number;
  nextReviewAt: string | null; // DateOnly as "YYYY-MM-DD"
}

export interface GlobalStats {
  totalSignsPracticed: number;
  totalCorrect: number;
  totalWrong: number;
  successRate: number;
  bestSignWord: string | null;
  bestSignSlug: string | null;
  hardestSignWord: string | null;
  hardestSignSlug: string | null;
  lastPracticeAt: string | null;
  dueForReviewCount: number;
}

export interface RevisionSign {
  id: string;
  word: string;
  slug: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  gifUrl: string | null;
  wrongCount: number;
  correctCount: number;
  nextReviewAt: string | null;
  srsInterval: number;
}

// ─── Daily Quests ─────────────────────────────────────────────────────────────

export interface DailyQuest {
  questType: string;
  label: string;
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  xpReward: number;
}

// ─── Session History ──────────────────────────────────────────────────────────

export interface GameSession {
  gameType: string;
  lessonTitle: string;
  score: number;
  correctCount: number | null;
  wrongCount: number | null;
  durationSeconds: number | null;
  playedAt: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
