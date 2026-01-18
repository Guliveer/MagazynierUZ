"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Top10Product } from "@/types";

interface Top10ChartProps {
  data: Top10Product[];
  sortBy: "quantity" | "price" | "name";
  viewType?: "bar" | "pie";
  onBarClick?: (product: Top10Product) => void;
}

export function Top10Chart({ data, sortBy, viewType = "bar", onBarClick }: Top10ChartProps) {
  // Transform data for the chart
  const chartData = data.map((product) => ({
    name: product.name,
    value: sortBy === "quantity" ? product.quantity : product.price,
    totalValue: product.quantity * product.price,
    productId: product.id,
    description: product.description,
    quantity: product.quantity,
    price: product.price,
    product: product,
  }));

  // Chart configuration
  const chartConfig = {
    value: {
      label: sortBy === "quantity" ? "Quantity" : "Price",
      color: "hsl(var(--primary))",
    },
  };

  // Colors for pie chart
  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(220, 70%, 50%)", "hsl(280, 70%, 50%)", "hsl(340, 70%, 50%)", "hsl(40, 70%, 50%)", "hsl(160, 70%, 50%)"];

  const handleBarClick = (data: any) => {
    if (onBarClick && data.product) {
      onBarClick(data.product);
    }
  };

  if (viewType === "pie") {
    const pieData = chartData.map((item, index) => ({
      name: item.name,
      value: item.totalValue,
      fill: COLORS[index % COLORS.length],
    }));

    return (
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={120} fill="#8884d8" dataKey="value">
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <RechartsTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0];
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-semibold">{data.name}</div>
                      <div className="text-sm text-muted-foreground">Value: {Number(data.value).toFixed(2)} PLN</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 12 }} className="text-muted-foreground" />
          <YAxis
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            label={{
              value: sortBy === "quantity" ? "Quantity" : "Price (PLN)",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
            }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, props) => {
                  const payload = props.payload;
                  return (
                    <div className="space-y-1">
                      <div className="font-semibold">{payload.name}</div>
                      <div className="text-xs text-muted-foreground">{payload.description}</div>
                      <div className="flex justify-between gap-4 pt-1">
                        <span>Quantity:</span>
                        <span className="font-mono">{payload.quantity}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Price:</span>
                        <span className="font-mono">{payload.price.toFixed(2)} PLN</span>
                      </div>
                      <div className="flex justify-between gap-4 border-t pt-1">
                        <span>Total Value:</span>
                        <span className="font-mono font-semibold">{payload.totalValue.toFixed(2)} PLN</span>
                      </div>
                    </div>
                  );
                }}
              />
            }
          />
          <Bar dataKey="value" fill="var(--color-value)" radius={[8, 8, 0, 0]} onClick={handleBarClick} className="cursor-pointer" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
