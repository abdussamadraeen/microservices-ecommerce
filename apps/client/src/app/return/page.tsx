import Link from "next/link";
import ReturnPageClient from "./ReturnPageClient";

const ReturnPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ session_id: string }> | undefined;
}) => {
  const session_id = (await searchParams)?.session_id;

  if (!session_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100">
          <div className="text-red-500 mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Session</h1>
          <p className="text-gray-500 mb-6">No session ID found.</p>
          <Link href="/" className="text-blue-600 hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  let data;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/sessions/${session_id}`,
      { cache: "no-store" }
    );
    data = await res.json();
  } catch (e) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p>Failed to retrieve payment status.</p>
        </div>
      </div>
    )
  }

  return (
    <ReturnPageClient
      sessionId={session_id}
      paymentStatus={data.paymentStatus || data.status}
      amountTotal={data.amountTotal || data.amount_total || 0}
    />
  );
};

export default ReturnPage;
