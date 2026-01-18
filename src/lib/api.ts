import type { LoginResponse, Warehouse, CreateWarehouseRequest, Location, CreateLocationRequest, Product, CreateProductRequest, Top10Product } from '@/types';
import { getToken } from '@/lib/auth';

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
 * @param endpoint - Endpoint API (bez base URL)
 * @param options - Opcje fetch
 * @returns Promise z odpowiedzią
 * @throws ApiError gdy brak tokenu lub błąd API
 */
async function fetchApiAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    if (!token) {
        throw new ApiError(401, 'Missing authorization token');
    }

    return await fetchApi<T>(endpoint, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`
        }
    });
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
    return await fetchApiAuth<Product>(`/api/v1/warehouses/${warehouseId}/${locationId}/products/${productId}`, {
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
}

/**
 * Wyszukuje produkty z zaawansowanymi filtrami
 * @param params - Parametry wyszukiwania
 */
export async function searchProducts(params?: ProductSearchParams): Promise<Product[]> {
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

    return await fetchApiAuth<Product[]>(endpoint);
}
