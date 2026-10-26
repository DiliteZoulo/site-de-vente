import React from 'react';
import { CheckCircle, Package, Truck, ArrowRight, Download, Share2 } from 'lucide-react';
import { formatPrice } from '../utils/formatters.ts';

interface OrderSuccessModalProps {
  orderInfo: any;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ orderInfo, onClose }) => {
  if (!orderInfo) return null;

  const order = orderInfo.order;
  let itemsList: any[] = [];
  try {
    if (order?.items) {
      itemsList = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    }
  } catch {
    // fallback
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto p-6 sm:p-8 space-y-6 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-50 duration-300">
          <CheckCircle className="w-8 h-8 stroke-[2]" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Commande Confirmée
          </span>
          <h2 className="text-2xl font-extrabold text-stone-900 font-sans pt-2">
            Merci pour votre commande !
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Nous préparons votre colis avec le plus grand soin. Un email de confirmation a été envoyé à{' '}
            <strong className="text-stone-800">{order?.customerEmail}</strong>.
          </p>
        </div>

        {/* Order tracking card */}
        <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 text-left space-y-3 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-stone-200">
            <div>
              <span className="text-stone-400 font-medium">Numéro de commande</span>
              <p className="font-mono font-bold text-stone-900 text-sm">{orderInfo.orderNumber}</p>
            </div>
            <div className="text-right">
              <span className="text-stone-400 font-medium">Montant réglé</span>
              <p className="font-mono font-bold text-emerald-700 text-sm">{formatPrice(order?.total)}</p>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-stone-400 font-medium flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-stone-600" />
              Numéro de suivi Colissimo
            </span>
            <p className="font-mono font-bold text-stone-800 text-xs">
              {orderInfo.trackingNumber}
            </p>
            <p className="text-[11px] text-stone-500">
              Délai estimé : {orderInfo.estimatedDelivery}
            </p>
          </div>

          {itemsList.length > 0 && (
            <div className="pt-2 border-t border-stone-200 space-y-2">
              <span className="text-stone-400 font-medium block">Articles commandés :</span>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {itemsList.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-stone-700">
                    <span className="truncate pr-2">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-mono font-semibold shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
          >
            <span>Retourner à la boutique</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
