import { PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import { formatMoney } from "../utils/money";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/mine")
      .then(({ data }) => setOrders(data))
      .catch((error) => toast.error(error.response?.data?.message || "Could not load orders"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[.28em] text-coral">Orders</p>
      <h1 className="mt-2 font-display text-5xl font-bold">Order history</h1>
      <div className="mt-8 grid gap-4">
        {loading && Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-[28px] glass" />)}
        {!loading && orders.length === 0 && <EmptyState title="No orders yet" text="Placed orders and COD status will appear here." />}
        {orders.map((order) => (
          <Link key={order._id} to={`/orders/${order._id}`} className="grid gap-4 rounded-[28px] glass p-5 shadow-resin transition hover:-translate-y-1 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <PackageCheck className="text-lagoon dark:text-tide" />
                <h2 className="font-display text-2xl font-bold">Order #{order._id.slice(-6).toUpperCase()}</h2>
                <span className="rounded-full bg-coral/16 px-3 py-1 text-xs font-semibold uppercase text-coral">{order.orderStatus}</span>
              </div>
              <p className="mt-3 text-sm text-ink/62 dark:text-pearl/64">{order.items.length} item(s) ordered on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xl font-bold">{formatMoney(order.totalAmount)}</p>
              <p className="text-sm text-ink/60 dark:text-pearl/64">{order.payment.method.toUpperCase()} - {order.payment.status.replace("_", " ")}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
