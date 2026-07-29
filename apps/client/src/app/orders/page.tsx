import { getUserOrders } from "@/lib/order";
import Link from "next/link";
import { ShoppingBag, Package, MapPin, CreditCard, Calendar, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const getStatusColor = (status: string) => {
  switch (status) {
    case "success":
    case "delivered":
      return "bg-green-100 text-green-800";
    case "pending":
    case "processing":
      return "bg-yellow-100 text-yellow-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    card: "Credit/Debit Card",
    upi: "UPI",
    qr: "Scan & Pay",
    razorpay: "Razorpay",
    cod: "Cash on Delivery",
  };
  return labels[method] || method || "N/A";
};

const OrdersPage = async () => {
  const orders = await getUserOrders();

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Orders Yet</h2>
        <p className="text-gray-500 mb-6">Looks like you haven&apos;t placed any orders yet.</p>
        <Link
          href="/"
          className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h1>

      <div className="space-y-4">
        {orders.map((order: any) => (
          <div
            key={order._id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Order Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Order ID</p>
                    <p className="font-mono text-sm font-medium text-gray-900">
                      {order._id?.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Order Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Total</p>
                    <p className="text-sm font-bold text-gray-900">
                      ₹{((order.amount || 0) / 100).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>

                <Link
                  href={`/invoice/${order._id}`}
                  target="_blank"
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors ml-auto sm:ml-0"
                >
                  <ShoppingBag className="w-3 h-3" /> {/* Reusing ShoppingBag import but essentially means 'Invoice' here if Printer not imported, wait I should use Printer */}
                  Invoice
                </Link>
              </div>
            </div>

            {/* Order Body */}
            <div className="px-6 py-4">
              {/* Products */}
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {order.products?.map((p: any) => p.name).join(", ") || "No products"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.products?.length || 0} item(s)
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {order.shippingAddress.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.shippingAddress.address}, {order.shippingAddress.city}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </p>
                  <div className="flex flex-wrap gap-1 items-center mt-1">
                    <p className="text-xs text-gray-500">
                      {order.paymentMethod === "cod" ? "Pay on Delivery" : "Paid"}
                    </p>
                    {order.paymentMethod === "razorpay" && order.paymentId?.includes('demo') && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">🧪 Test</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Expected Delivery */}
            <div className="px-6 py-3 bg-orange-50 border-t border-orange-100 flex items-center justify-between hover:bg-orange-100 transition-colors cursor-pointer group">
              <Link href={`/orders/${order._id}`} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 text-sm text-orange-800">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Expected Delivery:{" "}
                    {new Date(
                      new Date(order.createdAt || Date.now()).getTime() + 5 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-orange-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                  Track Order <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
