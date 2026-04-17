'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuthStore } from '@/store/authStore';
import { Form } from '@/components/ui/form';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthFormField } from '@/components/auth/AuthFormField';
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton';

const schema = z.object({
  email: z.email({ error: 'Email invalide' }),
  password: z.string().min(1, { error: 'Mot de passe requis' }),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await login(values);
      router.push('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue');
    }
  }

  return (
    <AuthCard
      title="Connexion"
      subtitle="Connectez-vous pour continuer votre apprentissage"
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-violet-400 font-medium hover:text-violet-300 transition-colors">
            S&apos;inscrire
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <AuthFormField control={form.control} name="email" label="Email" placeholder="vous@exemple.fr" type="email" />
          <AuthFormField control={form.control} name="password" label="Mot de passe" placeholder="••••••••" type="password" />

          {error && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <AuthSubmitButton isLoading={isLoading} label="Se connecter" loadingLabel="Connexion..." />
        </form>
      </Form>
    </AuthCard>
  );
}
