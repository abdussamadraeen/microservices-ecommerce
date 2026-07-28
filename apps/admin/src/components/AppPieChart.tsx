"use client";

import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { TrendingUp } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

const chartConfig = {
  status: {
    label: "Status",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-1))",
  },
  success: {
    label: "Success",
    color: "hsl(var(--chart-2))",
  },
  failed: {
    label: "Failed",
    color: "hsl(var(--chart-3))",
  },
  processing: {
    label: "Processing",
    color: "hsl(var(--chart-4))",
  },
  shipped: {
    label: "Shipped",
    color: "hsl(var(--chart-5))",
  },
  delivered: {
    label: "Delivered",
    color: "hsl(var(--chart-2))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--muted))",
  },
} satisfies ChartConfig;

const AppPieChart = () => {
  const { getToken } = useAuth();

  // Color map for pie chart segments
  const statusColors: Record<string, string> = {
    pending: "hsl(45, 93%, 47%)", // amber
    success: "hsl(142, 76%, 36%)", // green
    failed: "hsl(0, 84%, 60%)", // red
    processing: "hsl(221, 83%, 53%)", // blue
    shipped: "hsl(262, 83%, 58%)", // purple
    delivered: "hsl(142, 76%, 36%)", // green
  };

  const { data: rawData = [], isLoading } = useQuery({
    queryKey: ["order-status-stats"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/analytics/order-status`,
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

  // Map the data to include proper fill colors
  const chartData = rawData.map((item: any) => ({
    ...item,
    fill: statusColors[item.status?.toLowerCase()] || "hsl(0, 0%, 50%)"
  }));

  const totalOrders = chartData.reduce((acc: number, curr: any) => acc + curr.count, 0);

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6 text-glow-sm bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-white/50 bg-clip-text text-transparent">Order Status</h1>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px] bg-white/50 dark:bg-transparent rounded-lg"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="status"
            innerRadius={60}
            strokeWidth={5}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold dark:fill-white"
                      >
                        {totalOrders.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        Orders
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="mt-4 flex flex-col gap-2 items-center">
        <div className="flex items-center gap-2 font-medium leading-none dark:text-gray-300">
          Real-time order distribution <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing distribution for all orders
        </div>
      </div>
    </div>
  );
};

export default AppPieChart;
