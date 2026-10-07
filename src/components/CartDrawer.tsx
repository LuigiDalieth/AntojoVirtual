import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Banknote,
  Smartphone,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import {
  CartItem,
  Neighborhood,
  NEIVA_NEIGHBORHOODS,
  formatCop,
  calculateDistanceKm,
  calculateDynamicDeliveryCop,
} from '../data/neivaData';

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  selectedNeighborhood: Neighborhood;
  deliveryAddress: string;
  discountCodeApplied: boolean;
  onClose: () => void;
  onChangeNeighborhood: (neighborhoodId: string) => void;
  onChangeAddress: (address: string) => void;
  onUpdateCartQuantity: (cartItemId: string, delta: number) => void;
  onRemoveCartItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onConfirmCheckout: (paymentMethod: 'Efectivo' | 'Transferencia Nequi / Daviplata', cashChangeFor?: number) => void;
}

const FUN_EMPTY_MESSAGES = [
  '¡Ups! Parece que no hay antojos por aquí todavía.',
  'No hay productos en tu bolsa actual. Explora las parrillas locales de Neiva.',
  'Tu carrito está esperando una Doble Smash o una Salchipapa Bambuquera.',
];

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cart,
  selectedNeighborhood,
  deliveryAddress,
  discountCodeApplied,
  onClose,
  onChangeNeighborhood,
  onChangeAddress,
  onUpdateCartQuantity,
  onRemoveCartItem,
  onClearCart,
  onConfirmCheckout,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<
    'Efectivo' | 'Transferencia Nequi / Daviplata'
  >('Efectivo');
  const [cashBillete, setCashBillete] = useState<string>('50000');
  const [emptyIndex] = useState(() =>
    Math.floor(Math.random() * FUN_EMPTY_MESSAGES.length)
  );

  if (!isOpen) return null;

  // Exact integer math for cart subtotal
  const subtotalCop = cart.reduce((acc, item) => acc + item.lineTotal, 0);

  // Determine store coordinates from first item (or default El Altico center)
  const originCoords =
    cart.length > 0
      ? cart[0].business.coords
      : { lat: 2.9279, lng: -75.2812 };

  const distanceKm = calculateDistanceKm(originCoords, selectedNeighborhood.coords);
  const deliveryFeeCop = cart.length > 0 ? calculateDynamicDeliveryCop(distanceKm) : 0;
  const serviceFeeCop = cart.length > 0 ? 1200 : 0;
  const discountCop =
    discountCodeApplied && subtotalCop >= 15000
      ? Math.round((subtotalCop * 0.1) / 100) * 100
      : 0;

  const totalCop = Math.max(
    0,
    subtotalCop + deliveryFeeCop + serviceFeeCop - discountCop
  );

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    const parsedCash =
      paymentMethod === 'Efectivo' && cashBillete
        ? parseInt(cashBillete, 10)
        : undefined;
    onConfirmCheckout(paymentMethod, parsedCash);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#1F1B18]/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Carrito de compras y checkout"
    >
      <div className="bg-[#FFFFFF] w-full max-w-lg h-full shadow-modal flex flex-col justify-between overflow-hidden border-l border-[#EFEBE6]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EFEBE6] flex items-center justify-between bg-[#FFF8F5]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#E65100]" />
            <div>
              <h2 className="font-display text-lg font-bold text-[#1F1B18]">
                Tu Pedido en Neiva
              </h2>
              <p className="text-xs text-[#5A4138]">
                Persistencia activa · Matemática exacta libre de redondeos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-xs text-[#BA1A1A] hover:underline px-2 py-1 cursor-pointer"
              >
                Vaciar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar carrito"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#5A4138] hover:bg-[#EAE1DB] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Content */}
        {cart.length === 0 ? (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F6ECE7] flex items-center justify-center text-[#A43700] mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-display text-lg font-semibold text-[#1F1B18] mb-2">
              Bolsa de antojos vacía
            </h3>
            <p className="text-sm text-[#5A4138] max-w-xs mb-6">
              {FUN_EMPTY_MESSAGES[emptyIndex]}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#E65100] text-white font-display text-sm font-semibold hover:bg-[#CD4700] transition-colors cursor-pointer"
            >
              Explorar menú artesanal
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleCheckoutSubmit}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Itemized List */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#8F7066] tracking-wide">
                  Productos personalizados ({cart.reduce((a, b) => a + b.quantity, 0)})
                </h3>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="p-4 rounded-xl bg-[#FBFBF8] border border-[#EFEBE6] space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs text-[#A43700] font-medium block">
                            {item.business.name}
                          </span>
                          <h4 className="font-display text-sm font-bold text-[#1F1B18]">
                            {item.product.name}
                          </h4>
                        </div>
                        <span className="font-display text-sm font-bold text-[#1F1B18] tabular-nums shrink-0">
                          {formatCop(item.lineTotal)}
                        </span>
                      </div>

                      {/* Breakdown of base + selected toppings */}
                      <div className="text-xs text-[#5A4138] space-y-1 pl-2 border-l-2 border-[#E3BFB2]">
                        <div className="flex justify-between tabular-nums">
                          <span>Base unitaria</span>
                          <span>{formatCop(item.product.basePrice)}</span>
                        </div>
                        {item.selectedToppings.map((st) => (
                          <div
                            key={st.topping.id}
                            className="flex justify-between text-[#1F1B18] tabular-nums"
                          >
                            <span>
                              + {st.quantity}x {st.topping.name}
                            </span>
                            <span>
                              {formatCop(st.topping.price * st.quantity)}
                            </span>
                          </div>
                        ))}
                        {item.notes && (
                          <p className="text-[#8F7066] italic pt-0.5">
                            Nota: “{item.notes}”
                          </p>
                        )}
                      </div>

                      {/* Quantity stepper & remove */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#EFEBE6]">
                        <button
                          type="button"
                          onClick={() => onRemoveCartItem(item.cartItemId)}
                          className="text-xs text-[#BA1A1A] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>

                        <div className="flex items-center gap-2 bg-white border border-[#E3BFB2] rounded-full px-2 py-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateCartQuantity(item.cartItemId, -1)}
                            aria-label="Disminuir cantidad"
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[#1F1B18] hover:bg-[#F6ECE7] cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-display text-xs font-bold w-5 text-center tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateCartQuantity(item.cartItemId, 1)}
                            disabled={item.quantity >= item.product.stock}
                            aria-label="Aumentar cantidad"
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[#E65100] disabled:opacity-30 hover:bg-[#FFDBCF]/40 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Distance & Neighborhood Selector */}
              <div className="p-4 rounded-xl bg-[#FBF2EC] border border-[#E3BFB2] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1F1B18] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#E65100]" />
                    <span>Cálculo Dinámico de Envío (Neiva)</span>
                  </span>
                  <span className="text-xs font-semibold text-[#A43700] tabular-nums">
                    {distanceKm.toFixed(1)} km desde el local
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-[#5A4138] mb-1">
                      Barrio de destino
                    </label>
                    <select
                      value={selectedNeighborhood.id}
                      onChange={(e) => onChangeNeighborhood(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E3BFB2] bg-white text-[#1F1B18] font-medium"
                    >
                      {NEIVA_NEIGHBORHOODS.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#5A4138] mb-1">
                      Dirección de entrega
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => onChangeAddress(e.target.value)}
                      placeholder="Calle / Carrera / Apto"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E3BFB2] bg-white text-[#1F1B18]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold text-[#8F7066] tracking-wide">
                  Método de pago contra entrega o transferencia
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Efectivo')}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex items-center gap-2.5 ${
                      paymentMethod === 'Efectivo'
                        ? 'bg-[#FFF8F5] border-[#E65100] text-[#1F1B18]'
                        : 'bg-[#FBFBF8] border-[#EFEBE6] text-[#5A4138]'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-[#E65100] shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block">Efectivo</span>
                      <span className="text-[11px] text-[#8F7066]">
                        Contra entrega
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMethod('Transferencia Nequi / Daviplata')
                    }
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex items-center gap-2.5 ${
                      paymentMethod === 'Transferencia Nequi / Daviplata'
                        ? 'bg-[#FFF8F5] border-[#E65100] text-[#1F1B18]'
                        : 'bg-[#FBFBF8] border-[#EFEBE6] text-[#5A4138]'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-[#E65100] shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block">
                        Transferencia
                      </span>
                      <span className="text-[11px] text-[#8F7066]">
                        Nequi / Daviplata
                      </span>
                    </div>
                  </button>
                </div>

                {paymentMethod === 'Efectivo' && (
                  <div className="pt-1">
                    <label className="block text-xs text-[#5A4138] mb-1">
                      ¿Con qué billete pagas para llevar tus vueltas exactas?
                    </label>
                    <select
                      value={cashBillete}
                      onChange={(e) => setCashBillete(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E3BFB2] bg-[#FBFBF8] text-[#1F1B18] tabular-nums"
                    >
                      <option value={String(totalCop)}>
                        Pago exacto ({formatCop(totalCop)})
                      </option>
                      <option value="50000">Billete de $50.000 COP</option>
                      <option value="100000">Billete de $100.000 COP</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Cost Breakdown Receipt */}
              <div className="p-4 rounded-xl bg-[#FBFBF8] border border-[#EFEBE6] space-y-2 text-sm">
                <div className="flex justify-between text-[#5A4138] tabular-nums">
                  <span>Subtotal productos + toppings</span>
                  <span>{formatCop(subtotalCop)}</span>
                </div>
                <div className="flex justify-between text-[#5A4138] tabular-nums">
                  <span>
                    Envío dinámico ({selectedNeighborhood.name} · {distanceKm} km)
                  </span>
                  <span>{formatCop(deliveryFeeCop)}</span>
                </div>
                <div className="flex justify-between text-[#5A4138] tabular-nums">
                  <span>Tarifa de servicio plataforma</span>
                  <span>{formatCop(serviceFeeCop)}</span>
                </div>
                {discountCop > 0 && (
                  <div className="flex justify-between text-[#2E7D32] font-medium tabular-nums">
                    <span>Descuento fidelidad reseña (10%)</span>
                    <span>- {formatCop(discountCop)}</span>
                  </div>
                )}
                <div className="pt-2.5 border-t border-[#EFEBE6] flex justify-between items-baseline">
                  <span className="font-display font-bold text-base text-[#1F1B18]">
                    Total a pagar
                  </span>
                  <span className="font-display font-bold text-xl text-[#E65100] tabular-nums">
                    {formatCop(totalCop)}
                  </span>
                </div>
              </div>
            </div>

            {/* Sticky Confirm Button */}
            <div className="p-4 sm:px-6 bg-white border-t border-[#EFEBE6]">
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#E65100] hover:bg-[#CD4700] text-white font-display font-semibold text-sm flex items-center justify-between px-6 transition-colors cursor-pointer"
              >
                <span>Confirmar pedido y asignar domiciliario</span>
                <span className="flex items-center gap-1.5 font-bold tabular-nums">
                  {formatCop(totalCop)}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
