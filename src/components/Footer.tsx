import React, { useState } from 'react';
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  ArrowRight,
  Check,
  Sparkles,
} from 'lucide-react';

interface FooterProps {
  onSelectCategory: (slug: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-300 mt-20 border-t border-stone-800">
      {/* Guarantees Bar */}
      <div className="border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-stone-800 text-stone-200">
                <Truck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-semibold text-white text-xs sm:text-sm">Livraison Offerte</h4>
                <p className="text-[11px] text-stone-400">Dès 50 € en France métropolitaine</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-stone-800 text-stone-200">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-semibold text-white text-xs sm:text-sm">Retours sous 30 jours</h4>
                <p className="text-[11px] text-stone-400">Échanges et remboursements facilités</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-stone-800 text-stone-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-semibold text-white text-xs sm:text-sm">Paiement 100% Sécurisé</h4>
                <p className="text-[11px] text-stone-400">Chiffrement SSL 256 bits et 3D Secure</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-stone-800 text-stone-200">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-semibold text-white text-xs sm:text-sm">Service Client Dédié</h4>
                <p className="text-[11px] text-stone-400">Réponse sous 24h ouvrées</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-2xl text-white font-sans">
                Nova<span className="text-amber-500 font-light">Shop</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mb-2"></span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Boutique en ligne moderne dédiée aux objets du quotidien au design épuré,
              conçus avec exigence et matériaux durables.
            </p>
            <div className="pt-1 text-[11px] text-stone-500 font-mono">
              Propulsé par React, Node.js &amp; PostgreSQL Cloud SQL
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Catégories</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => onSelectCategory('audio-tech')}
                  className="hover:text-white transition"
                >
                  Audio &amp; High-Tech
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('maison-deco')}
                  className="hover:text-white transition"
                >
                  Maison &amp; Décoration
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('mode-accessoires')}
                  className="hover:text-white transition"
                >
                  Mode &amp; Accessoires
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('lifestyle-bien-etre')}
                  className="hover:text-white transition"
                >
                  Bien-être &amp; Quotidien
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Informations</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <span className="hover:text-white cursor-pointer transition">
                  Suivi de commande
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition">
                  Conditions de livraison
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition">
                  Politique de confidentialité
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition">
                  Mentions légales
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Le Cercle Nova
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Inscrivez-vous pour recevoir nos nouvelles collections et -10% sur votre première commande avec le code <strong className="text-amber-400 font-mono">BIENVENUE10</strong>.
            </p>

            {subscribed ? (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Merci pour votre inscription !</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="votre.email@domaine.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-white text-stone-900 rounded-xl hover:bg-stone-100 transition cursor-pointer"
                  title="S'inscrire"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-stone-800 text-xs text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} NovaShop France. Tous droits réservés.</p>
          <div className="flex gap-4">
            <span className="hover:text-stone-400 transition cursor-pointer">CGV</span>
            <span className="hover:text-stone-400 transition cursor-pointer">Cookies</span>
            <span className="hover:text-stone-400 transition cursor-pointer">Sécurité</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
