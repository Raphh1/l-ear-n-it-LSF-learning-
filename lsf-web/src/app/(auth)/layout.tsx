export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen overflow-hidden flex items-center justify-center bg-[#0a0a1a]">
      {/* Blobs globaux */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-violet-700/25 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-[50%] left-[30%] w-[300px] h-[300px] rounded-full bg-fuchsia-700/10 blur-[100px]" />
      </div>

      <div className="relative flex w-full max-w-5xl h-full">
        {/* Colonne gauche — présentation */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 px-12 py-16 border-r border-white/5">
          <span className="text-white font-bold text-lg tracking-tight">L&apos;ear&apos;n it</span>

          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Apprenez la langue<br />des signes françaises
              </h2>
              <p className="text-white/50 text-base leading-relaxed max-w-sm">
                Une plateforme d&apos;apprentissage interactive pour découvrir et maîtriser la LSF à votre rythme, où que vous soyez.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { icon: '📚', title: 'Modules structurés', desc: 'Des parcours progressifs adaptés à votre niveau.' },
                { icon: '🎯', title: 'Quiz interactifs', desc: 'Testez vos connaissances et progressez rapidement.' },
                { icon: '🔤', title: 'Dictionnaire complet', desc: 'Retrouvez tous les signes classés par catégorie.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-xl shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-sm text-white/40">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/20">© 2026 L&apos;ear&apos;n it</p>
        </div>

        {/* Colonne droite — formulaire */}
        <div className="flex flex-col items-center justify-center w-full lg:w-1/2 px-8">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
