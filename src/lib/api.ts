import type { LoginResponse, Warehouse, CreateWarehouseRequest, Location, CreateLocationRequest, Product, CreateProductRequest, Top10Product, PaginatedResponse, ProductWithContext, UserResponse, AdminCreateUserRequest, AdminUpdateUserRequest, OrganisationResponse, CreateOrganisationRequest, UpdateOrganisationRequest } from '@/types';
import { getToken, isAuthenticated, logout } from '@/lib/auth';

// Używamy lokalnego proxy API, aby obejść problem CORS
// Backend URL jest konfigurowany po stronie serwera w src/app/api/proxy/[...path]/route.ts
const API_BASE_URL = '/api/proxy';

export interface AuthRequest {
  username: string;
  password: string;
}

export class ApiError extends Error {
    constructor(
    public statusCode: number,
    message: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });

    if (!response.ok) {
        const errorData = await response.text().catch(() => '');
        throw new ApiError(response.status, errorData || 'Request failed');
    }

    return response.json();
}

export async function login(username: string, password: string): Promise<LoginResponse> {
    return await fetchApi<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            username,
            password
        } as AuthRequest)
    });
}

export async function register(username: string, password: string): Promise<void> {
    await fetchApi<void>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            username,
            password
        } as AuthRequest)
    });
}

// ============================================
// Authenticated API Helper
// ============================================

/**
 * Wykonuje zapytanie do API z automatycznym dodaniem nagłówka Authorization
 * Obsługuje wygaśnięcie sesji i automatyczne przekierowanie do logowania
 * @param endpoint - Endpoint API (bez base URL)
 * @param options - Opcje fetch (including optional signal for request cancellation)
 * @returns Promise z odpowiedzią
 * @throws ApiError gdy brak tokenu lub błąd API
 */
async function fetchApiAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Check if user is authenticated before making request
    if (!isAuthenticated()) {
        handleSessionExpiration();
        throw new ApiError(401, 'Session expired. Please log in again.');
    }

    const token = getToken();
    if (!token) {
        handleSessionExpiration();
        throw new ApiError(401, 'Missing authorization token');
    }

    try {
        return await fetchApi<T>(endpoint, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`
            },
            signal: options.signal // Pass through AbortSignal for request cancellation
        });
    } catch (error) {
    // Handle 401 Unauthorized errors (token expired on server side)
        if (error instanceof ApiError && error.statusCode === 401) {
            handleSessionExpiration();
            throw new ApiError(401, 'Session expired. Please log in again.');
        }
        throw error;
    }
}

/**
 * Handle session expiration by logging out and redirecting to login
 * This is called when the token is invalid or expired on the server side
 */
function handleSessionExpiration(): void {
    if (typeof window === 'undefined') {
        return;
    }

    // Clear authentication data
    logout();

    // Store current URL for redirect after login
    const currentPath = window.location.pathname + window.location.search;
    const shouldRedirect = !currentPath.includes('/login') && !currentPath.includes('/register');

    // Show notification about session expiration
    if (typeof window !== 'undefined' && 'sessionStorage' in window) {
        sessionStorage.setItem('session_expired', 'true');
        sessionStorage.setItem('session_expired_message', 'Your session has expired. Please log in again.');
    }

    // Redirect to login page with context
    if (shouldRedirect) {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&expired=true`;
    } else {
        window.location.href = '/login?expired=true';
    }
}

// ============================================
// Warehouse API
// ============================================

/**
 * Pobiera listę magazynów użytkownika
 */
export async function getWarehouses(): Promise<Warehouse[]> {
    return await fetchApiAuth<Warehouse[]>('/api/v1/warehouses');
}

/**
 * Pobiera szczegóły magazynu
 * @param id - ID magazynu
 */
export async function getWarehouse(id: number): Promise<Warehouse> {
    return await fetchApiAuth<Warehouse>(`/api/v1/warehouses/${id}`);
}

/**
 * Tworzy nowy magazyn
 * @param data - Dane magazynu
 */
