// API Response types

/**
 * Response from the login endpoint
 */
export interface LoginResponse {
  token: string;
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  message: string;
  status: number;
}

// JWT Payload type

/**
 * JWT token payload
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
 * Warehouse address
 */
export interface Address {
  /** Street name */
  street: string;
  /** House number */
  houseNumber: string;
  /** Apartment number (optional) */
  apartmentNumber: string;
  /** City */
  city: string;
  /** Postal code */
  postcode: string;
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
}

// ============================================
// Product Types
// ============================================

/**
 * API response with product data
 */
export interface ProductResponse {
  /** Unique product identifier (int64) */
  id: number;
  /** Product name */
  name: string;
  /** Product description */
  description: string;
  /** Product price (minimum 0.1) */
  price: number;
  /** Product quantity in warehouse (int32) */
  quantity: number;
}

/**
 * Data required to create a new product
 */
export interface CreateProductRequest {
  /** Product name */
  name: string;
  /** Product description */
  description: string;
  /** Product price (minimum 0.1) */
  price: number;
  /** Product quantity (int32) */
  quantity: number;
}

/**
 * Alias for ProductResponse - represents a product in the system
 */
export type Product = ProductResponse;

/**
 * Top 10 product statistics response
 */
export interface Top10Product {
  /** Product ID */
  id: number;
  /** Product name */
  name: string;
  /** Product description */
  description: string;
  /** Product price */
  price: number;
  /** Total quantity across all locations */
  quantity: number;
}

// ============================================
// Warehouse Types
// ============================================

/**
 * API response with warehouse data
 */
export interface WarehouseResponse {
  /** Unique warehouse identifier (int64) */
  id: number;
  /** Warehouse name */
  name: string;
  /** Warehouse code */
  code: string;
  /** Whether the warehouse is active */
  isActive: boolean;
  /** Warehouse address */
  address: Address;
}

/**
 * Data required to create a new warehouse
 */
export interface CreateWarehouseRequest {
  /** Warehouse name */
  name: string;
  /** Warehouse code */
  code: string;
  /** Warehouse description */
  description: string;
  /** Warehouse address */
  address: Address;
}

/**
 * Alias for WarehouseResponse - represents a warehouse in the system
 */
export type Warehouse = WarehouseResponse;

// ============================================
// Location Types
// ============================================

/**
 * Location type in warehouse
 */
export type LocationType = 'PICKING' | 'BULK' | 'RECEIVING' | 'SHIPPING' | 'RETURNS';

/**
 * API response with location data
 */
export interface LocationResponse {
  /** Unique location identifier */
  id: number;
  /** Location code */
  locationCode: string;
  /** Zone name */
  zoneName: string;
  /** Location type */
  locationType: LocationType;
  /** Whether the location is active */
  isActive: boolean;
  /** Whether the location is locked */
  isLocked: boolean;
}

/**
 * Data required to create a new location
 */
export interface CreateLocationRequest {
  /** Location code */
  locationCode: string;
  /** Zone name */
  zoneName: string;
  /** Location type */
  locationType: LocationType;
}

/**
 * Alias for LocationResponse - represents a location in the system
 */
export type Location = LocationResponse;

// ============================================
// Pagination Types
// ============================================

/**
 * Generic type for paginated responses
 * @template T - Type of elements in the list
 */
export interface PaginatedResponse<T> {
  /** List of elements on the current page */
  content: T[];
  /** Current page number (0-indexed) */
  page: number;
  /** Page size */
  size: number;
  /** Total number of elements */
  totalElements: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether this is the first page */
  first: boolean;
  /** Whether this is the last page */
  last: boolean;
}

// ============================================
// Statistics Types
// ============================================

/**
 * Summary statistics for the dashboard
 */
export interface SummaryStatistics {
  /** Total number of products */
  totalProducts: number;
  /** Total inventory value (sum of all products value) */
  totalInventoryValue: number;
  /** Average product price */
  averagePrice: number;
  /** Number of warehouses */
  warehousesCount: number;
  /** Number of products with low stock */
  lowStockCount: number;
}

/**
 * Warehouse distribution data for pie chart
 */
export interface WarehouseDistribution {
  /** Warehouse ID */
  warehouseId: number;
  /** Warehouse name */
  warehouseName: string;
  /** Number of products in warehouse */
  productCount: number;
  /** Total value of products in warehouse */
  totalValue: number;
}

/**
 * Chart view type
 */
export type ChartViewType = 'quantity' | 'price' | 'totalValue' | 'comparison';
