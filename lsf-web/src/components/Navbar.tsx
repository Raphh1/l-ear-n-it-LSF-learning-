'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';
import { LogOut, User, Star, Flame } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/modules', label: 'Modules' },
  { href: '/dictionnaire', label: 'Dictionnaire' },
  { href: '/jeux', label: 'Jeux' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { progress, reset: resetProgress } = useProgressStore();

  function handleLogout() {
    logout();
    resetProgress();
    router.push('/');
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-[#0a0a1a]/90 backdrop-blur-md border-b border-white/10">
      {/* Logo */}
      <Link href="/" className="text-white font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
        L&apos;ear&apos;n it
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-white/10"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Auth */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {progress && (
              <div className="hidden sm:flex items-center gap-3">
                {progress.streakDays > 0 && (
                  <span className="flex items-center gap-1 text-xs text-orange-400">
                    <Flame className="w-3.5 h-3.5" />
                    {progress.streakDays}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-amber-400">
                  <Star className="w-3.5 h-3.5" />
                  {progress.xpTotal} XP
                </span>
              </div>
            )}
            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <User className="w-4 h-4" />
              <span>{user.username}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="px-4 py-2 rounded-full text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-md shadow-violet-900/40 hover:scale-105 active:scale-95"
            >
              S&apos;inscrire
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
