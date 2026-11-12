'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, X, ChevronDown, ChevronUp, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { signsApi } from '@/lib/api/signs';
import { categoriesApi } from '@/lib/api/categories';
import { SignCard } from '@/components/signs/SignCard';
import { PageHeader } from '@/components/brand/PageHeader';
import type { Category, PagedResult, SignSummary } from '@/lib/types';

const PAGE_SIZE = 24;

function chipClass(active: boolean) {
  return `border-2 border-ink px-3 py-1 text-sm font-bold whitespace-nowrap transition-transform ${
    active ? '-rotate-1 bg-ink text-paper shadow-hard-sm' : 'bg-white hover:bg-mint'
  }`;
}

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

  const filteredCategories = categories
    .filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <PageHeader kicker="Dictionnaire" kickerClass="bg-mint" title="Tous les signes">
          Cherche un mot, survole une carte : la vidéo du signe se lance.
        </PageHeader>

        {/* Recherche */}
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Rechercher un signe..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="field py-4 pl-12 pr-12 text-lg"
          />
          {search && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 border-2 border-ink bg-white p-1 hover:bg-sun"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Catégories */}
        <div className="panel-flat flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Catégories</h2>
            <button
              onClick={() => {
                setCategoriesExpanded((v) => !v);
                if (categoriesExpanded) setCategorySearch('');
              }}
              className="btn btn-sm"
            >
              {categoriesExpanded
                ? <><ChevronUp className="h-4 w-4" /> Réduire</>
                : <><ChevronDown className="h-4 w-4" /> Tout voir</>}
            </button>
          </div>

          <div
            className="flex flex-col gap-3 overflow-hidden transition-all duration-300"
            style={{ maxHeight: categoriesExpanded ? '420px' : '44px' }}
          >
            {categoriesExpanded && (
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Trouver une catégorie..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="field py-2 pl-9 text-sm"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2 overflow-y-auto p-1 pb-2" style={{ maxHeight: categoriesExpanded ? '320px' : 'auto' }}>
              <button onClick={() => handleCategory(undefined)} className={chipClass(!categoryId)}>
                Toutes
              </button>
              {filteredCategories.map((cat) => (
                <button key={cat.id} onClick={() => handleCategory(cat.id)} className={chipClass(categoryId === cat.id)}>
                  {cat.name}
                </button>
              ))}
              {categorySearch && filteredCategories.length === 0 && (
                <span className="py-1 font-bold">Aucune catégorie trouvée.</span>
              )}
            </div>
          </div>
        </div>

        {/* Compteur */}
        {result && !isLoading && (
          <p className="font-bold">
            <span className="bg-sun px-1">{result.totalCount.toLocaleString('fr-FR')} signe{result.totalCount !== 1 ? 's' : ''}</span>
            {search && <span> pour « {search} »</span>}
            {categoryId && categories.find(c => c.id === categoryId) && (
              <span> dans {categories.find(c => c.id === categoryId)!.name}</span>
            )}
          </p>
        )}

        {/* Grille */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
          </div>
        ) : result && result.items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {result.items.map((sign) => <SignCard key={sign.id} sign={sign} />)}
            </div>

            {result.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button onClick={() => setPage(1)} disabled={page === 1} className="btn btn-sm h-11 w-11 p-0" title="Première page">
                  <ChevronsLeft className="h-5 w-5" />
                </button>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-sm h-11">
                  Précédent
                </button>
                <span className="tile h-11 bg-sun px-4">{page} / {result.totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))} disabled={page === result.totalPages} className="btn btn-sm h-11">
                  Suivant
                </button>
                <button onClick={() => setPage(result.totalPages)} disabled={page === result.totalPages} className="btn btn-sm h-11 w-11 p-0" title="Dernière page">
                  <ChevronsRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="panel py-20 text-center font-display text-2xl font-extrabold">Aucun signe trouvé.</p>
        )}
      </div>
    </div>
  );
}
