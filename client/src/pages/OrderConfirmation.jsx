import { CheckCircle2, Clock3, ImageIcon, Loader2, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import { cloudinaryImage } from "../utils/images";
import { formatMoney } from "../utils/money";

function prettyStatus(status = "") {
  return status.replaceAll("_", " ");
}

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/orders/mine/${id}`)
      .then(({ data }) => setOrder(data))
      .catch((error) => toast.error(error.response?.data?.message || "Could not load order confirmation"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16">
        <section className="rounded-[34px] glass p-6 shadow-resin">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lagoon/12 text-lagoon">
            <Loader2 className="animate-spin" />
          </div>
          <div className="mx-auto mt-6 h-10 max-w-md animate-pulse rounded-full bg-white/60 dark:bg-white/10" />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="h-44 animate-pulse rounded-3xl bg-white/50 dark:bg-white/10" />
            <div className="h-44 animate-pulse rounded-3xl bg-white/50 dark:bg-white/10" />
          </div>
        </section>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <EmptyState title="Order confirmation not found" text="This order may not belong to your account." />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl overflow-x-hidden px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-[36px] glass p-5 shadow-resin sm:p-8">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lagoon/14 text-lagoon dark:text-tide">
          <CheckCircle2 size={40} />
        </div>
        <div className="mx-auto mt-5 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[.28em] text-coral">Order placed</p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Payment screenshot received</h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-ink/66 dark:text-pearl/68">
            Order #{order._id.slice(-6).toUpperCase()} is waiting for studio verification. You can track every update from your order history.
          </p>
        </div>

        <div className="mt-8 grid min-w-0 gap-4 lg:grid-cols-[1fr_330px]">
          <div className="min-w-0 rounded-[28px] bg-white/44 p-4 dark:bg-white/8 sm:p-5">
            <div className="flex items-center gap-3">
              <PackageCheck className="shrink-0 text-lagoon dark:text-tide" />
              <h2 className="font-display text-2xl font-bold">Order summary</h2>
            </div>
            <div className="mt-4 grid max-h-[420px] gap-3 overflow-y-auto pr-1">
              {order.items.map((item) => (
                <div key={item.product} className="flex min-w-0 gap-3 rounded-3xl bg-white/54 p-3 dark:bg-white/10">
                  <img src={cloudinaryImage(item.image, { width: 180 })} alt={item.name} loading="lazy" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold">{item.name}</p>
                    <p className="text-sm text-ink/60 dark:text-pearl/64">Qty {item.quantity}</p>
                  </div>
                  <p className="shrink-0 font-semibold">{formatMoney(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="min-w-0 rounded-[28px] bg-white/44 p-5 dark:bg-white/8">
            <Clock3 className="text-coral" />
            <p className="mt-4 text-sm font-semibold uppercase tracking-[.22em] text-ink/58 dark:text-pearl/58">Payment status</p>
            <p className="mt-2 break-words font-display text-3xl font-bold capitalize">{prettyStatus(order.paymentStatus || order.payment?.status)}</p>
            <div className="mt-5 rounded-2xl bg-white/58 p-4 text-sm dark:bg-white/10">
              <div className="flex justify-between gap-4 font-bold">
                <span>Total</span>
                <span>{formatMoney(order.totalAmount)}</span>
              </div>
              <p className="mt-2 capitalize text-ink/62 dark:text-pearl/64">{prettyStatus(order.paymentMethod || order.payment?.method)}</p>
            </div>
            {order.paymentScreenshot?.url && (
              <a href={order.paymentScreenshot.url} target="_blank" rel="noreferrer" className="mt-4 flex min-w-0 items-center gap-3 rounded-2xl bg-lagoon/12 p-3 text-sm font-semibold text-lagoon dark:text-tide">
                <ImageIcon className="shrink-0" size={18} />
                <span className="break-words">View uploaded screenshot</span>
              </a>
            )}
          </aside>
        </div>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to={`/orders/${id}`} className="rounded-full bg-ink px-6 py-3 text-center font-semibold text-pearl dark:bg-pearl dark:text-ink">Track Order</Link>
          <Link to="/#collection" className="rounded-full glass px-6 py-3 text-center font-semibold">Continue Shopping</Link>
        </div>
      </section>
    </main>
  );
}