export async function createWarehouse(data: CreateWarehouseRequest): Promise<Warehouse> {
    return await fetchApiAuth<Warehouse>('/api/v1/warehouses', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * Aktualizuje magazyn
 * @param id - ID magazynu
 * @param data - Dane magazynu
 */
export async function updateWarehouse(id: number, data: CreateWarehouseRequest): Promise<Warehouse> {
    return await fetchApiAuth<Warehouse>(`/api/v1/warehouses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
}

/**
 * Usuwa magazyn
 * @param id - ID magazynu
 */
export async function deleteWarehouse(id: number): Promise<void> {
    await fetchApiAuth<void>(`/api/v1/warehouses/${id}`, {
        method: 'DELETE'
    });
}

// ============================================
// Location API
// ============================================

/**
 * Pobiera listę lokalizacji w magazynie
 * @param warehouseId - ID magazynu
 */
export async function getLocations(warehouseId: number): Promise<Location[]> {
    return await fetchApiAuth<Location[]>(`/api/v1/warehouses/${warehouseId}/locations`);
}

/**
 * Pobiera szczegóły lokalizacji w magazynie
 * @param warehouseId - ID magazynu
 * @param locationId - ID lokalizacji
 * @note Available for future use - location detail view may be implemented later
 */
export async function getLocation(warehouseId: number, locationId: number): Promise<Location> {
    return await fetchApiAuth<Location>(`/api/v1/warehouses/${warehouseId}/locations/${locationId}`);
}

/**
 * Tworzy nową lokalizację w magazynie
 * @param warehouseId - ID magazynu
 * @param data - Dane lokalizacji
 */
export async function createLocation(warehouseId: number, data: CreateLocationRequest): Promise<Location> {
    return await fetchApiAuth<Location>(`/api/v1/warehouses/${warehouseId}/locations`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * Aktualizuje lokalizację w magazynie
 * @param warehouseId - ID magazynu
 * @param locationId - ID lokalizacji
 * @param data - Dane lokalizacji
 */
export async function updateLocation(warehouseId: number, locationId: number, data: CreateLocationRequest): Promise<Location> {
    return await fetchApiAuth<Location>(`/api/v1/warehouses/${warehouseId}/locations/${locationId}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
}

/**
 * Usuwa lokalizację z magazynu
 * @param warehouseId - ID magazynu
 * @param locationId - ID lokalizacji
 */
export async function deleteLocation(warehouseId: number, locationId: number): Promise<void> {
    await fetchApiAuth<void>(`/api/v1/warehouses/${warehouseId}/locations/${locationId}`, {
        method: 'DELETE'
    });
}

// ============================================
// Product API
// ============================================

/**
 * Pobiera listę produktów w lokalizacji
 * @param warehouseId - ID magazynu
 * @param locationId - ID lokalizacji
 */
export async function getProducts(warehouseId: number, locationId: number): Promise<Product[]> {
    return await fetchApiAuth<Product[]>(`/api/v1/warehouses/${warehouseId}/${locationId}/products`);
}

/**
 * Pobiera szczegóły produktu
 * @param warehouseId - ID magazynu
 * @param locationId - ID lokalizacji
 * @param productId - ID produktu
 */
export async function getProduct(warehouseId: number, locationId: number, productId: number): Promise<Product> {
    return await fetchApiAuth<Product>(`/api/v1/warehouses/${warehouseId}/${locationId}/products/${productId}`);
}

/**
 * Tworzy nowy produkt w lokalizacji
 * @param warehouseId - ID magazynu
 * @param locationId - ID lokalizacji
 * @param data - Dane produktu
 */
export async function createProduct(warehouseId: number, locationId: number, data: CreateProductRequest): Promise<Product> {
    return await fetchApiAuth<Product>(`/api/v1/warehouses/${warehouseId}/${locationId}/products`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * Aktualizuje produkt
 * @param warehouseId - ID magazynu
 * @param locationId - ID lokalizacji
 * @param productId - ID produktu
 * @param data - Dane produktu
 */
export async function updateProduct(warehouseId: number, locationId: number, productId: number, data: CreateProductRequest): Promise<Product> {
    const endpoint = `/api/v1/warehouses/${warehouseId}/${locationId}/products/${productId}`;

    return await fetchApiAuth<Product>(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
}

/**
 * Usuwa produkt
 * @param warehouseId - ID magazynu
 * @param locationId - ID lokalizacji
 * @param productId - ID produktu
 */
export async function deleteProduct(warehouseId: number, locationId: number, productId: number): Promise<void> {
    await fetchApiAuth<void>(`/api/v1/warehouses/${warehouseId}/${locationId}/products/${productId}`, {
        method: 'DELETE'
    });
}

// ============================================
// Statistics API
// ============================================

export interface Top10ProductsParams {
  sortBy?: 'quantity' | 'price' | 'name';
  sortDirection?: 'asc' | 'desc';
  warehouseId?: number;
  locationId?: number;
  isAvailable?: boolean;
}

/**
 * Pobiera top 10 produktów na podstawie kryteriów
 * @param params - Parametry filtrowania i sortowania
 */
export async function getTop10Products(params?: Top10ProductsParams): Promise<Top10Product[]> {
    const queryParams = new URLSearchParams();

    if (params?.sortBy) {
        queryParams.append('sortBy', params.sortBy);
    }
    if (params?.sortDirection) {
        queryParams.append('sortDirection', params.sortDirection);
    }
    if (params?.warehouseId !== undefined) {
        queryParams.append('warehouseId', params.warehouseId.toString());
    }
    if (params?.locationId !== undefined) {
        queryParams.append('locationId', params.locationId.toString());
    }
    if (params?.isAvailable !== undefined) {
        queryParams.append('isAvailable', params.isAvailable.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/products/top10${queryString ? `?${queryString}` : ''}`;

    return await fetchApiAuth<Top10Product[]>(endpoint);
}

export interface ProductSearchParams {
  name?: string;
  warehouseId?: number;
  locationId?: number;
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
  isAvailable?: boolean;
  page?: number;
  size?: number;
  sortBy?: 'name' | 'price' | 'quantity' | 'id';
  sortDirection?: 'asc' | 'desc';
}

/**
 * Wyszukuje produkty z zaawansowanymi filtrami i paginacją po stronie serwera
 * @param params - Parametry wyszukiwania
 * @returns Paginated response with products
 */
export async function searchProducts(params?: ProductSearchParams): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();

    if (params?.name) {
        queryParams.append('name', params.name);
    }
    if (params?.warehouseId !== undefined) {
        queryParams.append('warehouseId', params.warehouseId.toString());
    }
    if (params?.locationId !== undefined) {
        queryParams.append('locationId', params.locationId.toString());
    }
    if (params?.minPrice !== undefined) {
        queryParams.append('minPrice', params.minPrice.toString());
    }
    if (params?.maxPrice !== undefined) {
        queryParams.append('maxPrice', params.maxPrice.toString());
    }
    if (params?.minQuantity !== undefined) {
        queryParams.append('minQuantity', params.minQuantity.toString());
    }
    if (params?.maxQuantity !== undefined) {
        queryParams.append('maxQuantity', params.maxQuantity.toString());
    }
    if (params?.isAvailable !== undefined) {
        queryParams.append('isAvailable', params.isAvailable.toString());
    }
    if (params?.page !== undefined) {
        queryParams.append('page', params.page.toString());
    }
    if (params?.size !== undefined) {
        queryParams.append('size', params.size.toString());
    }
    if (params?.sortBy) {
        queryParams.append('sortBy', params.sortBy);
    }
    if (params?.sortDirection) {
        queryParams.append('sortDirection', params.sortDirection);
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/products/search${queryString ? `?${queryString}` : ''}`;

    return await fetchApiAuth<PaginatedResponse<Product>>(endpoint);
}

/**
 * Wyszukuje produkty bez paginacji (dla backward compatibility i statistics)
 * @param params - Parametry wyszukiwania
 * @returns Array of products
 */
export async function searchProductsUnpaginated(params?: Omit<ProductSearchParams, 'page' | 'size' | 'sortBy' | 'sortDirection'>): Promise<Product[]> {
    const queryParams = new URLSearchParams();

    if (params?.name) {
        queryParams.append('name', params.name);
    }
    if (params?.warehouseId !== undefined) {
        queryParams.append('warehouseId', params.warehouseId.toString());
    }
    if (params?.locationId !== undefined) {
        queryParams.append('locationId', params.locationId.toString());
    }
    if (params?.minPrice !== undefined) {
        queryParams.append('minPrice', params.minPrice.toString());
    }
    if (params?.maxPrice !== undefined) {
        queryParams.append('maxPrice', params.maxPrice.toString());
    }
    if (params?.minQuantity !== undefined) {
        queryParams.append('minQuantity', params.minQuantity.toString());
    }
    if (params?.maxQuantity !== undefined) {
        queryParams.append('maxQuantity', params.maxQuantity.toString());
    }
    if (params?.isAvailable !== undefined) {
        queryParams.append('isAvailable', params.isAvailable.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/products/search${queryString ? `?${queryString}` : ''}`;

    // Backend returns paginated response, extract content array
    const response = await fetchApiAuth<PaginatedResponse<Product>>(endpoint);
    return response.content;
}

/**
 * Get product with full warehouse and location context
 * Searches for a product by ID and returns it with location information
 * @param productId - Product ID to search for
 * @param warehouseId - Optional warehouse ID to narrow search
 * @param locationId - Optional location ID to narrow search
 * @returns Product with full context or null if not found
 */
export async function getProductWithContext(productId: number, warehouseId?: number, locationId?: number): Promise<ProductWithContext | null> {
    try {
    // If we have both warehouse and location, use direct endpoint
        if (warehouseId && locationId) {
            const product = await getProduct(warehouseId, locationId, productId);

            // Fetch warehouse and location details
            const [warehouse, location] = await Promise.all([getWarehouse(warehouseId), getLocation(warehouseId, locationId)]);

            return {
                ...product,
                warehouseId,
                locationId,
                warehouseName: warehouse.name,
                warehouseCode: warehouse.code,
                locationCode: location.locationCode,
                zoneName: location.zoneName,
                locationType: location.locationType
            };
        }

        // Otherwise, search across all warehouses/locations
        // This is a fallback - search with product ID filter
        const searchResult = await searchProducts({
            page: 0,
            size: 100 // Limit search results
        });

        // Find the product in search results
        const product = searchResult.content.find((p) => p.id === productId);
        if (!product) {
            return null;
        }

        // If product has context, fetch additional details
        if (product.warehouseId && product.locationId) {
            const [warehouse, location] = await Promise.all([getWarehouse(product.warehouseId), getLocation(product.warehouseId, product.locationId)]);

            return {
                ...product,
                warehouseId: product.warehouseId,
                locationId: product.locationId,
                warehouseName: warehouse.name,
                warehouseCode: warehouse.code,
                locationCode: location.locationCode,
                zoneName: location.zoneName,
                locationType: location.locationType
            };
        }

        // Return product without full context if we can't determine location
        return product as ProductWithContext;
    } catch (err) {
        throw err;
    }
}

/**
 * Enrich products with warehouse and location context
 * Takes products and adds warehouse/location names and codes
 * @param products - Array of products to enrich
 * @param warehouseId - Warehouse ID for context
 * @param locationId - Location ID for context
 * @returns Products with full context
 */
export async function enrichProductsWithContext(products: Product[], warehouseId?: number, locationId?: number): Promise<ProductWithContext[]> {
    // If no context provided, return products as-is
    if (!warehouseId || !locationId) {
        return products.map((p) => ({
            ...p,
            warehouseId: p.warehouseId || 0,
            locationId: p.locationId || 0
        }));
    }

    try {
    // Fetch warehouse and location details once
        const [warehouse, location] = await Promise.all([getWarehouse(warehouseId), getLocation(warehouseId, locationId)]);

        // Enrich all products with context
        return products.map((product) => ({
            ...product,
            warehouseId,
            locationId,
            warehouseName: warehouse.name,
            warehouseCode: warehouse.code,
            locationCode: location.locationCode,
            zoneName: location.zoneName,
            locationType: location.locationType
        }));
    } catch {
    // If enrichment fails, return products with basic context
        return products.map((p) => ({
            ...p,
            warehouseId: warehouseId || p.warehouseId || 0,
            locationId: locationId || p.locationId || 0
        }));
    }
}

// ============================================
// Export API
// ============================================

export interface ExportInventoryParams {
  scope: 'ORGANISATION' | 'WAREHOUSE' | 'LOCATION';
  warehouseId?: number;
  locationId?: number;
}

/**
 * Export inventory to PDF
 * @param params - Export parameters (scope, warehouse, location)
 * @returns PDF blob for download
 */
export async function exportInventoryToPdf(params: ExportInventoryParams): Promise<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.append('scope', params.scope);

    if (params.warehouseId !== undefined) {
        queryParams.append('warehouseId', params.warehouseId.toString());
    }
    if (params.locationId !== undefined) {
        queryParams.append('locationId', params.locationId.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/exports/inventory/pdf${queryString ? `?${queryString}` : ''}`;

    // Check authentication
    if (!isAuthenticated()) {
        handleSessionExpiration();
        throw new ApiError(401, 'Session expired. Please log in again.');
    }

    const token = getToken();
    if (!token) {
        handleSessionExpiration();
        throw new ApiError(401, 'Missing authorization token');
    }

    // Fetch PDF as blob
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.text().catch(() => '');
        throw new ApiError(response.status, errorData || 'Failed to export PDF');
    }

    return await response.blob();
}

// ============================================
// Admin Statistics API
// ============================================

export interface SystemStatistics {
  totalWarehouses: number;
  totalLocations: number;
  totalProducts: number;
  totalInventoryValue: number;
  activeWarehouses: number;
  apiStatus: 'online' | 'offline';
  databaseStatus: 'connected' | 'disconnected';
}

export interface OrganisationStatistics {
  warehouseCount: number;
  locationCount: number;
  productCount: number;
  totalValue: number;
}

/**
 * Get system-wide statistics for admin panel
 * Aggregates data from all available endpoints
 */
export async function getSystemStatistics(): Promise<SystemStatistics> {
    try {
    // Fetch all warehouses
        const warehouses = await getWarehouses();
        const totalWarehouses = warehouses.length;
        const activeWarehouses = warehouses.filter((w) => w.name && w.code).length;

        // Fetch all locations from all warehouses
        let totalLocations = 0;
        const locationPromises = warehouses.map((w) => getLocations(w.id).catch(() => []));
        const locationsArrays = await Promise.all(locationPromises);
        locationsArrays.forEach((locations) => {
            totalLocations += locations.length;
        });

        // Search for all products (unpaginated)
        const products = await searchProductsUnpaginated({});
        const totalProducts = products.length;

        // Calculate total inventory value
        const totalInventoryValue = products.reduce((sum, product) => {
            return sum + (product.price || 0) * (product.quantity || 0);
        }, 0);

        return {
            totalWarehouses,
            totalLocations,
            totalProducts,
            totalInventoryValue,
            activeWarehouses,
            apiStatus: 'online',
            databaseStatus: 'connected'
        };
    } catch {
    // If API fails, return offline status
        return {
            totalWarehouses: 0,
            totalLocations: 0,
            totalProducts: 0,
            totalInventoryValue: 0,
            activeWarehouses: 0,
            apiStatus: 'offline',
            databaseStatus: 'disconnected'
        };
    }
}

/**
 * Get organisation statistics for organisation page
 * Similar to system statistics but focused on organisation data
 */
export async function getOrganisationStatistics(): Promise<OrganisationStatistics> {
    try {
    // Fetch all warehouses
        const warehouses = await getWarehouses();
        const warehouseCount = warehouses.length;

        // Fetch all locations from all warehouses
        let locationCount = 0;
        const locationPromises = warehouses.map((w) => getLocations(w.id).catch(() => []));
        const locationsArrays = await Promise.all(locationPromises);
        locationsArrays.forEach((locations) => {
            locationCount += locations.length;
        });

        // Search for all products
        const products = await searchProductsUnpaginated({});
        const productCount = products.length;

        // Calculate total value
        const totalValue = products.reduce((sum, product) => {
            return sum + (product.price || 0) * (product.quantity || 0);
        }, 0);

        return {
            warehouseCount,
            locationCount,
            productCount,
            totalValue
        };
    } catch {
        return {
            warehouseCount: 0,
            locationCount: 0,
            productCount: 0,
            totalValue: 0
        };
    }
}

// ============================================
// Admin User Management API
// ============================================

/**
 * Get all users (admin only)
 * @returns Array of all users in the system
 */
export async function getAllUsers(): Promise<UserResponse[]> {
    return await fetchApiAuth<UserResponse[]>('/api/admin/users');
}

/**
 * Get user by ID (admin only)
 * @param id - User ID
 * @returns User details
 */
export async function getUserById(id: number): Promise<UserResponse> {
    return await fetchApiAuth<UserResponse>(`/api/admin/users/${id}`);
}

/**
 * Create a new user (admin only)
 * @param data - User creation data
 * @returns Created user
 */
export async function createUser(data: AdminCreateUserRequest): Promise<UserResponse> {
    return await fetchApiAuth<UserResponse>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * Update an existing user (admin only)
 * @param id - User ID
 * @param data - User update data
 * @returns Updated user
 */
export async function updateUser(id: number, data: AdminUpdateUserRequest): Promise<UserResponse> {
    return await fetchApiAuth<UserResponse>(`/api/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * Delete a user (admin only)
 * @param id - User ID
 */
export async function deleteUser(id: number): Promise<void> {
    await fetchApiAuth<void>(`/api/admin/users/${id}`, {
        method: 'DELETE'
    });
}

/**
 * Assign user to organisation (admin only)
 * @param userId - User ID
 * @param organisationId - Organisation ID
 * @returns Updated user
 */
export async function assignUserToOrganisation(userId: number, organisationId: number): Promise<UserResponse> {
    return await fetchApiAuth<UserResponse>(`/api/admin/users/${userId}/organisation/${organisationId}`, {
        method: 'PUT'
    });
}

// ============================================
// Admin Organisation Management API
// ============================================

/**
 * Get all organisations (admin only)
 * @returns Array of all organisations in the system
 */
export async function getAllOrganisations(): Promise<OrganisationResponse[]> {
    return await fetchApiAuth<OrganisationResponse[]>('/api/admin/organisations');
}

/**
 * Get organisation by ID (admin only)
 * @param id - Organisation ID
 * @returns Organisation details
 */
export async function getOrganisationById(id: number): Promise<OrganisationResponse> {
    return await fetchApiAuth<OrganisationResponse>(`/api/admin/organisations/${id}`);
}

/**
 * Create a new organisation (admin only)
 * @param data - Organisation creation data
 * @returns Created organisation
 */
export async function createOrganisation(data: CreateOrganisationRequest): Promise<OrganisationResponse> {
    return await fetchApiAuth<OrganisationResponse>('/api/admin/organisations', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * Update an existing organisation (admin only)
 * @param id - Organisation ID
 * @param data - Organisation update data
 * @returns Updated organisation
 */
export async function updateOrganisation(id: number, data: UpdateOrganisationRequest): Promise<OrganisationResponse> {
    return await fetchApiAuth<OrganisationResponse>(`/api/admin/organisations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * Delete an organisation (admin only)
 * @param id - Organisation ID
 */
export async function deleteOrganisation(id: number): Promise<void> {
    await fetchApiAuth<void>(`/api/admin/organisations/${id}`, {
        method: 'DELETE'
    });
}

/**
 * Get warehouses for a specific organisation (admin only)
 * @param organisationId - Organisation ID
 * @returns Array of warehouses belonging to the organisation
 */
export async function getWarehousesByOrganisation(organisationId: number): Promise<Warehouse[]> {
    return await fetchApiAuth<Warehouse[]>(`/api/admin/organisations/${organisationId}/warehouses`);
}
