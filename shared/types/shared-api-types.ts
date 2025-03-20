/**
 * Tipi per le API comuni nel progetto
 */

// Risposta generica API
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// Errore API
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

// Risposta paginata
export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Parametri di paginazione per le richieste
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Parametri di geolocalizzazione
export interface GeoParams {
  lat?: number;
  lng?: number;
  radius?: number;
}

// Parametri per la ricerca di ristoranti
export interface RestaurantSearchParams extends PaginationParams, GeoParams {
  cuisineType?: string;
  query?: string;
}

// Parametri per la ricerca di piani abbonamento
export interface SubscriptionPlanSearchParams extends PaginationParams, GeoParams {
  cuisineType?: string;
  maxPrice?: number;
  minRating?: number;
  tags?: string[];
  dayOfWeek?: string;
  query?: string;
}

// Parametri per la ricerca di ordini
export interface OrderSearchParams extends PaginationParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  restaurantId?: string;
  planId?: string;
}

// Parametri per la richiesta di statistiche
export interface StatsParams {
  period?: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}

// Risposta di autenticazione
export interface AuthResponse {
  user: any;
  token?: string;
  message?: string;
}
