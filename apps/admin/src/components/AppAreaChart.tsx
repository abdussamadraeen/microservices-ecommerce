"use client";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

const chartConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const AppAreaChart = () => {
  const { getToken } = useAuth();

  const { data: chartData = [], isLoading } = useQuery({
    queryKey: ["sales-trend-analytics"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/analytics/sales-trend`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) return [];
      return res.json();
    },
  });

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6 text-glow-sm bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-white/50 bg-clip-text text-transparent">Sales Volume</h1>
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full bg-white/50 dark:bg-transparent rounded-lg">
        <AreaChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} stroke="hsl(var(--muted))" />
          <XAxis
            dataKey="date"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value}
          />
          <YAxis tickLine={false} tickMargin={10} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <defs>
            <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <Area
            dataKey="orders"
            type="monotone"
            fill="url(#fillOrders)"
            fillOpacity={0.4}
            stroke="#10b981"
            strokeWidth={3}
            filter="url(#glow)"
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export default AppAreaChart;
