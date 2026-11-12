'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';
import { LogOut, User, Star, Flame, Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Accueil', color: 'bg-sun' },
  { href: '/modules', label: 'Modules', color: 'bg-sun' },
  { href: '/dictionnaire', label: 'Dictionnaire', color: 'bg-mint' },
  { href: '/jeux', label: 'Jeux', color: 'bg-tomato' },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { progress, reset: resetProgress } = useProgressStore();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    resetProgress();
    setOpen(false);
    router.push('/');
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b-[3px] border-ink bg-paper">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        {/* Logo : le nom posé en tuiles */}
        <Link href="/" className="flex items-center gap-1 font-display text-lg font-extrabold" onClick={() => setOpen(false)}>
          <span className="-rotate-3 border-[3px] border-ink bg-sun px-1.5 leading-tight shadow-hard-sm">L&apos;ear&apos;n</span>
          <span className="rotate-2 border-[3px] border-ink bg-ink px-1.5 leading-tight text-paper shadow-hard-sm">it</span>
        </Link>

        {/* Liens */}
        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map(link => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`border-[3px] px-3 py-1 font-display font-bold transition-transform ${
                  active
                    ? `${link.color} -rotate-1 border-ink shadow-hard-sm`
                    : 'border-transparent hover:border-ink hover:bg-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Compte */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {progress && (
                <div className="hidden items-center gap-2 sm:flex">
                  {progress.streakDays > 0 && (
                    <span className="sticker bg-tomato" title="Jours d'affilée">
                      <Flame className="h-3.5 w-3.5" /> {progress.streakDays}
                    </span>
                  )}
                  <span className="sticker bg-sun" title="Expérience">
                    <Star className="h-3.5 w-3.5" /> {progress.xpTotal} XP
                  </span>
                </div>
              )}
              <Link
                href="/profile"
                className={`hidden items-center gap-2 border-[3px] px-3 py-1 font-bold sm:flex ${
                  pathname.startsWith('/profile') ? 'border-ink bg-white shadow-hard-sm' : 'border-transparent hover:border-ink hover:bg-white'
                }`}
              >
                <User className="h-4 w-4" />
                <span className="max-w-32 truncate">{user.username}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm hidden md:inline-flex" title="Déconnexion">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">Connexion</Link>
              <Link href="/register" className="btn btn-ink btn-sm">S&apos;inscrire</Link>
            </>
          )}
          <button
            onClick={() => setOpen(o => !o)}
            className="btn btn-sm md:hidden"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <nav className="border-b-[3px] border-ink bg-paper px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`panel px-4 py-3 font-display text-xl font-extrabold ${isActive(pathname, link.href) ? link.color : ''}`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <div className="flex gap-3">
                <Link href="/profile" onClick={() => setOpen(false)} className="btn flex-1">
                  <User className="h-4 w-4" /> {user.username}
                </Link>
                <button onClick={handleLogout} className="btn btn-tomato">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="btn">Connexion</Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
