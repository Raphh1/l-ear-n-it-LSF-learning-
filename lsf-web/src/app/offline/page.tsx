import Link from 'next/link';
import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 px-4 text-center">
      <span className="flex h-24 w-24 rotate-6 items-center justify-center border-[3px] border-ink bg-sun shadow-hard-lg">
        <WifiOff className="h-12 w-12" strokeWidth={2.5} />
      </span>
      <div className="flex flex-col gap-3">
        <h1 className="page-title">Tu es hors ligne</h1>
        <p className="max-w-sm text-lg text-ink/80">
          Vérifie ta connexion internet. Les pages déjà visitées restent accessibles.
        </p>
      </div>
      <Link href="/" className="btn btn-ink btn-lg">Retour à l&apos;accueil</Link>
    </div>
  );
}
