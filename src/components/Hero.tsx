import React from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  return (
    <section className="relative overflow-hidden bg-stone-100/60 border-b border-stone-200/60 py-16 sm:py-24">
      {/* Decorative background grid and soft radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none"></div>
      <div className="absolute -top-24 right-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-200/90 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Collection Intemporelle &bull; Saison 2026</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.1] font-sans">
            L'excellence du design,{' '}
            <span className="font-serif italic font-normal text-stone-600">
              l'épure au quotidien.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-stone-600 leading-relaxed font-normal">
            NovaShop sélectionne pour vous des objets singuliers alliant technologie de pointe,
            matières nobles et esthétique minimaliste. Pensés pour durer, conçus pour inspirer.
          </p>

          {/* CTA */}
          <div className="mt-10 flex items-center gap-4">
            <button
              onClick={onExploreClick}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 transition shadow-md active:scale-95 cursor-pointer"
            >
              <span>Découvrir la sélection</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </button>
            <span className="text-xs text-stone-400 font-medium">
              +50 références en stock
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
