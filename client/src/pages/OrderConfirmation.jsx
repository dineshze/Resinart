import { CheckCircle2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function OrderConfirmation() {
  const { id } = useParams();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <section className="rounded-[36px] glass p-8 shadow-resin">
        <CheckCircle2 className="mx-auto text-lagoon dark:text-tide" size={54} />
        <p className="mt-5 text-sm font-semibold uppercase tracking-[.28em] text-coral">Order placed</p>
        <h1 className="mt-3 font-display text-5xl font-bold">Cash on Delivery confirmed</h1>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-ink/66 dark:text-pearl/68">
          Your order #{id.slice(-6).toUpperCase()} has been received. You can track status changes from your order history.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to={`/orders/${id}`} className="rounded-full bg-ink px-6 py-3 font-semibold text-pearl dark:bg-pearl dark:text-ink">Track Order</Link>
          <Link to="/#collection" className="rounded-full glass px-6 py-3 font-semibold">Continue Shopping</Link>
        </div>
      </section>
    </main>
  );
}
