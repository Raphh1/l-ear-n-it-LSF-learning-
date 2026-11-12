'use client';

import { FormEvent, useState } from 'react';
import { API_URL } from '@/lib/api';
import { BackLink } from '@/components/brand/BackLink';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/account/password/change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // cookie de session httpOnly
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la mise à jour du mot de passe.');
      }

      setSuccess('Mot de passe mis à jour avec succès.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-12">
      <BackLink href="/settings">Retour aux paramètres</BackLink>

      <div className="panel flex flex-col gap-6 p-8">
        <div className="flex flex-col gap-3">
          <span className="sticker w-fit -rotate-2 bg-sun">Sécurité</span>
          <h1 className="text-4xl font-extrabold">Changer le mot de passe</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="currentPassword" className="field-label">Mot de passe actuel</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="field"
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="newPassword" className="field-label">Nouveau mot de passe</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="field"
              placeholder="Au moins 8 caractères"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="field-label">Confirmer le nouveau mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="field"
              placeholder="Répète le nouveau mot de passe"
            />
          </div>

          {error && <div className="notice notice-error">{error}</div>}
          {success && <div className="notice notice-ok">{success}</div>}

          <button type="submit" disabled={loading} className="btn btn-ink w-full">
            {loading ? 'Mise à jour en cours...' : 'Mettre à jour le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
