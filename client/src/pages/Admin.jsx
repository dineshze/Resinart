import { CheckCircle2, Clock, Package, Pencil, Save, Search, ShoppingBag, Trash2, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import { formatMoney } from "../utils/money";

const blankProduct = { name: "", price: "", category: "Trays", description: "", image: "", stock: 1, featured: false };
const categories = ["Trays", "Keychains", "Coasters", "Jewelry", "Shell Art", "Custom Gifts"];
const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [analytics, setAnalytics] = useState({ products: 0, orders: 0, pendingOrders: 0, deliveredOrders: 0, revenue: 0 });
  const [form, setForm] = useState(blankProduct);
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadAdmin() {
    setLoading(true);
    try {
      const [productRes, orderRes, customRes, analyticsRes] = await Promise.all([
        api.get("/products"),
        api.get("/orders"),
        api.get("/orders/custom"),
        api.get("/orders/admin/analytics")
      ]);
      setProducts(productRes.data);
      setOrders(orderRes.data);
      setCustomRequests(customRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmin();
  }, []);

  const cards = useMemo(
    () => [
      ["Products", analytics.products, Package],
      ["Total Orders", analytics.orders, ShoppingBag],
      ["Pending Orders", analytics.pendingOrders, Clock],
      ["Delivered", analytics.deliveredOrders, CheckCircle2],
      ["Revenue", formatMoney(analytics.revenue), Wallet]
    ],
    [analytics]
  );

  const visibleOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter;
      const matchesQuery =
        !query ||
        order._id.toLowerCase().includes(query) ||
        order.userDetails?.name?.toLowerCase().includes(query) ||
        order.userDetails?.email?.toLowerCase().includes(query) ||
        order.shippingAddress?.phone?.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [orders, orderSearch, statusFilter]);

  function editProduct(product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      image: product.image,
      stock: product.stock,
      featured: product.featured
    });
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveProduct(event) {
    event.preventDefault();
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    if (file) body.append("image", file);

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, body);
        toast.success("Product updated");
      } else {
        await api.post("/products", body);
        toast.success("Product added");
      }
      setForm(blankProduct);
      setFile(null);
      setEditingId(null);
      loadAdmin();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save product");
    }
  }

  async function deleteProduct(id) {
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      loadAdmin();
    } catch {
      toast.error("Could not delete product");
    }
  }

  async function updateOrderStatus(id, status) {
    try {
      const { data } = await api.patch(`/orders/${id}`, { orderStatus: status });
      setOrders((current) => current.map((order) => (order._id === id ? data : order)));
      toast.success("Order updated");
    } catch {
      toast.error("Could not update order");
    }
  }

  async function updateCustomRequestStatus(id, status) {
    try {
      const { data } = await api.patch(`/orders/custom/${id}`, { status });
      setCustomRequests((current) => current.map((request) => (request._id === id ? data : request)));
      toast.success("Custom request updated");
    } catch {
      toast.error("Could not update custom request");
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.28em] text-coral">Admin</p>
          <h1 className="mt-2 font-display text-5xl font-bold">Studio dashboard</h1>
        </div>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="rounded-[28px] glass p-5 shadow-resin">
            <Icon className="text-lagoon dark:text-tide" />
            <p className="mt-5 text-2xl font-bold">{value}</p>
            <p className="text-sm text-ink/60 dark:text-pearl/64">{label}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <form onSubmit={saveProduct} className="rounded-[34px] glass p-6 shadow-resin">
          <h2 className="font-display text-3xl font-bold">{editingId ? "Edit product" : "Add product"}</h2>
          <div className="mt-5 grid gap-4">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10" />
            <div className="grid gap-4 sm:grid-cols-2">
              <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10">
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="min-h-24 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10" />
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL or upload below" className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10" />
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} className="rounded-2xl border border-dashed border-lagoon/50 bg-white/42 px-4 py-3 text-sm dark:bg-white/8" />
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Featured product
            </label>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-pearl transition hover:bg-lagoon dark:bg-pearl dark:text-ink">
              <Save size={18} /> {editingId ? "Save Changes" : "Add Product"}
            </button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(blankProduct); }} className="rounded-full glass px-5 py-3 font-semibold">Cancel</button>}
          </div>
        </form>

        <div className="rounded-[34px] glass p-6 shadow-resin">
          <h2 className="font-display text-3xl font-bold">Products</h2>
          <div className="mt-5 grid gap-3">
            {loading && <div className="h-28 animate-pulse rounded-3xl bg-white/50 dark:bg-white/10" />}
            {!loading && products.length === 0 && <EmptyState title="No products yet" text="Add the first handmade piece to publish it." />}
            {products.map((product) => (
              <div key={product._id} className="flex gap-4 rounded-3xl bg-white/44 p-3 dark:bg-white/8">
                <img src={product.image} alt={product.name} className="h-20 w-20 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{product.name}</h3>
                  <p className="text-sm text-ink/60 dark:text-pearl/64">{formatMoney(product.price)} - {product.category}</p>
                  <p className="line-clamp-1 text-sm text-ink/54 dark:text-pearl/54">{product.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => editProduct(product)} className="grid h-10 w-10 place-items-center rounded-full glass"><Pencil size={16} /></button>
                  <button onClick={() => deleteProduct(product._id)} className="grid h-10 w-10 place-items-center rounded-full bg-coral text-white"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[34px] glass p-6 shadow-resin">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="font-display text-3xl font-bold">Orders</h2>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 dark:border-white/10 dark:bg-white/10">
              <Search size={16} />
              <input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="Search orders" className="w-full bg-transparent text-sm outline-none" />
            </label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold outline-none dark:border-white/10 dark:bg-ink">
              <option value="all">All status</option>
              {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {!loading && visibleOrders.length === 0 && <EmptyState title="No orders found" text="COD ecommerce orders will appear here." />}
          {visibleOrders.map((order) => (
            <div key={order._id} className="grid gap-4 rounded-3xl bg-white/44 p-4 dark:bg-white/8 xl:grid-cols-[1fr_auto] xl:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-semibold">#{order._id.slice(-6).toUpperCase()} - {order.userDetails?.name}</h3>
                  <span className="rounded-full bg-coral/16 px-3 py-1 text-xs font-semibold uppercase text-coral">{order.payment?.method}</span>
                  <span className="rounded-full bg-lagoon/14 px-3 py-1 text-xs font-semibold uppercase text-lagoon dark:text-tide">{order.payment?.status?.replace("_", " ")}</span>
                </div>
                <p className="mt-1 text-sm text-ink/60 dark:text-pearl/64">
                  {order.userDetails?.email} - {order.shippingAddress?.phone} - {formatMoney(order.totalAmount)}
                </p>
                <p className="mt-2 text-sm leading-6 text-ink/70 dark:text-pearl/70">
                  {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {order.items.map((item) => (
                    <span key={item.product} className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold dark:bg-white/10">
                      {item.name} x {item.quantity}
                    </span>
                  ))}
                </div>
              </div>
              <select value={order.orderStatus} onChange={(e) => updateOrderStatus(order._id, e.target.value)} className="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold capitalize outline-none dark:border-white/10 dark:bg-ink">
                {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-[34px] glass p-6 shadow-resin">
        <h2 className="font-display text-3xl font-bold">Custom requests</h2>
        <div className="mt-5 grid gap-3">
          {!loading && customRequests.length === 0 && <EmptyState title="No custom requests" text="New customer forms will appear here." />}
          {customRequests.map((request) => (
            <div key={request._id} className="grid gap-4 rounded-3xl bg-white/44 p-4 dark:bg-white/8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h3 className="font-semibold">{request.customerName} - {request.productType}</h3>
                <p className="mt-1 text-sm text-ink/60 dark:text-pearl/64">{request.email} {request.phone ? `- ${request.phone}` : ""} {request.budget ? `- ${request.budget}` : ""}</p>
                <p className="mt-2 text-sm leading-6 text-ink/70 dark:text-pearl/70">{request.notes}</p>
              </div>
              <select value={request.status} onChange={(e) => updateCustomRequestStatus(request._id, e.target.value)} className="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold outline-none dark:border-white/10 dark:bg-ink">
                <option value="new">New</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
