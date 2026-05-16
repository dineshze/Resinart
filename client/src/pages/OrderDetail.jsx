import { ArrowLeft, MapPin, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import { formatMoney } from "../utils/money";

const steps = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/orders/mine/${id}`)
      .then(({ data }) => setOrder(data))
      .catch((error) => toast.error(error.response?.data?.message || "Could not load order"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className="mx-auto max-w-5xl px-4 py-16"><div className="h-96 animate-pulse rounded-[34px] glass" /></main>;
  if (!order) return <main className="mx-auto max-w-4xl px-4 py-16"><EmptyState title="Order not found" text="This order may not belong to your account." /></main>;

  const activeIndex = steps.indexOf(order.orderStatus);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/orders" className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-semibold"><ArrowLeft size={16} /> Orders</Link>
      <section className="mt-8 rounded-[34px] glass p-6 shadow-resin">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.28em] text-coral">Tracking</p>
            <h1 className="mt-2 font-display text-4xl font-bold">Order #{order._id.slice(-6).toUpperCase()}</h1>
          </div>
          <span className="w-fit rounded-full bg-coral/16 px-4 py-2 text-sm font-semibold uppercase text-coral">{order.orderStatus}</span>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-5">
          {steps.map((step, index) => (
            <div key={step} className={`rounded-2xl p-3 text-sm font-semibold capitalize ${index <= activeIndex ? "bg-lagoon text-pearl" : "bg-white/50 text-ink/54 dark:bg-white/8 dark:text-pearl/54"}`}>
              {step}
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-3">
            {order.items.map((item) => (
              <div key={item.product} className="flex gap-4 rounded-3xl bg-white/44 p-3 dark:bg-white/8">
                <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">{item.name}</h2>
                  <p className="text-sm text-ink/60 dark:text-pearl/64">Qty {item.quantity}</p>
                </div>
                <p className="font-semibold">{formatMoney(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <aside className="rounded-[28px] bg-white/44 p-5 dark:bg-white/8">
            <PackageCheck className="text-lagoon dark:text-tide" />
            <div className="mt-4 flex justify-between text-lg font-bold"><span>Total</span><span>{formatMoney(order.totalAmount)}</span></div>
            <p className="mt-2 text-sm text-ink/60 dark:text-pearl/64">{order.payment.method.toUpperCase()} - {order.payment.status.replace("_", " ")}</p>
            <div className="mt-5 border-t border-white/50 pt-5 dark:border-white/10">
              <MapPin className="text-coral" />
              <p className="mt-3 font-semibold">{order.shippingAddress.fullName}</p>
              <p className="mt-1 text-sm leading-6 text-ink/66 dark:text-pearl/68">
                {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <p className="mt-1 text-sm">{order.shippingAddress.phone}</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
