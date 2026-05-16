import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatMoney } from "../utils/money";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <article className="group overflow-hidden rounded-[28px] glass shadow-resin transition duration-300 hover:-translate-y-2">
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
          <span className="absolute left-4 top-4 rounded-full bg-pearl/82 px-3 py-1 text-xs font-semibold text-lagoon backdrop-blur dark:bg-ink/70 dark:text-tide">
            {product.category}
          </span>
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link to={`/product/${product._id}`} className="font-display text-2xl font-bold">{product.name}</Link>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/62 dark:text-pearl/66">{product.description}</p>
          </div>
          <ArrowUpRight className="mt-1 shrink-0 text-lagoon transition group-hover:translate-x-1 group-hover:-translate-y-1 dark:text-tide" />
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="font-semibold">{formatMoney(product.price)}</span>
          <button onClick={() => addToCart(product)} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-pearl transition hover:bg-lagoon dark:bg-pearl dark:text-ink">
            <ShoppingBag size={16} /> Add
          </button>
        </div>
      </div>
    </article>
  );
}
