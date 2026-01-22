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
// User & Auth Types
// ============================================

/**
 * Organisation entity
 */
export interface Organisation {
  /** Organisation ID */
  id: number;
  /** Organisation name */
  name: string;
  /** Tax Identification Number */
  tin: string;
}

/**
 * Role entity
 */
export interface Role {
  /** Role ID */
  id: number;
  /** Role name (e.g., "ROLE_ADMIN", "ROLE_USER", "ROLE_MANAGER") */
  name: string;
}

/**
 * User entity with full details
 */
export interface User {
  /** User ID */
  userId: number;
  /** Username */
  username: string;
  /** User's organisation */
  organisation: Organisation;
  /** User's roles */
  roles: Role[];
  /** Account creation timestamp */
  createdAt: string;
  /** Last login timestamp */
  lastLogin: string;
  /** Whether the account is enabled */
  enabled: boolean;
  /** Whether the account is not expired */
  accountNonExpired: boolean;
  /** Whether the account is not locked */
  accountNonLocked: boolean;
  /** Whether the credentials are not expired */
  credentialsNonExpired: boolean;
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
 * Note: API returns nested warehouse and location objects
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
  /** Nested warehouse object (from API) */
  warehouse?: WarehouseResponse;
  /** Nested location object (from API) */
  location?: LocationResponse;
  /** Warehouse ID (extracted from nested object or set manually) */
  warehouseId?: number;
  /** Location ID (extracted from nested object or set manually) */
  locationId?: number;
}

/**
 * Extended product response with full warehouse and location context
 * Used when displaying products with their location information
 */
export interface ProductWithContext extends ProductResponse {
  /** Warehouse ID where product is stored */
  warehouseId: number;
  /** Location ID where product is stored */
  locationId: number;
  /** Warehouse name for display */
  warehouseName?: string;
  /** Warehouse code for display */
  warehouseCode?: string;
  /** Location code for display */
  locationCode?: string;
  /** Location zone name for display */
  zoneName?: string;
  /** Location type for display */
  locationType?: LocationType;
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

// ============================================
// Admin User Management Types
// ============================================

/**
 * User response from admin API
 */
export interface UserResponse {
  /** User ID */
  id: number;
  /** Username */
  username: string;
  /** User roles (e.g., ["ROLE_USER", "ROLE_ADMIN"]) */
  roles: string[];
  /** Organisation ID (optional) */
  organisationId?: number;
  /** Organisation name (optional) */
  organisationName?: string;
}

/**
 * Request to create a new user (admin)
 */
export interface AdminCreateUserRequest {
  /** Username (3-50 characters, required) */
  username: string;
  /** Password (minimum 4 characters, required) */
  password: string;
  /** Role names (e.g., ["ROLE_USER", "ROLE_ADMIN"]) */
  roleNames?: string[];
  /** Organisation ID (optional) */
  organisationId?: number;
}

/**
 * Request to update an existing user (admin)
 */
export interface AdminUpdateUserRequest {
  /** Username (3-50 characters) */
  username?: string;
  /** Password (minimum 4 characters) */
  password?: string;
  /** Role names (e.g., ["ROLE_USER", "ROLE_ADMIN"]) */
  roleNames?: string[];
  /** Organisation ID (null to remove) */
  organisationId?: number | null;
}

// ============================================
// Admin Organisation Management Types
// ============================================

/**
 * Organisation response from API
 */
export interface OrganisationResponse {
  /** Organisation ID */
  id: number;
  /** Organisation name */
  name: string;
  /** Tax Identification Number */
  tin: string;
}

/**
 * Request to create a new organisation (admin)
 */
export interface CreateOrganisationRequest {
  /** Organisation name (0-20 characters, required) */
  name: string;
  /** Tax Identification Number (0-20 characters, required) */
  tin: string;
}

/**
 * Request to update an existing organisation (admin)
 */
export interface UpdateOrganisationRequest {
  /** Organisation name (0-20 characters) */
  name?: string;
  /** Tax Identification Number (0-20 characters) */
  tin?: string;
}

/**
 * Organisation with additional statistics
 */
export interface OrganisationWithStats extends OrganisationResponse {
  /** Number of warehouses */
  warehouseCount?: number;
  /** Number of users */
  userCount?: number;
}
