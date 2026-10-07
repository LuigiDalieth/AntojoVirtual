export type UserRole = 'invitado' | 'cliente' | 'negocio' | 'domiciliario' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  neighborhoodId: string;
  addressDetails: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  commune: string;
  coords: { lat: number; lng: number };
}

export interface ToppingOption {
  id: string;
  name: string;
  category: 'quesos' | 'proteinas' | 'salsas' | 'adicionales';
  price: number; // Exact integer COP
  maxPortions: number;
  available: boolean;
}

export interface ProductItem {
  id: string;
  businessId: string;
  name: string;
  description: string;
  category: 'Hamburguesas' | 'Salchipapas' | 'Arepas' | 'Alitas' | 'Perros';
  basePrice: number; // Exact integer COP
  imageUrl: string;
  prepTimeMinutes: number;
  stock: number;
  availableToppings: ToppingOption[];
  featured?: boolean;
}

export interface BusinessStore {
  id: string;
  name: string;
  specialty: string;
  description: string;
  neighborhoodId: string;
  address: string;
  coords: { lat: number; lng: number };
  isOpen: boolean;
  schedule: string;
  rating: number;
  reviewCount: number;
  coverImageUrl: string;
  minOrderCop: number;
}

export interface SelectedTopping {
  topping: ToppingOption;
  quantity: number;
}

export interface CartItem {
  cartItemId: string;
  product: ProductItem;
  business: BusinessStore;
  quantity: number;
  selectedToppings: SelectedTopping[];
  notes: string;
  unitPriceWithToppings: number; // Exact integer: basePrice + sum(topping.price * topping.quantity)
  lineTotal: number; // Exact integer: unitPriceWithToppings * quantity
}

export type OrderStatus = 'Recibido' | 'Preparando' | 'En camino' | 'Entregado';

export interface CourierAgent {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  phone: string;
  neighborhoodId: string;
  coords: { lat: number; lng: number };
  rating: number;
  available: boolean;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryNeighborhood: Neighborhood;
  deliveryAddress: string;
  items: CartItem[];
  subtotalCop: number;
  serviceFeeCop: number;
  deliveryFeeCop: number;
  discountCop: number;
  totalCop: number;
  distanceKm: number;
  paymentMethod: 'Efectivo' | 'Transferencia Nequi / Daviplata';
  cashChangeFor?: number;
  status: OrderStatus;
  assignedCourier: CourierAgent;
  rejectedCourierIds: string[];
  ratingSubmitted?: {
    stars: number;
    comment: string;
    rewardCode: string;
  };
}

export const NEIVA_NEIGHBORHOODS: Neighborhood[] = [
  { id: 'altico', name: 'El Altico', commune: 'Comuna 3 · Centro', coords: { lat: 2.9273, lng: -75.2819 } },
  { id: 'quirinal', name: 'El Quirinal', commune: 'Comuna 2 · Norte', coords: { lat: 2.9385, lng: -75.2862 } },
  { id: 'ico', name: 'Ipanema / Santa Inés', commune: 'Comuna 1 · Noroccidente', coords: { lat: 2.9512, lng: -75.2940 } },
  { id: 'canaima', name: 'Canaima / Sur', commune: 'Comuna 6 · Sur', coords: { lat: 2.9055, lng: -75.2765 } },
  { id: 'la-rioja', name: 'La Rioja / Oriente', commune: 'Comuna 5 · Oriente', coords: { lat: 2.9310, lng: -75.2640 } },
  { id: 'las-granjas', name: 'Las Granjas', commune: 'Comuna 2 · Norte', coords: { lat: 2.9460, lng: -75.2810 } },
];

export const INITIAL_COURIERS: CourierAgent[] = [
  {
    id: 'dom-1',
    name: 'Carlos Andrés Perdomo',
    vehicle: 'Yamaha FZ 150',
    plate: 'HUI-48G',
    phone: '315 892 4410',
    neighborhoodId: 'altico',
    coords: { lat: 2.9288, lng: -75.2805 },
    rating: 4.9,
    available: true,
  },
  {
    id: 'dom-2',
    name: 'Jhon Jairo Trujillo',
    vehicle: 'Bajaj Pulsar NS 160',
    plate: 'NEI-92F',
    phone: '318 441 0923',
    neighborhoodId: 'quirinal',
    coords: { lat: 2.9360, lng: -75.2850 },
    rating: 4.8,
    available: true,
  },
  {
    id: 'dom-3',
    name: 'Luisa Fernanda Charry',
    vehicle: 'Honda CB 125F',
    plate: 'OPB-11D',
    phone: '310 765 3190',
    neighborhoodId: 'la-rioja',
    coords: { lat: 2.9301, lng: -75.2680 },
    rating: 5.0,
    available: true,
  },
  {
    id: 'dom-4',
    name: 'Brayan Stiven Polanía',
    vehicle: 'Suzuki Gixxer 150',
    plate: 'KLM-73E',
    phone: '320 519 8821',
    neighborhoodId: 'canaima',
    coords: { lat: 2.9110, lng: -75.2790 },
    rating: 4.7,
    available: true,
  },
];

