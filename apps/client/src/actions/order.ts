interface CreateOrderParams {
    products: {
        id: number;
        name: string;
        price: number;
        quantity: number;
        selectedSize?: string;
        selectedColor?: string;
    }[];
    amount: number;
    shippingAddress: {
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
    };
    paymentMethod: string;
    paymentId: string;
    status: "success" | "failed" | "pending" | "processing";
}

export async function createOrder(data: CreateOrderParams) {
    try {
        const res = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return { success: false, error: errorData.message || "Failed to create order" };
        }

        const newOrder = await res.json();
        return { success: true, orderId: (newOrder._id || newOrder.id).toString() };
    } catch (error) {
        console.error("Failed to create order:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
