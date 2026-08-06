import * as React from "react"
import { Pie, PieChart, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart as PieChartIcon } from "lucide-react"

interface ServiceChartData {
    status: string;
    count: number;
}

const statusConfig: Record<string, { label: string, color: string }> = {
    waiting_checking: { label: "Antrean Baru", color: "var(--color-waiting_checking)" },
    waiting_approval: { label: "Menunggu Konfirmasi", color: "var(--color-waiting_approval)" },
    approved: { label: "Disetujui", color: "var(--color-approved)" },
    in_progress: { label: "Dikerjakan", color: "var(--color-in_progress)" },
    completed: { label: "Selesai", color: "var(--color-completed)" },
    cancelled: { label: "Batal", color: "var(--color-cancelled)" },
}

const chartConfig = {
    waiting_checking: { label: "Antrean Baru", color: "var(--chart-1)" },
    waiting_approval: { label: "Menunggu Konfirmasi", color: "var(--chart-2)" },
    approved: { label: "Disetujui", color: "var(--chart-3)" },
    in_progress: { label: "Dikerjakan", color: "var(--chart-4)" },
    completed: { label: "Selesai", color: "var(--chart-5)" },
    cancelled: { label: "Batal", color: "var(--destructive)" },
}

export function ServiceStatusChart({ data = [] }: { data: ServiceChartData[] }) {
    const formattedData = data.map(item => ({
        ...item,
        fill: chartConfig[item.status as keyof typeof chartConfig]?.color || "hsl(var(--muted))"
    }))

    const totalServices = React.useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.count, 0)
    }, [data])

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-sm flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-muted-foreground" />
                    Distribusi Status Servis
                </CardTitle>
                <CardDescription>Semua Servis Aktif & Riwayat</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={formattedData}
                            dataKey="count"
                            nameKey="status"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            {formattedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
