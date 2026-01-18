"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Warehouse as WarehouseIcon, TrendingUp, AlertTriangle, Plus, Search, BarChart3, ArrowRight } from "lucide-react";
import { getWarehouses, searchProductsUnpaginated, getTop10Products } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Warehouse, Product, Top10Product } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<Top10Product[]>([]);

  // Summary statistics
  const [stats, setStats] = useState({
    totalWarehouses: 0,
    totalProducts: 0,
    totalInventoryValue: 0,
    lowStockCount: 0,
  });

  // Check authentication
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [warehousesData, productsData, topProductsData] = await Promise.all([getWarehouses().catch(() => []), searchProductsUnpaginated().catch(() => []), getTop10Products({ sortBy: "quantity", sortDirection: "desc" }).catch(() => [])]);

      setWarehouses(warehousesData);
      setProducts(productsData);
      setTopProducts(topProductsData.slice(0, 3)); // Only top 3 for dashboard

      // Calculate statistics
      const totalValue = productsData.reduce((sum: number, p) => sum + p.price * p.quantity, 0);
      const lowStock = productsData.filter((p: Product) => p.quantity < 10).length;

      setStats({
        totalWarehouses: warehousesData.length,
        totalProducts: productsData.length,
        totalInventoryValue: totalValue,
        lowStockCount: lowStock,
      });
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format price as PLN currency
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to your warehouse management system</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" size="sm" disabled={loading}>
          <TrendingUp className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Warehouses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
            <WarehouseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalWarehouses}</div>
                <p className="text-xs text-muted-foreground mt-1">Active locations</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">In inventory</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Inventory Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatPrice(stats.totalInventoryValue)}</div>
                <p className="text-xs text-muted-foreground mt-1">Total value</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-destructive">{stats.lowStockCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Below 10 units</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/products">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <Search className="h-6 w-6" />
                <span className="font-medium">Search Products</span>
                <span className="text-xs text-muted-foreground">Find and manage products</span>
              </Button>
            </Link>

            <Link href="/dashboard/warehouses">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <Plus className="h-6 w-6" />
                <span className="font-medium">Add Warehouse</span>
                <span className="text-xs text-muted-foreground">Create new warehouse</span>
              </Button>
            </Link>

            <Link href="/dashboard/statistics">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                <span className="font-medium">View Statistics</span>
                <span className="text-xs text-muted-foreground">Analytics and insights</span>
              </Button>
            </Link>

            <Link href="/dashboard/products">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                <Package className="h-6 w-6" />
                <span className="font-medium">Add Product</span>
                <span className="text-xs text-muted-foreground">Create new product</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top 3 Products</CardTitle>
                <CardDescription>Products with highest quantities</CardDescription>
              </div>
              <Link href="/dashboard/statistics">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No products found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">{index + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{product.description}</p>
                      </div>
                    </div>
                    <Badge variant={product.quantity > 50 ? "default" : product.quantity > 10 ? "secondary" : "destructive"}>{product.quantity} units</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Warehouses Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Warehouses</CardTitle>
                <CardDescription>Your warehouse locations</CardDescription>
              </div>
              <Link href="/dashboard/warehouses">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : warehouses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <WarehouseIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="mb-4">No warehouses found</p>
                <Link href="/dashboard/warehouses">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Warehouse
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {warehouses.slice(0, 3).map((warehouse) => (
                  <div key={warehouse.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <WarehouseIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{warehouse.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {warehouse.address.city}, {warehouse.address.street}
                        </p>
                      </div>
                    </div>
                    <Badge variant={warehouse.isActive ? "default" : "secondary"}>{warehouse.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                ))}
                {warehouses.length > 3 && (
                  <div className="text-center pt-2">
                    <Link href="/dashboard/warehouses">
                      <Button variant="link" size="sm">
                        View {warehouses.length - 3} more
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stock Level Indicators */}
      {!loading && products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Stock Level Overview</CardTitle>
            <CardDescription>Distribution of products by stock level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Stock</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{products.filter((p: Product) => p.quantity >= 50).length}</p>
                  <p className="text-xs text-muted-foreground">≥ 50 units</p>
                </div>
                <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Medium Stock</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{products.filter((p: Product) => p.quantity >= 10 && p.quantity < 50).length}</p>
                  <p className="text-xs text-muted-foreground">10-49 units</p>
                </div>
                <Package className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.lowStockCount}</p>
                  <p className="text-xs text-muted-foreground">&lt; 10 units</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
