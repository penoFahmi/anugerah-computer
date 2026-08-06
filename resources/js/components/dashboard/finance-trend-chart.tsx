import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp } from "lucide-react"

interface FinanceChartData {
    date: string;
    income: number;
    expense: number;
}

const chartConfig = {
    income: {
        label: "Pemasukan",
        color: "var(--chart-2)", // Greenish/emerald
    },
    expense: {
        label: "Pengeluaran",
        color: "var(--destructive)", // Red
    },
}

export function FinanceTrendChart({ data = [] }: { data: FinanceChartData[] }) {
    
    // Format tanggal untuk X-Axis agar lebih mudah dibaca (misal: "Senin", "Selasa" atau "12 Jul")
    const formattedData = data.map(item => {
        const dateObj = new Date(item.date);
        return {
            ...item,
            formattedDate: dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })
        }
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Arus Kas 7 Hari Terakhir
                </CardTitle>
                <CardDescription>
                    Perbandingan Pemasukan dan Pengeluaran Harian
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={formattedData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="formattedDate"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                        <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
