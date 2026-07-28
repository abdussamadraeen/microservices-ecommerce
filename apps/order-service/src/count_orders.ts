
import { Order, connectOrderDB } from "@repo/order-db";

async function main() {
    await connectOrderDB();
    const count = await Order.countDocuments();
    console.log(`Total orders: ${count}`);

    // Check distribution of statuses
    const statuses = await Order.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);
    console.log("Order statuses:", statuses);
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
