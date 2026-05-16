import { Gem } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const user = isSignup ? await signup(form) : await login({ email: form.email, password: form.password });
      const fallback = user.role === "admin" ? "/admin" : "/";
      navigate(location.state?.from?.pathname || fallback, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-74px)] max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
      <section>
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-lagoon text-pearl shadow-resin">
          <Gem />
        </div>
        <h1 className="mt-6 font-display text-5xl font-bold">{isSignup ? "Create your studio account" : "Welcome back to the studio"}</h1>
        <p className="mt-4 max-w-md leading-7 text-ink/66 dark:text-pearl/68">
          Sign in to manage custom requests, product listings, and handmade resin orders from one quiet dashboard.
        </p>
      </section>
      <form onSubmit={handleSubmit} className="rounded-[34px] glass p-6 shadow-resin">
        <h2 className="font-display text-3xl font-bold">{isSignup ? "Sign up" : "Login"}</h2>
        <div className="mt-6 grid gap-4">
          {isSignup && (
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Name" className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10" />
          )}
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required type="email" placeholder="Email" className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10" />
          <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required type="password" minLength={8} placeholder="Password" className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-tide dark:border-white/10 dark:bg-white/10" />
        </div>
        <button disabled={loading} className="mt-6 w-full rounded-full bg-ink px-6 py-3 font-semibold text-pearl transition hover:bg-lagoon disabled:opacity-60 dark:bg-pearl dark:text-ink">
          {loading ? "Please wait..." : isSignup ? "Create Account" : "Login"}
        </button>
        <p className="mt-5 text-center text-sm text-ink/64 dark:text-pearl/68">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <Link className="font-semibold text-coral" to={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Login" : "Create one"}
          </Link>
        </p>
      </form>
    </main>
  );
}
