// Niveau d'un module en 1 à 3 carrés (la couleur reste réservée au type d'activité)
export const levelLabels: Record<number, string> = {
  1: 'Débutant',
  2: 'Intermédiaire',
  3: 'Avancé',
};

export function LevelMeter({ level, showLabel = true }: { level: number; showLabel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" title={levelLabels[level] ?? 'Débutant'}>
      <span className="flex gap-1" aria-hidden>
        {[1, 2, 3].map(n => (
          <span key={n} className={`h-3 w-3 border-2 border-ink ${n <= level ? 'bg-ink' : 'bg-white'}`} />
        ))}
      </span>
      {showLabel && <span className="text-sm font-bold">{levelLabels[level] ?? 'Débutant'}</span>}
    </span>
  );
}
