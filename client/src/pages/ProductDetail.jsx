import { ArrowLeft, ShoppingBag, Sparkles, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { fallbackProducts } from "../data/fallbackProducts";
import { cloudinaryImage } from "../utils/images";
import { formatMoney } from "../utils/money";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!product?.category) return;
    const demoRecommended = fallbackProducts.filter((item) => item.category === product.category && item._id !== product._id).slice(0, 4);
    if (demoRecommended.length) {
      setRecommended(demoRecommended);
      return;
    }
    setRecommendedLoading(true);
    api
      .get(`/products?category=${encodeURIComponent(product.category)}`)
      .then(({ data }) => setRecommended(data.filter((item) => item._id !== product._id).slice(0, 6)))
      .catch(() => setRecommended([]))
      .finally(() => setRecommendedLoading(false));
  }, [product]);

  const featureCards = useMemo(
    () => [
      ["Small-batch handmade finish", Sparkles, "Every piece is poured, finished, and checked in small runs."],
      ["Custom details at checkout", Zap, "Add names, dates, quotes, and reference images before payment."]
    ],
    []
  );

  function buyNow() {
    addToCart(product);
    navigate("/checkout");
  }

  if (loading) return <main className="mx-auto max-w-6xl px-4 py-16"><div className="h-[520px] animate-pulse rounded-[34px] glass" /></main>;
  if (!product) return <main className="mx-auto max-w-4xl px-4 py-16"><EmptyState title="Piece not found" text="The product may have been moved or sold." /></main>;

  return (
    <main className="mx-auto max-w-7xl overflow-x-hidden px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-semibold"><ArrowLeft size={16} /> Back</Link>
      <section className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,.8fr)]">
        <div className="overflow-hidden rounded-[38px] shadow-resin">
          <img src={cloudinaryImage(product.image, { width: 1400 })} alt={product.name} loading="eager" className="h-full max-h-[680px] w-full object-cover" />
        </div>
        <div className="flex min-w-0 flex-col justify-center rounded-[34px] glass p-5 shadow-resin sm:p-7">
          <span className="w-fit rounded-full bg-coral/16 px-4 py-2 text-sm font-semibold text-coral">{product.category}</span>
          <h1 className="mt-5 break-words font-display text-4xl font-bold sm:text-5xl">{product.name}</h1>
          <p className="mt-5 text-3xl font-bold text-lagoon dark:text-tide">{formatMoney(product.price)}</p>
          <p className="mt-5 break-words leading-8 text-ink/76 dark:text-pearl/76">{product.description}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {featureCards.map(([label, Icon, text]) => (
              <div key={label} className="rounded-3xl bg-white/50 p-5 dark:bg-white/10">
                <Icon className="text-coral" />
                <p className="mt-3 font-semibold">{label}</p>
                <p className="mt-2 text-sm leading-6 text-ink/64 dark:text-pearl/66">{text}</p>
              </div>
            ))}
          </div>
          <div className="sticky bottom-3 z-20 mt-8 grid gap-3 rounded-[28px] bg-pearl/86 p-3 backdrop-blur dark:bg-ink/86 sm:static sm:grid-cols-2 sm:bg-transparent sm:p-0 sm:backdrop-blur-0 dark:sm:bg-transparent">
            <button onClick={() => addToCart(product)} className="inline-flex items-center justify-center gap-2 rounded-full glass px-6 py-3 font-semibold transition hover:-translate-y-1">
              <ShoppingBag size={18} /> Add to Cart
            </button>
            <button onClick={buyNow} className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-pearl transition hover:-translate-y-1 hover:bg-lagoon dark:bg-pearl dark:text-ink">
              <Zap size={18} /> Buy Now
            </button>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.28em] text-coral">Recommended</p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">More from {product.category}</h2>
          </div>
          <Link to={`/?category=${encodeURIComponent(product.category)}`} className="text-sm font-semibold text-lagoon dark:text-tide">View collection</Link>
        </div>
        <div className="mt-6 flex gap-4 overflow-x-auto pb-3 snap-x sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-4">
          {recommendedLoading && Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-80 min-w-[260px] animate-pulse rounded-[28px] glass sm:min-w-0" />)}
          {!recommendedLoading && recommended.length === 0 && <div className="w-full"><EmptyState title="No related pieces yet" text="New handmade products will appear here as the collection grows." /></div>}
          {recommended.map((item) => (
            <div key={item._id} className="min-w-[260px] snap-start sm:min-w-0">
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
