import Link from "next/link";

export default function OrderConfirm({ params, searchParams }: any) {
  const id = params.id;
  const sms = searchParams?.sms;
  return (
    <div className="max-w-xl mx-auto text-center space-y-4">
      <h1 className="text-2xl font-semibold">Order confirmed</h1>
      <p>Order ID: <span className="font-mono">{id}</span></p>
      {sms === "pending" ? (
        <p className="text-yellow-400">SMS pending — check admin if needed.</p>
      ) : (
        <p className="text-green-400">SMS sent to kitchen.</p>
      )}
      <p>Estimated prep time: 20–30 minutes.</p>
      <div className="flex justify-center gap-3">
        <Link href="/" className="btn btn-primary">Back to menu</Link>
        <Link href={`/orders/${id}/ticket`} className="btn border border-neutral-700">Print ticket</Link>
      </div>
    </div>
  );
}
