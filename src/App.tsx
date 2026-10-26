import React, { useEffect, useState, useMemo } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { Category, FilterState, Product } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { CategoryFilter } from './components/CategoryFilter.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductModal } from './components/ProductModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderSuccessModal } from './components/OrderSuccessModal.tsx';
import { UserOrdersModal } from './components/UserOrdersModal.tsx';
import { Footer } from './components/Footer.tsx';
import { ShoppingBag, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';
import { formatPrice } from './utils/formatters.ts';

const initialFilters: FilterState = {
  category: 'all',
  search: '',
  minPrice: 0,
  maxPrice: 50000,
  sortBy: 'featured',
  inStock: false,
};

function ShopContent() {
  const { itemCount, subtotal, setIsCartOpen, isCheckoutOpen, setIsCheckoutOpen } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<any | null>(null);

  // Fetch Categories on mount
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => {
        if (!res.ok) throw new Error('Échec du chargement des catégories');
        return res.json();
      })
      .then((data) => setCategories(data))
      .catch((err) => console.warn('Categories fetch error:', err));
  }, []);

  // Fetch Products whenever filters change
  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') {
      params.set('category', filters.category);
    }
    if (filters.search.trim()) {
      params.set('search', filters.search.trim());
    }
    if (filters.minPrice > 0) {
      params.set('minPrice', filters.minPrice.toString());
    }
    if (filters.maxPrice < 50000) {
      params.set('maxPrice', filters.maxPrice.toString());
    }
    if (filters.sortBy) {
      params.set('sortBy', filters.sortBy);
    }
    if (filters.inStock) {
      params.set('inStock', 'true');
    }

    const queryStr = params.toString() ? `?${params.toString()}` : '';

    fetch(`/api/products${queryStr}`)
      .then((res) => {
        if (!res.ok) throw new Error('Erreur lors du chargement des produits');
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error('Products fetch error:', err);
        setError('Impossible de charger les produits. Veuillez rafraîchir la page.');
        setLoading(false);
      });
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleSelectProduct = (product: Product) => {
    // Optionally fetch full product with fresh reviews
    fetch(`/api/products/${product.slug}`)
      .then((res) => (res.ok ? res.json() : product))
      .then((fullProduct) => setSelectedProduct(fullProduct))
      .catch(() => setSelectedProduct(product));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      {/* Navigation Bar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onSelectCategory={(slug) => handleFilterChange({ category: slug })}
        selectedCategory={filters.category}
      />

      {/* Hero Banner (visible on 'all' without active search) */}
      {filters.category === 'all' && !filters.search && (
        <Hero
          onExploreClick={() => {
            const el = document.getElementById('catalog-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* Main Catalog Section */}
      <main id="catalog-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {/* Section Heading & Category Filter Toolbar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-stone-200/80 pb-4">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-amber-700">
                Catalogue NovaShop
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 font-sans">
                {filters.category === 'all'
                  ? 'Tous nos produits'
                  : categories.find((c) => c.slug === filters.category)?.name || 'Sélection'}
              </h2>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Conçus avec exigence &bull; Matériaux durables
            </p>
          </div>

          <CategoryFilter
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalProductsCount={products.length}
          />
        </div>

        {/* Products Grid / Status States */}
        {error ? (
          <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-800">{error}</p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-rose-900 text-white text-xs font-medium rounded-full"
            >
              Réessayer
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-stone-200 p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-square bg-stone-100 rounded-xl"></div>
                <div className="h-3 bg-stone-100 rounded w-1/3"></div>
                <div className="h-4 bg-stone-100 rounded w-3/4"></div>
                <div className="h-3 bg-stone-100 rounded w-1/2"></div>
                <div className="pt-2 flex justify-between">
                  <div className="h-5 bg-stone-100 rounded w-1/4"></div>
                  <div className="h-5 bg-stone-100 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <Sparkles className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-stone-900 text-base">Aucun produit trouvé</h3>
              <p className="text-xs text-stone-500">
                Aucun article ne correspond exactement à vos critères de recherche actuels.
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser les filtres</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={handleSelectProduct}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Button for Mobile when scrolled */}
      {itemCount > 0 && (
        <div className="sm:hidden fixed bottom-6 right-4 z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 px-5 py-3.5 bg-stone-900 text-white rounded-full shadow-2xl active:scale-95 transition-transform"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            </div>
            <span className="font-mono font-bold text-xs">{formatPrice(subtotal)}</span>
          </button>
        </div>
      )}

      {/* Modals & Drawers */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <CartDrawer />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={handleSelectProduct}
        onSelectCategory={(slug) => handleFilterChange({ category: slug })}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(orderInfo) => setOrderSuccessData(orderInfo)}
      />

      {orderSuccessData && (
        <OrderSuccessModal
          orderInfo={orderSuccessData}
          onClose={() => setOrderSuccessData(null)}
        />
      )}

      <UserOrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
      />

      {/* Footer */}
      <Footer onSelectCategory={(slug) => handleFilterChange({ category: slug })} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ShopContent />
      </CartProvider>
    </AuthProvider>
  );
}
