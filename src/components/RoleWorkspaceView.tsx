import React from 'react';
import {
  Store,
  Bike,
  Lock,
  Power,
  PackagePlus,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import {
  BusinessStore,
  ProductItem,
  OrderRecord,
  CourierAgent,
  UserRole,
  OrderStatus,
  formatCop,
} from '../data/neivaData';

interface RoleWorkspaceModalProps {
  activeTab: 'negocio' | 'domiciliario';
  userRole: UserRole;
  businesses: BusinessStore[];
  products: ProductItem[];
  orders: OrderRecord[];
  couriers: CourierAgent[];
  onSwitchRole: (role: UserRole) => void;
  onToggleBusinessOpen: (businessId: string) => void;
  onUpdateProductStock: (productId: string, delta: number) => void;
  onAdvanceOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onReassignCourier: (orderId: string) => void;
  onBackToMarketplace: () => void;
}

export const RoleWorkspaceView: React.FC<RoleWorkspaceModalProps> = ({
  activeTab,
  userRole,
  businesses,
  products,
  orders,
  couriers,
  onSwitchRole,
  onToggleBusinessOpen,
  onUpdateProductStock,
  onAdvanceOrderStatus,
  onReassignCourier,
  onBackToMarketplace,
}) => {
  const requiredRole = activeTab === 'negocio' ? 'negocio' : 'domiciliario';
  const hasPermission = userRole === requiredRole || userRole === 'admin';

  if (!hasPermission) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-card border border-[#EFEBE6] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFDAD6] text-[#93000A] flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <span className="text-xs font-semibold text-[#BA1A1A] block">
            Control de Acceso Basado en Roles (Seguridad RBAC)
          </span>
          <h2 className="font-display text-2xl font-bold text-[#1F1B18]">
            Se requiere perfil de{' '}
            {activeTab === 'negocio' ? 'Emprendimiento / Negocio' : 'Domiciliario'}
          </h2>
          <p className="text-sm text-[#5A4138] max-w-md mx-auto">
            Tu rol actual es <strong className="text-[#1F1B18]">{userRole}</strong>.
            Por seguridad multitenant, los endpoints de gestión de inventario y rutas
            están restringidos a cuentas autorizadas.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onSwitchRole(requiredRole)}
              className="px-5 py-2.5 rounded-xl bg-[#E65100] hover:bg-[#CD4700] text-white font-display text-xs font-semibold transition-colors cursor-pointer"
            >
              Cambiar a rol “{requiredRole.toUpperCase()}” (Demo RBAC)
            </button>
            <button
              type="button"
              onClick={onBackToMarketplace}
              className="px-4 py-2.5 rounded-xl bg-[#F6ECE7] text-[#1F1B18] text-xs font-semibold hover:bg-[#EAE1DB] transition-colors cursor-pointer"
            >
              Volver al catálogo público
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'negocio') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFEBE6] pb-5">
          <div>
            <span className="text-xs font-semibold text-[#E65100] block mb-1">
              Panel de Gestión Comercial · Aislamiento Multitenant
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1B18]">
              Consola de Emprendimientos Locales
            </h1>
          </div>
          <button
            type="button"
            onClick={onBackToMarketplace}
            className="px-4 py-2 rounded-lg bg-[#FBF2EC] text-[#A43700] text-xs font-semibold hover:bg-[#FFDBCF] transition-colors cursor-pointer self-start"
          >
            Ver vitrina de clientes
          </button>
        </div>

        {/* Store Operational Status Controls */}
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold text-[#1F1B18]">
            1. Estado Operativo de Locales (Apertura / Cierre en vivo)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businesses.map((biz) => (
              <div
                key={biz.id}
                className="bg-white rounded-xl p-5 shadow-card border border-[#EFEBE6] flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Store className="w-4 h-4 text-[#A43700]" />
                    <h3 className="font-display font-bold text-base text-[#1F1B18]">
                      {biz.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[#5A4138]">{biz.schedule}</p>
                  <p className="text-xs font-medium mt-1">
                    Estado en vitrina:{' '}
                    <span
                      className={
                        biz.isOpen
                          ? 'text-[#2E7D32] font-semibold'
                          : 'text-[#616161] font-semibold'
                      }
                    >
                      {biz.isOpen ? 'Abierto al público' : 'Cerrado (Bloqueo activo)'}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleBusinessOpen(biz.id)}
                  className={`px-4 py-2.5 rounded-xl font-display text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                    biz.isOpen
                      ? 'bg-[#EEEEEE] text-[#1F1B18] hover:bg-[#E1D8D3]'
                      : 'bg-[#2E7D32] text-white hover:bg-[#186A22]'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{biz.isOpen ? 'Marcar Cerrado' : 'Abrir Local'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Stock & Concurrency Control */}
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold text-[#1F1B18]">
            2. Control de Inventario y Bloqueo de Sobreventas
          </h2>
          <div className="bg-white rounded-2xl shadow-card border border-[#EFEBE6] overflow-hidden">
            <div className="divide-y divide-[#EFEBE6]">
              {products.map((prod) => {
                const biz = businesses.find((b) => b.id === prod.businessId);
                return (
                  <div
                    key={prod.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-xs text-[#8F7066] block">
                        {biz?.name} · {prod.category}
                      </span>
                      <h3 className="font-display font-bold text-sm text-[#1F1B18]">
                        {prod.name}
                      </h3>
                      <span className="text-xs font-semibold text-[#A43700] tabular-nums">
                        Base: {formatCop(prod.basePrice)} · {prod.availableToppings.length}{' '}
                        toppings configurados
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#5A4138]">
                        Unidades disponibles:
                      </span>
                      <div className="flex items-center gap-2 bg-[#FBF2EC] border border-[#E3BFB2] rounded-lg px-3 py-1">
                        <button
                          type="button"
                          onClick={() => onUpdateProductStock(prod.id, -1)}
                          disabled={prod.stock <= 0}
                          className="text-sm font-bold px-2 text-[#1F1B18] disabled:opacity-30 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-display font-bold text-sm w-8 text-center tabular-nums text-[#1F1B18]">
                          {prod.stock}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateProductStock(prod.id, 1)}
                          className="text-sm font-bold px-2 text-[#E65100] cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Domiciliario Workspace View
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFEBE6] pb-5">
        <div>
          <span className="text-xs font-semibold text-[#2E7D32] block mb-1">
            Módulo de Rutas y Cercanía · Neiva
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1B18]">
            Central de Domiciliarios Activos
          </h1>
        </div>
        <button
          type="button"
          onClick={onBackToMarketplace}
          className="px-4 py-2 rounded-lg bg-[#FBF2EC] text-[#A43700] text-xs font-semibold hover:bg-[#FFDBCF] transition-colors cursor-pointer self-start"
        >
          Volver al catálogo
        </button>
      </div>

      {/* Active Orders Queue */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-[#1F1B18]">
          Pedidos Asignados por Proximidad ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#EFEBE6] text-sm text-[#5A4138]">
            No hay despachos activos en este momento. Crea un pedido desde la
            vitrina para observar el algoritmo de asignación por cercanía.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-2xl p-5 shadow-card border border-[#EFEBE6] space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#EFEBE6] pb-3">
                  <div>
                    <span className="text-xs font-bold text-[#E65100]">
                      Orden #{ord.id} · {ord.status}
                    </span>
                    <h3 className="font-display font-bold text-base text-[#1F1B18]">
                      Destino: {ord.deliveryNeighborhood.name}
                    </h3>
                    <p className="text-xs text-[#5A4138]">{ord.deliveryAddress}</p>
                  </div>
                  <div className="text-right tabular-nums">
                    <span className="text-xs text-[#8F7066] block">
                      Distancia ruta
                    </span>
                    <span className="font-display font-bold text-sm text-[#1F1B18]">
                      {ord.distanceKm} km
                    </span>
                  </div>
                </div>

                <div className="text-xs text-[#5A4138] space-y-1">
                  <p>
                    <strong className="text-[#1F1B18]">Domiciliario actual:</strong>{' '}
                    {ord.assignedCourier.name} ({ord.assignedCourier.plate})
                  </p>
                  <p>
                    <strong className="text-[#1F1B18]">Recaudo:</strong>{' '}
                    {formatCop(ord.totalCop)} ({ord.paymentMethod})
                  </p>
                </div>

                {ord.status !== 'Entregado' ? (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => onReassignCourier(ord.id)}
                      className="px-3 py-2 rounded-lg bg-[#FBF2EC] text-[#A43700] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#FFDBCF] cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Rechazar y Reasignar Cercano</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onAdvanceOrderStatus(
                          ord.id,
                          ord.status === 'Recibido'
                            ? 'Preparando'
                            : ord.status === 'Preparando'
                            ? 'En camino'
                            : 'Entregado'
                        )
                      }
                      className="px-4 py-2 rounded-lg bg-[#2E7D32] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#186A22] cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Actualizar Estado de Entrega</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-[#2E7D32] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Entrega finalizada con éxito</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fleet Directory */}
      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-[#1F1B18]">
          Flota Conectada en Neiva ({couriers.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {couriers.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-white border border-[#EFEBE6] space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <Bike className="w-4 h-4 text-[#E65100]" />
                <span className="text-xs font-semibold text-[#2E7D32]">
                  Disponible
                </span>
              </div>
              <h3 className="font-display font-bold text-sm text-[#1F1B18]">
                {c.name}
              </h3>
              <p className="text-xs text-[#5A4138]">
                {c.vehicle} · {c.plate}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
