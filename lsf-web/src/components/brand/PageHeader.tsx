// En-tête commun à toutes les pages : étiquette inclinée + grand titre + texte d'intro
interface Props {
  kicker?: string;
  kickerClass?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ kicker, kickerClass = 'bg-sun', title, children, actions }: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div className="flex max-w-2xl flex-col gap-4">
        {kicker && <span className={`sticker w-fit -rotate-2 ${kickerClass}`}>{kicker}</span>}
        <h1 className="page-title">{title}</h1>
        {children && <div className="text-lg leading-relaxed text-ink/80">{children}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}
