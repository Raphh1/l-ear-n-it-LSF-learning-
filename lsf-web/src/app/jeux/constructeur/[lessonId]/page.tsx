'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RefreshCw, Check, X, ArrowRight } from 'lucide-react';
import { phrasesApi } from '@/lib/api/phrases';
import { scoresApi } from '@/lib/api/scores';
import { progressApi, type CompleteLessonResponse } from '@/lib/api/progress';
import { GameEnd, GameHeader, GameProgress } from '@/components/brand/Game';
import { Loader } from '@/components/brand/Loader';
import { checkOrder, RULE_HINTS, type OrderCheck, type OrderRule } from '@/lib/lsfOrder';
import type { PhraseLesson, Phrase, SignInPhrase } from '@/lib/types';

// Mélange un tableau
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

type Phase = 'playing' | 'result';
// exact = ordre de la leçon ; valid = autre ordre possible en LSF ; wrong = règle non respectée
type AnswerState = 'idle' | OrderCheck['status'];

const TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];

// Tuile d'un signe : vignette + mot, comme une pièce à poser
function SignTile({ sign, i, size = 'md' }: { sign: SignInPhrase; i: number; size?: 'sm' | 'md' }) {
  const box = size === 'md' ? 'h-16 w-16' : 'h-14 w-14';
  const src = sign.thumbnailUrl ?? sign.gifUrl;
  return (
    <span className={`flex flex-col items-center gap-1 border-[3px] border-ink bg-white p-1.5 shadow-hard ${TILTS[i % TILTS.length]}`}>
      <span className={`${box} overflow-hidden border-2 border-ink bg-paper`}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            data-gif={sign.gifUrl ?? undefined}
            data-thumb={sign.thumbnailUrl ?? undefined}
            alt={sign.word}
            className="h-full w-full object-cover"
            onMouseEnter={(e) => { const g = e.currentTarget.dataset.gif; if (g) e.currentTarget.src = g; }}
            onMouseLeave={(e) => { const t = e.currentTarget.dataset.thumb; if (t) e.currentTarget.src = t; }}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-xl font-extrabold uppercase">{sign.word[0]}</span>
        )}
      </span>
      <span className="font-display text-sm font-extrabold uppercase">{sign.word}</span>
    </span>
  );
}

