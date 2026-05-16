import { Banknote, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import { useCart } from "../context/CartContext";
import { formatMoney } from "../utils/money";

const initialAddress = { fullName: "", phone: "", address: "", city: "", state: "", pincode: "" };

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function placeOrder(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/orders", {
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingAddress,
        paymentMethod: "cod"
      });
      clearCart();
      toast.success("Order placed with Cash on Delivery");
      navigate(`/order-confirmation/${data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not place order");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <EmptyState title="Checkout needs a cart" text="Add a piece before placing an order." />
        <div className="mt-6 text-center"><Link to="/cart" className="rounded-full bg-lagoon px-6 py-3 font-semibold text-pearl">Go to Cart</Link></div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[.28em] text-coral">Checkout</p>
      <h1 className="mt-2 font-display text-5xl font-bold">Complete your order</h1>
      <form onSubmit={placeOrder} className="mt-8 grid gap-6 lg:grid-cols-[1fr_390px]">
        <section className="rounded-[34px] glass p-6 shadow-resin">
          <h2 className="font-display text-3xl font-bold">Customer details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["fullName", "Full Name"],
              ["phone", "Phone Number"],
              ["address", "Address"],
              ["city", "City"],
              ["state", "State"],
              ["pincode", "Pincode"]
            ].map(([key, label]) => (
              <input
                key={key}
                required
                value={shippingAddress[key]}
                onChange={(e) => setShippingAddress({ ...shippingAddress, [key]: e.target.value })}
                placeholder={label}
                className={`rounded-2xl border border-white/60 bg-white/70 px-4 py-3 outline-none transition focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10 ${key === "address" ? "sm:col-span-2" : ""}`}
              />
            ))}
          </div>

          <div className="mt-6 rounded-[26px] bg-white/48 p-5 dark:bg-white/8">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-lagoon text-pearl"><Banknote size={20} /></span>
              <div>
                <p className="font-semibold">Cash on Delivery</p>
                <p className="text-sm text-ink/60 dark:text-pearl/64">Pay when your resin piece arrives.</p>
              </div>
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-[34px] glass p-6 shadow-resin">
          <ShieldCheck className="text-coral" />
          <h2 className="mt-4 font-display text-3xl font-bold">Summary</h2>
          <div className="mt-5 grid gap-3">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3 rounded-3xl bg-white/44 p-3 dark:bg-white/8">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.name}</p>
                  <p className="text-sm text-ink/60 dark:text-pearl/64">Qty {item.quantity}</p>
                </div>
                <p className="font-semibold">{formatMoney(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-white/50 pt-4 text-lg font-bold dark:border-white/10">
            <span>Total</span><span>{formatMoney(total)}</span>
          </div>
          <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-pearl transition hover:-translate-y-1 hover:bg-lagoon disabled:cursor-not-allowed disabled:opacity-70 dark:bg-pearl dark:text-ink">
            {loading && <Loader2 className="animate-spin" size={18} />} Place Order
          </button>
        </aside>
      </form>
    </main>
  );
}
