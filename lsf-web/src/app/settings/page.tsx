'use client';

import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { KeyRound, Lock, Download, Trash2, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/brand/PageHeader';
import { BackLink } from '@/components/brand/BackLink';

function Row({ icon, iconClass, title, description, danger }: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  description: string;
  danger?: boolean;
}) {
  return (
    <>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center border-[3px] border-ink ${iconClass}`}>{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col text-left">
        <span className={`font-display text-lg font-extrabold ${danger ? 'text-tomato' : ''}`}>{title}</span>
        <span className="text-ink/75">{description}</span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
    </>
  );
}

const rowClass = 'panel-flat group flex w-full items-center gap-4 p-5 hover:shadow-hard';

export default function SettingsPage() {
  const handleExportData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/account/export-data`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `learn-it-data-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Erreur lors de l\'export des données');
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12">
      <BackLink href="/profile">Retour au profil</BackLink>

      <PageHeader kicker="Compte" kickerClass="bg-ocean text-white" title="Paramètres">
        Gère ta sécurité et tes données personnelles.
      </PageHeader>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-extrabold">Sécurité</h2>
        <Link href="/settings/change-password" className={rowClass}>
          <Row icon={<KeyRound className="h-6 w-6" />} iconClass="bg-sun" title="Changer le mot de passe" description="Mettre à jour ton mot de passe" />
        </Link>
        <Link href="/forgot-password" className={rowClass}>
          <Row icon={<Lock className="h-6 w-6" />} iconClass="bg-ocean text-white" title="Mot de passe oublié" description="Recevoir un lien de réinitialisation par email" />
        </Link>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-extrabold">Tes données</h2>
        <button type="button" onClick={handleExportData} className={rowClass}>
          <Row icon={<Download className="h-6 w-6" />} iconClass="bg-mint" title="Exporter mes données" description="Télécharger une copie de tes données" />
        </button>
        <Link href="/settings/delete-account" className={`${rowClass} border-tomato`}>
          <Row icon={<Trash2 className="h-6 w-6" />} iconClass="bg-tomato" title="Supprimer le compte" description="Supprimer définitivement ton compte et tes données" danger />
        </Link>
      </section>
    </div>
  );
}
