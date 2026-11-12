'use client';

import type { SignInLesson } from '@/lib/types';
import { SignCardFrame } from './SignCard';

export function LessonSignCard({ sign }: { sign: SignInLesson }) {
  return <SignCardFrame sign={sign} />;
}
