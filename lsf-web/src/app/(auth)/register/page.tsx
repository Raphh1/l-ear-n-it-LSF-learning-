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

const schema = z
  .object({
    email: z.email({ error: 'Email invalide' }),
    username: z.string().min(3, { error: 'Minimum 3 caractères' }),
    password: z.string().min(8, { error: 'Minimum 8 caractères' }),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', username: '', password: '', confirmPassword: '' },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await register({ email: values.email, username: values.username, password: values.password });
      router.push('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue');
    }
  }

  return (
    <AuthCard
      title="Créer un compte"
      subtitle="Commencez votre apprentissage de la LSF"
      footer={
        <>
          Déjà un compte ?{' '}
          <Link href="/login" className="text-violet-400 font-medium hover:text-violet-300 transition-colors">
            Se connecter
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <AuthFormField control={form.control} name="email" label="Email" placeholder="vous@exemple.fr" type="email" />
          <AuthFormField control={form.control} name="username" label="Nom d'utilisateur" placeholder="votre_pseudo" />
          <AuthFormField control={form.control} name="password" label="Mot de passe" placeholder="••••••••" type="password" />
          <AuthFormField control={form.control} name="confirmPassword" label="Confirmer le mot de passe" placeholder="••••••••" type="password" />

          {error && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <AuthSubmitButton isLoading={isLoading} label="Créer mon compte" loadingLabel="Création..." />
        </form>
      </Form>
    </AuthCard>
  );
}
