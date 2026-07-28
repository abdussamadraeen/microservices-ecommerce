import { connectOrderDB, Order } from "@repo/order-db";
import { auth } from "@clerk/nextjs/server";

export async function getUserOrders() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return [];
        }

        await connectOrderDB();

        const ordersData = await (Order as any).find({ userId }).sort({ createdAt: -1 });
        const orders = JSON.parse(JSON.stringify(ordersData));

        return orders.map((order: any) => ({
            ...order,
            _id: order._id.toString(),
            createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
            updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
            products: order.products.map((product: any) => ({
                ...product,
                _id: product._id ? product._id.toString() : undefined,
            })),
        }));
    } catch (error) {
        console.error("Failed to fetch user orders:", error);
        return [];
    }
}

export async function getOrderById(orderId: string) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return null;
        }

        await connectOrderDB();

        const orderData = await (Order as any).findOne({ _id: orderId, userId });
        const order = JSON.parse(JSON.stringify(orderData));

        if (!order) {
            return null;
        }

        return {
            ...order,
            _id: order._id.toString(),
            createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
            updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
            products: order.products.map((product: any) => ({
                ...product,
                _id: product._id ? product._id.toString() : undefined,
            })),
        };
    } catch (error) {
        console.error("Failed to fetch order:", error);
        return null;
    }
}
