import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  X,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Category, FilterState } from '../types.ts';
import { formatPrice } from '../utils/formatters.ts';

interface CategoryFilterProps {
  categories: Category[];
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalProductsCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  filters,
  onFilterChange,
  onResetFilters,
  totalProductsCount,
}) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const sortOptions = [
    { value: 'featured', label: 'Sélection NovaShop' },
    { value: 'price-asc', label: 'Prix : Ordre croissant' },
    { value: 'price-desc', label: 'Prix : Ordre décroissant' },
    { value: 'rating', label: 'Mieux notés' },
    { value: 'newest', label: 'Nouveautés' },
  ];

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.search !== '' ||
    filters.minPrice > 0 ||
    filters.maxPrice < 50000 ||
    filters.inStock ||
    filters.sortBy !== 'featured';

  return (
    <div className="space-y-4">
      {/* Category Pills & Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => onFilterChange({ category: 'all' })}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
              filters.category === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80 hover:border-stone-300'
            }`}
          >
            Tous les produits
          </button>
          {categories.map((cat) => {
            const isActive = filters.category === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => onFilterChange({ category: cat.slug })}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80 hover:border-stone-300'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Search & Filter Toggles */}
        <div className="flex items-center gap-2">
          {/* In-page live search */}
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Filtrer par nom..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="w-full pl-9 pr-8 py-2 bg-white text-xs sm:text-sm rounded-full border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-800 placeholder-stone-400"
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange({ search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Panel Toggle */}
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium border transition cursor-pointer ${
              isFilterPanelOpen || hasActiveFilters
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtres</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            )}
          </button>

          {/* Sort selector */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              className="appearance-none bg-white text-stone-700 text-xs sm:text-sm font-medium py-2 pl-3.5 pr-8 rounded-full border border-stone-200 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400 cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {isFilterPanelOpen && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-stone-600" />
              Ajuster les critères de recherche
            </h3>
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Réinitialiser les filtres
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Price Range */}
            <div>
              <div className="flex justify-between text-xs font-medium text-stone-600 mb-2">
                <span>Budget maximum</span>
                <span className="font-semibold text-stone-900 font-mono">
                  {formatPrice(filters.maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="50000"
                step="1000"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) })}
                className="w-full accent-stone-900 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-stone-400 mt-1">
                <span>20 €</span>
                <span>250 €</span>
                <span>500 €</span>
              </div>
            </div>

            {/* Quick Price Brackets */}
            <div>
              <span className="text-xs font-medium text-stone-600 block mb-2">
                Tranches de prix rapides
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '< 50 €', max: 5000 },
                  { label: '< 150 €', max: 15000 },
                  { label: '< 250 €', max: 25000 },
                  { label: 'Tous', max: 50000 },
                ].map((bracket) => (
                  <button
                    key={bracket.label}
                    onClick={() => onFilterChange({ maxPrice: bracket.max })}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition ${
                      filters.maxPrice === bracket.max
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {bracket.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock status toggle */}
            <div>
              <span className="text-xs font-medium text-stone-600 block mb-2">
                Disponibilité
              </span>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => onFilterChange({ inStock: e.target.checked })}
                  className="rounded text-stone-900 focus:ring-stone-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-medium text-stone-700">
                  Afficher uniquement les articles en stock
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Pills Bar */}
      {hasActiveFilters && (
        <div className="flex items-center flex-wrap gap-2 pt-1 text-xs text-stone-500">
          <span className="font-medium text-stone-400">Filtres actifs :</span>
          {filters.category !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-200/80 text-stone-800">
              Catégorie : {categories.find((c) => c.slug === filters.category)?.name || filters.category}
              <button onClick={() => onFilterChange({ category: 'all' })} className="hover:text-stone-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-200/80 text-stone-800">
              Recherche : "{filters.search}"
              <button onClick={() => onFilterChange({ search: '' })} className="hover:text-stone-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.maxPrice < 50000 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-200/80 text-stone-800">
              Max : {formatPrice(filters.maxPrice)}
              <button onClick={() => onFilterChange({ maxPrice: 50000 })} className="hover:text-stone-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.inStock && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-200/80 text-stone-800">
              En stock
              <button onClick={() => onFilterChange({ inStock: false })} className="hover:text-stone-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={onResetFilters}
            className="text-amber-700 hover:underline font-semibold ml-1 cursor-pointer"
          >
            Effacer tout
          </button>
          <span className="ml-auto text-stone-400 font-mono text-[11px]">
            {totalProductsCount} produit{totalProductsCount > 1 ? 's' : ''} trouvé{totalProductsCount > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
};
