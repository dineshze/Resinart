import { createContext, useContext, useMemo, useState } from "react";
import toast from "react-hot-toast";

const CartContext = createContext(null);
const storageKey = "resin_cart";

function normalizeItem(product, quantity) {
  return {
    productId: product._id,
    name: product.name,
    price: Number(product.price),
    image: product.image,
    category: product.category,
    stock: product.stock ?? 99,
    quantity
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  function persist(nextItems) {
    setItems(nextItems);
    localStorage.setItem(storageKey, JSON.stringify(nextItems));
  }

  function addToCart(product, quantity = 1) {
    const nextQuantity = Math.max(1, Number(quantity) || 1);
    const nextItems = items.some((item) => item.productId === product._id)
      ? items.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: Math.min(item.quantity + nextQuantity, item.stock || 99) }
            : item
        )
      : [...items, normalizeItem(product, nextQuantity)];
    persist(nextItems);
    toast.success("Added to cart");
  }

  function removeFromCart(productId) {
    persist(items.filter((item) => item.productId !== productId));
    toast.success("Removed from cart");
  }

  function updateQuantity(productId, quantity) {
    const nextQuantity = Math.max(1, Number(quantity) || 1);
    persist(items.map((item) => (item.productId === productId ? { ...item, quantity: Math.min(nextQuantity, item.stock || 99) } : item)));
  }

  function clearCart() {
    persist([]);
  }

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, subtotal, total: subtotal, count, addToCart, removeFromCart, updateQuantity, clearCart }),
    [items, subtotal, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
