import { getOrderById } from "@/lib/order";
import { getSettings } from "@/actions/settings";
import InvoiceView from "@/components/invoice/InvoiceView";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const ClientInvoicePage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const order = await getOrderById(id);
    const settings = await getSettings();

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
                <p className="text-gray-500 mb-6">We couldn't locate the order or invoice you're looking for.</p>
                <Link href="/orders" className="text-blue-600 hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Orders
                </Link>
            </div>
        );
    }

    return <InvoiceView order={order} settings={settings} />;
};

export default ClientInvoicePage;
