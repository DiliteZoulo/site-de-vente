import React, { useEffect, useState, useRef } from 'react';
import { Search, X, Star, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types.ts';
import { formatPrice } from '../utils/formatters.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (categorySlug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onSelectCategory,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const filteredProducts = trimmed
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          p.description.toLowerCase().includes(trimmed) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(trimmed)) ||
          (p.tags && p.tags.toLowerCase().includes(trimmed))
      )
    : products.slice(0, 4); // show top 4 featured if empty

  const trendingTags = ['Casque ANC', 'Travertin', 'Sac à dos', 'Gourde', 'Cuir', 'Enceinte'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-stone-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher un produit, une matière, un usage..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition"
          >
            Échap
          </button>
        </div>

        {/* Trending tags */}
        <div className="px-5 py-2.5 bg-stone-50/70 border-b border-stone-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-stone-400 font-medium whitespace-nowrap flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Tendances :
          </span>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 transition whitespace-nowrap text-[11px]"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 px-2">
            {trimmed ? `Résultats (${filteredProducts.length})` : 'Suggestions du moment'}
          </p>

          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400 space-y-2">
              <p>Aucun produit ne correspond à "{query}".</p>
              <p className="text-[11px]">Essayez avec un terme plus générique comme "Audio", "Maison" ou "Cuir".</p>
            </div>
          ) : (
            filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => {
                  onSelectProduct(prod);
                  onClose();
                }}
                className="group flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-stone-100/80 transition cursor-pointer"
              >
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-14 h-14 rounded-xl object-cover bg-stone-100 border border-stone-200 group-hover:scale-105 transition-transform"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                      {prod.categoryName || 'NovaShop'}
                    </span>
                    <span className="flex items-center gap-0.5 text-[11px] text-stone-600 font-medium">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {prod.rating}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-semibold text-stone-900 truncate group-hover:text-amber-800 transition-colors">
                    {prod.name}
                  </h4>

                  <p className="text-[11px] text-stone-500 truncate">
                    {prod.description}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-xs sm:text-sm text-stone-900 block">
                    {formatPrice(prod.price)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    En stock
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-stone-700 group-hover:translate-x-0.5 transition-all" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
