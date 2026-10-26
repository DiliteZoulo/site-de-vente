import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
} from 'lucide-react';
import { Product, Review } from '../types.ts';
import { formatPrice } from '../utils/formatters.ts';
import { useCart } from '../context/CartContext.tsx';
import { ReviewsSection } from './ReviewsSection.tsx';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Gallery images parse
  let gallery: string[] = [product.imageUrl];
  try {
    if (product.images) {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        gallery = [product.imageUrl, ...parsed];
      }
    }
  } catch {
    // fallback
  }

  const [activeImage, setActiveImage] = useState(gallery[0]);

  // Technical specs parse
  let specsObj: Record<string, string> = {};
  try {
    if (product.specs) {
      specsObj = JSON.parse(product.specs);
    }
  } catch {
    // fallback
  }

  // Reviews list
  const [reviews, setReviews] = useState<Review[]>(product.reviewsList || []);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleReviewAdded = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-stone-100 text-stone-600 hover:text-stone-900 shadow-sm border border-stone-200 transition cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Gallery Column */}
            <div className="space-y-3">
              <div className="relative aspect-square rounded-2xl bg-stone-100 overflow-hidden border border-stone-200">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />
                {product.isNew && (
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-stone-900 text-white">
                    Nouveau
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {gallery.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                        activeImage === img
                          ? 'border-stone-900 ring-2 ring-stone-900/20'
                          : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Aperçu" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Column */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-amber-700">
                  {product.categoryName || 'NovaShop Design'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1 font-sans">
                  {product.name}
                </h2>

                {/* Rating & Review Jump */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(Number(product.rating))
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-800">{product.rating}</span>
                  <span className="text-stone-300">•</span>
                  <span className="text-xs text-stone-500 font-medium">
                    {reviews.length || product.reviewCount} avis clients
                  </span>
                </div>
              </div>

              {/* Price Block */}
              <div className="flex items-baseline gap-3 pb-4 border-b border-stone-100">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-stone-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-sm font-mono text-stone-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-50 text-rose-600">
                      Économisez {formatPrice(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-stone-600 leading-relaxed">
                {product.description}
              </p>

              {/* Technical Specifications */}
              {Object.keys(specsObj).length > 0 && (
                <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200/70">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                    Caractéristiques techniques
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(specsObj).map(([key, val]) => (
                      <div key={key} className="space-y-0.5">
                        <span className="text-stone-400 font-medium">{key}</span>
                        <p className="font-semibold text-stone-800">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-stone-200 rounded-full bg-white px-2 py-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-mono font-bold text-stone-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="p-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add to cart action */}
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3.5 px-6 rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                      justAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Ajouté au panier !</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Ajouter au panier ({formatPrice(product.price * quantity)})</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Guarantees */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-stone-500 text-center">
                  <div className="flex flex-col items-center gap-1 p-2 bg-stone-50 rounded-xl">
                    <Truck className="w-3.5 h-3.5 text-stone-700" />
                    <span>Livraison 48h</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 bg-stone-50 rounded-xl">
                    <RotateCcw className="w-3.5 h-3.5 text-stone-700" />
                    <span>Retours 30j</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 bg-stone-50 rounded-xl">
                    <ShieldCheck className="w-3.5 h-3.5 text-stone-700" />
                    <span>Garantie 2 ans</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Customer Reviews Section */}
          <ReviewsSection
            productId={product.id}
            productName={product.name}
            initialRating={product.rating}
            initialReviewCount={product.reviewCount}
            reviews={reviews}
            onReviewAdded={handleReviewAdded}
          />
        </div>
      </div>
    </div>
  );
};
