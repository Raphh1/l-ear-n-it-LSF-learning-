'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TriangleAlert } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

interface DeleteResponse {
  success: boolean;
  message: string;
  exportedData?: string;
}

export default function DeleteAccountPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [step, setStep] = useState<'confirm' | 'password' | 'final'>('confirm');
  const [password, setPassword] = useState('');
  const [exportData, setExportData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await api.post<DeleteResponse>('/api/account/delete', {
        password,
        exportDataFirst: exportData,
      });

      if (!data.success) throw new Error(data.message || 'Erreur lors de la suppression');

      setSuccess(true);

      if (data.exportedData) {
        const blob = new Blob([data.exportedData], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `learn-it-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
      }

      setTimeout(async () => {
        await logout();
        router.push('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="panel p-6 font-bold">Veuillez vous connecter d&apos;abord.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="panel w-full max-w-md p-8">
        {step === 'confirm' && !success && (
          <div className="flex flex-col gap-5">
            <span className="flex h-14 w-14 -rotate-3 items-center justify-center border-[3px] border-ink bg-tomato shadow-hard-sm">
              <TriangleAlert className="h-7 w-7" strokeWidth={2.5} />
            </span>
            <h1 className="text-4xl font-extrabold">Supprimer le compte</h1>
            <p className="text-lg text-ink/80">
              Cette action est <strong>définitive</strong>. Tu perdras l&apos;accès à tous tes progrès et données.
            </p>
            <div className="notice bg-sun">
              Tu peux exporter tes données avant la suppression.
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => setStep('password')} className="btn btn-tomato w-full">
                Je confirme, continuer
              </button>
              <button onClick={() => router.back()} className="btn w-full">
                Annuler
              </button>
            </div>
          </div>
        )}

        {step === 'password' && !success && (
          <div className="flex flex-col gap-5">
            <h1 className="text-3xl font-extrabold">Confirmer la suppression</h1>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="field-label">Entre ton mot de passe</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="field"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-3 font-bold">
              <input
                type="checkbox"
                checked={exportData}
                onChange={(e) => setExportData(e.target.checked)}
                className="h-5 w-5 accent-ink"
              />
              Exporter mes données avant suppression
            </label>
            {error && <div className="notice notice-error">{error}</div>}
            <div className="flex flex-col gap-3">
              <button onClick={handleDeleteAccount} disabled={loading || !password} className="btn btn-tomato w-full">
                {loading ? 'Suppression en cours...' : 'Supprimer mon compte'}
              </button>
              <button onClick={() => setStep('confirm')} disabled={loading} className="btn w-full">
                Retour
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="sticker rotate-2 bg-mint">Compris</span>
            <h2 className="text-3xl font-extrabold">Compte supprimé</h2>
            <p className="text-ink/75">Redirection en cours...</p>
          </div>
        )}
      </div>
    </div>
  );
}
