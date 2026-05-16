import { ArrowLeft, MessageCircle, ShoppingBag, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import { useCart } from "../context/CartContext";
import { fallbackProducts } from "../data/fallbackProducts";
import { formatMoney } from "../utils/money";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const demo = fallbackProducts.find((item) => item._id === id);
    if (demo) {
      setProduct(demo);
      setLoading(false);
      return;
    }
    api
      .get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className="mx-auto max-w-6xl px-4 py-16"><div className="h-[520px] animate-pulse rounded-[34px] glass" /></main>;
  if (!product) return <main className="mx-auto max-w-4xl px-4 py-16"><EmptyState title="Piece not found" text="The product may have been moved or sold." /></main>;

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-semibold"><ArrowLeft size={16} /> Back</Link>
      <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_.8fr]">
        <div className="overflow-hidden rounded-[38px] shadow-resin">
          <img src={product.image} alt={product.name} className="h-full max-h-[680px] w-full object-cover" />
        </div>
        <div className="flex flex-col justify-center rounded-[34px] glass p-7 shadow-resin">
          <span className="w-fit rounded-full bg-coral/16 px-4 py-2 text-sm font-semibold text-coral">{product.category}</span>
          <h1 className="mt-5 font-display text-5xl font-bold">{product.name}</h1>
          <p className="mt-5 text-3xl font-bold text-lagoon dark:text-tide">{formatMoney(product.price)}</p>
          <p className="mt-5 leading-8 text-ink/68 dark:text-pearl/70">{product.description}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/44 p-5 dark:bg-white/8">
              <Sparkles className="text-coral" />
              <p className="mt-3 font-semibold">Small-batch handmade finish</p>
            </div>
            <div className="rounded-3xl bg-white/44 p-5 dark:bg-white/8">
              <MessageCircle className="text-lagoon dark:text-tide" />
              <p className="mt-3 font-semibold">Custom colors available</p>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button onClick={() => addToCart(product)} className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-pearl transition hover:-translate-y-1 hover:bg-lagoon dark:bg-pearl dark:text-ink">
              <ShoppingBag size={18} /> Add to Cart
            </button>
            <a href="/#custom" className="inline-flex justify-center rounded-full glass px-6 py-3 font-semibold transition hover:-translate-y-1">
              Request This Style
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
