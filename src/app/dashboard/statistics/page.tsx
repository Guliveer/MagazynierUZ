'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTop10Products, getWarehouses, type Top10ProductsParams } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Top10Product, Warehouse } from '@/types';
import { Top10Chart } from '@/components/statistics/Top10Chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BarChart3 } from 'lucide-react';

export default function StatisticsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Top10Product[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [sortBy, setSortBy] = useState<'quantity' | 'price' | 'name'>('quantity');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');

    // Check authentication
    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    // Fetch warehouses
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const data = await getWarehouses();
                setWarehouses(data);
            } catch (err) {
                console.error('Failed to fetch warehouses:', err);
            }
        };

        fetchWarehouses();
    }, []);

    // Fetch top 10 products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                const params: Top10ProductsParams = {
                    sortBy,
                    sortDirection
                };

                if (selectedWarehouse !== 'all') {
                    params.warehouseId = parseInt(selectedWarehouse);
                }

                const data = await getTop10Products(params);
                setProducts(data);
            } catch (err) {
                console.error('Failed to fetch top 10 products:', err);
                setError('Failed to load statistics. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [sortBy, sortDirection, selectedWarehouse]);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">Product Statistics</h1>
                    <p className="text-muted-foreground">Top 10 products based on selected criteria</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Customize the statistics view</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Sort By */}
                        <div className="space-y-2">
                            <Label htmlFor="sortBy">Sort By</Label>
                            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'quantity' | 'price' | 'name')}>
                                <SelectTrigger id="sortBy">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="quantity">Quantity</SelectItem>
                                    <SelectItem value="price">Price</SelectItem>
                                    <SelectItem value="name">Name</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort Direction */}
                        <div className="space-y-2">
                            <Label htmlFor="sortDirection">Sort Direction</Label>
                            <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as 'asc' | 'desc')}>
                                <SelectTrigger id="sortDirection">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desc">Descending (High to Low)</SelectItem>
                                    <SelectItem value="asc">Ascending (Low to High)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Warehouse Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="warehouse">Warehouse</Label>
                            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                                <SelectTrigger id="warehouse">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Warehouses</SelectItem>
                                    {warehouses.map((warehouse) => (
                                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                            {warehouse.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Top 10 Products</CardTitle>
                    <CardDescription>
                        {sortBy === 'quantity' && 'Products with the highest quantities'}
                        {sortBy === 'price' && 'Products with the highest prices'}
                        {sortBy === 'name' && 'Products sorted alphabetically'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-[400px]">
                            <Spinner className="h-8 w-8" />
                        </div>
                    ) : error ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                            <BarChart3 className="h-16 w-16 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No products found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <Top10Chart data={products} sortBy={sortBy} />
                    )}
                </CardContent>
            </Card>

            {/* Products Table */}
            {!loading && !error && products.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Product Details</CardTitle>
                        <CardDescription>Detailed information about the top 10 products</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2 font-medium">Rank</th>
                                        <th className="text-left p-2 font-medium">Name</th>
                                        <th className="text-left p-2 font-medium">Description</th>
                                        <th className="text-right p-2 font-medium">Quantity</th>
                                        <th className="text-right p-2 font-medium">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, index) => (
                                        <tr key={product.id} className="border-b hover:bg-muted/50">
                                            <td className="p-2 font-mono text-muted-foreground">{index + 1}</td>
                                            <td className="p-2 font-medium">{product.name}</td>
                                            <td className="p-2 text-muted-foreground">{product.description}</td>
                                            <td className="p-2 text-right font-mono">{product.quantity}</td>
                                            <td className="p-2 text-right font-mono">{product.price.toFixed(2)} PLN</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
