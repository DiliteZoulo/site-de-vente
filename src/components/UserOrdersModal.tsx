import React, { useEffect, useState } from 'react';
import { X, Package, Calendar, Clock, Truck, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { formatPrice, formatDate } from '../utils/formatters.ts';

interface UserOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserOrdersModal: React.FC<UserOrdersModalProps> = ({ isOpen, onClose }) => {
  const { user, getAuthHeaders } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      fetch('/api/user/orders', {
        headers: getAuthHeaders(),
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setOrders(data))
        .catch((e) => console.warn('Failed to load user orders:', e))
        .finally(() => setLoading(false));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-sans">
                Historique de mes commandes
              </h2>
              <p className="text-xs text-stone-500">
                Synchronisé avec votre compte {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4 flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-stone-400">
              <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin"></div>
              <p className="text-xs">Chargement de vos commandes...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-stone-400 space-y-2">
              <Package className="w-10 h-10 mx-auto stroke-1" />
              <p className="text-sm font-semibold text-stone-800">Aucune commande pour le moment</p>
              <p className="text-xs">Vos futurs achats apparaîtront automatiquement ici.</p>
            </div>
          ) : (
            orders.map((ord) => {
              let items: any[] = [];
              try {
                items = typeof ord.items === 'string' ? JSON.parse(ord.items) : ord.items;
              } catch {
                // fallback
              }

              return (
                <div
                  key={ord.id}
                  className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-200">
                    <div>
                      <span className="font-mono font-bold text-stone-900 text-sm">
                        {ord.orderNumber}
                      </span>
                      <span className="text-stone-400 ml-2">
                        {formatDate(ord.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px] uppercase tracking-wider">
                        {ord.status === 'confirmed' ? 'Confirmée' : ord.status}
                      </span>
                      <span className="font-mono font-bold text-stone-900 text-sm">
                        {formatPrice(ord.total)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {items.map((it: any, i: number) => (
                      <div key={i} className="flex justify-between text-stone-700">
                        <span>
                          {it.quantity}x {it.name}
                        </span>
                        <span className="font-mono font-medium">
                          {formatPrice(it.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-stone-600" />
                      Expédié par Colissimo
                    </span>
                    <span>Paiement : {ord.paymentMethod}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
