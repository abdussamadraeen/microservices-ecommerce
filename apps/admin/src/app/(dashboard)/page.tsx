"use client";

import AppAreaChart from "@/components/AppAreaChart";
import AppBarChart from "@/components/AppBarChart";
import AppPieChart from "@/components/AppPieChart";
import CardList from "@/components/CardList";
import ActionCenter from "@/components/ActionCenter";
import { StatsCards } from "@/components/StatsCards";

const DashboardPage = () => {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight text-glow">Dashboard</h2>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
        {/* Revenue - Wide */}
        <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2 shadow-sm border border-white/5">
          <AppBarChart />
        </div>

        {/* Recent Orders - Single */}
        <div className="bg-primary-foreground p-4 rounded-lg shadow-sm border border-white/5">
          <CardList title="Recent Orders" />
        </div>

        {/* Pie Chart - Single */}
        <div className="bg-primary-foreground p-4 rounded-lg shadow-sm border border-white/5">
          <AppPieChart />
        </div>

        {/* Action Center - Single */}
        <div className="bg-primary-foreground p-4 rounded-lg shadow-sm border border-white/5">
          <ActionCenter />
        </div>

        {/* Sales Trend - Wide */}
        <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2 shadow-sm border border-white/5">
          <AppAreaChart />
        </div>

        {/* Popular Products - Single */}
        <div className="bg-primary-foreground p-4 rounded-lg shadow-sm border border-white/5">
          <CardList title="Popular Products" />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
