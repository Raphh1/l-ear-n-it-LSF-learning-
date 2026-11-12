import { Library, Target, BookA } from 'lucide-react';

const features = [
  { icon: Library, title: 'Modules structurés', desc: 'Des parcours progressifs adaptés à votre niveau.', color: 'bg-sun' },
  { icon: Target, title: 'Jeux & quiz', desc: 'Testez vos connaissances et progressez vite.', color: 'bg-tomato' },
  { icon: BookA, title: 'Dictionnaire complet', desc: 'Près de 4 000 signes en vidéo.', color: 'bg-mint' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full">
      {/* Colonne gauche — présentation */}
      <div className="hidden w-1/2 flex-col justify-between border-r-[3px] border-ink bg-ocean px-12 py-14 text-white lg:flex">
        <span className="sticker w-fit -rotate-2 bg-sun text-ink">Langue des Signes Française</span>

        <div className="flex flex-col gap-10">
          <h2 className="flex flex-wrap gap-3 text-5xl font-extrabold leading-none">
            <span className="tile -rotate-2 bg-white text-ink">Apprends</span>
            <span className="tile rotate-1 bg-sun text-ink">la</span>
            <span className="tile rotate-2 bg-tomato text-ink">LSF</span>
          </h2>
          <p className="max-w-sm text-lg leading-relaxed">
            Une plateforme interactive pour découvrir et maîtriser la langue des signes, à ton rythme.
          </p>

          <div className="flex flex-col gap-4">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex items-start gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center border-[3px] border-ink text-ink shadow-hard-sm ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{title}</p>
                  <p className="text-white/85">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-white/70">© 2026 L&apos;ear&apos;n it</p>
      </div>

      {/* Colonne droite — formulaire */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
