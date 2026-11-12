'use client';

import Link from 'next/link';
import { Trophy, Dna, CalendarDays, Target, Zap, RefreshCw, Brain, Hourglass, BookOpen, MessageCircle, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/brand/PageHeader';

// Couleur = famille d'activité : tomate = jouer, vert = réviser, bleu = phrases, jaune = défi du jour
const GAMES = [
  {
    slug: 'defi',
    title: 'Défi du jour',
    description: 'Un signe par jour, le même pour tout le monde. Une seule chance !',
    icon: CalendarDays,
    color: 'bg-sun',
    badge: 'Quotidien',
    featured: true,
  },
  {
    slug: 'srs',
    title: 'Révision SRS',
    description: 'Répétition espacée : les signes les plus oubliés reviennent plus vite.',
    icon: Dna,
    color: 'bg-mint',
    badge: 'SRS',
    featured: true,
  },
  {
    slug: 'quiz',
    title: 'Quiz',
    description: "Un signe s'affiche, trouve le bon mot parmi 4 choix.",
    icon: Target,
    color: 'bg-tomato',
    badge: 'Classique',
  },
  {
    slug: 'vitesse',
    title: 'Vitesse',
    description: 'Réponds le plus vite possible : chaque seconde compte !',
    icon: Zap,
    color: 'bg-tomato',
    badge: 'Chrono',
  },
  {
    slug: 'inverse',
    title: 'Mode inversé',
    description: 'On te montre le mot, retrouve le bon signe parmi 4.',
    icon: RefreshCw,
    color: 'bg-tomato',
    badge: 'Inversé',
  },
  {
    slug: 'memoire',
    title: 'Mémoire',
    description: 'Retrouve les paires signe ↔ mot. Classique mais redoutable.',
    icon: Brain,
    color: 'bg-tomato',
    badge: 'Memory',
  },
  {
    slug: 'survie',
    title: 'Survie',
    description: "Réponds avant la fin du chrono : chaque bonne réponse rapporte +5 s.",
    icon: Hourglass,
    color: 'bg-tomato',
    badge: 'Timer',
  },
  {
    slug: 'revision',
    title: 'Révision',
    description: "Retravaille uniquement les signes sur lesquels tu t'es trompé.",
    icon: BookOpen,
    color: 'bg-mint',
    badge: 'Ciblé',
  },
  {
    slug: 'constructeur',
    title: 'Constructeur de phrases',
    description: "Assemble les signes pour former une phrase en LSF.",
    icon: MessageCircle,
    color: 'bg-ocean text-white',
    badge: 'Phrases',
  },
];

const tilts = ['-rotate-1', 'rotate-1', 'rotate-0', '-rotate-1', 'rotate-1'];

export default function JeuxPage() {
  const featured = GAMES.filter(g => g.featured);
  const others = GAMES.filter(g => !g.featured);

  return (
    <div className="px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <PageHeader
          kicker="Jouer"
          kickerClass="bg-tomato"
          title="Salle de jeux"
          actions={
            <Link href="/jeux/classement" className="btn btn-sun">
              <Trophy className="h-5 w-5" /> Classement
            </Link>
          }
        >
          Neuf façons de t&apos;entraîner pour que les signes restent en mémoire.
        </PageHeader>

        {/* À la une */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {featured.map(({ slug, title, description, icon: Icon, color, badge }, i) => (
            <Link
              key={slug}
              href={`/jeux/${slug}`}
              className={`panel press group flex min-h-60 flex-col justify-between gap-6 p-7 ${color} ${i ? 'rotate-1' : '-rotate-1'}`}
            >
              <div className="flex items-start justify-between">
                <span className="flex h-16 w-16 items-center justify-center border-[3px] border-ink bg-white shadow-hard-sm">
                  <Icon className="h-8 w-8" strokeWidth={2.5} />
                </span>
                <span className="sticker rotate-2">{badge}</span>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-extrabold leading-none">{title}</h2>
                <p className="text-lg">{description}</p>
                <span className="mt-2 flex items-center gap-1 font-display text-lg font-extrabold">
                  Jouer <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Tous les modes */}
        <div className="flex flex-col gap-6">
          <h2 className="border-b-[3px] border-ink pb-3 text-3xl font-extrabold">Tous les modes</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map(({ slug, title, description, icon: Icon, color, badge }, i) => (
              <Link key={slug} href={`/jeux/${slug}`} className={`panel press group flex flex-col gap-4 p-5 ${tilts[i % tilts.length]}`}>
                <div className="flex items-start justify-between">
                  <span className={`flex h-14 w-14 items-center justify-center border-[3px] border-ink shadow-hard-sm ${color}`}>
                    <Icon className="h-7 w-7" strokeWidth={2.5} />
                  </span>
                  <span className="sticker">{badge}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-2xl font-extrabold leading-tight">{title}</h3>
                  <p className="leading-snug text-ink/80">{description}</p>
                </div>
                <span className="mt-auto flex items-center gap-1 font-display font-extrabold">
                  Jouer <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
