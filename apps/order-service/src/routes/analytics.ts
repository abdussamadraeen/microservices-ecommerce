import { FastifyInstance } from "fastify";
import { shouldBeAdmin } from "../middleware/authMiddleware.js";
import { Order } from "@repo/order-db";

interface AnalyticsTrend {
    _id: {
        year: number;
        month: number;
    };
    orders: number;
    sales: number;
}

interface RevenueTrend {
    _id: {
        year: number;
        month: number;
    };
    revenue: number;
}

interface StatusCount {
    _id: string;
    count: number;
}

interface TotalRevenue {
    _id: null;
    total: number;
}

export const analyticsRoute = async (fastify: FastifyInstance) => {
    // GET /analytics/order-status (Replaces Browser Usage)
    fastify.get(
        "/analytics/order-status",
        { preHandler: shouldBeAdmin },
        async (request, reply) => {
            try {
                const stats = await Order.aggregate<StatusCount>([
                    { $group: { _id: "$status", count: { $sum: 1 } } }
                ]);

                // Map status to colors
                const colorMap: Record<string, string> = {
                    pending: "var(--color-pending)",
                    success: "var(--color-success)",
                    failed: "var(--color-failed)",
                    processing: "var(--color-processing)",
                    shipped: "var(--color-shipped)",
                    delivered: "var(--color-delivered)",
                };

                // Format for chart: [{ browser: "pending", visitors: 10, fill: "..." }]
                const data = stats.map(s => ({
                    status: s._id,
                    count: s.count,
                    fill: colorMap[s._id] || "var(--color-other)"
                }));

                return reply.send(data);
            } catch (error) {
                console.error("Analytics Order Status Error:", error);
                return reply.status(500).send({ message: "Failed to fetch order status stats" });
            }
        }
    );

    // Helper to get last 6 months
    const getLast6Months = () => {
        const months = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push({
                year: d.getFullYear(),
                month: d.getMonth() + 1, // 1-12
                name: monthNames[d.getMonth()]
            });
        }
        return months;
    };

    // GET /analytics/sales-trend (Replaces Visitors)
    fastify.get(
        "/analytics/sales-trend",
        { preHandler: shouldBeAdmin },
        async (request, reply) => {
            try {
                const last6Months = getLast6Months();
                const firstMonth = last6Months[0];
                if (!firstMonth) throw new Error("Failed to calculate date range");
                const startDate = new Date(firstMonth.year, firstMonth.month - 1, 1);

                const trends = await Order.aggregate<AnalyticsTrend>([
                    {
                        $match: {
                            createdAt: { $gte: startDate },
                            status: { $in: ["success", "pending", "processing", "shipped", "delivered"] }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" } // 1-12
                            },
                            orders: { $sum: 1 },
                            sales: { $sum: "$amount" }
                        }
                    }
                ]);

                // Map results to the 6-month timeline, filling 0s
                const data = last6Months.map(m => {
                    const match = trends.find(t => t._id?.year === m.year && t._id?.month === m.month);
                    return {
                        date: m.name,
                        orders: match ? match.orders : 0,
                        sales: match ? (match.sales / 100) : 0
                    };
                });

                return reply.send(data);
            } catch (error) {
                console.error("Analytics Sales Trend Error:", error);
                return reply.status(500).send({ message: "Failed to fetch sales trends" });
            }
        }
    );

    // GET /analytics/revenue (New)
    fastify.get(
        "/analytics/revenue",
        { preHandler: shouldBeAdmin },
        async (request, reply) => {
            try {
                // Total revenue (all time)
                const total = await Order.aggregate<TotalRevenue>([
                    { $match: { status: { $in: ["success", "pending", "processing", "shipped", "delivered"] } } }, // Include all valid orders
                    { $group: { _id: null, total: { $sum: "$amount" } } }
                ]);

                // Revenue last 6 months for chart
                const last6Months = getLast6Months();
                const firstMonth = last6Months[0];
                if (!firstMonth) throw new Error("Failed to calculate date range");
                const startDate = new Date(firstMonth.year, firstMonth.month - 1, 1);

                const revenueTrend = await Order.aggregate<RevenueTrend>([
                    {
                        $match: {
                            createdAt: { $gte: startDate },
                            status: { $in: ["success", "pending", "processing", "shipped", "delivered"] }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" }
                            },
                            revenue: { $sum: "$amount" }
                        }
                    }
                ]);

                const chartData = last6Months.map(m => {
                    const match = revenueTrend.find(t => t._id?.year === m.year && t._id?.month === m.month);
                    return {
                        name: m.name,
                        total: match ? (match.revenue / 100) : 0
                    };
                });

                return reply.send({
                    totalRevenue: (total[0]?.total || 0) / 100,
                    chartData
                });

            } catch (error) {
                console.error("Analytics Revenue Error:", error);
                return reply.status(500).send({ message: "Failed to fetch revenue stats" });
            }
        }
    );
};

