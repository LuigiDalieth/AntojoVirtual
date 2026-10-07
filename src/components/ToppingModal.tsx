import React, { useState, useMemo } from 'react';
import { X, Plus, Minus, Check, AlertCircle } from 'lucide-react';
import {
  ProductItem,
  BusinessStore,
  ToppingOption,
  SelectedTopping,
  formatCop,
} from '../data/neivaData';
import { ResilientImage } from './ResilientImage';

interface ToppingModalProps {
  product: ProductItem | null;
  business: BusinessStore | null;
  currentQuantityInCart: number;
  onClose: () => void;
  onConfirmAdd: (
    product: ProductItem,
    business: BusinessStore,
    quantity: number,
    selectedToppings: SelectedTopping[],
    notes: string
  ) => void;
}

const CATEGORY_LABELS: Record<ToppingOption['category'], string> = {
  quesos: 'Quesos Fundidos & Gratinados',
  proteinas: 'Proteínas al Barril & Parrilla',
  adicionales: 'Adicionales de la Casa',
  salsas: 'Salsas Artesanales',
};

export const ToppingModal: React.FC<ToppingModalProps> = ({
  product,
  business,
  currentQuantityInCart,
  onClose,
  onConfirmAdd,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [toppingCounts, setToppingCounts] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<string>('');

  if (!product || !business) return null;

  const remainingStock = Math.max(0, product.stock - currentQuantityInCart);

  const handleToppingChange = (topping: ToppingOption, delta: number) => {
    setToppingCounts((prev) => {
      const current = prev[topping.id] || 0;
      const next = Math.max(0, Math.min(topping.maxPortions, current + delta));
      if (next === 0) {
        const copy = { ...prev };
        delete copy[topping.id];
        return copy;
      }
      return { ...prev, [topping.id]: next };
    });
  };

  const selectedToppingsList: SelectedTopping[] = useMemo(() => {
    return product.availableToppings
      .filter((t) => (toppingCounts[t.id] || 0) > 0)
      .map((t) => ({
        topping: t,
        quantity: toppingCounts[t.id],
      }));
  }, [product.availableToppings, toppingCounts]);

  const toppingsUnitSum = useMemo(() => {
    return selectedToppingsList.reduce(
      (acc, item) => acc + item.topping.price * item.quantity,
      0
    );
  }, [selectedToppingsList]);

  const unitPriceWithToppings = product.basePrice + toppingsUnitSum;
  const totalOrderLinePrice = unitPriceWithToppings * quantity;

  const groupedToppings = useMemo(() => {
    const groups: Partial<Record<ToppingOption['category'], ToppingOption[]>> = {};
    for (const t of product.availableToppings) {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category]!.push(t);
    }
    return groups;
  }, [product.availableToppings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingStock < quantity || !business.isOpen) return;
    onConfirmAdd(product, business, quantity, selectedToppingsList, notes.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#1F1B18]/60 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
    >
      <div className="bg-[#FFFFFF] w-full max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-modal overflow-hidden flex flex-col max-h-[90vh] border border-[#EFEBE6]">
        {/* Header with image */}
        <div className="relative h-52 sm:h-60 w-full bg-[#F6ECE7] shrink-0">
          <ResilientImage
            src={product.imageUrl}
            alt={product.name}
            fallbackTitle={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar personalización"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#1F1B18]/75 text-white flex items-center justify-center hover:bg-[#1F1B18] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <p className="text-xs font-medium text-[#FFDBCF] mb-1">
              {business.name} · Prep. {product.prepTimeMinutes} min
            </p>
            <h2
              id="modal-product-title"
              className="font-display text-2xl font-bold tracking-tight text-white"
            >
              {product.name}
            </h2>
          </div>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Description & Base Price */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFEBE6]">
              <p className="text-sm text-[#5A4138] leading-relaxed">
                {product.description}
              </p>
              <div className="shrink-0 sm:text-right">
                <span className="text-xs text-[#8F7066] block">Precio base</span>
                <span className="font-display text-xl font-bold text-[#1F1B18] tabular-nums">
                  {formatCop(product.basePrice)}
                </span>
              </div>
            </div>

            {/* Stock Concurrency Notice */}
            {remainingStock <= 3 && remainingStock > 0 && (
              <div className="flex items-center gap-2 text-xs text-[#7E5700] bg-[#FFDEAC]/50 px-3.5 py-2.5 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#7E5700]" />
                <span>
                  Control de inventario en tiempo real: quedan solo{' '}
                  <strong className="font-semibold tabular-nums">{remainingStock}</strong>{' '}
                  unidades disponibles para este turno.
                </span>
              </div>
            )}

            {/* Toppings Customization Sections */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-semibold text-[#1F1B18]">
                    Personaliza tus Toppings Artesanales
                  </h3>
                  <p className="text-xs text-[#5A4138]">
                    Adiciona ingredientes al gusto; el valor se calcula al instante
                  </p>
                </div>
                {toppingsUnitSum > 0 && (
                  <span className="text-xs font-semibold text-[#E65100] tabular-nums">
                    + {formatCop(toppingsUnitSum)} por unidad
                  </span>
                )}
              </div>

              {(Object.keys(groupedToppings) as ToppingOption['category'][]).map(
                (categoryKey) => {
                  const items = groupedToppings[categoryKey] || [];
                  return (
                    <div key={categoryKey} className="space-y-2.5">
                      <h4 className="text-xs font-semibold text-[#8F7066] tracking-wide">
                        {CATEGORY_LABELS[categoryKey]}
                      </h4>
                      <div className="divide-y divide-[#EFEBE6] border border-[#EFEBE6] rounded-xl bg-[#FBFBF8]">
                        {items.map((topping) => {
                          const count = toppingCounts[topping.id] || 0;
                          const isSelected = count > 0;
                          return (
                            <div
                              key={topping.id}
                              className={`flex items-center justify-between p-3.5 transition-colors ${
                                isSelected ? 'bg-[#FFF8F5]' : ''
                              }`}
                            >
                              <div className="pr-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-[#1F1B18]">
                                    {topping.name}
                                  </span>
                                  {!topping.available && (
                                    <span className="text-xs text-[#BA1A1A] font-medium">
                                      · Agotado
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs font-semibold text-[#A43700] tabular-nums">
                                  + {formatCop(topping.price)} COP
                                </span>
                              </div>

                              {/* Additive portion stepper */}
                              {topping.available ? (
                                <div className="flex items-center gap-2 bg-white border border-[#E3BFB2] rounded-full px-2 py-1">
                                  <button
                                    type="button"
                                    onClick={() => handleToppingChange(topping, -1)}
                                    disabled={count === 0}
                                    aria-label={`Quitar ${topping.name}`}
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#1F1B18] disabled:opacity-30 hover:bg-[#F6ECE7] transition-colors cursor-pointer"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="font-display text-sm font-semibold w-5 text-center tabular-nums text-[#1F1B18]">
                                    {count}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleToppingChange(topping, 1)}
                                    disabled={count >= topping.maxPortions}
                                    aria-label={`Agregar ${topping.name}`}
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#E65100] disabled:opacity-30 hover:bg-[#FFDBCF]/50 transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-[#8F7066]">No disponible</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* Kitchen notes */}
            <div>
              <label
                htmlFor="kitchen-notes"
                className="block text-xs font-semibold text-[#5A4138] mb-1.5"
              >
                Notas para la cocina (opcional)
              </label>
              <input
                id="kitchen-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Carne tres cuartos, salsas aparte, sin cebolla..."
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#E3BFB2] bg-[#FBFBF8] text-[#1F1B18] placeholder:text-[#8F7066] focus:outline-none focus:border-[#E65100]"
              />
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="p-4 sm:px-6 bg-[#FFFFFF] border-t border-[#EFEBE6] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            {/* Product Quantity Stepper */}
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <span className="text-xs font-medium text-[#5A4138] sm:hidden">
                Cantidad:
              </span>
              <div className="flex items-center gap-3 bg-[#FBF2EC] border border-[#E3BFB2] rounded-full px-3 py-1.5">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Disminuir cantidad"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#1F1B18] disabled:opacity-30 hover:bg-white transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-display text-base font-bold w-6 text-center tabular-nums text-[#1F1B18]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(remainingStock, q + 1))}
                  disabled={quantity >= remainingStock}
                  aria-label="Aumentar cantidad"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#1F1B18] disabled:opacity-30 hover:bg-white transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Primary Add CTA */}
            <button
              type="submit"
              disabled={remainingStock === 0 || !business.isOpen}
              className="flex-1 h-12 px-6 rounded-xl bg-[#E65100] hover:bg-[#CD4700] disabled:bg-[#E1D8D3] disabled:text-[#8F7066] text-white font-display font-semibold text-sm flex items-center justify-between transition-colors cursor-pointer whitespace-nowrap"
            >
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Agregar al pedido</span>
              </span>
              <span className="tabular-nums font-bold text-base">
                {formatCop(totalOrderLinePrice)}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
