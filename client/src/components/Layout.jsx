import { Heart, LogOut, Menu, Moon, ShoppingBag, Sun, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

const links = [
  { to: "/", label: "Studio" },
  { to: "/#collection", label: "Collection" },
  { to: "/#custom", label: "Custom" }
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();

  return (
    <div className="min-h-screen resin-bg text-ink transition-colors duration-500 dark:text-pearl">
      <header className="sticky top-0 z-50 border-b border-white/40 bg-pearl/70 backdrop-blur-2xl dark:border-white/10 dark:bg-ink/70">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-lagoon text-pearl shadow-resin">
              <Heart size={18} fill="currentColor" />
            </span>
            <span>
              <span className="block font-display text-xl font-bold leading-none">Resin Atelier</span>
              <span className="text-xs uppercase tracking-[.28em] text-lagoon dark:text-tide">handmade</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <a key={link.label} href={link.to} className="text-sm font-medium text-ink/70 transition hover:text-lagoon dark:text-pearl/72 dark:hover:text-tide">
                {link.label}
              </a>
            ))}
            {isAdmin && <NavLink to="/admin" className="text-sm font-semibold text-coral">Admin</NavLink>}
            {user && !isAdmin && <NavLink to="/orders" className="text-sm font-semibold text-lagoon dark:text-tide">Orders</NavLink>}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button aria-label="Toggle theme" onClick={toggleTheme} className="relative h-10 w-20 rounded-full border border-white/60 bg-white/60 p-1 transition dark:border-white/10 dark:bg-white/10">
              <span className={`grid h-8 w-8 place-items-center rounded-full bg-lagoon text-pearl shadow transition duration-300 ${theme === "dark" ? "translate-x-10 bg-coral" : ""}`}>
                {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
              </span>
            </button>
            {user ? (
              <button onClick={logout} className="grid h-10 w-10 place-items-center rounded-full glass" title="Sign out">
                <LogOut size={18} />
              </button>
            ) : (
              <Link to="/login" className="grid h-10 w-10 place-items-center rounded-full glass" title="Login">
                <UserRound size={18} />
              </Link>
            )}
            <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-full bg-ink text-pearl transition hover:bg-lagoon dark:bg-pearl dark:text-ink">
              <ShoppingBag size={18} />
              {count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1 text-xs text-white">{count}</span>}
            </Link>
          </div>

          <button className="grid h-10 w-10 place-items-center rounded-full glass md:hidden" onClick={() => setOpen((value) => !value)}>
            {open ? <X /> : <Menu />}
          </button>
        </nav>
        {open && (
          <div className="border-t border-white/40 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <a key={link.label} href={link.to} onClick={() => setOpen(false)} className="font-medium">
                  {link.label}
                </a>
              ))}
              {isAdmin && <Link to="/admin">Admin</Link>}
              {user && !isAdmin && <Link to="/orders">Orders</Link>}
              <Link to="/cart" onClick={() => setOpen(false)} className="flex items-center gap-2">
                Cart {count > 0 && <span className="rounded-full bg-coral px-2 py-0.5 text-xs text-white">{count}</span>}
              </Link>
              <div className="flex items-center gap-3">
                <button onClick={toggleTheme} className="rounded-full bg-white/60 px-4 py-2 dark:bg-white/10">{theme === "dark" ? "Dark" : "Light"}</button>
                {user ? <button onClick={logout}>Sign out</button> : <Link to="/login">Login</Link>}
              </div>
            </div>
          </div>
        )}
      </header>
      <Outlet />
    </div>
  );
}
