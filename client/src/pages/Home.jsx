import { ArrowRight, CheckCircle2, Gem, Palette, Shell, Sparkles, Waves } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import { fallbackProducts } from "../data/fallbackProducts";

const categories = ["All","Rakhi 🌸","Keychains","Hammering Glass Art", "Preservation", "Lipan Art", "Photo frame","Portrait","String Art"];
const testimonials = [
  { name: "Maya R.", text: "The ocean tray feels like a little tide pool on my table. Beautiful finish and packaging." },
  { name: "Anika S.", text: "My custom name keychains were delicate, personal, and ready faster than expected." },
  { name: "Priya K.", text: "The coasters look premium but still handmade. Every piece has tiny details." }
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ customerName: "", email: "", phone: "", productType: "Custom Gift", budget: "", notes: "" });

  useEffect(() => {
    api
      .get("/products")
      .then(({ data }) => setProducts(data.length ? data : fallbackProducts))
      .catch(() => setProducts(fallbackProducts))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => (active === "All" ? products : products.filter((item) => item.category === active)), [active, products]);

  async function submitCustomOrder(event) {
    event.preventDefault();
    try {
      await api.post("/orders/custom", form);
      toast.success("Custom request sent");
      setForm({ customerName: "", email: "", phone: "", productType: "Custom Gift", budget: "", notes: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send request");
    }
  }

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_.9fr] lg:px-8 lg:py-16">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-lagoon dark:text-tide">
            <Sparkles size={16} /> Small-batch resin art studio
          </div>
          <h1 className="font-display text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
            Happy Creation.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-ink/68 dark:text-pearl/70">
            Handmade trays, keychains, coasters, jewelry dishes, shell art, and custom gifts poured with soft coastal color and careful finishing.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#collection" className="inline-flex items-center gap-2 rounded-full bg-lagoon px-6 py-3 font-semibold text-pearl shadow-resin transition hover:-translate-y-1 hover:bg-ink dark:hover:bg-coral">
              Shop Now <ArrowRight size={18} />
            </a>
            <a href="#custom" className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 font-semibold transition hover:-translate-y-1">
              Explore Custom Work
            </a>
          </div>
          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3 text-sm">
            {["Hand poured", "Custom colors", "Gift-ready"].map((item) => (
              <div key={item} className="rounded-2xl glass p-3">
                <CheckCircle2 className="mb-2 text-coral" size={18} />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="hidden md:block relative min-h-[520px]">
          <div className="absolute inset-x-8 top-8 h-[450px] rounded-[42px] bg-gradient-to-br from-tide/40 via-shell/50 to-coral/30 blur-2xl" />
          <div className="relative grid h-full grid-cols-2 gap-4">
            <img className="mt-10 h-[360px] w-full rounded-[36px] object-cover shadow-resin" src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80" alt="Ocean resin inspiration" />
            <img className="h-[300px] w-full rounded-[36px] object-cover shadow-resin animate-float" src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80" alt="Handmade decorative resin" />
            <div className="col-span-2 -mt-14 ml-auto w-72 rounded-[30px] glass p-5 shadow-resin">
              <Waves className="text-lagoon dark:text-tide" />
              <p className="mt-4 font-display text-2xl font-bold">Soft waves, preserved blooms, pearl pigments.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="collection" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-col md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.28em] text-coral">Collection</p>
            <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Handmade pieces</h2>
          </div>
          <div className="flex max-w-full gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button key={category} onClick={() => setActive(category)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${active === category ? "bg-ink text-pearl dark:bg-pearl dark:text-ink" : "glass hover:bg-white/80"}`}>
                {category}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />) : filtered.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
        {!loading && filtered.length === 0 && <div className="mt-8"><EmptyState title="No pieces in this category yet" text="Custom requests are open if you want something in this style." /></div>}
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
        <div className="rounded-[34px] glass p-8 shadow-resin">
          <Shell className="text-coral" size={34} />
          <h2 className="mt-5 font-display text-4xl font-bold">Made slowly, finished carefully.</h2>
          <p className="mt-4 leading-7 text-ink/66 dark:text-pearl/68">
            Happy Creation is a small handmade studio creating practical keepsakes from resin, shells, pressed botanicals, pigments, and ocean-inspired textures. Each item is poured, sanded, polished, and packed by hand.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Custom palettes", Palette],
            ["Shell and ocean textures", Waves],
            ["Jewelry-safe finishes", Gem],
            ["Premium gifting details", Sparkles]
          ].map(([label, Icon]) => (
            <div key={label} className="rounded-[28px] bg-white/46 p-6 shadow-resin transition hover:-translate-y-1 dark:bg-white/8">
              <Icon className="text-lagoon dark:text-tide" />
              <h3 className="mt-5 font-display text-2xl font-bold">{label}</h3>
            </div>
          ))}
        </div>
      </section>

      <section id="custom" className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.28em] text-coral">Custom order</p>
          <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Request a piece made around your story.</h2>
          <p className="mt-4 leading-7 text-ink/66 dark:text-pearl/68">Share colors, names, occasions, shells, flowers, or keepsake details. The admin dashboard keeps every request easy to track.</p>
        </div>
        <form onSubmit={submitCustomOrder} className="grid gap-4 rounded-[34px] glass p-6 shadow-resin sm:grid-cols-2">
          {[
            ["customerName", "Name"],
            ["email", "Email"],
            ["phone", "WhatsApp"],
            ["budget", "Budget"]
          ].map(([key, label]) => (
            <input key={key} required={key !== "phone" && key !== "budget"} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={label} className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 outline-none transition focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10" />
          ))}
          <select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })} className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 outline-none transition focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10">
            {categories.slice(1).map((category) => <option key={category}>{category}</option>)}
          </select>
          <textarea required value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Tell us about the piece" className="min-h-32 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 outline-none transition focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10 sm:col-span-2" />
          <button className="rounded-full bg-ink px-6 py-3 font-semibold text-pearl transition hover:-translate-y-1 hover:bg-lagoon dark:bg-pearl dark:text-ink sm:col-span-2">Send Request</button>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.name} className="rounded-[28px] glass p-6 shadow-resin">
              <p className="leading-7 text-ink/72 dark:text-pearl/72">“{item.text}”</p>
              <p className="mt-5 font-semibold text-coral">{item.name}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
