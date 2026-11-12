'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.post('/api/account/password-reset/request', { email });
      setMessage('Si un compte existe avec cet email, un lien de réinitialisation vous a été envoyé.');
      setEmail('');
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="panel w-full max-w-md p-8 shadow-hard-lg">
        <span className="sticker mb-4 -rotate-2 bg-sun">Pas de panique</span>
        <h1 className="mb-2 text-4xl font-extrabold leading-none">Mot de passe oublié ?</h1>
        <p className="mb-6 text-ink/75">Entrez votre email pour recevoir un lien de réinitialisation.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="field-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
              className="field"
            />
          </div>

          {message && <div className="notice notice-ok">{message}</div>}
          {error && <div className="notice notice-error">{error}</div>}

          <button type="submit" disabled={loading} className="btn btn-ink btn-lg w-full">
            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
          </button>
        </form>

        <div className="mt-6 border-t-[3px] border-ink pt-4 text-center">
          <Link href="/login" className="link">← Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
}