export const INITIAL_BUSINESSES: BusinessStore[] = [
  {
    id: 'biz-la-brasa-opita',
    name: 'La Brasa Opita Burger Lab',
    specialty: 'Smash Burgers & Brioche Artesanal',
    description: 'Hamburguesas maduradas al carbón de leña con pan de papa hecho en casa cada mañana.',
    neighborhoodId: 'altico',
    address: 'Calle 10 # 7-42, Barrio El Altico',
    coords: { lat: 2.9279, lng: -75.2812 },
    isOpen: true,
    schedule: '5:00 PM – 11:30 PM',
    rating: 4.9,
    reviewCount: 214,
    coverImageUrl: '/src/assets/images/hero_burger_neiva_1791402193370.jpg',
    minOrderCop: 16000,
  },
  {
    id: 'biz-papas-del-magdalena',
    name: 'Papas & Costillas del Magdalena',
    specialty: 'Salchipapas Gourmet & Alitas Ahumadas',
    description: 'Papas criollas y sabaneras crocantes con chorizo artesanal huilense, costilla desmechada y quesos fundidos.',
    neighborhoodId: 'quirinal',
    address: 'Carrera 5A # 21-18, El Quirinal',
    coords: { lat: 2.9390, lng: -75.2855 },
    isOpen: true,
    schedule: '4:30 PM – 11:45 PM',
    rating: 4.8,
    reviewCount: 168,
    coverImageUrl: '/src/assets/images/salchipapa_huilense_1791402203031.jpg',
    minOrderCop: 15000,
  },
  {
    id: 'biz-el-taller-del-maiz',
    name: 'El Taller del Maíz & Perros',
    specialty: 'Arepas Rellenas a la Parrilla & Perros',
    description: 'Maíz trillado molido al día, asado sobre piedra volcánica con carnes desmechadas en hogao tradicional.',
    neighborhoodId: 'la-rioja',
    address: 'Calle 8 # 19-05, La Rioja',
    coords: { lat: 2.9315, lng: -75.2650 },
    isOpen: true,
    schedule: '5:00 PM – 10:30 PM',
    rating: 4.9,
    reviewCount: 142,
    coverImageUrl: '/src/assets/images/arepa_rellena_artesanal_1791402213893.jpg',
    minOrderCop: 12000,
  },
  {
    id: 'biz-humo-y-barril',
    name: 'Humo & Barril Neiva',
    specialty: 'Cilindro Peruano & Costillas al Barril',
    description: 'Carnes ahumadas lentamente durante 6 horas en barril de acero con leña de guayabo.',
    neighborhoodId: 'canaima',
    address: 'Avenida Max Duque # 14-80, Sur',
    coords: { lat: 2.9062, lng: -75.2770 },
    isOpen: false, // Closed by default to demonstrate the "Negocio Cerrado" edge case
    schedule: 'Jueves a Domingo · 6:00 PM – 11:00 PM',
    rating: 4.7,
    reviewCount: 89,
    coverImageUrl: '/src/assets/images/alitas_bbq_artesanal_1791402222500.jpg',
    minOrderCop: 20000,
  },
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    businessId: 'biz-la-brasa-opita',
    name: 'Doble Smash Tatacoa',
    description: 'Doble carne de res madurada (220g) con costra caramelizada, doble cheddar americano, tocineta ahumada al barril, cebolla grille en reducción de panela y salsa de la casa en brioche dorado.',
    category: 'Hamburguesas',
    basePrice: 24500,
    imageUrl: '/src/assets/images/hero_burger_neiva_1791402193370.jpg',
    prepTimeMinutes: 18,
    stock: 14,
    featured: true,
    availableToppings: [
      { id: 'top-cheddar', name: 'Lonja extra de Queso Cheddar', category: 'quesos', price: 3000, maxPortions: 3, available: true },
      { id: 'top-tocineta', name: 'Tocineta Ahumada Crocante', category: 'proteinas', price: 4500, maxPortions: 3, available: true },
      { id: 'top-carne-smash', name: 'Medallón extra Smash 110g', category: 'proteinas', price: 7500, maxPortions: 2, available: true },
      { id: 'top-cebolla', name: 'Cebolla Caramelizada en Panela', category: 'adicionales', price: 2500, maxPortions: 2, available: true },
      { id: 'top-piña', name: 'Piña Asada al Carbón', category: 'adicionales', price: 2500, maxPortions: 2, available: true },
      { id: 'top-salsa-ajo', name: 'Copa de Aioli de Ajo Rostizado', category: 'salsas', price: 1500, maxPortions: 3, available: true },
    ],
  },
  {
    id: 'prod-2',
    businessId: 'biz-papas-del-magdalena',
    name: 'Salchipapa Bambuquera Especial',
    description: 'Base de papa sabanera bastón y papa criolla dorada, chorizo santarrosano, pollo desmechado, costilla en BBQ de cholupa, baño de mozzarella gratinado y huevos de codorniz.',
    category: 'Salchipapas',
    basePrice: 26900,
    imageUrl: '/src/assets/images/salchipapa_huilense_1791402203031.jpg',
    prepTimeMinutes: 20,
    stock: 9,
    featured: true,
    availableToppings: [
      { id: 'top-mozzarella', name: 'Gratinado extra de Mozzarella', category: 'quesos', price: 4000, maxPortions: 2, available: true },
      { id: 'top-chorizo', name: 'Chorizo Artesanal adicional', category: 'proteinas', price: 5500, maxPortions: 3, available: true },
      { id: 'top-codorniz', name: '4 Huevos de Codorniz', category: 'adicionales', price: 3500, maxPortions: 2, available: true },
      { id: 'top-maicitos', name: 'Maíz Tierno Salteado en Mantequilla', category: 'adicionales', price: 3000, maxPortions: 2, available: true },
      { id: 'top-tartara', name: 'Tártara Artesanal de la Casa', category: 'salsas', price: 1500, maxPortions: 3, available: true },
    ],
  },
  {
    id: 'prod-3',
    businessId: 'biz-el-taller-del-maiz',
    name: 'Arepa Rellena La Vorágine',
    description: 'Arepa de maíz blanco asada al carbón, rellena de sobrebarriga desmechada en hogao criollo, maduritos calados, queso doble crema fundido y chicharrón carnudo picado.',
    category: 'Arepas',
    basePrice: 17500,
    imageUrl: '/src/assets/images/arepa_rellena_artesanal_1791402213893.jpg',
    prepTimeMinutes: 15,
    stock: 18,
    featured: true,
    availableToppings: [
      { id: 'top-doble-crema', name: 'Queso Doble Crema Tajado', category: 'quesos', price: 3000, maxPortions: 3, available: true },
      { id: 'top-chicharron', name: 'Trozos de Chicharrón Crocante', category: 'proteinas', price: 5000, maxPortions: 2, available: true },
      { id: 'top-guacamole', name: 'Guacamole Rústico con Cilantro', category: 'adicionales', price: 3500, maxPortions: 2, available: true },
      { id: 'top-suero', name: 'Suero Costeño Artesanal', category: 'salsas', price: 2000, maxPortions: 2, available: true },
    ],
  },
  {
    id: 'prod-4',
    businessId: 'biz-papas-del-magdalena',
    name: 'Alitas Glaseadas en Miel de Caña (10 Pzs)',
    description: 'Diez piezas de alitas horneadas y crocantes bañadas en reducción de BBQ ahumada y miel de panela huilense, servidas con bastones de apio y aderezo ranch.',
    category: 'Alitas',
    basePrice: 25000,
    imageUrl: '/src/assets/images/alitas_bbq_artesanal_1791402222500.jpg',
    prepTimeMinutes: 22,
    stock: 7,
    availableToppings: [
      { id: 'top-ranch', name: 'Dip extra de Ranch Artesanal', category: 'salsas', price: 2000, maxPortions: 3, available: true },
      { id: 'top-papas-rusticas', name: 'Porción de Papas Rústicas con Paprika', category: 'adicionales', price: 6000, maxPortions: 2, available: true },
      { id: 'top-cheddar-dip', name: 'Salsa de Queso Cheddar Fundido', category: 'quesos', price: 4000, maxPortions: 2, available: true },
    ],
  },
  {
    id: 'prod-5',
    businessId: 'biz-el-taller-del-maiz',
    name: 'Perro Caliente Artesanal San Pedro',
    description: 'Pan brioche suave, salchicha tipo Suiza a la parrilla, queso costeño rallado y mozzarella fundido, piña asada en mantequilla, papa cabello de ángel y tocineta.',
    category: 'Perros',
    basePrice: 18900,
    imageUrl: '/src/assets/images/perro_caliente_gourmet_1791402232476.jpg',
    prepTimeMinutes: 14,
    stock: 11,
    availableToppings: [
      { id: 'top-salchicha-extra', name: 'Salchicha Suiza adicional', category: 'proteinas', price: 6500, maxPortions: 1, available: true },
      { id: 'top-tocineta-perro', name: 'Lluvia de Tocineta Ahumada', category: 'proteinas', price: 3500, maxPortions: 2, available: true },
      { id: 'top-queso-fundido', name: 'Capa de Queso Mozzarella Gratinado', category: 'quesos', price: 3000, maxPortions: 2, available: true },
      { id: 'top-piña-dulce', name: 'Salsa de Piña Caramelizada', category: 'salsas', price: 1500, maxPortions: 2, available: true },
    ],
  },
  {
    id: 'prod-6',
    businessId: 'biz-humo-y-barril',
    name: 'Costillas San Luis al Barril (450g)',
    description: 'Corte grueso de costilla de cerdo ahumada durante 6 horas con corteza caramelizada, acompañada de arepa santandereana y papas criollas.',
    category: 'Alitas',
    basePrice: 32000,
    imageUrl: '/src/assets/images/alitas_bbq_artesanal_1791402222500.jpg',
    prepTimeMinutes: 25,
    stock: 5,
    availableToppings: [
      { id: 'top-guacamole-barril', name: 'Guacamole de la Casa', category: 'adicionales', price: 4000, maxPortions: 2, available: true },
      { id: 'top-chorizo-barril', name: 'Chorizo Ahumado al Barril', category: 'proteinas', price: 6000, maxPortions: 2, available: true },
    ],
  },
];

