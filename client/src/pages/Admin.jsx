import { CheckCircle2, Clock, Eye, ImageIcon, Package, Pencil, Save, Search, ShoppingBag, Trash2, Wallet, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import { cloudinaryImage } from "../utils/images";
import { formatMoney } from "../utils/money";

const blankProduct = { name: "", price: "", category: "Uncategorized", description: "", image: "", featured: false };
const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["payment_pending", "screenshot_uploaded", "payment_verified", "payment_rejected"];

function prettyStatus(status = "") {
  return status.replaceAll("_", " ");
}

function paymentBadge(status = "") {
  if (status === "payment_verified") return "bg-lagoon/14 text-lagoon dark:text-tide";
  if (status === "payment_rejected") return "bg-coral/16 text-coral";
  return "bg-white/70 text-ink/70 dark:bg-white/10 dark:text-pearl/70";
}

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [analytics, setAnalytics] = useState({ products: 0, orders: 0, pendingOrders: 0, deliveredOrders: 0, revenue: 0 });
  const [form, setForm] = useState(blankProduct);
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [screenshotOrder, setScreenshotOrder] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});

  async function loadAdmin() {
    setLoading(true);
    try {
      const [productRes, orderRes, customRes, analyticsRes, categoryRes] = await Promise.all([
        api.get("/products"),
        api.get("/orders"),
        api.get("/orders/custom"),
        api.get("/orders/admin/analytics"),
        api.get("/products/categories")
      ]);
      setProducts(productRes.data);
      setOrders(orderRes.data);
      setCustomRequests(customRes.data);
      setAnalytics(analyticsRes.data);
      setCategories(categoryRes.data);
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
        order.shippingAddress?.phone?.toLowerCase().includes(query) ||
        order.payment?.metadata?.orderRef?.toLowerCase().includes(query);
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

  async function addCategory(event) {
    event.preventDefault();
    if (!newCategory.trim()) return;

    try {
      await api.post("/products/categories", { name: newCategory.trim() });
      toast.success("Category added");
      setNewCategory("");
      loadAdmin();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add category");
    }
  }

  async function deleteCategory(id) {
    try {
      await api.delete(`/products/categories/${id}`);
      toast.success("Category deleted");
      loadAdmin();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete category");
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

  async function updatePaymentReview(order, paymentStatus) {
    const verificationStatus =
      paymentStatus === "payment_verified"
        ? "verified"
        : paymentStatus === "payment_rejected"
          ? "rejected"
          : paymentStatus === "screenshot_uploaded"
            ? "uploaded"
            : "pending";
    try {
      const { data } = await api.patch(`/orders/${order._id}`, {
        paymentStatus,
        verificationStatus,
        adminNotes: adminNotes[order._id] ?? order.adminNotes ?? ""
      });
      setOrders((current) => current.map((item) => (item._id === order._id ? data : item)));
      toast.success(paymentStatus === "payment_verified" ? "Payment approved" : paymentStatus === "payment_rejected" ? "Payment rejected" : "Payment status updated");
    } catch {
      toast.error("Could not update payment verification");
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
    <main className="mx-auto max-w-7xl overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[.28em] text-coral">Admin</p>
          <h1 className="mt-2 break-words font-display text-4xl font-bold sm:text-5xl">Studio dashboard</h1>
        </div>
      </div>

      <section className="mt-8 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="min-w-0 rounded-[28px] glass p-5 shadow-resin">
            <Icon className="text-lagoon dark:text-tide" />
            <p className="mt-5 break-words text-2xl font-bold">{value}</p>
            <p className="text-sm text-ink/60 dark:text-pearl/64">{label}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
        <form onSubmit={saveProduct} className="min-w-0 rounded-[34px] glass p-5 shadow-resin sm:p-6">
          <h2 className="font-display text-3xl font-bold">{editingId ? "Edit product" : "Add product"}</h2>
          <div className="mt-5 grid gap-4">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="min-w-0 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10" />
            <div className="grid gap-4 sm:grid-cols-2">
              <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" className="min-w-0 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="min-w-0 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10">
                <option value="Uncategorized">Uncategorized</option>
                {categories.map((category) => <option key={category._id} value={category.name}>{category.name}</option>)}
              </select>
            </div>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="min-h-24 min-w-0 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10" />
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL or upload below" className="min-w-0 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10" />
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} className="rounded-2xl border border-dashed border-lagoon/50 bg-white/42 px-4 py-3 text-sm dark:bg-white/8" />
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Featured product
            </label>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-pearl transition hover:bg-lagoon dark:bg-pearl dark:text-ink">
              <Save size={18} /> {editingId ? "Save Changes" : "Add Product"}
            </button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(blankProduct); }} className="rounded-full glass px-5 py-3 font-semibold">Cancel</button>}
          </div>
        </form>

        <div className="min-w-0 rounded-[34px] glass p-5 shadow-resin sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-3xl font-bold">Products</h2>
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[.2em] text-ink/70 dark:bg-white/10 dark:text-pearl/70">{products.length} items</span>
          </div>
          <form onSubmit={addCategory} className="mt-5 flex flex-col gap-3 rounded-3xl bg-white/44 p-3 dark:bg-white/8 sm:flex-row">
            <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Add a category" className="min-w-0 flex-1 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10" />
            <button className="rounded-full bg-lagoon px-5 py-3 font-semibold text-pearl">Add</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <div key={category._id} className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-sm font-semibold dark:bg-white/10">
                <span>{category.name}</span>
                {category.name !== "Uncategorized" && <button type="button" onClick={() => deleteCategory(category._id)} className="text-coral">×</button>}
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 max-h-screen overflow-y-auto pr-2">
            {loading && <div className="h-28 animate-pulse rounded-3xl bg-white/50 dark:bg-white/10" />}
            {!loading && products.length === 0 && <EmptyState title="No products yet" text="Add the first handmade piece to publish it." />}
            {products.map((product) => (
              <div key={product._id} className="grid min-w-0 gap-4 rounded-3xl bg-white/44 p-3 dark:bg-white/8 sm:grid-cols-[80px_1fr_auto] sm:items-center">
                <img src={cloudinaryImage(product.image, { width: 220 })} alt={product.name} loading="lazy" className="h-20 w-20 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <h3 className="break-words font-semibold">{product.name}</h3>
                  <p className="break-words text-sm text-ink/60 dark:text-pearl/64">{formatMoney(product.price)} - {product.category}</p>
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

      <section className="mt-8 min-w-0 rounded-[34px] glass p-5 shadow-resin sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="font-display text-3xl font-bold">Orders</h2>
          <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <label className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 dark:border-white/10 dark:bg-white/10">
              <Search size={16} />
              <input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="Search orders" className="min-w-0 w-full bg-transparent text-sm outline-none" />
            </label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="min-w-0 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold outline-none dark:border-white/10 dark:bg-ink">
              <option value="all">All status</option>
              {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {!loading && visibleOrders.length === 0 && <EmptyState title="No orders found" text="Manual UPI ecommerce orders will appear here." />}
          {visibleOrders.map((order) => (
            <div key={order._id} className="grid min-w-0 gap-4 rounded-3xl bg-white/44 p-4 dark:bg-white/8 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="break-all font-semibold">#{order._id.slice(-6).toUpperCase()} - {order.userDetails?.name}</h3>
                  <span className="rounded-full bg-coral/16 px-3 py-1 text-xs font-semibold uppercase text-coral">{prettyStatus(order.paymentMethod || order.payment?.method)}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${paymentBadge(order.paymentStatus || order.payment?.status)}`}>{prettyStatus(order.paymentStatus || order.payment?.status)}</span>
                </div>
                <p className="mt-1 break-words text-sm text-ink/60 dark:text-pearl/64">
                  {order.userDetails?.email} - {order.shippingAddress?.phone} - {formatMoney(order.totalAmount)}
                </p>
                <p className="mt-2 break-words text-sm leading-6 text-ink/70 dark:text-pearl/70">
                  {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {order.items.map((item) => (
                    <span key={item.product} className="max-w-full break-words rounded-full bg-white/60 px-3 py-1 text-xs font-semibold dark:bg-white/10">
                      {item.name} x {item.quantity}
                    </span>
                  ))}
                </div>
                {order.customizationRequested && (
                  <div className="mt-4 rounded-2xl bg-coral/10 p-3 text-sm leading-6 text-ink/72 dark:text-pearl/72">
                    <p className="font-semibold text-coral">Customization requested</p>
                    {order.customText && <p className="mt-1 break-words">Text: {order.customText}</p>}
                    {order.uploadedReferenceImages?.length > 0 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {order.uploadedReferenceImages.map((image) => (
                          <a key={image} href={image} target="_blank" rel="noreferrer" className="block shrink-0 overflow-hidden rounded-xl">
                            <img src={cloudinaryImage(image, { width: 180 })} alt="Customization reference" loading="lazy" className="h-16 w-16 object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                  <textarea
                    value={adminNotes[order._id] ?? order.adminNotes ?? ""}
                    onChange={(e) => setAdminNotes({ ...adminNotes, [order._id]: e.target.value })}
                    placeholder="Admin notes for payment verification"
                    className="min-h-20 min-w-0 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10"
                  />
                  <div className="flex flex-wrap gap-2">
                    {order.paymentScreenshot?.url && (
                      <button type="button" onClick={() => setScreenshotOrder(order)} className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-semibold">
                        <Eye size={16} /> Screenshot
                      </button>
                    )}
                    <button type="button" onClick={() => updatePaymentReview(order, "payment_verified")} className="inline-flex items-center gap-2 rounded-full bg-lagoon px-4 py-2 text-sm font-semibold text-pearl">
                      <CheckCircle2 size={16} /> Approve
                    </button>
                    <button type="button" onClick={() => updatePaymentReview(order, "payment_rejected")} className="inline-flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white">
                      <X size={16} /> Reject
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid min-w-0 gap-3">
                <select value={order.orderStatus} onChange={(e) => updateOrderStatus(order._id, e.target.value)} className="min-w-0 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold capitalize outline-none dark:border-white/10 dark:bg-ink">
                  {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <select value={order.paymentStatus || order.payment?.status || "screenshot_uploaded"} onChange={(e) => updatePaymentReview(order, e.target.value)} className="min-w-0 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold capitalize outline-none dark:border-white/10 dark:bg-ink">
                  {paymentStatuses.map((status) => <option key={status} value={status}>{prettyStatus(status)}</option>)}
                </select>
                <div className="rounded-2xl bg-white/52 p-3 text-xs leading-5 text-ink/62 dark:bg-white/10 dark:text-pearl/64">
                  <p className="break-all font-semibold">Ref: {order.payment?.metadata?.orderRef || order._id.slice(-6).toUpperCase()}</p>
                  <p className="break-words">Verification: {prettyStatus(order.verificationStatus)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 min-w-0 rounded-[34px] glass p-5 shadow-resin sm:p-6">
        <h2 className="font-display text-3xl font-bold">Custom requests</h2>
        <div className="mt-5 grid gap-3">
          {!loading && customRequests.length === 0 && <EmptyState title="No custom requests" text="New customer forms will appear here." />}
          {customRequests.map((request) => (
            <div key={request._id} className="grid min-w-0 gap-4 rounded-3xl bg-white/44 p-4 dark:bg-white/8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="min-w-0">
                <h3 className="break-words font-semibold">{request.customerName} - {request.productType}</h3>
                <p className="mt-1 break-words text-sm text-ink/60 dark:text-pearl/64">{request.email} {request.phone ? `- ${request.phone}` : ""} {request.budget ? `- ${request.budget}` : ""}</p>
                <p className="mt-2 break-words text-sm leading-6 text-ink/70 dark:text-pearl/70">{request.notes}</p>
              </div>
              <select value={request.status} onChange={(e) => updateCustomRequestStatus(request._id, e.target.value)} className="min-w-0 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold outline-none dark:border-white/10 dark:bg-ink">
                <option value="new">New</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          ))}
        </div>
      </section>

      {screenshotOrder && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-3xl rounded-[34px] glass p-4 shadow-resin sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[.22em] text-coral">Payment proof</p>
                <h3 className="mt-1 break-all font-display text-3xl font-bold">#{screenshotOrder._id.slice(-6).toUpperCase()}</h3>
              </div>
              <button onClick={() => setScreenshotOrder(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full glass" aria-label="Close screenshot preview">
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <a href={screenshotOrder.paymentScreenshot.url} target="_blank" rel="noreferrer" className="block min-w-0 overflow-hidden rounded-[24px] bg-white/54 dark:bg-white/10">
                <img src={screenshotOrder.paymentScreenshot.url} alt="Payment screenshot" className="max-h-[70vh] w-full object-contain" />
              </a>
              <div className="min-w-0 rounded-[24px] bg-white/54 p-4 text-sm leading-6 dark:bg-white/10">
                <ImageIcon className="text-lagoon dark:text-tide" />
                <p className="mt-3 break-words font-semibold">{screenshotOrder.userDetails?.name}</p>
                <p className="break-words text-ink/62 dark:text-pearl/64">{screenshotOrder.shippingAddress?.phone}</p>
                <p className="mt-3 font-bold">{formatMoney(screenshotOrder.totalAmount)}</p>
                <p className="mt-3 break-all text-ink/62 dark:text-pearl/64">Ref: {screenshotOrder.payment?.metadata?.orderRef}</p>
                <p className="mt-3 whitespace-pre-wrap break-words text-xs text-ink/58 dark:text-pearl/58">{screenshotOrder.payment?.metadata?.note}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
