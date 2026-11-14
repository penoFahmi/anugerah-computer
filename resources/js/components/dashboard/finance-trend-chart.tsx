import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FinanceChartItem {
    label: string;
    date: string;
    income: number;
    expense: number;
}

export type FinancePeriod = 'today' | 'week' | 'month' | 'year';

interface FinanceTrendChartProps {
    data?: FinanceChartItem[];
    period: FinancePeriod;
    periodLabel: string;
    onPeriodChange: (period: FinancePeriod) => void;
}

const chartConfig = {
    income: {
        label: "Pemasukan",
        color: "#10b981", // emerald-500
    },
    expense: {
        label: "Pengeluaran",
        color: "#f43f5e", // rose-500
    },
};

const periodOptions: Array<{ value: FinancePeriod; label: string }> = [
    { value: 'today', label: 'Hari Ini' },
    { value: 'week', label: 'Minggu Ini' },
    { value: 'month', label: 'Bulan Ini' },
    { value: 'year', label: 'Tahun Ini' },
];

export function FinanceTrendChart({
    data = [],
    period,
    periodLabel,
    onPeriodChange
}: FinanceTrendChartProps) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <Card className="flex flex-col shadow-sm">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
                <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        Tren Arus Kas Toko
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Perbandingan Pemasukan vs Pengeluaran &bull; <span className="font-medium text-slate-700 dark:text-slate-300">{periodLabel}</span>
                    </CardDescription>
                </div>

                {/* Filter Periode Cepat */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg self-start sm:self-auto border border-slate-200/60 dark:border-slate-700/60">
                    <Calendar className="w-3.5 h-3.5 ml-1.5 text-slate-400" />
                    {periodOptions.map((opt) => {
                        const isActive = period === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => onPeriodChange(opt.value)}
                                className={cn(
                                    "px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                                    isActive
                                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                )}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </CardHeader>

            <CardContent className="flex-1 pb-4">
                <ChartContainer config={chartConfig} className="min-h-[260px] w-full">
                    <BarChart accessibilityLayer data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            className="text-[11px] text-muted-foreground"
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={5}
                            tickFormatter={(value) => {
                                if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
                                if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
                                return `${value}`;
                            }}
                            className="text-[11px] text-muted-foreground"
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name) => (
                                        <div className="flex min-w-[130px] items-center text-xs text-muted-foreground">
                                            <span className={cn(
                                                "w-2 h-2 rounded-full mr-2",
                                                name === "income" ? "bg-emerald-500" : "bg-rose-500"
                                            )} />
                                            <span>{name === "income" ? "Pemasukan" : "Pengeluaran"}</span>
                                            <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                {formatCurrency(Number(value))}
                                            </div>
                                        </div>
                                    )}
                                />
                            }
                        />
                        <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                        <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    </BarChart>
                </ChartContainer>

                {/* Legend Keterangan */}
                <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-xs bg-emerald-500" />
                        <span className="text-muted-foreground font-medium">Pemasukan Kas</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-xs bg-rose-500" />
                        <span className="text-muted-foreground font-medium">Pengeluaran & Belanja</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