// Utility for exact integer COP formatting
export function formatCop(amount: number): string {
  const rounded = Math.round(amount);
  return `$${rounded.toLocaleString('es-CO')}`;
}

// Haversine distance in kilometers between two coordinates in Neiva
export function calculateDistanceKm(
  coordA: { lat: number; lng: number },
  coordB: { lat: number; lng: number }
): number {
  const R = 6371; // Earth radius km
  const dLat = ((coordB.lat - coordA.lat) * Math.PI) / 180;
  const dLng = ((coordB.lng - coordA.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coordA.lat * Math.PI) / 180) *
      Math.cos((coordB.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Multiply by 1.32 urban road factor in Neiva and round to 1 decimal
  const roadDist = Math.max(0.8, Math.round(R * c * 1.32 * 10) / 10);
  return roadDist;
}

// Exact integer dynamic delivery fee based on distance in Neiva
export function calculateDynamicDeliveryCop(distanceKm: number): number {
  const baseRate = 3500;
  const perKmRate = 900;
  // Round to nearest 100 COP to avoid awkward change in cash transactions
  const raw = baseRate + distanceKm * perKmRate;
  return Math.round(raw / 100) * 100;
}

// Find closest available courier to the business coordinates excluding rejected courier IDs
export function assignClosestCourier(
  businessCoords: { lat: number; lng: number },
  couriers: CourierAgent[],
  rejectedIds: string[] = []
): { courier: CourierAgent; distanceToStoreKm: number } {
  const candidates = couriers.filter((c) => c.available && !rejectedIds.includes(c.id));
  const pool = candidates.length > 0 ? candidates : couriers;

  let bestCourier = pool[0];
  let bestDist = calculateDistanceKm(businessCoords, bestCourier.coords);

  for (const c of pool) {
    const d = calculateDistanceKm(businessCoords, c.coords);
    if (d < bestDist) {
      bestDist = d;
      bestCourier = c;
    }
  }

  return { courier: bestCourier, distanceToStoreKm: bestDist };
}
