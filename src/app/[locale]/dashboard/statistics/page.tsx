'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { getTop10Products, getWarehouses, getLocations, searchProductsUnpaginated } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Top10Product, Warehouse, Location, Product, ChartViewType } from '@/types';
import { Top10Chart } from '@/components/statistics/Top10Chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'shadcn/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'shadcn/select';
import { Label } from 'shadcn/label';
import { Spinner } from 'shadcn/spinner';
import { Alert, AlertDescription } from 'shadcn/alert';
import { Button } from 'shadcn/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'shadcn/tabs';
import { Switch } from 'shadcn/switch';
import { Badge } from 'shadcn/badge';
import { Skeleton } from 'shadcn/skeleton';
import { AlertCircle, BarChart3, TrendingUp, Package, DollarSign, Warehouse as WarehouseIcon, AlertTriangle, RefreshCw, Download, Clock, Filter, PieChart as PieChartIcon } from 'lucide-react';

export default function StatisticsPage() {
    const router = useRouter();
    const t = useTranslations('statistics');
    const locale = useLocale();
    const [products, setProducts] = useState<Top10Product[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [autoRefresh, setAutoRefresh] = useState(false);

    const [sortBy, setSortBy] = useState<'quantity' | 'price' | 'name'>('quantity');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
    const [selectedLocation, setSelectedLocation] = useState<string>('all');
    const [showAvailableOnly, setShowAvailableOnly] = useState(false);
    const [chartView, setChartView] = useState<ChartViewType>('quantity');

    const [summaryStats, setSummaryStats] = useState({
        totalProducts: 0,
        totalInventoryValue: 0,
        averagePrice: 0,
        warehousesCount: 0,
        lowStockCount: 0
    });

    const formatCurrency = useCallback(
        (value: number) => {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: 'PLN',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);
        },
        [locale]
    );

    const formatNumber = useCallback(
        (value: number) => {
            return new Intl.NumberFormat(locale).format(value);
        },
        [locale]
    );

    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
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
        } catch {
            setError(t('messages.error'));
        } finally {
            setLoading(false);
        }
    }, [sortBy, sortDirection, selectedWarehouse, selectedLocation, showAvailableOnly, t]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    useEffect(() => {
        const fetchLocations = async () => {
            if (selectedWarehouse !== 'all') {
                try {
                    const data = await getLocations(parseInt(selectedWarehouse));
                    setLocations(data);
                } catch {
                    setLocations([]);
                }
            } else {
                setLocations([]);
                setSelectedLocation('all');
            }
        };

        fetchLocations();
    }, [selectedWarehouse]);

    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                fetchAllData();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [autoRefresh, fetchAllData]);

    const exportToCSV = () => {
        const headers = [t('table.headers.rank'), t('table.headers.name'), t('table.headers.description'), t('table.headers.quantity'), t('table.headers.price'), t('table.headers.totalValue')];
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

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">{t('title')}</h1>
                        <p className="text-muted-foreground">{t('subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{t('lastUpdated', { time: lastUpdated.toLocaleTimeString(locale) })}</span>
                    </div>
                    <Button onClick={fetchAllData} variant="outline" size="sm" disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {t('actions.refresh')}
                    </Button>
                    <Button onClick={exportToCSV} variant="outline" size="sm" disabled={products.length === 0}>
                        <Download className="h-4 w-4 mr-2" />
                        {t('actions.exportCsv')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('summary.totalProducts')}</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{formatNumber(summaryStats.totalProducts)}</div>
                                <p className="text-xs text-muted-foreground">{t('summary.totalProductsDesc')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('summary.totalValue')}</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalInventoryValue)}</div>
                                <p className="text-xs text-muted-foreground">{t('summary.totalValueDesc')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('summary.averagePrice')}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{formatCurrency(summaryStats.averagePrice)}</div>
                                <p className="text-xs text-muted-foreground">{t('summary.averagePriceDesc')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('summary.warehouses')}</CardTitle>
                        <WarehouseIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-12" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{formatNumber(summaryStats.warehousesCount)}</div>
                                <p className="text-xs text-muted-foreground">{t('summary.warehousesDesc')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('summary.lowStock')}</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-12" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-destructive">{formatNumber(summaryStats.lowStockCount)}</div>
                                <p className="text-xs text-muted-foreground">{t('summary.lowStockDesc')}</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                {t('filters.title')}
                            </CardTitle>
                            <CardDescription>{t('filters.description')}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="auto-refresh" className="text-sm">
                                {t('filters.autoRefresh')}
                            </Label>
                            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t('filters.quickFilters')}</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => applyQuickFilter('highValue')}>
                                <TrendingUp className="h-4 w-4 mr-2" />
                                {t('filters.highValue')}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => applyQuickFilter('lowStock')}>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                {t('filters.lowStock')}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => applyQuickFilter('mostPopular')}>
                                <Package className="h-4 w-4 mr-2" />
                                {t('filters.mostPopular')}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sortBy">{t('filters.sortBy')}</Label>
                            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'quantity' | 'price' | 'name')}>
                                <SelectTrigger id="sortBy">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="quantity">{t('filters.sortOptions.quantity')}</SelectItem>
                                    <SelectItem value="price">{t('filters.sortOptions.price')}</SelectItem>
                                    <SelectItem value="name">{t('filters.sortOptions.name')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sortDirection">{t('filters.sortDirection')}</Label>
                            <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as 'asc' | 'desc')}>
                                <SelectTrigger id="sortDirection">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desc">{t('filters.sortDirectionOptions.desc')}</SelectItem>
                                    <SelectItem value="asc">{t('filters.sortDirectionOptions.asc')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="warehouse">{t('filters.warehouse')}</Label>
                            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                                <SelectTrigger id="warehouse">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('filters.allWarehouses')}</SelectItem>
                                    {warehouses.map((warehouse) => (
                                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                            {warehouse.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">{t('filters.location')}</Label>
                            <Select value={selectedLocation} onValueChange={setSelectedLocation} disabled={selectedWarehouse === 'all' || locations.length === 0}>
                                <SelectTrigger id="location">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('filters.allLocations')}</SelectItem>
                                    {locations.map((location) => (
                                        <SelectItem key={location.id} value={location.id.toString()}>
                                            {location.locationCode} - {location.zoneName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="available">{t('filters.showAvailableOnly')}</Label>
                            <div className="flex items-center h-10 px-3 border rounded-md">
                                <Switch id="available" checked={showAvailableOnly} onCheckedChange={setShowAvailableOnly} />
                                <span className="ml-2 text-sm">{showAvailableOnly ? t('filters.yes') : t('filters.no')}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs value={chartView} onValueChange={(value) => setChartView(value as ChartViewType)} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="quantity">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        {t('charts.tabs.byQuantity')}
                    </TabsTrigger>
                    <TabsTrigger value="price">
                        <DollarSign className="h-4 w-4 mr-2" />
                        {t('charts.tabs.byPrice')}
                    </TabsTrigger>
                    <TabsTrigger value="totalValue">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        {t('charts.tabs.totalValue')}
                    </TabsTrigger>
                    <TabsTrigger value="comparison">
                        <PieChartIcon className="h-4 w-4 mr-2" />
                        {t('charts.tabs.distribution')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="quantity" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('charts.titles.byQuantity')}</CardTitle>
                            <CardDescription>{t('charts.descriptions.byQuantity')}</CardDescription>
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
                                    <p className="text-lg font-medium">{t('messages.noProducts')}</p>
                                    <p className="text-sm">{t('messages.noProductsDescription')}</p>
                                </div>
                            ) : (
                                <Top10Chart data={products} sortBy="quantity" viewType="bar" locale={locale} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="price" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('charts.titles.byPrice')}</CardTitle>
                            <CardDescription>{t('charts.descriptions.byPrice')}</CardDescription>
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
                                    <p className="text-lg font-medium">{t('messages.noProducts')}</p>
                                    <p className="text-sm">{t('messages.noProductsDescription')}</p>
                                </div>
                            ) : (
                                <Top10Chart data={products} sortBy="price" viewType="bar" locale={locale} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="totalValue" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('charts.titles.totalValue')}</CardTitle>
                            <CardDescription>{t('charts.descriptions.totalValue')}</CardDescription>
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
                                    <p className="text-lg font-medium">{t('messages.noProducts')}</p>
                                    <p className="text-sm">{t('messages.noProductsDescription')}</p>
                                </div>
                            ) : (
                                <Top10Chart data={products.map((p) => ({ ...p, price: p.quantity * p.price }))} sortBy="price" viewType="bar" locale={locale} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="comparison" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('charts.titles.distribution')}</CardTitle>
                            <CardDescription>{t('charts.descriptions.distribution')}</CardDescription>
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
                                    <p className="text-lg font-medium">{t('messages.noData')}</p>
                                    <p className="text-sm">{t('messages.noProductsDescription')}</p>
                                </div>
                            ) : (
                                <Top10Chart data={products} sortBy="quantity" viewType="pie" locale={locale} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {!loading && !error && products.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('table.title')}</CardTitle>
                        <CardDescription>{t('table.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2 font-medium">{t('table.headers.rank')}</th>
                                        <th className="text-left p-2 font-medium">{t('table.headers.name')}</th>
                                        <th className="text-left p-2 font-medium">{t('table.headers.description')}</th>
                                        <th className="text-right p-2 font-medium">{t('table.headers.quantity')}</th>
                                        <th className="text-right p-2 font-medium">{t('table.headers.price')}</th>
                                        <th className="text-right p-2 font-medium">{t('table.headers.totalValue')}</th>
                                        <th className="text-center p-2 font-medium">{t('table.headers.status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, index) => (
                                        <tr key={product.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="p-2 font-mono text-muted-foreground">{index + 1}</td>
                                            <td className="p-2 font-medium">{product.name}</td>
                                            <td className="p-2 text-muted-foreground">{product.description}</td>
                                            <td className="p-2 text-right font-mono">{formatNumber(product.quantity)}</td>
                                            <td className="p-2 text-right font-mono">{formatCurrency(product.price)}</td>
                                            <td className="p-2 text-right font-mono font-semibold">{formatCurrency(product.quantity * product.price)}</td>
                                            <td className="p-2 text-center">{product.quantity < 10 ? <Badge variant="destructive">{t('status.lowStock')}</Badge> : product.quantity < 50 ? <Badge variant="secondary">{t('status.medium')}</Badge> : <Badge variant="default">{t('status.inStock')}</Badge>}</td>
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
