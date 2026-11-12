'use client';

import Link from 'next/link';
import { ArrowDown, ArrowRight } from 'lucide-react';

interface Props {
  signCount: number | null;
  moduleCount: number | null;
  categoryCount: number | null;
  onScrollDown: () => void;
}

const titleTiles = [
  { text: 'Apprends', cls: 'bg-white -rotate-2' },
  { text: 'la', cls: 'bg-sun rotate-3' },
  { text: 'LSF,', cls: 'bg-tomato -rotate-1' },
  { text: 'à ton', cls: 'bg-white rotate-1' },
  { text: 'rythme.', cls: 'bg-mint -rotate-2' },
];

// Exemple d'ordre LSF : on montre la grammaire visuelle dès l'accueil
const glossTiles = [
  { text: 'MOI', cls: 'bg-sun -rotate-3' },
  { text: 'LSF', cls: 'bg-white rotate-2' },
  { text: 'APPRENDRE', cls: 'bg-tomato -rotate-1' },
];

function formatCount(value: number | null) {
  return value !== null ? value.toLocaleString('fr-FR') : '—';
}

export function HeroSection({ signCount, moduleCount, categoryCount, onScrollDown }: Props) {
  return (
    <section className="border-b-[3px] border-ink">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-16 lg:min-h-[calc(100vh-4rem-6.5rem)] lg:grid-cols-[1.25fr_1fr] lg:items-center lg:py-10">
        <div className="flex flex-col gap-8">
          <span className="sticker w-fit -rotate-2 bg-ocean text-white">Langue des Signes Française</span>

          <h1 className="flex flex-wrap gap-x-3 gap-y-4 text-5xl font-extrabold leading-none tracking-tight sm:text-7xl">
            {titleTiles.map(t => (
              <span key={t.text} className={`tile px-3 py-1 ${t.cls}`}>{t.text}</span>
            ))}
          </h1>

          <p className="max-w-lg text-xl leading-relaxed">
            Des vidéos, des modules progressifs et des jeux pour apprendre la LSF pour de vrai. Gratuitement.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/modules" className="btn btn-ink btn-lg">
              Commencer <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/dictionnaire" className="btn btn-lg">Explorer le dictionnaire</Link>
          </div>
        </div>

        <div className="relative">
          <div className="panel rotate-1 p-6 shadow-hard-lg">
            <p className="font-display text-sm font-bold uppercase tracking-widest">En français</p>
            <p className="mt-1 font-display text-3xl font-extrabold">« J&apos;apprends la LSF. »</p>

            <div className="my-6 border-t-[3px] border-dashed border-ink" />

            <p className="font-display text-sm font-bold uppercase tracking-widest">En LSF, on signe</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {glossTiles.map(t => (
                <span key={t.text} className={`tile text-2xl ${t.cls}`}>{t.text}</span>
              ))}
            </div>
            <p className="mt-6 text-ink/80">
              Le sujet d&apos;abord, l&apos;action à la fin. La LSF a sa propre grammaire&nbsp;: tu vas l&apos;apprendre ici.
            </p>
          </div>
          <span className="tile absolute -right-3 -top-6 rotate-6 bg-ocean text-lg text-white">Nouveau&nbsp;: phrases&nbsp;!</span>
        </div>
      </div>

      {/* Bande de chiffres */}
      <div className="border-t-[3px] border-ink bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl grid-cols-3 px-6">
          {[
            { value: signCount, label: 'signes' },
            { value: moduleCount, label: 'modules' },
            { value: categoryCount, label: 'catégories' },
          ].map(({ value, label }, i) => (
            <div key={label} className={`py-5 text-center ${i ? 'border-l-[3px] border-paper/25' : ''}`}>
              <p className="font-display text-3xl font-extrabold text-sun sm:text-5xl">{formatCount(value)}</p>
              <p className="text-xs font-bold uppercase tracking-widest sm:text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 -mb-6 flex translate-y-1/2 justify-center">
        <button onClick={onScrollDown} className="btn btn-sun">
          Découvrir <ArrowDown className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
