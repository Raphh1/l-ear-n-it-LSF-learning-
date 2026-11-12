'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface ResetResponse {
  success: boolean;
  message: string;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="panel w-full max-w-md p-8 shadow-hard-lg">{children}</div>
    </div>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);
    try {
      const data = await api.post<ResetResponse>('/api/account/password-reset/confirm', {
        email,
        token,
        newPassword: password,
        confirmPassword,
      });

      if (!data.success) throw new Error(data.message);

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Shell>
        <span className="sticker mb-4 -rotate-2 bg-tomato">Oups</span>
        <h1 className="mb-3 text-4xl font-extrabold leading-none">Lien invalide</h1>
        <p className="mb-6 text-ink/75">Ce lien de réinitialisation est invalide ou expiré.</p>
        <Link href="/forgot-password" className="btn btn-ink w-full">Demander un nouveau lien</Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="mb-2 text-4xl font-extrabold leading-none">Nouveau mot de passe</h1>
      <p className="mb-6 text-ink/75">Entrez votre nouveau mot de passe ci-dessous.</p>

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="field-label">Nouveau mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="field"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="field-label">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="field"
            />
          </div>

          {error && <div className="notice notice-error">{error}</div>}

          <button type="submit" disabled={loading} className="btn btn-ink btn-lg w-full">
            {loading ? 'Traitement...' : 'Réinitialiser'}
          </button>
        </form>
      )}

      {success && (
        <div className="notice notice-ok text-center">
          <p>Mot de passe réinitialisé avec succès !</p>
          <p className="mt-1 font-normal">Redirection vers la connexion...</p>
        </div>
      )}
    </Shell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center font-display text-xl font-bold">Chargement...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
