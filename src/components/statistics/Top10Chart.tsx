'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { Top10Product } from '@/types';

interface Top10ChartProps {
  data: Top10Product[];
  sortBy: 'quantity' | 'price' | 'name';
}

export function Top10Chart({ data, sortBy }: Top10ChartProps) {
    // Transform data for the chart
    const chartData = data.map((product) => ({
        name: product.name,
        value: sortBy === 'quantity' ? product.quantity : product.price,
        productId: product.id,
        description: product.description,
        quantity: product.quantity,
        price: product.price
    }));

    // Chart configuration
    const chartConfig = {
        value: {
            label: sortBy === 'quantity' ? 'Quantity' : 'Price',
            color: 'hsl(var(--primary))'
        }
    };

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
                            value: sortBy === 'quantity' ? 'Quantity' : 'Price (PLN)',
                            angle: -90,
                            position: 'insideLeft',
                            style: { textAnchor: 'middle' }
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
                                        </div>
                                    );
                                }}
                            />
                        }
                    />
                    <Bar dataKey="value" fill="var(--color-value)" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
