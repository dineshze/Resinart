import { CheckCircle2, Clipboard, ExternalLink, ImagePlus, ImageUp, Loader2, QrCode, ShieldCheck, Type, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { cloudinaryImage } from "../utils/images";
import { formatMoney } from "../utils/money";

const initialAddress = { fullName: "", phone: "", address: "", city: "", state: "", pincode: "" };
const UPI_ID = import.meta.env.VITE_UPI_ID || "example@upi";
const MERCHANT_NAME = import.meta.env.VITE_UPI_MERCHANT_NAME || "HappyCreation";
const MAX_SCREENSHOT_SIZE = 3 * 1024 * 1024;
const MAX_CUSTOM_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_CUSTOM_TEXT = 120;

function shortProductCode(productId) {
  return `RESIN-${String(productId).slice(-4).toUpperCase()}`;
}

function createOrderRef() {
  return `RSN${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [shippingAddress, setShippingAddress] = useState(() => ({ ...initialAddress, fullName: user?.name || "" }));
  const [pincodeLookup, setPincodeLookup] = useState({ loading: false, error: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [customText, setCustomText] = useState("");
  const [customImages, setCustomImages] = useState([]);
  const [customUploading, setCustomUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [orderRef] = useState(() => createOrderRef());
  const fileInputRef = useRef(null);
  const customInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.name) return;
    setShippingAddress((current) => (current.fullName ? current : { ...current, fullName: user.name }));
  }, [user?.name]);

  useEffect(() => {
    const pincode = shippingAddress.pincode;
    if (pincode.length !== 6) {
      setPincodeLookup({ loading: false, error: "" });
      return;
    }

    const controller = new AbortController();
    setPincodeLookup({ loading: true, error: "" });

    api.get(`/pincode/${pincode}`, { signal: controller.signal })
      .then((data) => {
        setShippingAddress((current) => {
          if (current.pincode !== pincode) return current;
          return {
            ...current,
            city: data.data.city || current.city,
            state: data.data.state || current.state
          };
        });
        setPincodeLookup({ loading: false, error: "" });
      })
      .catch((error) => {
        if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return;
        setPincodeLookup({ loading: false, error: error.response?.data?.message || "Could not fetch pincode details" });
      });

    return () => controller.abort();
  }, [shippingAddress.pincode]);

  const paymentNote = useMemo(() => {
    const lines = items.map((item) => `${shortProductCode(item.productId)} | ${item.name}`);
    return [...lines, `OrderRef: ${orderRef}`].join("\n");
  }, [items, orderRef]);

  const upiUrl = useMemo(() => {
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: MERCHANT_NAME,
      am: String(total),
      tn: paymentNote,
      cu: "INR"
    });
    return `upi://pay?${params.toString()}`;
  }, [paymentNote, total]);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=14&data=${encodeURIComponent(upiUrl)}`;

  async function copyUpiId() {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      toast.success("UPI ID copied");
    } catch {
      toast.error("Could not copy UPI ID");
    }
  }

  async function uploadScreenshot(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Upload an image screenshot");
      return;
    }
    if (file.size > MAX_SCREENSHOT_SIZE) {
      toast.error("Screenshot must be under 3 MB");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setPaymentScreenshot(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("screenshot", file);
      const { data } = await api.post("/orders/payment-screenshot", body, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setPaymentScreenshot(data);
      toast.success("Screenshot uploaded");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not upload screenshot");
    } finally {
      setUploading(false);
    }
  }

  async function uploadCustomImages(fileList) {
    const files = Array.from(fileList || []);
    const availableSlots = 3 - customImages.length;
    const selected = files.slice(0, availableSlots);
    if (availableSlots <= 0) {
      toast.error("You can upload up to 3 reference images");
      return;
    }
    if (files.length > availableSlots) toast.error(`Only ${availableSlots} more reference image(s) allowed`);

    const validFiles = selected.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > MAX_CUSTOM_IMAGE_SIZE) {
        toast.error(`${file.name} must be under 5 MB`);
        return false;
      }
      return true;
    });
    if (validFiles.length === 0) return;

    setCustomUploading(true);
    try {
      const body = new FormData();
      validFiles.forEach((file) => body.append("images", file));
      const { data } = await api.post("/orders/customization-images", body, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const uploaded = data.urls.map((url, index) => ({
        url,
        name: validFiles[index]?.name || `Reference ${customImages.length + index + 1}`
      }));
      setCustomImages((current) => [...current, ...uploaded].slice(0, 3));
      toast.success("Reference image uploaded");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not upload reference images");
    } finally {
      setCustomUploading(false);
      setDragging(false);
      if (customInputRef.current) customInputRef.current.value = "";
    }
  }

  function removeCustomImage(url) {
    setCustomImages((current) => current.filter((image) => image.url !== url));
  }

  function updateShippingAddress(key, value) {
    const nextValue = key === "pincode" ? value.replace(/\D/g, "").slice(0, 6) : value;
    setShippingAddress((current) => ({ ...current, [key]: nextValue }));
  }

  async function placeOrder(event) {
    event.preventDefault();
    if (!paymentScreenshot?.url) {
      toast.error("Upload the UPI payment screenshot first");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/orders", {
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingAddress,
        paymentMethod: "manual_upi",
        paymentScreenshot,
        paymentNote,
        orderRef,
        customText,
        customImages: customImages.map((image) => image.url)
      });
      clearCart();
      toast.success("Order placed. Payment is awaiting verification.");
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
    <main className="mx-auto max-w-7xl overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[.28em] text-coral">Checkout</p>
      <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold sm:text-5xl">Complete your order</h1>
      <form onSubmit={placeOrder} className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,390px)]">
        <section className="min-w-0 rounded-[34px] glass p-5 shadow-resin sm:p-6">
          <div className="rounded-[28px] bg-white/46 p-4 dark:bg-white/8 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-coral/16 text-coral"><Type size={20} /></span>
              <div className="min-w-0">
                <h2 className="font-display text-3xl font-bold">Personalization</h2>
                <p className="mt-1 text-sm leading-6 text-ink/70 dark:text-pearl/72">Add names, dates, quotes, or reference images for a custom resin finish.</p>
              </div>
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-ink/76 dark:text-pearl/78">Custom text</label>
              <textarea
                value={customText}
                maxLength={MAX_CUSTOM_TEXT}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Example: Anaya, 14.02.2026, or a short quote"
                className="mt-2 min-h-24 w-full min-w-0 rounded-2xl border border-white/60 bg-white/72 px-4 py-3 text-ink outline-none transition placeholder:text-ink/48 focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10 dark:text-pearl dark:placeholder:text-pearl/48"
              />
              <p className="mt-1 text-right text-xs font-semibold text-ink/58 dark:text-pearl/58">{customText.length}/{MAX_CUSTOM_TEXT}</p>
            </div>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                uploadCustomImages(event.dataTransfer.files);
              }}
              className={`mt-4 rounded-[26px] border border-dashed p-4 transition ${
                dragging ? "border-lagoon bg-lagoon/10" : "border-lagoon/42 bg-white/44 dark:bg-white/8"
              }`}
            >
              <input ref={customInputRef} type="file" accept="image/*" multiple onChange={(e) => uploadCustomImages(e.target.files)} className="hidden" />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold">Reference images</p>
                  <p className="mt-1 text-sm text-ink/64 dark:text-pearl/66">Drag and drop up to 3 images, or choose from your device.</p>
                </div>
                <button type="button" onClick={() => customInputRef.current?.click()} disabled={customUploading || customImages.length >= 3} className="inline-flex items-center justify-center gap-2 rounded-full bg-lagoon px-5 py-3 text-sm font-semibold text-pearl transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60">
                  {customUploading ? <Loader2 className="animate-spin" size={16} /> : <ImagePlus size={16} />} Add images
                </button>
              </div>
              {customImages.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {customImages.map((image) => (
                    <div key={image.url} className="group relative overflow-hidden rounded-2xl bg-white/64 dark:bg-white/10">
                      <img src={cloudinaryImage(image.url, { width: 360 })} alt={image.name} loading="lazy" className="h-32 w-full object-cover" />
                      <button type="button" onClick={() => removeCustomImage(image.url)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-ink/78 text-pearl backdrop-blur">
                        <X size={15} />
                      </button>
                      <p className="truncate px-3 py-2 text-xs font-semibold text-ink/70 dark:text-pearl/70">{image.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
          <h2 className="font-display text-3xl font-bold">Customer details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["fullName", "Full Name"],
              ["phone", "Phone Number"],
              ["address", "Address"],
              ["pincode", "Pincode"],
              ["city", "City"],
              ["state", "State"]
            ].map(([key, label]) => (
              <input
                key={key}
                required
                value={shippingAddress[key]}
                onChange={(e) => updateShippingAddress(key, e.target.value)}
                placeholder={label}
                inputMode={key === "pincode" || key === "phone" ? "numeric" : undefined}
                maxLength={key === "pincode" ? 6 : undefined}
                className={`min-w-0 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-ink outline-none transition placeholder:text-ink/48 focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10 dark:text-pearl dark:placeholder:text-pearl/48 ${key === "address" ? "sm:col-span-2" : ""}`}
              />
            ))}
          </div>
          {(pincodeLookup.loading || pincodeLookup.error) && (
            <p className={`mt-2 text-sm font-semibold ${pincodeLookup.error ? "text-coral" : "text-ink/60 dark:text-pearl/64"}`}>
              {pincodeLookup.error || "Fetching city and state..."}
            </p>
          )}
          </div>

          <div className="mt-6 rounded-[28px] bg-white/50 p-4 dark:bg-white/8 sm:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="mx-auto grid shrink-0 place-items-center rounded-[24px] bg-pearl p-3 shadow-resin dark:bg-white">
                <img src={qrUrl} alt="UPI payment QR code" className="h-52 w-52 max-w-full rounded-2xl object-contain sm:h-60 sm:w-60" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-lagoon text-pearl"><QrCode size={20} /></span>
                  <div className="min-w-0">
                    <p className="font-semibold">Manual UPI payment</p>
                    <p className="break-words text-sm text-ink/60 dark:text-pearl/64">Pay first, then upload the payment screenshot.</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm">
                  <div className="rounded-2xl bg-white/60 p-3 dark:bg-white/10">
                    <p className="text-ink/58 dark:text-pearl/58">UPI ID</p>
                    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
                      <strong className="break-all">{UPI_ID}</strong>
                      <button type="button" onClick={copyUpiId} className="inline-flex items-center gap-1 rounded-full bg-lagoon px-3 py-1 text-xs font-semibold text-pearl">
                        <Clipboard size={14} /> Copy
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/60 p-3 dark:bg-white/10">
                      <p className="text-ink/58 dark:text-pearl/58">Amount</p>
                      <strong>{formatMoney(total)}</strong>
                    </div>
                    <div className="rounded-2xl bg-white/60 p-3 dark:bg-white/10">
                      <p className="text-ink/58 dark:text-pearl/58">Reference</p>
                      <strong>{orderRef}</strong>
                    </div>
                  </div>
                </div>
                <a href={upiUrl} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-pearl transition hover:bg-lagoon dark:bg-pearl dark:text-ink sm:w-auto">
                  <ExternalLink size={16} /> Open in UPI App
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-dashed border-lagoon/40 bg-white/42 p-4 dark:bg-white/8 sm:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-display text-2xl font-bold">Payment screenshot</h3>
                <p className="mt-1 text-sm text-ink/60 dark:text-pearl/64">Image files only, up to 3 MB. You can retry before placing the order.</p>
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-full bg-lagoon px-5 py-3 text-sm font-semibold text-pearl">
                <ImageUp size={16} /> {paymentScreenshot ? "Replace" : "Upload"}
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => uploadScreenshot(e.target.files?.[0])} className="hidden" />
            {(preview || uploading || paymentScreenshot) && (
              <div className="mt-4 grid gap-4 sm:grid-cols-[160px_1fr] sm:items-center">
                {preview && <img src={preview} alt="Payment screenshot preview" className="h-40 w-full rounded-2xl object-cover sm:w-40" />}
                <div className="min-w-0 rounded-2xl bg-white/54 p-4 dark:bg-white/10">
                  {uploading && <p className="inline-flex items-center gap-2 text-sm font-semibold"><Loader2 className="animate-spin" size={16} /> Uploading screenshot...</p>}
                  {!uploading && paymentScreenshot && <p className="inline-flex items-center gap-2 text-sm font-semibold text-lagoon dark:text-tide"><CheckCircle2 size={16} /> Screenshot uploaded successfully</p>}
                  {!uploading && !paymentScreenshot && <p className="text-sm font-semibold text-coral">Upload failed. Please retry.</p>}
                  <p className="mt-2 break-words text-xs text-ink/58 dark:text-pearl/58">{paymentScreenshot?.originalName || "Preview ready"}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="min-w-0 h-fit rounded-[34px] glass p-5 shadow-resin sm:p-6">
          <ShieldCheck className="text-coral" />
          <h2 className="mt-4 font-display text-3xl font-bold">Summary</h2>
          <div className="mt-5 grid max-h-[460px] gap-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.productId} className="flex min-w-0 gap-3 rounded-3xl bg-white/44 p-3 dark:bg-white/8">
                <img src={cloudinaryImage(item.image, { width: 180 })} alt={item.name} loading="lazy" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="break-words font-semibold">{item.name}</p>
                  <p className="text-sm text-ink/60 dark:text-pearl/64">Qty {item.quantity}</p>
                </div>
                <p className="shrink-0 font-semibold">{formatMoney(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between gap-4 border-t border-white/50 pt-4 text-lg font-bold dark:border-white/10">
            <span>Total</span><span>{formatMoney(total)}</span>
          </div>
          <div className="mt-5 rounded-2xl bg-coral/12 p-4 text-sm leading-6 text-ink/70 dark:text-pearl/70">
            Orders are confirmed after the studio verifies the UPI screenshot. Rejected payments can be rechecked from order support.
          </div>
          <button disabled={loading || uploading || customUploading || !paymentScreenshot?.url} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-pearl transition hover:-translate-y-1 hover:bg-lagoon disabled:cursor-not-allowed disabled:opacity-70 dark:bg-pearl dark:text-ink">
            {(loading || uploading || customUploading) && <Loader2 className="animate-spin" size={18} />} Place Order
          </button>
        </aside>
      </form>
    </main>
  );
}
