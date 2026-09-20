export type BookingPlatform = 'airbnb' | 'booking' | 'vrbo' | 'direct';
export type ReservationStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'deposit_only';
export type CleaningStatus = 'pending' | 'in_progress' | 'completed' | 'inspected';

export interface Property {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  basePrice: number; // USD / night
  cleaningFee: number;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  status: 'active' | 'maintenance' | 'paused';
  syncStatus: {
    airbnb: boolean;
    booking: boolean;
    vrbo: boolean;
  };
  smartLock: {
    enabled: boolean;
    brand: string;
  };
  wifiNetwork: string;
  wifiPassword: string;
}

export interface Reservation {
  id: string;
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAvatar?: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  guestsCount: number;
  platform: BookingPlatform;
  totalAmount: number;
  cleaningFee: number;
  commissionPaid: number;
  netRevenue: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  pinCode: string;
  specialNotes?: string;
  createdAt: string;
}

export interface CleaningChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}

export interface CleaningTask {
  id: string;
  propertyId: string;
  reservationId?: string;
  date: string; // YYYY-MM-DD
  scheduledTime: string; // e.g. "11:00 - 14:00"
  cleanerName: string;
  cleanerPhone: string;
  status: CleaningStatus;
  checklist: CleaningChecklistItem[];
  notes?: string;
  damageReported?: string;
  photosUploaded?: number;
}

export interface MessageTemplate {
  id: string;
  title: string;
  triggerEvent: string;
  channel: 'whatsapp' | 'email' | 'ota_chat';
  content: string;
  variables: string[];
}

export interface TransportationItem {
  id: string;
  title: string;
  type: 'airport' | 'bus_station' | 'car' | 'remis';
  description: string;
  estimatedCost?: string;
  contactPhone?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface AttractionItem {
  id: string;
  title: string;
  category: 'cataratas' | 'naturaleza' | 'ciudad' | 'compras';
  description: string;
  tips: string;
  ticketPrice?: string;
  officialUrl?: string;
  distanceMinutes: number;
}

export interface DiningItem {
  id: string;
  name: string;
  specialty: string;
  priceRange: '$' | '$$' | '$$$';
  hasDelivery: boolean;
  address: string;
  phone?: string;
}

export interface WelcomeGuideData {
  propertyName: string;
  tagline: string;
  hostName: string;
  hostPhone: string;
  locationAddress: string;
  googleMapsUrl: string;
  wifiNetwork: string;
  wifiPassword: string;
  poolHours: string;
  checkoutHour: string;
  woodBagPrice: string;
  specialAnnouncement?: string;
  transportation: TransportationItem[];
  attractions: AttractionItem[];
  dining: DiningItem[];
  rules: {
    title: string;
    description: string;
  }[];
  directBookingSettings: {
    customSlug: string;
    depositPercentage: number;
    bankAlias: string;
    cbu: string;
    bankName: string;
    accountHolder: string;
    directDiscountPercent: number;
  };
}

export interface DemoState {
  properties: Property[];
  reservations: Reservation[];
  cleaningTasks: CleaningTask[];
  templates: MessageTemplate[];
  welcomeGuide?: WelcomeGuideData;
  lastUpdated: string;
}
