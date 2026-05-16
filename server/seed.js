import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Product from "./models/Product.js";
import User from "./models/User.js";

dotenv.config();

const products = [
  {
    name: "Ocean Pour Tray",
    price: 54,
    category: "Trays",
    description: "Layered resin tray with foamy wave textures and pearl shell accents.",
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=80",
    stock: 6,
    featured: true
  },
  {
    name: "Shell Bloom Coasters",
    price: 28,
    category: "Coasters",
    description: "Pastel coaster set with dried flowers, mica shimmer, and sealed edges.",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80",
    stock: 12,
    featured: true
  },
  {
    name: "Sea Glass Keychain",
    price: 12,
    category: "Keychains",
    description: "Pocket-sized resin charm with sea glass tones and gold initials.",
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=80",
    stock: 20
  },
  {
    name: "Lagoon Jewelry Dish",
    price: 34,
    category: "Jewelry",
    description: "Small handmade dish for rings and earrings with translucent ocean depth.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80",
    stock: 8
  },
  {
    name: "Shell Wall Tide",
    price: 68,
    category: "Shell Art",
    description: "Textured shell art panel inspired by quiet shoreline mornings.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    stock: 3,
    featured: true
  },
  {
    name: "Custom Name Gift",
    price: 42,
    category: "Custom Gifts",
    description: "Personalized resin keepsake with color palette, name, and embedded details.",
    image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=900&q=80",
    stock: 10
  }
];

async function seed() {
  await connectDB();
  await User.deleteMany({});
  await Product.deleteMany({});
  await User.create({ name: "Resin Admin", email: "admin@resinart.local", password: "admin12345", role: "admin" });
  await Product.insertMany(products);
  console.log("Seeded admin and products");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
