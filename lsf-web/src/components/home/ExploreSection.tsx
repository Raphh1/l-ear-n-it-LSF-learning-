import Link from 'next/link';
import { BookOpen, Gamepad2, MessageSquareText, Search, ArrowRight } from 'lucide-react';

// Une couleur = une activité, partout sur le site
const cards = [
  {
    href: '/modules',
    icon: BookOpen,
    title: 'Modules',
    desc: "Apprentissage structuré étape par étape, du débutant à l'avancé.",
    color: 'bg-sun',
  },
  {
    href: '/jeux',
    icon: Gamepad2,
    title: 'Jeux',
    desc: "Vitesse, mémoire, survie : teste tes connaissances en t'amusant.",
    color: 'bg-tomato',
  },
  {
    href: '/modules',
    icon: MessageSquareText,
    title: 'Phrases',
    desc: "Construis des phrases en LSF en assemblant les signes.",
    color: 'bg-ocean text-white',
  },
  {
    href: '/dictionnaire',
    icon: Search,
    title: 'Dictionnaire',
    desc: "Retrouve n'importe quel signe parmi toutes les catégories.",
    color: 'bg-mint',
  },
];

export function ExploreSection() {
  return (
    <section className="border-t-[3px] border-ink px-6 py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-col gap-3">
          <span className="sticker w-fit -rotate-1 bg-tomato">À toi de choisir</span>
          <h2 className="text-4xl font-extrabold sm:text-5xl">Par où commencer ?</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ href, icon: Icon, title, desc, color }) => (
            <Link key={title} href={href} className={`panel press group flex min-h-56 flex-col justify-between gap-6 p-6 ${color}`}>
              <Icon className="h-10 w-10" strokeWidth={2.5} />
              <div className="flex flex-col gap-2">
                <h3 className="text-3xl font-extrabold">{title}</h3>
                <p className="leading-snug">{desc}</p>
                <span className="mt-2 flex items-center gap-1 font-display font-bold">
                  Y aller <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
