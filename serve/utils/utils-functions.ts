// client/src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Funzione di utilità per combinare classnames con tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatta il prezzo in Euro
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
}

/**
 * Funzione di utilità per calcolare la distanza tra due punti geografici
 * usando la formula di Haversine (distanza sulla superficie di una sfera)
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raggio della Terra in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distanza in km
  return distance;
}

/**
 * Converte gradi in radianti
 */
export function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Formatta la distanza in km o m
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
}

/**
 * Traduce il tipo di piano in italiano
 */
export function translatePlanType(type: string): string {
  const typeMap: Record<string, string> = {
    'primo': 'Primo piatto',
    'secondo': 'Secondo piatto',
    'completo': 'Menu completo',
  };
  
  return typeMap[type] || type;
}

/**
 * Traduce lo stato dell'ordine in italiano
 */
export function translateOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'In attesa',
    'confirmed': 'Confermato',
    'ready': 'Pronto',
    'completed': 'Completato',
    'cancelled': 'Cancellato',
    'donated': 'Donato',
  };
  
  return statusMap[status] || status;
}

/**
 * Ritorna la classe CSS per il badge dello stato dell'ordine
 */
export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'donated':
      return 'bg-purple-100 text-purple-800';
    case 'ready':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
}

/**
 * Calcola il prezzo finale dell'abbonamento con sconti applicati
 */
export function calculateFinalPrice(
  basePrice: number,
  quantity: number,
  discount?: number
): {
  baseTotal: number;
  discountAmount: number;
  finalPrice: number;
} {
  const baseTotal = basePrice * quantity;
  const discountPercentage = discount || 0;
  const discountAmount = baseTotal * (discountPercentage / 100);
  const finalPrice = baseTotal - discountAmount;
  
  return {
    baseTotal,
    discountAmount,
    finalPrice
  };
}

/**
 * Converte oggetto da snake_case a camelCase
 */
export function snakeToCamel<T>(obj: Record<string, any>): T {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    // Gestisci ricorsivamente gli oggetti annidati
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[camelKey] = snakeToCamel(value);
    } else {
      result[camelKey] = value;
    }
  }
  
  return result as T;
}

/**
 * Converte oggetto da camelCase a snake_case
 */
export function camelToSnake<T>(obj: Record<string, any>): T {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    // Gestisci ricorsivamente gli oggetti annidati
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[snakeKey] = camelToSnake(value);
    } else {
      result[snakeKey] = value;
    }
  }
  
  return result as T;
}

// client/src/lib/constants.ts
export const CUISINE_TYPES = [
  'Tutti', 
  'Italiano', 
  'Cinese', 
  'Giapponese', 
  'Indiano', 
  'Messicano', 
  'Fast Food', 
  'Vegano', 
  'Vegetariano'
];

export const DELIVERY_FREQUENCY_OPTIONS = [
  { value: '1', label: '1 volta a settimana' },
  { value: '2', label: '2 volte a settimana' },
  { value: '3', label: '3 volte a settimana' },
  { value: '4', label: '4 volte a settimana' },
  { value: '5', label: '5 volte a settimana (lun-ven)' },
  { value: '6', label: '6 volte a settimana' },
  { value: '7', label: '7 volte a settimana (tutti i giorni)' },
];

export const SUBSCRIPTION_DURATION_OPTIONS = [
  { value: '1', label: '1 settimana' },
  { value: '2', label: '2 settimane' },
  { value: '4', label: '1 mese (4 settimane)' },
  { value: '8', label: '2 mesi (8 settimane)' },
  { value: '12', label: '3 mesi (12 settimane)' },
  { value: '24', label: '6 mesi (24 settimane)' },
  { value: '48', label: '1 anno (48 settimane)' },
];

export const PLAN_TYPES = [
  { value: 'primo', label: 'Primo piatto' },
  { value: 'secondo', label: 'Secondo piatto' },
  { value: 'completo', label: 'Menu completo' },
];

// client/src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
