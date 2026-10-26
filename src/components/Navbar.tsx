import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Package,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { formatPrice } from '../utils/formatters.ts';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenOrders: () => void;
  onSelectCategory: (slug: string) => void;
  selectedCategory: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenOrders,
  onSelectCategory,
  selectedCategory,
}) => {
  const { user, signInWithGoogle, signOut } = useAuth();
  const { itemCount, subtotal, setIsCartOpen } = useCart();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const categories = [
    { slug: 'all', name: 'Tous les produits' },
    { slug: 'audio-tech', name: 'Audio & Tech' },
    { slug: 'maison-deco', name: 'Maison & Déco' },
    { slug: 'mode-accessoires', name: 'Mode' },
    { slug: 'lifestyle-bien-etre', name: 'Bien-être' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      {/* Top Banner Notice */}
      <div className="bg-stone-900 text-stone-100 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Livraison offerte dès 50 € d'achat en France métropolitaine</span>
        <span className="hidden sm:inline text-stone-400">•</span>
        <span className="hidden sm:inline text-stone-300">Retours gratuits sous 30 jours</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="p-2 -ml-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
              aria-label="Menu"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectCategory('all')}
              className="text-left group cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-2xl text-stone-900 font-sans">
                  Nova<span className="text-amber-700 font-light">Shop</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-stone-900 mb-2 group-hover:scale-125 transition-transform"></span>
              </div>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest text-stone-400 font-medium -mt-1">
                L'essentiel raffiné
              </span>
            </button>
          </div>

          {/* Desktop Category Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-full transition-all cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Quick Search, User Auth, Cart */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Search Button */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-stone-500 bg-stone-100 hover:bg-stone-200/80 hover:text-stone-800 rounded-full transition border border-stone-200 cursor-pointer"
              title="Rechercher des produits (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Rechercher...</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-white border border-stone-300 rounded text-stone-400">
                ⌘K
              </kbd>
            </button>

            {/* User Account / Auth */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-stone-300 transition cursor-pointer"
                    title={user.displayName || user.email || 'Mon compte'}
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover border border-stone-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-semibold">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 text-stone-800 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-xs font-medium text-stone-400">Connecté en tant que</p>
                        <p className="text-sm font-semibold truncate text-stone-900">
                          {user.displayName || user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenOrders();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-stone-50 flex items-center gap-2.5 transition text-stone-700"
                      >
                        <Package className="w-4 h-4 text-stone-500" />
                        Mes commandes
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2.5 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-full border border-stone-200/90 transition cursor-pointer"
                  title="Connexion Google"
                >
                  <UserIcon className="w-3.5 h-3.5 text-stone-600" />
                  <span className="hidden sm:inline">Connexion</span>
                </button>
              )}
            </div>

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
              aria-label="Voir le panier"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline font-mono">
                {subtotal > 0 ? formatPrice(subtotal) : '0,00 €'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileNavOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-stone-50 px-4 pt-3 pb-5 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 px-3">
            Catégories
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => {
                  onSelectCategory(cat.slug);
                  setIsMobileNavOpen(false);
                }}
                className={`text-left px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                  selectedCategory === cat.slug
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-700 border border-stone-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {user && (
            <div className="pt-2 border-t border-stone-200">
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onOpenOrders();
                }}
                className="w-full text-left px-3.5 py-2 text-sm font-medium text-stone-700 bg-white rounded-xl border border-stone-200 flex items-center gap-2"
              >
                <Package className="w-4 h-4 text-stone-500" />
                Mes commandes
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
