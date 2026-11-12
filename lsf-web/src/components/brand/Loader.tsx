// Indicateur de chargement : trois tuiles colorées qui sautent
export function Loader({ label = 'Chargement...', className = '' }: { label?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-16 ${className}`} role="status">
      <div className="flex gap-2" aria-hidden>
        {['bg-sun', 'bg-tomato', 'bg-ocean'].map(c => (
          <span key={c} className={`hop h-6 w-6 border-[3px] border-ink ${c}`} />
        ))}
      </div>
      <p className="font-display text-lg font-bold">{label}</p>
    </div>
  );
}
