import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Calendar,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { formatPrice } from '../utils/formatters.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderInfo: any) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { items, subtotal, shipping, discount, total, clearCart } = useCart();
  const { user, getAuthHeaders } = useAuth();

  // Shipping Form State
  const [formData, setFormData] = useState({
    firstName: user?.displayName ? user.displayName.split(' ')[0] : '',
    lastName: user?.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
    email: user?.email || '',
    phone: '06 12 34 56 78',
    address: '14 Rue de la Paix',
    postalCode: '75002',
    city: 'Paris',
    country: 'France',
  });

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay' | 'klarna'>('card');
  const [cardData, setCardData] = useState({
    number: '4532 •••• •••• 8912',
    name: user?.displayName || 'Alexandre Dupont',
    expiry: '12/28',
    cvv: '•••',
  });

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Shipping adjustment
  const shippingCost = shippingMethod === 'express' ? shipping + 700 : shipping;
  const finalTotal = total + (shippingMethod === 'express' ? 700 : 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.address || !formData.city || !formData.postalCode) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Secure tokenization simulation
      setProcessingStep('Chiffrement des données de paiement (SSL 256 bits)...');
      await new Promise((r) => setTimeout(r, 800));

      // Step 2: 3D Secure banking validation
      setProcessingStep('Validation 3D Secure auprès de votre banque...');
      await new Promise((r) => setTimeout(r, 1000));

      // Step 3: Record Order in PostgreSQL via API
      setProcessingStep('Création de la commande sécurisée dans PostgreSQL...');

      const fullCustomerName = `${formData.firstName} ${formData.lastName}`.trim() || 'Client NovaShop';
      const shippingAddressStr = `${formData.address}, ${formData.postalCode} ${formData.city}, ${formData.country} (Tél: ${formData.phone})`;

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          customerName: fullCustomerName,
          customerEmail: formData.email,
          shippingAddress: shippingAddressStr,
          paymentMethod:
            paymentMethod === 'card'
              ? 'Carte Bancaire Sécurisée (Visa/Mastercard)'
              : paymentMethod === 'applepay'
              ? 'Apple Pay / Paiement Express'
              : 'Klarna 3x sans frais',
          subtotal,
          shipping: shippingCost,
          discount,
          total: finalTotal,
          items: JSON.stringify(
            items.map((i) => ({
              id: i.product.id,
              name: i.product.name,
              price: i.product.price,
              quantity: i.quantity,
              imageUrl: i.product.imageUrl,
            }))
          ),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erreur lors du règlement.');
      }

      const orderData = await res.json();

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1c1917', '#d97706', '#10b981', '#f59e0b'],
        });
      } catch (e) {
        // Confetti optional
      }

      clearCart();
      onClose();
      onOrderSuccess(orderData);
    } catch (err: any) {
      setError(err.message || 'Le paiement a échoué. Veuillez vérifier vos coordonnées bancaires.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 font-sans">
                Paiement Sécurisé NovaShop
              </h2>
              <p className="text-xs text-stone-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Transaction chiffrée SSL 256 bits certifiée</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleCheckoutSubmit} className="overflow-y-auto p-5 sm:p-7 space-y-7 flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Livraison */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">
                1
              </span>
              Coordonnées de livraison
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Prénom *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Jean"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1">Nom *</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Dupont"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1">Adresse email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="jean.dupont@example.com"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1">Téléphone portable</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="06 12 34 56 78"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-400 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-stone-600 font-medium mb-1">Adresse postale *</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="14 Rue de la Paix"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1">Code postal *</label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="75002"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1">Ville *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Paris"
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Mode de Livraison */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              Mode de livraison
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                onClick={() => setShippingMethod('standard')}
                className={`p-3.5 rounded-2xl border-2 flex items-start justify-between cursor-pointer transition ${
                  shippingMethod === 'standard'
                    ? 'border-stone-900 bg-stone-50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-stone-700" />
                    Colissimo Suivi Neutre Carbone
                  </p>
                  <p className="text-stone-500 text-[11px]">Livraison à domicile sous 3 à 4 jours ouvrés</p>
                </div>
                <span className="font-mono font-bold text-stone-900">
                  {shipping === 0 ? 'Gratuit' : formatPrice(shipping)}
                </span>
              </label>

              <label
                onClick={() => setShippingMethod('express')}
                className={`p-3.5 rounded-2xl border-2 flex items-start justify-between cursor-pointer transition ${
                  shippingMethod === 'express'
                    ? 'border-stone-900 bg-stone-50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Chronopost Express 24h
                  </p>
                  <p className="text-stone-500 text-[11px]">Livraison garantie demain avant 13h</p>
                </div>
                <span className="font-mono font-bold text-stone-900">
                  {formatPrice(shipping + 700)}
                </span>
              </label>
            </div>
          </div>

          {/* Section 3: Paiement Sécurisé */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]">
                3
              </span>
              Mode de règlement sécurisé
            </h3>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border-2 text-xs font-semibold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-stone-900 bg-stone-50 text-stone-900'
                    : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Carte Bancaire</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('applepay')}
                className={`p-3 rounded-2xl border-2 text-xs font-semibold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  paymentMethod === 'applepay'
                    ? 'border-stone-900 bg-stone-50 text-stone-900'
                    : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Apple / Google Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('klarna')}
                className={`p-3 rounded-2xl border-2 text-xs font-semibold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  paymentMethod === 'klarna'
                    ? 'border-stone-900 bg-stone-50 text-stone-900'
                    : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>3x sans frais</span>
              </button>
            </div>

            {/* Credit Card inputs */}
            {paymentMethod === 'card' && (
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-stone-600 mb-1 font-medium">
                    <span>Numéro de carte</span>
                    <span className="text-[10px] text-stone-400 font-mono">CB &bull; Visa &bull; Mastercard</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 font-medium mb-1">Expiration (MM/AA)</label>
                    <input
                      type="text"
                      required
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-medium mb-1">Cryptogramme (CVV)</label>
                    <input
                      type="text"
                      required
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'applepay' && (
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-1">
                <p className="font-semibold text-stone-900">Paiement en 1 clic par Touch ID / Face ID</p>
                <p>Authentification biométrique ultra-sécurisée instantanée.</p>
              </div>
            )}

            {paymentMethod === 'klarna' && (
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-1">
                <p className="font-semibold text-stone-900">Payez en 3 mensualités sans aucun frais :</p>
                <p className="font-mono font-medium text-stone-800">
                  3 x {formatPrice(Math.round(finalTotal / 3))} (Aujourd'hui, J+30, J+60)
                </p>
              </div>
            )}
          </div>

          {/* Order Summary Recap */}
          <div className="bg-stone-100/70 p-4 rounded-2xl border border-stone-200/80 text-xs space-y-2">
            <span className="font-bold text-stone-800 uppercase tracking-wider block text-[11px]">
              Récapitulatif de la commande ({items.length} article{items.length > 1 ? 's' : ''})
            </span>
            <div className="flex justify-between text-stone-600">
              <span>Articles ({items.reduce((s, i) => s + i.quantity, 0)})</span>
              <span className="font-mono">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Code promotionnel déduit</span>
                <span className="font-mono">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Frais de port ({shippingMethod === 'express' ? 'Express 24h' : 'Colissimo'})</span>
              <span className="font-mono">{shippingCost === 0 ? 'Gratuit' : formatPrice(shippingCost)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-stone-900 pt-2 border-t border-stone-200">
              <span>Total à régler</span>
              <span className="font-mono text-base">{formatPrice(finalTotal)}</span>
            </div>
            <p className="text-[10px] text-stone-400 text-right">TVA 20% incluse dans le montant</p>
          </div>

          {/* Submit Action */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 px-6 rounded-full bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg active:scale-98 transition cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{processingStep || 'Validation sécurisée en cours...'}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Payer {formatPrice(finalTotal)} en toute sécurité</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-stone-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Garantie Satisfait ou Remboursé 30j
              </span>
              <span>&bull;</span>
              <span>PostgreSQL Transaction Sécurisée</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
