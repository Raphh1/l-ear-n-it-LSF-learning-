// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'User' | 'Admin';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
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

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
