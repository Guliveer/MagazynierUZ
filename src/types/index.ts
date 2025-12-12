// API Response types

/**
 * Odpowiedź z endpointu logowania
 */
export interface LoginResponse {
  token: string;
}

/**
 * Standardowa odpowiedź błędu API
 */
export interface ApiErrorResponse {
  message: string;
  status: number;
}

// JWT Payload type

/**
 * Payload tokenu JWT
 */
export interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
  roles?: string[];
}

// ============================================
// Address Types
// ============================================

/**
 * Adres magazynu
 */
export interface Address {
  /** Nazwa ulicy */
  street: string;
  /** Numer domu */
  houseNumber: string;
  /** Numer mieszkania (opcjonalny) */
  apartmentNumber: string;
  /** Miasto */
  city: string;
  /** Kod pocztowy */
  postcode: string;
  /** Szerokość geograficzna */
  latitude: number;
  /** Długość geograficzna */
  longitude: number;
}

// ============================================
// Product Types
// ============================================

/**
 * Odpowiedź API z danymi produktu
 */
export interface ProductResponse {
  /** Unikalny identyfikator produktu (int64) */
  id: number;
  /** Nazwa produktu */
  name: string;
  /** Opis produktu */
  description: string;
  /** Cena produktu (minimum 0.1) */
  price: number;
  /** Ilość produktu w magazynie (int32) */
  quantity: number;
}

/**
 * Dane wymagane do utworzenia nowego produktu
 */
export interface CreateProductRequest {
  /** Nazwa produktu */
  name: string;
  /** Opis produktu */
  description: string;
  /** Cena produktu (minimum 0.1) */
  price: number;
  /** Ilość produktu (int32) */
  quantity: number;
}

/**
 * Alias dla ProductResponse - reprezentuje produkt w systemie
 */
export type Product = ProductResponse;

// ============================================
// Warehouse Types
// ============================================

/**
 * Odpowiedź API z danymi magazynu
 */
export interface WarehouseResponse {
  /** Unikalny identyfikator magazynu (int64) */
  id: number;
  /** Nazwa magazynu */
  name: string;
  /** Kod magazynu */
  code: string;
  /** Czy magazyn jest aktywny */
  isActive: boolean;
  /** Adres magazynu */
  address: Address;
}

/**
 * Dane wymagane do utworzenia nowego magazynu
 */
export interface CreateWarehouseRequest {
  /** Nazwa magazynu */
  name: string;
  /** Kod magazynu */
  code: string;
  /** Opis magazynu */
  description: string;
  /** Adres magazynu */
  address: Address;
}

/**
 * Alias dla WarehouseResponse - reprezentuje magazyn w systemie
 */
export type Warehouse = WarehouseResponse;

// ============================================
// Location Types
// ============================================

/**
 * Typ lokalizacji w magazynie
 */
export type LocationType = 'PICKING' | 'BULK' | 'RECEIVING' | 'SHIPPING' | 'RETURNS';

/**
 * Odpowiedź API z danymi lokalizacji
 */
export interface LocationResponse {
  /** Unikalny identyfikator lokalizacji */
  id: number;
  /** Kod lokalizacji */
  locationCode: string;
  /** Nazwa strefy */
  zoneName: string;
  /** Typ lokalizacji */
  locationType: LocationType;
  /** Czy lokalizacja jest aktywna */
  isActive: boolean;
  /** Czy lokalizacja jest zablokowana */
  isLocked: boolean;
}

/**
 * Dane wymagane do utworzenia nowej lokalizacji
 */
export interface CreateLocationRequest {
  /** Kod lokalizacji */
  locationCode: string;
  /** Nazwa strefy */
  zoneName: string;
  /** Typ lokalizacji */
  locationType: LocationType;
}

/**
 * Alias dla LocationResponse - reprezentuje lokalizację w systemie
 */
export type Location = LocationResponse;

// ============================================
// Pagination Types
// ============================================

/**
 * Generyczny typ dla odpowiedzi z paginacją
 * @template T - Typ elementów w liście
 */
export interface PaginatedResponse<T> {
  /** Lista elementów na bieżącej stronie */
  content: T[];
  /** Numer bieżącej strony (0-indexed) */
  page: number;
  /** Rozmiar strony */
  size: number;
  /** Całkowita liczba elementów */
  totalElements: number;
  /** Całkowita liczba stron */
  totalPages: number;
  /** Czy jest to pierwsza strona */
  first: boolean;
  /** Czy jest to ostatnia strona */
  last: boolean;
}
