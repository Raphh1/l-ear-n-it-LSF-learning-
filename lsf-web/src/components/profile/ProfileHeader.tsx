'use client';

import { Check, Edit2, X } from 'lucide-react';
import type { User } from '@/lib/types';

interface Props {
  user: User;
  level: number;
  isEditing: boolean;
  editUsername: string;
  editEmail: string;
  isSaving: boolean;
  errorMsg: string;
  onEditOpen: () => void;
  onEditCancel: () => void;
  onSave: () => void;
  onUsernameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
}

export function ProfileHeader({
  user, level, isEditing,
  editUsername, editEmail, isSaving, errorMsg,
  onEditOpen, onEditCancel, onSave, onUsernameChange, onEmailChange,
}: Props) {
  return (
    <div className="panel flex flex-col items-start gap-6 p-7 shadow-hard-lg sm:flex-row sm:items-center">
      <div className="relative shrink-0">
        <div className="flex h-24 w-24 -rotate-3 items-center justify-center border-[3px] border-ink bg-sun font-display text-5xl font-extrabold shadow-hard">
          {user.username[0]?.toUpperCase() ?? 'U'}
        </div>
        <span className="absolute -bottom-3 -right-3 flex h-10 w-10 rotate-6 items-center justify-center border-[3px] border-ink bg-ocean font-display font-extrabold text-white" title="Niveau">
          {level}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        {!isEditing ? (
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className="truncate text-4xl font-extrabold leading-none">{user.username}</h1>
              <p className="truncate text-ink/75">{user.email}</p>
              <p className="mt-1 text-sm font-bold">
                Membre depuis{' '}
                {new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button onClick={onEditOpen} className="btn btn-sm shrink-0" title="Modifier mon profil">
              <Edit2 className="h-4 w-4" /> Modifier
            </button>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="field-label">Nom d&apos;utilisateur</span>
                <input type="text" className="field py-2" value={editUsername} onChange={(e) => onUsernameChange(e.target.value)} disabled={isSaving} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="field-label">Email</span>
                <input type="email" className="field py-2" value={editEmail} onChange={(e) => onEmailChange(e.target.value)} disabled={isSaving} />
              </label>
            </div>

            {errorMsg && <p className="notice notice-error py-2">{errorMsg}</p>}

            <div className="flex gap-3">
              <button onClick={onSave} disabled={isSaving} className="btn btn-ink btn-sm">
                <Check className="h-4 w-4" /> {isSaving ? 'Enregistrement...' : 'Sauvegarder'}
              </button>
              <button onClick={onEditCancel} disabled={isSaving} className="btn btn-sm">
                <X className="h-4 w-4" /> Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
