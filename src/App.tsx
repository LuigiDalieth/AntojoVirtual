import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ShoppingBag,
  User,
  MapPin,
  Clock,
  Plus,
  Lock,
  ArrowRight,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import {
  UserProfile,
  UserRole,
  BusinessStore,
  ProductItem,
  CartItem,
  SelectedTopping,
  OrderRecord,
  OrderStatus,
  NEIVA_NEIGHBORHOODS,
  INITIAL_BUSINESSES,
  INITIAL_PRODUCTS,
  INITIAL_COURIERS,
  formatCop,
  calculateDistanceKm,
  calculateDynamicDeliveryCop,
  assignClosestCourier,
} from './data/neivaData';
import { ResilientImage } from './components/ResilientImage';
import { ToppingModal } from './components/ToppingModal';
import { AuthWallModal } from './components/AuthWallModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderTrackingView } from './components/OrderTrackingView';
import { RoleWorkspaceView } from './components/RoleWorkspaceView';

const STORAGE_KEYS = {
  USER: 'antojo_virtual_user_v1',
  CART: 'antojo_virtual_cart_v1',
  BUSINESSES: 'antojo_virtual_businesses_v1',
  PRODUCTS: 'antojo_virtual_products_v1',
  ORDERS: 'antojo_virtual_orders_v1',
  DISCOUNT: 'antojo_virtual_discount_v1',
};

type ActiveView = 'explorar' | 'locales' | 'seguimiento' | 'negocio' | 'domiciliario';

const CATEGORIES: Array<'Todas' | ProductItem['category']> = [
  'Todas',
  'Hamburguesas',
  'Salchipapas',
  'Arepas',
  'Alitas',
  'Perros',
];

const EMPTY_CATALOG_MESSAGES = [
  '¡Ups! Parece que no hay antojos por aquí con esos filtros.',
  'No hay productos que coincidan con tu búsqueda actual en Neiva.',
  'Todavía no encontramos ese antojo. Prueba seleccionando otra categoría o local.',
];

