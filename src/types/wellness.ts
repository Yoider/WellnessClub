export type SessionId = 'sesion-01' | 'sesion-02' | 'sesion-03';

export type ReservationStatus = 'pendiente' | 'confirmada' | 'checked_in' | 'waitlist';

export type PaymentMethod = 'Efectivo (XAF)' | 'Muni Dinero / Móvil' | 'Transferencia Local' | 'Por definir en WhatsApp';

export type DrinkPreference = 'Matcha Latte' | 'Smoothie Tropical' | 'Café de Especialidad' | 'Limonada Botánica';

export type FoodPreference = 'Yogur & Granola Artesanal' | 'Mini Croissant & Fruta' | 'Bagel Vegetariano' | 'Sin preferencia';

export interface CompanionGuest {
  name: string;
  matNumber?: number;
  drink?: DrinkPreference;
}

export interface Reservation {
  id: string;
  code: string;
  holderName: string; // Nombre titular (A nombre de quién está la reserva)
  whatsapp: string; // Con prefijo +240
  sessionId: SessionId;
  partySize: number; // 1 a 4 personas
  companions: CompanionGuest[];
  matNumbers: number[]; // Esterillas asignadas (1 a 44; 41-44 son de reserva)
  drinkPreference: DrinkPreference;
  foodPreference: FoodPreference;
  paymentMethod: PaymentMethod;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
  checkedInAt?: string;
  welcomeDrinkServed?: boolean;
}

export interface WellnessSession {
  id: SessionId;
  number: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  focus: string;
  maxCapacity: number; // 40 esterillas
  reserveMats: number; // 4 esterillas extra de reserva (41-44)
  priceXAF: number;
  tags: string[];
}

export interface ChecklistItem {
  id: string;
  category: 'Espacio & Equipo' | 'Estación Brunch' | 'Operaciones & Cierre';
  label: string;
  completed: boolean;
}
