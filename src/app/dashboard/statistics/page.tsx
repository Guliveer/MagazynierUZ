'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getTop10Products, getWarehouses, getLocations, searchProductsUnpaginated } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Top10Product, Warehouse, Location, Product, ChartViewType } from '@/types';
import { Top10Chart } from '@/components/statistics/Top10Chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, BarChart3, TrendingUp, Package, DollarSign, Warehouse as WarehouseIcon, AlertTriangle, RefreshCw, Download, Clock, Filter, PieChart as PieChartIcon } from 'lucide-react';

export default function StatisticsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Top10Product[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [autoRefresh, setAutoRefresh] = useState(false);

    // Filter states
    const [sortBy, setSortBy] = useState<'quantity' | 'price' | 'name'>('quantity');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
    const [selectedLocation, setSelectedLocation] = useState<string>('all');
    const [showAvailableOnly, setShowAvailableOnly] = useState(false);
    const [chartView, setChartView] = useState<ChartViewType>('quantity');

    // Summary statistics
    const [summaryStats, setSummaryStats] = useState({
        totalProducts: 0,
        totalInventoryValue: 0,
        averagePrice: 0,
        warehousesCount: 0,
        lowStockCount: 0
    });

    // Check authentication
    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    // Fetch all data in parallel
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Parallel API calls for better performance
            const [warehousesData, top10Data, searchData] = await Promise.all([
                getWarehouses().catch(() => []),
                getTop10Products({
                    sortBy,
                    sortDirection,
                    warehouseId: selectedWarehouse !== 'all' ? parseInt(selectedWarehouse) : undefined,
                    locationId: selectedLocation !== 'all' ? parseInt(selectedLocation) : undefined,
                    isAvailable: showAvailableOnly || undefined
                }).catch(() => []),
                searchProductsUnpaginated({
                    warehouseId: selectedWarehouse !== 'all' ? parseInt(selectedWarehouse) : undefined,
                    locationId: selectedLocation !== 'all' ? parseInt(selectedLocation) : undefined,
                    isAvailable: showAvailableOnly || undefined
                }).catch(() => [])
            ]);

            setWarehouses(warehousesData);
            setProducts(top10Data);

            // Calculate summary statistics
            const totalProducts = searchData.length;
            const totalValue = searchData.reduce((sum: number, p) => sum + p.price * p.quantity, 0);
            const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;
            const lowStock = searchData.filter((p: Product) => p.quantity < 10).length;

            setSummaryStats({
                totalProducts,
                totalInventoryValue: totalValue,
                averagePrice: avgPrice,
                warehousesCount: warehousesData.length,
                lowStockCount: lowStock
            });

            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load statistics. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [sortBy, sortDirection, selectedWarehouse, selectedLocation, showAvailableOnly]);

    // Initial data fetch
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Fetch locations when warehouse changes
    useEffect(() => {
        const fetchLocations = async () => {
            if (selectedWarehouse !== 'all') {
                try {
                    const data = await getLocations(parseInt(selectedWarehouse));
                    setLocations(data);
                } catch (err) {
                    console.error('Failed to fetch locations:', err);
                    setLocations([]);
                }
            } else {
                setLocations([]);
                setSelectedLocation('all');
            }
        };

        fetchLocations();
    }, [selectedWarehouse]);

    // Auto-refresh functionality
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                fetchAllData();
            }, 30000); // Refresh every 30 seconds

            return () => clearInterval(interval);
        }
    }, [autoRefresh, fetchAllData]);

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Rank', 'Name', 'Description', 'Quantity', 'Price (PLN)', 'Total Value (PLN)'];
        const rows = products.map((product, index) => [index + 1, product.name, product.description, product.quantity, product.price.toFixed(2), (product.quantity * product.price).toFixed(2)]);

        const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `statistics_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Quick filter presets
    const applyQuickFilter = (filter: 'highValue' | 'lowStock' | 'mostPopular') => {
        switch (filter) {
            case 'highValue':
                setSortBy('price');
                setSortDirection('desc');
                break;
            case 'lowStock':
                setSortBy('quantity');
                setSortDirection('asc');
                break;
            case 'mostPopular':
                setSortBy('quantity');
                setSortDirection('desc');
                break;
        }
    };

    // Unused functions kept for future use
    // const getChartData = () => {
    //     switch (chartView) {
    //         case 'quantity':
    //             return { data: products, sortBy: 'quantity' as const };
    //         case 'price':
    //             return { data: products, sortBy: 'price' as const };
    //         case 'totalValue':
    //             return {
    //                 data: products.map((p) => ({ ...p, price: p.quantity * p.price })),
    //                 sortBy: 'price' as const
    //             };
    //         default:
    //             return { data: products, sortBy };
    //     }
    // };

    // const warehouseDistribution = warehouses.map((warehouse) => {
    //     const warehouseProducts = allProducts.filter(() => {
    //         // This is a simplified calculation - in real scenario, products would have warehouse info
    //         return true; // Include all for now
    //     });
    //     const totalValue = warehouseProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    //     return {
    //         name: warehouse.name,
    //         value: totalValue,
    //         productCount: warehouseProducts.length
    //     };
    // });

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Product Statistics</h1>
                        <p className="text-muted-foreground">Comprehensive analytics and insights</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
                    </div>
                    <Button onClick={fetchAllData} variant="outline" size="sm" disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
                    </Button>
                    <Button onClick={exportToCSV} variant="outline" size="sm" disabled={products.length === 0}>
                        <Download className="h-4 w-4 mr-2" />
            Export CSV
                    </Button>
                </div>
            </div>

            {/* Summary Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{summaryStats.totalProducts}</div>
                                <p className="text-xs text-muted-foreground">Across all locations</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{summaryStats.totalInventoryValue.toFixed(2)} PLN</div>
                                <p className="text-xs text-muted-foreground">Inventory value</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Price</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{summaryStats.averagePrice.toFixed(2)} PLN</div>
                                <p className="text-xs text-muted-foreground">Per product</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Warehouses</CardTitle>
                        <WarehouseIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-12" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{summaryStats.warehousesCount}</div>
                                <p className="text-xs text-muted-foreground">Active locations</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-12" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-destructive">{summaryStats.lowStockCount}</div>
                                <p className="text-xs text-muted-foreground">Below 10 units</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Filters Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                Filters & Settings
                            </CardTitle>
                            <CardDescription>Customize the statistics view</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="auto-refresh" className="text-sm">
                Auto-refresh
                            </Label>
                            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Quick Filters */}
                    <div className="space-y-2">
                        <Label>Quick Filters</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => applyQuickFilter('highValue')}>
                                <TrendingUp className="h-4 w-4 mr-2" />
                High Value
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => applyQuickFilter('lowStock')}>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                Low Stock
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => applyQuickFilter('mostPopular')}>
                                <Package className="h-4 w-4 mr-2" />
                Most Popular
                            </Button>
                        </div>
                    </div>

                    {/* Main Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                                    <SelectItem value="desc">Descending</SelectItem>
                                    <SelectItem value="asc">Ascending</SelectItem>
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

                        {/* Location Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Select value={selectedLocation} onValueChange={setSelectedLocation} disabled={selectedWarehouse === 'all' || locations.length === 0}>
                                <SelectTrigger id="location">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Locations</SelectItem>
                                    {locations.map((location) => (
                                        <SelectItem key={location.id} value={location.id.toString()}>
                                            {location.locationCode} - {location.zoneName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Availability Toggle */}
                        <div className="space-y-2">
                            <Label htmlFor="available">Show Available Only</Label>
                            <div className="flex items-center h-10 px-3 border rounded-md">
                                <Switch id="available" checked={showAvailableOnly} onCheckedChange={setShowAvailableOnly} />
                                <span className="ml-2 text-sm">{showAvailableOnly ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Charts Section */}
            <Tabs value={chartView} onValueChange={(value) => setChartView(value as ChartViewType)} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="quantity">
                        <BarChart3 className="h-4 w-4 mr-2" />
            By Quantity
                    </TabsTrigger>
                    <TabsTrigger value="price">
                        <DollarSign className="h-4 w-4 mr-2" />
            By Price
                    </TabsTrigger>
                    <TabsTrigger value="totalValue">
                        <TrendingUp className="h-4 w-4 mr-2" />
            Total Value
                    </TabsTrigger>
                    <TabsTrigger value="comparison">
                        <PieChartIcon className="h-4 w-4 mr-2" />
            Distribution
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="quantity" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 10 Products by Quantity</CardTitle>
                            <CardDescription>Products with the highest quantities in stock</CardDescription>
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
                                <Top10Chart data={products} sortBy="quantity" viewType="bar" />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="price" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 10 Products by Price</CardTitle>
                            <CardDescription>Most expensive products in inventory</CardDescription>
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
                                <Top10Chart data={products} sortBy="price" viewType="bar" />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="totalValue" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 10 Products by Total Value</CardTitle>
                            <CardDescription>Products with highest total inventory value (quantity × price)</CardDescription>
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
                                <Top10Chart data={products.map((p) => ({ ...p, price: p.quantity * p.price }))} sortBy="price" viewType="bar" />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="comparison" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Warehouse Distribution</CardTitle>
                            <CardDescription>Distribution of product value across warehouses</CardDescription>
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
                                    <PieChartIcon className="h-16 w-16 mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No data available</p>
                                    <p className="text-sm">Try adjusting your filters</p>
                                </div>
                            ) : (
                                <Top10Chart data={products} sortBy="quantity" viewType="pie" />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

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
                                        <th className="text-right p-2 font-medium">Total Value</th>
                                        <th className="text-center p-2 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, index) => (
                                        <tr key={product.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="p-2 font-mono text-muted-foreground">{index + 1}</td>
                                            <td className="p-2 font-medium">{product.name}</td>
                                            <td className="p-2 text-muted-foreground">{product.description}</td>
                                            <td className="p-2 text-right font-mono">{product.quantity}</td>
                                            <td className="p-2 text-right font-mono">{product.price.toFixed(2)} PLN</td>
                                            <td className="p-2 text-right font-mono font-semibold">{(product.quantity * product.price).toFixed(2)} PLN</td>
                                            <td className="p-2 text-center">{product.quantity < 10 ? <Badge variant="destructive">Low Stock</Badge> : product.quantity < 50 ? <Badge variant="secondary">Medium</Badge> : <Badge variant="default">In Stock</Badge>}</td>
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
