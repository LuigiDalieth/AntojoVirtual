import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Bike,
  ChefHat,
  RefreshCw,
  Star,
  Gift,
  MapPin,
  Phone,
} from 'lucide-react';
import {
  OrderRecord,
  OrderStatus,
  formatCop,
  calculateDistanceKm,
} from '../data/neivaData';

interface OrderTrackingViewProps {
  order: OrderRecord;
  onAdvanceStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onSimulateCourierReject: (orderId: string) => void;
  onSubmitOrderRating: (orderId: string, stars: number, comment: string) => void;
  onBackToCatalog: () => void;
}

const STATUS_STEPS: OrderStatus[] = [
  'Recibido',
  'Preparando',
  'En camino',
  'Entregado',
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  order,
  onAdvanceStatus,
  onSimulateCourierReject,
  onSubmitOrderRating,
  onBackToCatalog,
}) => {
  const [stars, setStars] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  const currentStepIdx = STATUS_STEPS.indexOf(order.status);
  const firstBusiness = order.items[0]?.business;
  const courierDistToStore = firstBusiness
    ? calculateDistanceKm(firstBusiness.coords, order.assignedCourier.coords)
    : 0.9;

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitOrderRating(order.id, stars, comment.trim());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Status Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-card border border-[#EFEBE6] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFEBE6] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#5A4138] mb-1">
              <span>Orden #{order.id}</span>
              <span aria-hidden="true">·</span>
              <span>{order.createdAt}</span>
              <span aria-hidden="true">·</span>
              <span>{order.paymentMethod}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1B18]">
              {order.status === 'Entregado'
                ? '¡Pedido entregado en tu puerta!'
                : `Estado actual: ${order.status}`}
            </h1>
          </div>

          <button
            type="button"
            onClick={onBackToCatalog}
            className="px-4 py-2 rounded-lg bg-[#FBF2EC] text-[#A43700] text-xs font-semibold hover:bg-[#FFDBCF] transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap"
          >
            Volver al catálogo
          </button>
        </div>

        {/* 4-Step Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index <= currentStepIdx;
            const isCurrent = index === currentStepIdx;
            return (
              <div
                key={step}
                className={`p-3.5 rounded-xl border transition-colors ${
                  isCurrent
                    ? 'bg-[#FFF8F5] border-[#E65100]'
                    : isCompleted
                    ? 'bg-[#E8F5E9]/60 border-[#2E7D32]/30'
                    : 'bg-[#FBFBF8] border-[#EFEBE6] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#8F7066] tabular-nums">
                    0{index + 1}
                  </span>
                  {step === 'Recibido' && <Clock className="w-4 h-4 text-[#E65100]" />}
                  {step === 'Preparando' && <ChefHat className="w-4 h-4 text-[#E65100]" />}
                  {step === 'En camino' && <Bike className="w-4 h-4 text-[#E65100]" />}
                  {step === 'Entregado' && (
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                  )}
                </div>
                <p className="font-display text-sm font-bold text-[#1F1B18]">
                  {step}
                </p>
                <p className="text-[11px] text-[#5A4138] mt-0.5">
                  {step === 'Recibido' && 'Confirmado por el local'}
                  {step === 'Preparando' && 'En parrilla artesanal'}
                  {step === 'En camino' && 'Ruta activa en Neiva'}
                  {step === 'Entregado' && 'Disfruta tu antojo'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Interactive Simulation Controls for Testing Happy Path & Edge Cases */}
        {order.status !== 'Entregado' && (
          <div className="p-4 rounded-xl bg-[#FBF2EC] border border-[#E3BFB2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-[#5A4138]">
              <strong className="text-[#1F1B18] block font-semibold">
                Simulador de Flujo en Vivo (Pruebas E2E)
              </strong>
              Avanza el estado del pedido o prueba la bifurcación de rechazo de
              domiciliario.
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onSimulateCourierReject(order.id)}
                className="px-3.5 py-2 rounded-lg bg-white border border-[#E3BFB2] text-[#5A4138] hover:text-[#1F1B18] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#A43700]" />
                <span>Simular Rechazo de Domiciliario</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onAdvanceStatus(order.id, STATUS_STEPS[currentStepIdx + 1])
                }
                className="px-4 py-2 rounded-lg bg-[#E65100] hover:bg-[#CD4700] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                Avanzar a “{STATUS_STEPS[currentStepIdx + 1]}”
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Courier Assignment & Route Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card border border-[#EFEBE6] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#2E7D32] block">
                Asignación automática por proximidad
              </span>
              <h2 className="font-display text-lg font-bold text-[#1F1B18]">
                Domiciliario Asignado
              </h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FFF8F5] border border-[#E3BFB2] flex items-center justify-center text-[#E65100]">
              <Bike className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FBFBF8] border border-[#EFEBE6] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-base text-[#1F1B18]">
                {order.assignedCourier.name}
              </span>
              <span className="text-xs font-semibold text-[#7E5700] tabular-nums">
                ★ {order.assignedCourier.rating.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-[#5A4138]">
              Vehículo: {order.assignedCourier.vehicle} · Placa{' '}
              <strong className="text-[#1F1B18]">{order.assignedCourier.plate}</strong>
            </p>
            <div className="flex items-center gap-4 pt-2 text-xs text-[#5A4138]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#E65100]" />A{' '}
                {courierDistToStore} km del restaurante
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#2E7D32]" />
                {order.assignedCourier.phone}
              </span>
            </div>
          </div>

          {order.rejectedCourierIds.length > 0 && (
            <div className="p-3 rounded-lg bg-[#FFF8F5] border border-[#E3BFB2] text-xs text-[#5A4138]">
              <strong className="text-[#A43700] block">
                Reasignación automática ejecutada:
              </strong>
              {order.rejectedCourierIds.length} domiciliario(s) anterior(es)
              rechazaron el viaje; el servicio de rutas asignó al siguiente más
              cercano en tiempo real.
            </div>
          )}
        </div>

        {/* Receipt Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-[#EFEBE6] space-y-4">
          <h2 className="font-display text-lg font-bold text-[#1F1B18]">
            Desglose del Pedido
          </h2>
          <div className="space-y-2 text-xs text-[#5A4138] border-b border-[#EFEBE6] pb-3">
            {order.items.map((item) => (
              <div key={item.cartItemId} className="flex justify-between gap-2">
                <span>
                  <strong className="text-[#1F1B18] tabular-nums">
                    {item.quantity}x
                  </strong>{' '}
                  {item.product.name}
                  {item.selectedToppings.length > 0 &&
                    ` (+${item.selectedToppings.length} toppings)`}
                </span>
                <span className="font-semibold text-[#1F1B18] tabular-nums shrink-0">
                  {formatCop(item.lineTotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-xs text-[#5A4138] tabular-nums">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCop(order.subtotalCop)}</span>
            </div>
            <div className="flex justify-between">
              <span>
                Envío a {order.deliveryNeighborhood.name} ({order.distanceKm} km)
              </span>
              <span>{formatCop(order.deliveryFeeCop)}</span>
            </div>
            <div className="flex justify-between">
              <span>Servicio plataforma</span>
              <span>{formatCop(order.serviceFeeCop)}</span>
            </div>
            {order.discountCop > 0 && (
              <div className="flex justify-between text-[#2E7D32] font-semibold">
                <span>Descuento fidelidad</span>
                <span>- {formatCop(order.discountCop)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-[#EFEBE6] text-sm font-display font-bold text-[#1F1B18]">
              <span>Total verificado</span>
              <span className="text-[#E65100]">{formatCop(order.totalCop)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback & Retention Loopback when status === 'Entregado' */}
      {order.status === 'Entregado' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-card border border-[#E3BFB2] space-y-5">
          {order.ratingSubmitted ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#E8F5E9] p-5 rounded-xl border border-[#2E7D32]/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#186A22] font-display font-bold text-base">
                  <Gift className="w-5 h-5" />
                  <span>¡Gracias por valorar al emprendimiento local!</span>
                </div>
                <p className="text-xs text-[#1F1B18]">
                  Tu reseña de {order.ratingSubmitted.stars} estrellas ha sido
                  publicada. Hemos activado automáticamente un{' '}
                  <strong>10% de descuento</strong> para tu próximo pedido con el
                  código{' '}
                  <code className="px-2 py-0.5 rounded bg-white font-mono font-bold text-[#A43700]">
                    {order.ratingSubmitted.rewardCode}
                  </code>
                  .
                </p>
              </div>
              <button
                type="button"
                onClick={onBackToCatalog}
                className="px-5 py-2.5 rounded-xl bg-[#2E7D32] text-white font-display text-xs font-semibold hover:bg-[#186A22] transition-colors cursor-pointer shrink-0"
              >
                Usar descuento ahora
              </button>
            </div>
          ) : (
            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-[#E65100] block">
                    Retención y mejora continua
                  </span>
                  <h3 className="font-display text-xl font-bold text-[#1F1B18]">
                    Califica tu experiencia y recibe 10% OFF en tu próximo antojo
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setStars(starValue)}
                      aria-label={`Calificar con ${starValue} estrellas`}
                      className="p-1.5 rounded-lg hover:bg-[#FFF8F5] transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          starValue <= stars
                            ? 'fill-[#FFB300] text-[#FFB300]'
                            : 'text-[#E1D8D3]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A4138] mb-1">
                  ¿Qué tal estuvo el sabor, los toppings y la temperatura?
                </label>
                <input
                  type="text"
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ej. La carne smash llegó súper jugosa y el queso bien fundido..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E3BFB2] bg-[#FBFBF8] text-[#1F1B18]"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#E65100] hover:bg-[#CD4700] text-white font-display text-sm font-semibold transition-colors cursor-pointer"
              >
                Enviar valoración y desbloquear 10% OFF
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
