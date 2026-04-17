'use client';

import { motion } from 'framer-motion';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-2xl"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-sm text-white/50">{subtitle}</p>
      </div>

      {children}

      <p className="text-center text-sm text-white/40">{footer}</p>
    </motion.div>
  );
}
