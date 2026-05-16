import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { useCart } from "../context/CartContext";
import { formatMoney } from "../utils/money";

export default function Cart() {
  const { items, subtotal, total, removeFromCart, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <EmptyState title="Your cart is empty" text="Choose a handmade resin piece to start your order." />
        <div className="mt-6 text-center">
          <Link to="/#collection" className="inline-flex rounded-full bg-lagoon px-6 py-3 font-semibold text-pearl shadow-resin">
            Browse Collection
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[.28em] text-coral">Cart</p>
      <h1 className="mt-2 font-display text-5xl font-bold">Your selected pieces</h1>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {items.map((item) => (
            <article key={item.productId} className="grid gap-4 rounded-[28px] glass p-4 shadow-resin sm:grid-cols-[112px_1fr_auto] sm:items-center">
              <img src={item.image} alt={item.name} className="h-28 w-full rounded-3xl object-cover sm:w-28" />
              <div>
                <h2 className="font-display text-2xl font-bold">{item.name}</h2>
                <p className="mt-1 text-sm text-ink/60 dark:text-pearl/64">{item.category}</p>
                <p className="mt-3 font-semibold text-lagoon dark:text-tide">{formatMoney(item.price)}</p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <div className="flex items-center rounded-full bg-white/60 p-1 dark:bg-white/10">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="grid h-9 w-9 place-items-center rounded-full glass" aria-label="Decrease quantity">
                    <Minus size={15} />
                  </button>
                  <span className="w-10 text-center font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="grid h-9 w-9 place-items-center rounded-full glass" aria-label="Increase quantity">
                    <Plus size={15} />
                  </button>
                </div>
                <button onClick={() => removeFromCart(item.productId)} className="grid h-10 w-10 place-items-center rounded-full bg-coral text-white" aria-label="Remove item">
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-[32px] glass p-6 shadow-resin">
          <ShoppingBag className="text-lagoon dark:text-tide" />
          <h2 className="mt-4 font-display text-3xl font-bold">Order summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">{formatMoney(subtotal)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span className="font-semibold">Calculated offline</span></div>
            <div className="border-t border-white/50 pt-3 text-base font-bold dark:border-white/10">
              <div className="flex justify-between"><span>Total</span><span>{formatMoney(total)}</span></div>
            </div>
          </div>
          <Link to="/checkout" className="mt-6 flex w-full justify-center rounded-full bg-ink px-6 py-3 font-semibold text-pearl transition hover:-translate-y-1 hover:bg-lagoon dark:bg-pearl dark:text-ink">
            Checkout
          </Link>
        </aside>
      </section>
    </main>
  );
}