function PhraseExercise({
  phrase,
  index,
  total,
  onResult,
}: {
  phrase: Phrase;
  index: number;
  total: number;
  onResult: (status: OrderCheck['status']) => void;
}) {
  const [pool, setPool] = useState<SignInPhrase[]>(() => shuffle(phrase.signs));
  const [built, setBuilt] = useState<SignInPhrase[]>([]);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [broken, setBroken] = useState<OrderRule[]>([]);

  // Réinitialise quand la phrase change
  useEffect(() => {
    setPool(shuffle(phrase.signs));
    setBuilt([]);
    setAnswerState('idle');
    setBroken([]);
  }, [phrase]);

  function pickSign(sign: SignInPhrase) {
    if (answerState !== 'idle') return;
    setPool((p) => p.filter((s) => s.id !== sign.id));
    setBuilt((b) => [...b, sign]);
  }

  function removeSign(sign: SignInPhrase) {
    if (answerState !== 'idle') return;
    setBuilt((b) => b.filter((s) => s.id !== sign.id));
    setPool((p) => [...p, sign]);
  }

  function checkAnswer() {
    const result = checkOrder(built, phrase.signs);
    setAnswerState(result.status);
    setBroken(result.broken);
    // Ordre exact : on enchaîne. Sinon on laisse le temps de lire l'explication.
    if (result.status === 'exact') setTimeout(() => onResult('exact'), 900);
  }

  const indicativeOrder = phrase.signs.map((s) => s.word.toUpperCase()).join(' → ');

  function reset() {
    setPool(shuffle(phrase.signs));
    setBuilt([]);
    setAnswerState('idle');
  }

  const canCheck = built.length === phrase.signs.length && answerState === 'idle';

  return (
    <div key={phrase.id} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="font-bold">Phrase {index + 1} / {total}</span>
        <GameProgress value={((index + 1) / total) * 100} color="bg-ocean" />
      </div>

      {/* Phrase en français */}
      <div className="panel flex flex-col gap-2 px-6 py-5">
        <p className="text-sm font-bold uppercase tracking-widest">En français</p>
        <p className="font-display text-3xl font-extrabold leading-tight">« {phrase.textFr} »</p>
        <p className="text-ink/75">
          Construis cette phrase en LSF. Plusieurs ordres sont souvent possibles : on vérifie surtout que le temps
          est en début de phrase et la question à la fin.
        </p>
      </div>

      {/* Zone de construction */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold uppercase tracking-widest">Ta phrase en LSF</p>
        <div
          className={`flex min-h-28 flex-wrap items-center gap-4 border-[3px] border-dashed border-ink p-4 transition-colors ${
            answerState === 'exact' ? 'border-solid bg-mint'
              : answerState === 'valid' ? 'border-solid bg-sun'
              : answerState === 'wrong' ? 'border-solid bg-tomato'
              : 'bg-white/60'
          }`}
        >
          {built.length === 0 ? (
            <p className="font-bold text-ink/60">Clique sur les signes ci-dessous pour les poser ici…</p>
          ) : (
            built.map((sign, i) => (
              <button key={`${sign.id}-${i}`} onClick={() => removeSign(sign)} title="Retirer" className="transition-transform hover:-translate-y-1">
                <SignTile sign={sign} i={i} size="sm" />
              </button>
            ))
          )}
        </div>
        {answerState === 'exact' && (
          <p className="flex items-center gap-1.5 font-display text-xl font-extrabold">
            <Check className="h-6 w-6" strokeWidth={3} /> Parfait !
          </p>
        )}
        {answerState === 'valid' && (
          <div className="flex flex-col gap-1">
            <p className="flex items-center gap-1.5 font-display text-xl font-extrabold">
              <Check className="h-6 w-6" strokeWidth={3} /> Ordre possible en LSF !
            </p>
            <p className="font-bold">L&apos;ordre proposé par la leçon : {indicativeOrder}</p>
          </div>
        )}
        {answerState === 'wrong' && (
          <div className="flex flex-col gap-1">
            <p className="flex items-center gap-1.5 font-display text-xl font-extrabold">
              <X className="h-6 w-6" strokeWidth={3} /> Pas tout à fait…
            </p>
            {broken.map((rule) => <p key={rule} className="font-bold">{RULE_HINTS[rule]}</p>)}
            <p className="font-bold">Ordre proposé : {indicativeOrder}</p>
          </div>
        )}
      </div>

      {/* Signes disponibles */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold uppercase tracking-widest">Signes disponibles</p>
        <div className="flex min-h-24 flex-wrap gap-4">
          {pool.map((sign, i) => (
            <button
              key={sign.id}
              onClick={() => pickSign(sign)}
              disabled={answerState !== 'idle'}
              className="transition-transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <SignTile sign={sign} i={i + 1} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        {answerState === 'valid' || answerState === 'wrong' ? (
          <button onClick={() => onResult(answerState)} className="btn btn-ink btn-lg flex-1">
            Suivant <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
          </button>
        ) : (
          <>
            <button onClick={reset} disabled={answerState !== 'idle'} className="btn">
              <RefreshCw className="h-5 w-5" /> Recommencer
            </button>
            <button onClick={checkAnswer} disabled={!canCheck} className="btn btn-ocean btn-lg flex-1">
              Vérifier
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ConstructeurPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<PhraseLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);      // réponses acceptées (exactes + ordres possibles)
  const [perfect, setPerfect] = useState(0);  // dont ordre exact de la leçon
  const [phase, setPhase] = useState<Phase>('playing');
  const [completion, setCompletion] = useState<CompleteLessonResponse | null>(null);

  useEffect(() => {
    phrasesApi.getByLesson(lessonId)
      .then(setLesson)
      .catch(() => router.push('/jeux'))
      .finally(() => setIsLoading(false));
  }, [lessonId, router]);

  function handleResult(status: OrderCheck['status']) {
    const correct = status !== 'wrong';
    if (correct) setScore((s) => s + 1);
    if (status === 'exact') setPerfect((p) => p + 1);
    if (!lesson) return;

    if (currentIndex + 1 >= lesson.phrases.length) {
      const finalScore = correct ? score + 1 : score;
      const pct = Math.round((finalScore / lesson.phrases.length) * 100);
      progressApi.completeLesson(lessonId, finalScore, lesson.phrases.length)
        .then(setCompletion)
        .catch(() => {});
      scoresApi.submit('constructeur', lessonId, pct).catch(() => {});
      setPhase('result');
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setPerfect(0);
    setPhase('playing');
    setCompletion(null);
  }, []);

  if (isLoading) return <Loader label="Préparation des phrases..." />;

  if (!lesson) return null;

  // ─── Résultats ────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const total = lesson.phrases.length;
    const pct = Math.round((score / total) * 100);
    const xpEarned = completion?.xpEarned ?? Math.round((score / total) * lesson.xpReward);
    const feedback =
      pct === 100 ? 'Parfait !' :
      pct >= 75   ? 'Excellent !' :
      pct >= 50   ? 'Pas mal !' :
                    'Continue à t\'entraîner !';

    return (
      <div className="px-6 py-14">
        <div className="mx-auto max-w-xl">
          <GameEnd
            title={feedback}
            color="bg-ocean text-white"
            subtitle={<span className="font-display text-7xl font-extrabold">{score}<span className="text-4xl text-ink/50">/{total}</span></span>}
            xp={xpEarned}
            extra={
              <>
                <span className="sticker bg-white text-sm">{pct}% de bonnes réponses</span>
                <span className="sticker bg-mint text-sm">{perfect} dans l&apos;ordre de la leçon</span>
                {score > perfect && <span className="sticker bg-sun text-sm">{score - perfect} autre{score - perfect > 1 ? 's' : ''} ordre{score - perfect > 1 ? 's' : ''} possible{score - perfect > 1 ? 's' : ''}</span>}
                {completion?.isFirstCompletion && <span className="sticker bg-mint">Première complétion : XP enregistrés !</span>}
              </>
            }
          >
            <button onClick={handleRestart} className="btn flex-1"><RefreshCw className="h-5 w-5" /> Recommencer</button>
            <Link href="/jeux" className="btn btn-ink flex-1">Retour aux jeux</Link>
          </GameEnd>
        </div>
      </div>
    );
  }

  // ─── Jeu ─────────────────────────────────────────────────────────────────────
  return (
    <div className="px-6 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-7">
        <GameHeader title="Constructeur" color="bg-ocean text-white" right={<span className="truncate text-sm">{lesson.title}</span>} />
        <PhraseExercise
          key={currentIndex}
          phrase={lesson.phrases[currentIndex]}
          index={currentIndex}
          total={lesson.phrases.length}
          onResult={handleResult}
        />
      </div>
    </div>
  );
}
