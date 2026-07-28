"use client";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { OrderChartType } from "@repo/types";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const AppBarChart = () => {
  const { getToken } = useAuth();

  const { data } = useQuery({
    queryKey: ["revenue-analytics"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/analytics/revenue`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) return { totalRevenue: 0, chartData: [] };
      return res.json();
    },
  });

  const chartData = data?.chartData || [];
  const totalRevenue = data?.totalRevenue || 0;

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-lg font-medium text-glow-sm bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-white/50 bg-clip-text text-transparent">Total Revenue</h1>
        <p className="text-3xl font-bold mt-2">₹{totalRevenue.toLocaleString("en-IN")}</p>
      </div>
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full bg-white/50 dark:bg-transparent rounded-lg">
        <BarChart accessibilityLayer data={chartData}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="hsl(var(--muted))" strokeDasharray="4 4" />
          <XAxis
            dataKey="name"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value?.slice?.(0, 3) || value}
            tick={{ fill: "hsl(var(--foreground))" }}
          />
          <YAxis
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => new Intl.NumberFormat("en-IN", {
              notation: "compact",
              compactDisplay: "short",
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 1
            }).format(value)}
            tick={{ fill: "hsl(var(--foreground))" }}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent formatter={(value) => new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR"
            }).format(Number(value))} />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="total"
            name="Revenue"
            fill="url(#barGradient)"
            radius={[8, 8, 0, 0]}
            className="hover:opacity-90 transition-opacity"
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default AppBarChart;
