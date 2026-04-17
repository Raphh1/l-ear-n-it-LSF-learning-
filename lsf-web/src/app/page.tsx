'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronDown, BookOpen, Gamepad2, Search, ArrowRight, Hand, CheckCircle2, Lock, MessageSquareText } from 'lucide-react';
import { signsApi } from '@/lib/api/signs';
import { modulesApi } from '@/lib/api/modules';
import { categoriesApi } from '@/lib/api/categories';
import { dailyApi, type DailyChallenge } from '@/lib/api/daily';
import { useAuthStore } from '@/store/authStore';

// ── Animated title ────────────────────────────────────────────────────────────

const letterVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

function AnimatedText({ text, className }: { text: string; className?: string }) {
  return (
    <motion.span
      className={className}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.03 } } }}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          variants={letterVariants}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ── Steps ─────────────────────────────────────────────────────────────────────

const steps = [
  {
    num: '01',
    title: 'Choisis un module',
    desc: 'Des parcours structurés par niveau, du débutant à l\'avancé.',
    color: 'from-violet-500 to-indigo-600',
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    num: '02',
    title: 'Apprends les signes',
    desc: 'Regarde les vidéos, mémorise les gestes, avance à ton rythme.',
    color: 'from-fuchsia-500 to-violet-600',
    icon: <Hand className="w-6 h-6" />,
  },
  {
    num: '03',
    title: 'Entraîne-toi',
    desc: 'Teste tes connaissances avec des jeux interactifs et monte en niveau.',
    color: 'from-rose-500 to-fuchsia-600',
    icon: <Gamepad2 className="w-6 h-6" />,
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function HomePage() {
  const activitiesRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const [signCount, setSignCount] = useState<number | null>(null);
  const [moduleCount, setModuleCount] = useState<number | null>(null);
  const [categoryCount, setCategoryCount] = useState<number | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [isDailyLoading, setIsDailyLoading] = useState(true);

  useEffect(() => {
    // Stats
    signsApi.getAll({ page: 1, pageSize: 1 }).then(r => setSignCount(r.totalCount));
    modulesApi.getAll().then(m => setModuleCount(m.length));
    categoriesApi.getAll().then(c => setCategoryCount(c.length));

    // Défi du jour
    dailyApi.getToday()
      .then(setDailyChallenge)
      .catch(() => {})
      .finally(() => setIsDailyLoading(false));
  }, []);

  const titleLine1 = "Apprends la LSF,";
  const titleLine2 = "à ton rythme.";
  const titleDelay = (titleLine1.length + titleLine2.length) * 0.03;

  return (
    <div className="flex flex-col bg-[#0a0a1a]">

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 gap-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-700/25 blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-fuchsia-600/10 blur-[100px]" />
        </div>

        <div className="relative flex flex-col items-center gap-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium"
          >
            🤟 Langue des Signes Française
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-tight text-white">
            <AnimatedText text={titleLine1} />
            <br />
            <AnimatedText text={titleLine2} className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent" />
          </h1>

          <motion.p
            className="text-lg sm:text-xl text-white/50 max-w-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: titleDelay + 0.2, duration: 0.5 }}
          >
            Des vidéos, des modules structurés et des jeux pour apprendre la LSF efficacement — gratuitement.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: titleDelay + 0.4, duration: 0.4 }}
          >
            <Link href="/modules">
              <button className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-900/40 hover:scale-105 active:scale-95">
                Commencer <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/dictionnaire">
              <button className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white/70 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:scale-95">
                Explorer le dictionnaire
              </button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex flex-wrap gap-8 justify-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: titleDelay + 0.7, duration: 0.5 }}
          >
            {[
              { value: signCount, label: 'signes' },
              { value: moduleCount, label: 'modules' },
              { value: categoryCount, label: 'catégories' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-bold text-white">
                  {value !== null ? `${value}+` : '—'}
                </span>
                <span className="text-white/40 text-xs uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.button
          onClick={() => activitiesRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: titleDelay + 1.2 }}
        >
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </motion.button>
      </section>

      {/* ── Comment ça marche ── */}
      <section ref={activitiesRef} className="px-6 py-24 bg-[#0d0d20]">
        <div className="max-w-5xl mx-auto flex flex-col gap-14">
          <motion.div
            className="flex flex-col gap-2 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Comment ça marche ?</h2>
            <p className="text-white/40">Trois étapes simples pour progresser en LSF.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative flex flex-col gap-4 rounded-2xl border border-white/8 bg-white/3 p-7"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white`}>
                  {step.icon}
                </div>
                <div className="absolute top-5 right-5 text-4xl font-black text-white/5 select-none">{step.num}</div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-white font-semibold text-base">{step.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Défi du jour ── */}
      <section className="px-6 py-24 bg-[#0a0a1a]">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <motion.div
            className="flex flex-col gap-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Quotidien
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Défi du jour</h2>
          </motion.div>

          {isDailyLoading ? (
            <div className="h-40 rounded-2xl bg-white/5 animate-pulse" />
          ) : dailyChallenge ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative flex flex-col sm:flex-row gap-8 items-center rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 p-8 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-600/10 blur-[80px] pointer-events-none" />

              {/* Icône / image floutée */}
              <div className="relative w-full sm:w-44 aspect-square rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-white/5 border border-amber-500/15 shadow-2xl">
                {dailyChallenge.sign.thumbnailUrl ? (
                  <img
                    src={dailyChallenge.sign.thumbnailUrl}
                    alt="Défi du jour"
                    className={`w-full h-full object-cover ${dailyChallenge.alreadyPlayed ? '' : 'blur-md scale-110'}`}
                  />
                ) : (
                  <span className="text-6xl select-none">📅</span>
                )}
                {!dailyChallenge.alreadyPlayed && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl">🤟</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-5 flex-1 relative">
                <div className="flex flex-col gap-1.5">
                  <span className="text-amber-400/70 text-xs font-semibold uppercase tracking-widest">
                    {formatDate(dailyChallenge.date)}
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    {dailyChallenge.alreadyPlayed
                      ? dailyChallenge.sign.word
                      : 'Quel est ce signe ?'}
                  </h3>
                  <p className="text-white/40 text-sm">
                    {dailyChallenge.alreadyPlayed
                      ? dailyChallenge.wasCorrect
                        ? 'Tu as trouvé la bonne réponse !'
                        : 'Tu t\'es trompé aujourd\'hui.'
                      : 'Un nouveau signe chaque jour — une seule chance !'}
                  </p>
                </div>

                {dailyChallenge.alreadyPlayed ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-white/40">
                    {dailyChallenge.wasCorrect
                      ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400">Déjà réussi</span></>
                      : <><Lock className="w-4 h-4" /> Reviens demain</>
                    }
                  </div>
                ) : (
                  <Link href="/jeux/defi">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white text-sm font-semibold transition-all hover:scale-105 w-fit shadow-lg shadow-amber-900/30">
                      Relever le défi <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                )}

                {!user && (
                  <p className="text-white/25 text-xs">
                    <Link href="/login" className="text-amber-400/70 hover:text-amber-400 underline underline-offset-2">Connecte-toi</Link> pour sauvegarder ta progression.
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="h-40 rounded-2xl bg-white/5 flex items-center justify-center">
              <p className="text-white/30 text-sm">Aucun défi disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Explorer ── */}
      <section className="px-6 py-24 bg-[#0d0d20]">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <motion.div
            className="flex flex-col gap-2 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Par où commencer ?</h2>
            <p className="text-white/40">Choisis ce qui correspond à ton envie du moment.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                href: '/modules',
                icon: <BookOpen className="w-7 h-7" />,
                title: 'Modules',
                desc: 'Apprentissage structuré étape par étape, du débutant à l\'avancé.',
                gradient: 'from-violet-500 to-indigo-600',
                border: 'hover:border-violet-500/40',
              },
              {
                href: '/jeux',
                icon: <Gamepad2 className="w-7 h-7" />,
                title: 'Jeux',
                desc: 'Vitesse, mémoire, association — teste tes connaissances en t\'amusant.',
                gradient: 'from-rose-500 to-orange-400',
                border: 'hover:border-rose-500/40',
              },
              {
                href: '/modules',
                icon: <MessageSquareText className="w-7 h-7" />,
                title: 'Phrases',
                desc: 'Apprends aussi à construire des phrases en LSF, pas à pas, depuis les modules.',
                gradient: 'from-teal-500 to-emerald-500',
                border: 'hover:border-teal-500/40',
              },
              {
                href: '/dictionnaire',
                icon: <Search className="w-7 h-7" />,
                title: 'Dictionnaire',
                desc: 'Explore ou recherche n\'importe quel signe parmi toutes les catégories.',
                gradient: 'from-emerald-400 to-teal-500',
                border: 'hover:border-emerald-500/40',
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link href={card.href}>
                  <div className={`group relative flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-7 hover:bg-white/8 transition-all duration-200 hover:scale-[1.02] cursor-pointer overflow-hidden ${card.border}`}>
                    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.gradient} opacity-60`} />
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white`}>
                      {card.icon}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-white font-semibold text-base">{card.title}</h3>
                      <p className="text-white/40 text-sm leading-relaxed">{card.desc}</p>
                    </div>
                    <span className="flex items-center gap-1 text-white/30 group-hover:text-white/60 text-xs font-medium transition-colors">
                      Accéder <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="px-6 py-32 bg-[#0a0a1a]">
        <motion.div
          className="max-w-2xl mx-auto flex flex-col items-center gap-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-4xl">🤟</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Prêt à commencer ?
          </h2>
          <p className="text-white/40 text-base max-w-md">
            Rejoins la communauté et apprends la LSF dès aujourd'hui, gratuitement.
          </p>
          <Link href="/modules">
            <button className="flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-900/40 hover:scale-105 active:scale-95">
              Commencer maintenant <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </motion.div>
      </section>

    </div>
  );
}
