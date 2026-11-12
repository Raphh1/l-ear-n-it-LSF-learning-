import { BookOpen, Gamepad2, Hand } from 'lucide-react';

const steps = [
  {
    num: '1',
    title: 'Choisis un module',
    desc: "Des parcours structurés par niveau, du débutant à l'avancé.",
    color: 'bg-sun',
    tilt: '-rotate-1',
    icon: BookOpen,
  },
  {
    num: '2',
    title: 'Apprends les signes',
    desc: 'Regarde les vidéos, mémorise les gestes, avance à ton rythme.',
    color: 'bg-mint',
    tilt: 'rotate-1',
    icon: Hand,
  },
  {
    num: '3',
    title: 'Entraîne-toi',
    desc: 'Teste-toi avec des jeux et des phrases, et monte en niveau.',
    color: 'bg-tomato',
    tilt: '-rotate-1',
    icon: Gamepad2,
  },
];

export function HowItWorksSection() {
  return (
    <section className="px-6 pb-20 pt-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <div className="flex flex-col gap-3">
          <span className="sticker w-fit rotate-1 bg-sun">Mode d&apos;emploi</span>
          <h2 className="text-4xl font-extrabold sm:text-5xl">Comment ça marche ?</h2>
        </div>

        <ol className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {steps.map(({ num, title, desc, color, tilt, icon: Icon }) => (
            <li key={num} className={`panel relative flex flex-col gap-4 p-6 pt-10 ${tilt}`}>
              <span className={`absolute -left-4 -top-5 flex h-12 w-12 items-center justify-center border-[3px] border-ink font-display text-2xl font-extrabold shadow-hard-sm ${color}`}>
                {num}
              </span>
              <Icon className="h-8 w-8" strokeWidth={2.5} />
              <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-extrabold">{title}</h3>
                <p className="leading-relaxed text-ink/80">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
