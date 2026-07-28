import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    try {
        const { userId, getToken } = await auth();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const token = await getToken();
        const orderServiceUrl = process.env.ORDER_SERVICE_URL || process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || "http://127.0.0.1:8005";

        console.log("Creating order via API route to service:", orderServiceUrl);

        let response;
        try {
            response = await fetch(`${orderServiceUrl}/create-order`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...data,
                    userId,
                }),
            });
        } catch (fetchError) {
            console.error("Fetch error connecting to order service:", fetchError);
            return NextResponse.json(
                { message: fetchError instanceof Error ? fetchError.message : "Failed to connect to order service" },
                { status: 502 }
            );
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { message: errorData.message || `Order service responded with status ${response.status}` },
                { status: response.status }
            );
        }

        const newOrder = await response.json();
        return NextResponse.json(newOrder);
    } catch (error) {
        console.error("API Route Error creating order:", error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
    }
}