export default function App() {
  // Persistent State initialization
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [businesses, setBusinesses] = useState<BusinessStore[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUSINESSES);
      return saved ? JSON.parse(saved) : INITIAL_BUSINESSES;
    } catch {
      return INITIAL_BUSINESSES;
    }
  });

  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [discountUnlocked, setDiscountUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.DISCOUNT) === 'true';
    } catch {
      return false;
    }
  });

  // Navigation & Filters
  const [activeView, setActiveView] = useState<ActiveView>('explorar');
  const [selectedCategory, setSelectedCategory] = useState<'Todas' | ProductItem['category']>('Todas');
  const [selectedBusinessFilter, setSelectedBusinessFilter] = useState<string>('todos');
  const [onlyOpenFilter, setOnlyOpenFilter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string>(
    user?.neighborhoodId || 'quirinal'
  );
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    user?.addressDetails || 'Calle 21 # 5A-34, El Quirinal'
  );

  // Modals & Pending Actions (Login Wall)
  const [customizingProduct, setCustomizingProduct] = useState<ProductItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [pendingCartAddition, setPendingCartAddition] = useState<{
    product: ProductItem;
    business: BusinessStore;
    quantity: number;
    selectedToppings: SelectedTopping[];
    notes: string;
  } | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch {
      // Ignore storage quota issues
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
    } catch {
      // Ignore
    }
  }, [businesses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch {
      // Ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {
      // Ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DISCOUNT, String(discountUnlocked));
    } catch {
      // Ignore
    }
  }, [discountUnlocked]);

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => {
      setToastNotification((prev) => (prev === msg ? null : prev));
    }, 3600);
  };

  const selectedNeighborhood = useMemo(() => {
    return (
      NEIVA_NEIGHBORHOODS.find((n) => n.id === selectedNeighborhoodId) ||
      NEIVA_NEIGHBORHOODS[0]
    );
  }, [selectedNeighborhoodId]);

  // Calculate how many units of a given product are already in the cart
  const getProductQuantityInCart = (productId: string): number => {
    return cart
      .filter((item) => item.product.id === productId)
      .reduce((acc, item) => acc + item.quantity, 0);
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const biz = businesses.find((b) => b.id === prod.businessId);
      if (!biz) return false;
      if (onlyOpenFilter && !biz.isOpen) return false;
      if (selectedBusinessFilter !== 'todos' && prod.businessId !== selectedBusinessFilter) {
        return false;
      }
      if (selectedCategory !== 'Todas' && prod.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = prod.name.toLowerCase().includes(q);
        const matchDesc = prod.description.toLowerCase().includes(q);
        const matchBiz = biz.name.toLowerCase().includes(q);
        return matchName || matchDesc || matchBiz;
      }
      return true;
    });
  }, [
    products,
    businesses,
    onlyOpenFilter,
    selectedBusinessFilter,
    selectedCategory,
    searchQuery,
  ]);

  // Execute adding item to cart (after auth verification)
  const commitItemToCart = (
    product: ProductItem,
    business: BusinessStore,
    quantity: number,
    selectedToppings: SelectedTopping[],
    notes: string
  ) => {
    const toppingsUnitSum = selectedToppings.reduce(
      (sum, t) => sum + t.topping.price * t.quantity,
      0
    );
    const unitPriceWithToppings = product.basePrice + toppingsUnitSum;
    const lineTotal = unitPriceWithToppings * quantity;

    const newItem: CartItem = {
      cartItemId: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      product,
      business,
      quantity,
      selectedToppings,
      notes,
      unitPriceWithToppings,
      lineTotal,
    };

    setCart((prev) => [...prev, newItem]);
    setCustomizingProduct(null);
    showToast(`Agregado: ${quantity}x ${product.name} (${formatCop(lineTotal)})`);
  };

  // Handler when user confirms toppings inside ToppingModal
  const handleConfirmToppings = (
    product: ProductItem,
    business: BusinessStore,
    quantity: number,
    selectedToppings: SelectedTopping[],
    notes: string
  ) => {
    // Login Wall: If user is not logged in, intercept and store pending item
    if (!user) {
      setPendingCartAddition({
        product,
        business,
        quantity,
        selectedToppings,
        notes,
      });
      setCustomizingProduct(null);
      setIsAuthModalOpen(true);
      return;
    }

    commitItemToCart(product, business, quantity, selectedToppings, notes);
  };

  // Handler when user completes Login/Registration in AuthWallModal
  const handleSuccessAuth = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setSelectedNeighborhoodId(authenticatedUser.neighborhoodId);
    setDeliveryAddress(authenticatedUser.addressDetails);
    setIsAuthModalOpen(false);

    if (pendingCartAddition) {
      commitItemToCart(
        pendingCartAddition.product,
        pendingCartAddition.business,
        pendingCartAddition.quantity,
        pendingCartAddition.selectedToppings,
        pendingCartAddition.notes
      );
      setPendingCartAddition(null);
      setIsCartOpen(true);
    } else {
      showToast(`Bienvenido(a), ${authenticatedUser.name}`);
    }
  };

  // Cart item quantity update with stock concurrency validation
  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId !== cartItemId) return item;
          const currentProduct =
            products.find((p) => p.id === item.product.id) || item.product;
          const nextQty = item.quantity + delta;
          if (nextQty <= 0) return null;
          if (nextQty > currentProduct.stock) {
            showToast(`Stock máximo alcanzado (${currentProduct.stock} disp.)`);
            return item;
          }
          return {
            ...item,
            quantity: nextQty,
            lineTotal: item.unitPriceWithToppings * nextQty,
          };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Checkout & Automatic Proximity Courier Assignment
  const handleConfirmCheckout = (
    paymentMethod: 'Efectivo' | 'Transferencia Nequi / Daviplata',
    cashChangeFor?: number
  ) => {
    if (!user) {
      setIsCartOpen(false);
      setIsAuthModalOpen(true);
      return;
    }

    if (cart.length === 0) return;

    // Deduct stock atomically to prevent overselling
    setProducts((prevProducts) =>
      prevProducts.map((prod) => {
        const orderedQty = cart
          .filter((ci) => ci.product.id === prod.id)
          .reduce((sum, ci) => sum + ci.quantity, 0);
        if (orderedQty === 0) return prod;
        return {
          ...prod,
          stock: Math.max(0, prod.stock - orderedQty),
        };
      })
    );

    const subtotalCop = cart.reduce((sum, item) => sum + item.lineTotal, 0);
    const originCoords = cart[0].business.coords;
    const distanceKm = calculateDistanceKm(originCoords, selectedNeighborhood.coords);
    const deliveryFeeCop = calculateDynamicDeliveryCop(distanceKm);
    const serviceFeeCop = 1200;
    const discountCop =
      discountUnlocked && subtotalCop >= 15000
        ? Math.round((subtotalCop * 0.1) / 100) * 100
        : 0;
    const totalCop = Math.max(
      0,
      subtotalCop + deliveryFeeCop + serviceFeeCop - discountCop
    );

    const { courier } = assignClosestCourier(originCoords, INITIAL_COURIERS, []);

    const newOrder: OrderRecord = {
      id: `AV-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      customerName: user.name,
      customerPhone: user.phone,
      deliveryNeighborhood: selectedNeighborhood,
      deliveryAddress,
      items: [...cart],
      subtotalCop,
      serviceFeeCop,
      deliveryFeeCop,
      discountCop,
      totalCop,
      distanceKm,
      paymentMethod,
      cashChangeFor,
      status: 'Recibido',
      assignedCourier: courier,
      rejectedCourierIds: [],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    if (discountCop > 0) setDiscountUnlocked(false);
    setIsCartOpen(false);
    setActiveView('seguimiento');
    showToast(
      `Pedido #${newOrder.id} confirmado · Domiciliario asignado: ${courier.name}`
    );
  };

  // Order Status & Courier Reassignment Handlers
  const handleAdvanceOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    showToast(`Estado actualizado a: ${nextStatus}`);
  };

  const handleSimulateCourierReject = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const updatedRejected = [...o.rejectedCourierIds, o.assignedCourier.id];
        const storeCoords =
          o.items[0]?.business.coords || { lat: 2.9279, lng: -75.2812 };
        const { courier: nextClosest } = assignClosestCourier(
          storeCoords,
          INITIAL_COURIERS,
          updatedRejected
        );
        showToast(
          `Viaje reasignado por cercanía a: ${nextClosest.name} (${nextClosest.plate})`
        );
        return {
          ...o,
          assignedCourier: nextClosest,
          rejectedCourierIds: updatedRejected,
        };
      })
    );
  };

  const handleSubmitOrderRating = (
    orderId: string,
    stars: number,
    comment: string
  ) => {
    const rewardCode = 'OPITA10';
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              ratingSubmitted: { stars, comment, rewardCode },
            }
          : o
      )
    );
    setDiscountUnlocked(true);
    showToast('¡Valoración enviada! Tienes 10% OFF en tu próximo pedido.');
  };

  // Business Admin Handlers
  const handleToggleBusinessOpen = (businessId: string) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === businessId ? { ...b, isOpen: !b.isOpen } : b))
    );
  };

  const handleUpdateProductStock = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      )
    );
  };

  const handleSwitchRole = (role: UserRole) => {
    if (!user) {
      setUser({
        id: 'usr-demo-rbac',
        name: 'Administrador Local Neiva',
        email: 'admin@antojovirtual.co',
        phone: '315 800 1122',
        role,
        neighborhoodId: selectedNeighborhoodId,
        addressDetails: deliveryAddress,
      });
    } else {
      setUser({ ...user, role });
    }
    showToast(`Rol RBAC activo: ${role.toUpperCase()}`);
  };

  const totalCartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartCop = cart.reduce((acc, item) => acc + item.lineTotal, 0);
  const activeOrder = orders[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF8] text-[#1F1B18]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#FBFBF8]/95 backdrop-blur-md border-b border-[#EFEBE6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#explorar"
            onClick={(e) => {
              e.preventDefault();
              setActiveView('explorar');
            }}
            className="font-display text-xl font-bold tracking-tight text-[#E65100] whitespace-nowrap shrink-0"
          >
            Antojo Virtual
          </a>

          {/* Zone 2: 5 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#5A4138]">
            <button
              type="button"
              onClick={() => setActiveView('explorar')}
              className={`hover:text-[#1F1B18] transition-colors cursor-pointer whitespace-nowrap py-1 ${
                activeView === 'explorar'
                  ? 'text-[#1F1B18] font-semibold underline decoration-[#E65100] decoration-2 underline-offset-8'
                  : ''
              }`}
            >
              Catálogo
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('locales');
              }}
              className={`hover:text-[#1F1B18] transition-colors cursor-pointer whitespace-nowrap py-1 ${
                activeView === 'locales'
                  ? 'text-[#1F1B18] font-semibold underline decoration-[#E65100] decoration-2 underline-offset-8'
                  : ''
              }`}
            >
              Emprendimientos
            </button>
            <button
              type="button"
              onClick={() => setActiveView('seguimiento')}
              className={`hover:text-[#1F1B18] transition-colors cursor-pointer whitespace-nowrap py-1 ${
                activeView === 'seguimiento'
                  ? 'text-[#1F1B18] font-semibold underline decoration-[#E65100] decoration-2 underline-offset-8'
                  : ''
              }`}
            >
              Seguimiento{orders.length > 0 ? ` (${orders.length})` : ''}
            </button>
            <button
              type="button"
              onClick={() => setActiveView('negocio')}
              className={`hover:text-[#1F1B18] transition-colors cursor-pointer whitespace-nowrap py-1 ${
                activeView === 'negocio'
                  ? 'text-[#1F1B18] font-semibold underline decoration-[#E65100] decoration-2 underline-offset-8'
                  : ''
              }`}
            >
              Consola Local
            </button>
            <button
              type="button"
              onClick={() => setActiveView('domiciliario')}
              className={`hover:text-[#1F1B18] transition-colors cursor-pointer whitespace-nowrap py-1 ${
                activeView === 'domiciliario'
                  ? 'text-[#1F1B18] font-semibold underline decoration-[#E65100] decoration-2 underline-offset-8'
                  : ''
              }`}
            >
              Domiciliarios
            </button>
          </nav>

          {/* Zone 3: 2 Primary Actions (Account + Cart) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {user ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-[#1F1B18] bg-[#F6ECE7] hover:bg-[#EAE1DB] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <User className="w-3.5 h-3.5 text-[#A43700]" />
                  <span className="max-w-[110px] truncate">{user.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUser(null);
                    showToast('Sesión cerrada. Modo invitado activo.');
                  }}
                  aria-label="Cerrar sesión"
                  className="p-2 rounded-lg text-[#5A4138] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#A43700] bg-[#E65100]/10 hover:bg-[#E65100]/15 transition-colors cursor-pointer whitespace-nowrap"
              >
                Ingresar
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#E65100] hover:bg-[#CD4700] text-white font-display text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Carrito</span>
              <span className="tabular-nums font-bold">
                ({totalCartItemsCount})
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Secondary Tab Bar */}
        <div className="flex md:hidden items-center justify-around border-t border-[#EFEBE6] bg-[#FFF8F5] px-2 py-1.5 text-xs font-medium text-[#5A4138] overflow-x-auto">
          {(
            [
              { id: 'explorar', label: 'Catálogo' },
              { id: 'locales', label: 'Locales' },
              { id: 'seguimiento', label: 'Pedido' },
              { id: 'negocio', label: 'Negocio' },
              { id: 'domiciliario', label: 'Rutas' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveView(t.id)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap cursor-pointer ${
                activeView === t.id
                  ? 'text-[#E65100] font-bold bg-[#FFDBCF]/40'
                  : ''
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 bg-[#1F1B18] text-[#F8EFEA] px-4 py-3 rounded-xl shadow-modal border border-[#5A4138] flex items-center gap-2.5 text-xs font-medium max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-[#FFB300] shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Main Content Switcher */}
      <main className="flex-1">
        {activeView === 'seguimiento' && (
          <div>
            {activeOrder ? (
              <OrderTrackingView
                order={activeOrder}
                onAdvanceStatus={handleAdvanceOrderStatus}
                onSimulateCourierReject={handleSimulateCourierReject}
                onSubmitOrderRating={handleSubmitOrderRating}
                onBackToCatalog={() => setActiveView('explorar')}
              />
            ) : (
              <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
                <h2 className="font-display text-2xl font-bold text-[#1F1B18]">
                  Aún no tienes pedidos en curso
                </h2>
                <p className="text-sm text-[#5A4138]">
                  Personaliza tu hamburguesa, salchipapa o arepa rellena con
                  toppings artesanales y sigue aquí cada estado en tiempo real.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveView('explorar')}
                  className="px-6 py-3 rounded-xl bg-[#E65100] text-white font-display text-sm font-semibold hover:bg-[#CD4700] transition-colors cursor-pointer"
                >
                  Ir al catálogo de Neiva
                </button>
              </div>
            )}
          </div>
        )}

        {(activeView === 'negocio' || activeView === 'domiciliario') && (
          <RoleWorkspaceView
            activeTab={activeView}
            userRole={user?.role || 'invitado'}
            businesses={businesses}
            products={products}
            orders={orders}
            couriers={INITIAL_COURIERS}
            onSwitchRole={handleSwitchRole}
            onToggleBusinessOpen={handleToggleBusinessOpen}
            onUpdateProductStock={handleUpdateProductStock}
            onAdvanceOrderStatus={handleAdvanceOrderStatus}
            onReassignCourier={handleSimulateCourierReject}
            onBackToMarketplace={() => setActiveView('explorar')}
          />
        )}

        {(activeView === 'explorar' || activeView === 'locales') && (
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12">
            {/* Section 1: Storefront Hero */}
            {activeView === 'explorar' && (
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FFF8F5] rounded-2xl p-6 sm:p-10 border border-[#EFEBE6] shadow-card">
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#A43700]">
                    <span>Gastronomía Local de Neiva</span>
                    <span aria-hidden="true">·</span>
                    <span>Personalización Exacta de Toppings</span>
                    <span aria-hidden="true">·</span>
                    <span>Envío Dinámico por Barrio</span>
                  </div>

                  <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#1F1B18] tracking-tight leading-[1.12] text-balance">
                    El sabor artesanal de los emprendimientos opitas, directo a tu
                    mesa.
                  </h1>

                  <p className="text-base sm:text-lg text-[#5A4138] max-w-xl leading-relaxed">
                    Explora los menús de las mejores parrillas y cocinas ocultas de
                    Neiva. Arma tu pedido con ingredientes adicionales al gusto y
                    paga contra entrega o por transferencia sin costos ocultos.
                  </p>

                  {/* Search & Neighborhood Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-[#8F7066] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar smash burger, salchipapa, arepa o local..."
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-[#E3BFB2] text-sm text-[#1F1B18] placeholder:text-[#8F7066] focus:outline-none focus:border-[#E65100]"
                      />
                    </div>

                    <div className="flex items-center gap-2 bg-white border border-[#E3BFB2] rounded-xl px-3.5 h-12 shrink-0">
                      <MapPin className="w-4 h-4 text-[#E65100] shrink-0" />
                      <div className="text-left">
                        <span className="block text-[10px] text-[#8F7066] leading-none">
                          Tu barrio en Neiva
                        </span>
                        <select
                          aria-label="Seleccionar barrio en Neiva"
                          value={selectedNeighborhoodId}
                          onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
                          className="text-xs font-semibold text-[#1F1B18] bg-transparent focus:outline-none cursor-pointer"
                        >
                          {NEIVA_NEIGHBORHOODS.map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {discountUnlocked && (
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#2E7D32] bg-[#E8F5E9] px-3.5 py-2 rounded-lg">
                      <span>
                        ★ Tienes activo un 10% de descuento por valorar tu pedido
                        anterior.
                      </span>
                    </div>
                  )}
                </div>

                {/* Hero Featured Visual Card */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-2xl overflow-hidden aspect-16/10 sm:aspect-16/9 lg:aspect-4/3 shadow-card border border-[#EFEBE6] bg-[#F6ECE7]">
                    <ResilientImage
                      src="/src/assets/images/hero_burger_neiva_1791402193370.jpg"
                      alt="Doble Smash Tatacoa recién salida de la parrilla"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white flex items-end justify-between gap-3">
                      <div>
                        <span className="text-xs font-medium text-[#FFDBCF] block">
                          La Brasa Opita Burger Lab · El Altico
                        </span>
                        <p className="font-display text-lg font-bold">
                          Doble Smash Tatacoa
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const p = products.find((item) => item.id === 'prod-1');
                          if (p) setCustomizingProduct(p);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#E65100] hover:bg-[#CD4700] text-white font-display text-xs font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                      >
                        Personalizar · {formatCop(24500)}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Section 2: Emprendimientos Locales (Businesses Showcase with Open/Closed states) */}
            <section className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#1F1B18]">
                    Emprendimientos Gastronómicos en Neiva
                  </h2>
                  <p className="text-sm text-[#5A4138]">
                    Selecciona un local para filtrar su menú o verifica su horario
                    de atención en tiempo real
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#5A4138] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={onlyOpenFilter}
                      onChange={(e) => setOnlyOpenFilter(e.target.checked)}
                      className="rounded border-[#E3BFB2] text-[#E65100] focus:ring-[#E65100]"
                    />
                    <span>Mostrar solo abiertos ahora</span>
                  </label>

                  {selectedBusinessFilter !== 'todos' && (
                    <button
                      type="button"
                      onClick={() => setSelectedBusinessFilter('todos')}
                      className="text-xs font-semibold text-[#E65100] hover:underline cursor-pointer"
                    >
                      Ver todos los locales
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {businesses.map((biz) => {
                  const isSelected = selectedBusinessFilter === biz.id;
                  const distKm = calculateDistanceKm(
                    biz.coords,
                    selectedNeighborhood.coords
                  );
                  const estDelivery = calculateDynamicDeliveryCop(distKm);

                  return (
                    <div
                      key={biz.id}
                      onClick={() =>
                        setSelectedBusinessFilter(isSelected ? 'todos' : biz.id)
                      }
                      className={`group rounded-2xl bg-white border transition-all overflow-hidden flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#E65100] ring-2 ring-[#E65100]/20 shadow-card-hover'
                          : 'border-[#EFEBE6] shadow-card hover:-translate-y-0.5 hover:shadow-card-hover'
                      } ${!biz.isOpen ? 'opacity-85' : ''}`}
                    >
                      <div>
                        <div className="relative h-36 w-full bg-[#F6ECE7] overflow-hidden">
                          <ResilientImage
                            src={biz.coverImageUrl}
                            alt={biz.name}
                            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                              !biz.isOpen ? 'grayscale-40' : ''
                            }`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />

                          {/* Operational Status Pill per Design System */}
                          <div className="absolute top-3 left-3">
                            {biz.isOpen ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#2E7D32]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-pulse" />
                                Abierto
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EEEEEE] text-[#616161]">
                                <Lock className="w-3 h-3" />
                                Cerrado
                              </span>
                            )}
                          </div>

                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                            <span className="font-medium truncate">
                              {biz.address.split(',')[1] || 'Neiva'}
                            </span>
                            <span className="font-semibold text-[#FFDEAC] tabular-nums">
                              ★ {biz.rating.toFixed(1)} ({biz.reviewCount})
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-1.5">
                          <h3 className="font-display font-bold text-base text-[#1F1B18] leading-snug">
                            {biz.name}
                          </h3>
                          <p className="text-xs text-[#A43700] font-medium">
                            {biz.specialty}
                          </p>
                          <p className="text-xs text-[#5A4138] line-clamp-2">
                            {biz.description}
                          </p>
                        </div>
                      </div>

                      <div className="px-4 pb-4 pt-2 border-t border-[#EFEBE6] flex items-center justify-between text-xs text-[#5A4138] tabular-nums">
                        <span>{biz.schedule}</span>
                        <span className="font-semibold text-[#1F1B18]">
                          Envío {formatCop(estDelivery)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section 3: Featured Product Catalog & Topping Customizer Trigger */}
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EFEBE6] pb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#1F1B18]">
                    Menú de Antojos & Personalización
                  </h2>
                  <p className="text-sm text-[#5A4138]">
                    Elige cualquier plato para configurar tus toppings y calcular tu
                    domicilio exacto
                  </p>
                </div>

                {/* Interactive Category Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  {CATEGORIES.map((category) => {
                    const active = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-[#E65100] text-white shadow-xs'
                            : 'bg-[#F6ECE7] text-[#5A4138] hover:text-[#1F1B18] hover:bg-[#EAE1DB]'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-[#EFEBE6] space-y-3">
                  <p className="font-display text-lg font-bold text-[#1F1B18]">
                    {
                      EMPTY_CATALOG_MESSAGES[
                        searchQuery.length % EMPTY_CATALOG_MESSAGES.length
                      ]
                    }
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('Todas');
                      setSelectedBusinessFilter('todos');
                      setOnlyOpenFilter(false);
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#FBF2EC] text-[#A43700] text-xs font-semibold hover:bg-[#FFDBCF] transition-colors cursor-pointer"
                  >
                    Restablecer filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const business = businesses.find(
                      (b) => b.id === product.businessId
                    )!;
                    const inCartQty = getProductQuantityInCart(product.id);
                    const remainingStock = Math.max(0, product.stock - inCartQty);
                    const isClosed = !business.isOpen;
                    const isOutOfStock = remainingStock === 0;

                    return (
                      <article
                        key={product.id}
                        className={`bg-white rounded-2xl border border-[#EFEBE6] shadow-card overflow-hidden flex flex-col justify-between transition-all ${
                          isClosed || isOutOfStock
                            ? 'opacity-80'
                            : 'hover:-translate-y-0.5 hover:shadow-card-hover'
                        }`}
                      >
                        <div>
                          {/* 4:3 Product Image */}
                          <div className="relative aspect-4/3 w-full bg-[#F6ECE7] overflow-hidden">
                            <ResilientImage
                              src={product.imageUrl}
                              alt={product.name}
                              className={`w-full h-full object-cover ${
                                isClosed ? 'grayscale-50' : ''
                              }`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                            {/* Proactive Closed Overlay or Stock Indicator */}
                            {isClosed && (
                              <div className="absolute inset-0 bg-[#1F1B18]/65 flex flex-col items-center justify-center p-4 text-center text-white">
                                <span className="px-3 py-1 rounded-full bg-[#EEEEEE] text-[#1F1B18] text-xs font-bold mb-1.5">
                                  Cerrado temporalmente
                                </span>
                                <span className="text-xs text-[#F8EFEA]">
                                  Horario: {business.schedule}
                                </span>
                              </div>
                            )}

                            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                              <span className="font-medium truncate">
                                {business.name}
                              </span>
                              <span className="flex items-center gap-1 shrink-0 tabular-nums">
                                <Clock className="w-3.5 h-3.5 text-[#FFB300]" />
                                {product.prepTimeMinutes} min
                              </span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-5 space-y-2.5">
                            {/* Clean unboxed metadata with typographic separators */}
                            <div className="flex items-center gap-1.5 text-xs text-[#8F7066]">
                              <span className="font-semibold text-[#A43700]">
                                {product.category}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>
                                {product.availableToppings.length} toppings disp.
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">
                                {remainingStock} en stock
                              </span>
                            </div>

                            <h3 className="font-display text-lg font-bold text-[#1F1B18] leading-snug">
                              {product.name}
                            </h3>

                            <p className="text-sm text-[#5A4138] line-clamp-2 leading-relaxed">
                              {product.description}
                            </p>
                          </div>
                        </div>

                        {/* Card Footer with Price & Customize Action */}
                        <div className="px-5 pb-5 pt-3 border-t border-[#EFEBE6] flex items-center justify-between gap-3">
                          <div>
                            <span className="text-[11px] text-[#8F7066] block">
                              Desde
                            </span>
                            <span className="font-display text-xl font-bold text-[#1F1B18] tabular-nums">
                              {formatCop(product.basePrice)}
                            </span>
                          </div>

                          {isClosed ? (
                            <button
                              type="button"
                              disabled
                              className="h-11 px-4 rounded-xl bg-[#EEEEEE] text-[#616161] font-display text-xs font-semibold cursor-not-allowed whitespace-nowrap"
                            >
                              Local Cerrado
                            </button>
                          ) : isOutOfStock ? (
                            <button
                              type="button"
                              disabled
                              className="h-11 px-4 rounded-xl bg-[#FFDAD6] text-[#93000A] font-display text-xs font-semibold cursor-not-allowed whitespace-nowrap"
                            >
                              Agotado hoy
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setCustomizingProduct(product)}
                              className="h-11 px-4 rounded-xl bg-[#E65100] hover:bg-[#CD4700] text-white font-display text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Personalizar</span>
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Mobile Sticky Bottom Checkout Bar (Respecting 15% Viewport Cap) */}
      {totalCartItemsCount > 0 && !isCartOpen && (
        <div className="sticky bottom-0 z-30 p-3 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#EFEBE6] sm:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full h-12 px-5 rounded-xl bg-[#E65100] text-white font-display text-sm font-semibold flex items-center justify-between shadow-card cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Ver mi pedido ({totalCartItemsCount})</span>
            </span>
            <span className="flex items-center gap-1 font-bold tabular-nums">
              {formatCop(totalCartCop)}
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      )}

      {/* Clean Quiet Footer */}
      <footer className="bg-[#FFF8F5] border-t border-[#EFEBE6] mt-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5A4138]">
          <div>
            <span className="font-display font-bold text-[#1F1B18]">
              Antojo Virtual
            </span>{' '}
            · Plataforma de comercialización gastronómica para emprendimientos de
            Neiva, Huila.
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveView('negocio')}
              className="hover:text-[#E65100] transition-colors cursor-pointer"
            >
              Portal Negocios
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveView('domiciliario')}
              className="hover:text-[#E65100] transition-colors cursor-pointer"
            >
              Red de Domiciliarios
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="hover:text-[#E65100] transition-colors cursor-pointer"
            >
              Mi Cuenta ({user ? user.role : 'invitado'})
            </button>
          </div>
        </div>
      </footer>

      {/* Topping Customization Modal */}
      {customizingProduct && (
        <ToppingModal
          product={customizingProduct}
          business={
            businesses.find((b) => b.id === customizingProduct.businessId) || null
          }
          currentQuantityInCart={getProductQuantityInCart(customizingProduct.id)}
          onClose={() => setCustomizingProduct(null)}
          onConfirmAdd={handleConfirmToppings}
        />
      )}

      {/* Authentication Wall Modal */}
      <AuthWallModal
        isOpen={isAuthModalOpen}
        pendingActionLabel={
          pendingCartAddition
            ? `Inicia sesión o regístrate para guardar “${pendingCartAddition.product.name}” en tu carrito y calcular el envío exacto a tu barrio.`
            : 'Gestiona tus direcciones en Neiva, pedidos y perfil de acceso.'
        }
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingCartAddition(null);
        }}
        onSuccessAuth={handleSuccessAuth}
      />

      {/* Cart & Dynamic Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        selectedNeighborhood={selectedNeighborhood}
        deliveryAddress={deliveryAddress}
        discountCodeApplied={discountUnlocked}
        onClose={() => setIsCartOpen(false)}
        onChangeNeighborhood={(id) => setSelectedNeighborhoodId(id)}
        onChangeAddress={(addr) => setDeliveryAddress(addr)}
        onUpdateCartQuantity={handleUpdateCartQuantity}
        onRemoveCartItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onConfirmCheckout={handleConfirmCheckout}
      />
    </div>
  );
}

