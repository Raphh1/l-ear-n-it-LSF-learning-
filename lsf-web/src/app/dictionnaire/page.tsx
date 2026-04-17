'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown, ChevronUp, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { signsApi } from '@/lib/api/signs';
import { categoriesApi } from '@/lib/api/categories';
import { SignCard } from '@/components/signs/SignCard';
import type { Category, PagedResult, SignSummary } from '@/lib/types';

const PAGE_SIZE = 24;

export default function DictionnairePage() {
  const [result, setResult] = useState<PagedResult<SignSummary> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  useEffect(() => {
    categoriesApi.getAll().then(setCategories);
  }, []);

  const fetchSigns = useCallback(() => {
    setIsLoading(true);
    signsApi.getAll({ page, pageSize: PAGE_SIZE, search: search || undefined, categoryId })
      .then(setResult)
      .finally(() => setIsLoading(false));
  }, [page, search, categoryId]);

  useEffect(() => {
    const timer = setTimeout(fetchSigns, 300);
    return () => clearTimeout(timer);
  }, [fetchSigns]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleCategory(id: number | undefined) {
    setCategoryId(id);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] px-6 py-16">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-white">Dictionnaire</h1>
          <p className="text-white/40">Explorez tous les signes de la LSF.</p>
        </motion.div>

        {/* Barre de recherche */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher un signe..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
          />
          {search && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtres catégories — accordéon avec recherche interne */}
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-medium text-sm">Catégories</h2>
            <button
              onClick={() => {
                setCategoriesExpanded((v) => !v);
                if (categoriesExpanded) setCategorySearch(''); // reset on collapse
              }}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              {categoriesExpanded
                ? <><ChevronUp className="w-3.5 h-3.5" /> Réduire</>
                : <><ChevronDown className="w-3.5 h-3.5" /> Tout voir</>
              }
            </button>
          </div>

          <div
            className="flex flex-col gap-3 overflow-hidden transition-all duration-300"
            style={{ maxHeight: categoriesExpanded ? '400px' : '45px' }}
          >
            {categoriesExpanded && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input
                  type="text"
                  placeholder="Trouver une catégorie..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2 overflow-y-auto pr-2 custom-scrollbar pb-2" style={{ maxHeight: categoriesExpanded ? '300px' : 'auto' }}>
              <button
                onClick={() => handleCategory(undefined)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  !categoryId
                    ? 'bg-violet-600 text-white shadow'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                Toutes
              </button>
              {categories
                .filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      categoryId === cat.id
                        ? 'bg-violet-600 text-white shadow'
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              {categorySearch && categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                <span className="text-xs text-white/30 italic py-1.5 flex items-center">Aucune catégorie trouvée.</span>
              )}
            </div>
          </div>
        </div>

        {/* Résultats */}
        {result && !isLoading && (
          <p className="text-white/30 text-sm -mt-2">
            {result.totalCount} signe{result.totalCount !== 1 ? 's' : ''}
            {search && <span> pour « {search} »</span>}
            {categoryId && categories.find(c => c.id === categoryId) && (
              <span> dans {categories.find(c => c.id === categoryId)!.name}</span>
            )}
          </p>
        )}

        {/* Grille */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : result && result.items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {result.items.map((sign) => (
                <SignCard key={sign.id} sign={sign} />
              ))}
            </div>

            {result.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {/* Aller à la première page */}
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Première page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Page Précédente */}
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 h-10 rounded-xl bg-white/5 border border-white/10 text-sm text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Précédent
                </button>

                {/* Info de pagination */}
                <div className="px-4 py-2 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  <span className="text-sm font-medium text-white/70">
                    <span className="text-white">{page}</span> <span className="text-white/30 mx-1">/</span> {result.totalPages}
                  </span>
                </div>

                {/* Page Suivante */}
                <button
                  onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
                  disabled={page === result.totalPages}
                  className="px-4 py-2 h-10 rounded-xl bg-white/5 border border-white/10 text-sm text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Suivant
                </button>

                {/* Aller à la dernière page */}
                <button
                  onClick={() => setPage(result.totalPages)}
                  disabled={page === result.totalPages}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Dernière page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-white/30 text-center py-20">Aucun signe trouvé.</p>
        )}

      </div>
    </div>
  );
}
