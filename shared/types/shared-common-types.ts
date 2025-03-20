/**
 * Tipi comuni condivisi tra client e server
 */

// Tipi di utente
export type UserType = 'customer' | 'tavola_calda' | 'onlus';

// Tipi di piano abbonamento
export type PlanType = 'primo' | 'secondo' | 'completo';

// Stati degli ordini
export type OrderStatus = 'pending' | 'completed' | 'canceled' | 'donated';

// Giorni della settimana
export type DayOfWeek = '1' | '2' | '3' | '4' | '5' | '6' | '7';

// Interfaccia coordinate geografiche
export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

// Intervallo di tempo
export interface TimeRange {
  start: string; // formato HH:MM
  end: string; // formato HH:MM
}

// Informazioni punto di ritiro
export interface PickupPointInfo {
  id: string;
  name: string;
  address: string;
  coordinates: GeoCoordinates;
  businessHours?: Record<DayOfWeek, TimeRange[]>;
}

// Range orario per ritiro
export interface PickupTimeSlot {
  id: string;
  pickupPointId: string;
  dayOfWeek: DayOfWeek;
  timeStart: string; // formato HH:MM
  timeEnd: string; // formato HH:MM
  maxCapacity: number;
  availableCapacity: number;
}

// Periodo di tempo
export interface DateRange {
  startDate: string; // formato ISO
  endDate: string; // formato ISO
}

// Informazioni su sconto
export interface DiscountInfo {
  deliveriesPerWeek: number;
  durationWeeks: number;
  discountPercentage: number;
}

// Errore di validazione
export interface ValidationError {
  field: string;
  message: string;
}

// Informazioni sul file
export interface FileInfo {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

// Contatto
export interface ContactInfo {
  email: string;
  phone?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

// Interfaccia per indirizzo completo
export interface Address {
  street: string;
  number?: string;
  city: string;
  zipCode: string;
  province: string;
  country: string;
  formatted: string;
}
