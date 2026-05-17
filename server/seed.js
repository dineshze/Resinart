import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Product from "./models/Product.js";
import User from "./models/User.js";

dotenv.config();

const products = [
  {
  name: "Ocean Breeze Resin Serving Tray",
  price: 5800,
  category: "Trays",
  description: "Handcrafted ocean-inspired resin tray featuring elegant wave textures and premium glossy finishing.",
  image: "https://i1-e.pinimg.com/1200x/88/e2/74/88e2744e8f96e6802cb55d395b943fef.jpg",
  featured: true
},
{
  name: "Anniversary Floral Resin Coasters",
  price: 3000,
  category: "Coasters",
  description: "Elegant floral preservation coasters designed to preserve special memories with a luxurious finish.",
  image: "https://i1-e.pinimg.com/1200x/9d/cd/f7/9dcdf751cdcbd66f21ab93547e2c2e76.jpg",
  featured: true
},
{
  name: "Royal Rose Preservation Frame",
  price: 4200,
  category: "Frames",
  description: "Premium resin preservation frame with ocean blue aesthetics and delicate pearl shell detailing.",
  image: "https://i.pinimg.com/736x/ba/7b/54/ba7b54ba1f662d0b50622ed0ca3ea97a.jpg",
  featured: true
},
{
  name: "Golden Shore Luxury Tray",
  price: 6500,
  category: "Trays",
  description: "Luxury handcrafted resin tray inspired by golden beach waves with refined artistic detailing.",
  image: "https://i1-e.pinimg.com/1200x/5f/38/0f/5f380f146a4b555ce88f72ebedca9f5d.jpg",
  featured: true
},
{
  name: "Pearl Baby Resin Wall Clock",
  price: 3800,
  category: "Wall Art",
  description: "Minimal handcrafted resin wall clock featuring soft pearl textures and elegant decorative styling.",
  image: "https://i1-e.pinimg.com/736x/16/bb/49/16bb494fd4d321525bbb98209bf6bc2d.jpg"
},
{
  name: "Blossom Floral Resin Tray",
  price: 5400,
  category: "Trays",
  description: "Elegant floral resin tray with premium gold-edge detailing and a glossy handcrafted finish.",
  image: "https://i1-e.pinimg.com/1200x/b7/65/c8/b765c8396edf97c3c8efc120470fb33a.jpg"
},
{
  name: "Wedding Varmala Preservation Art",
  price: 7800,
  category: "Decor",
  description: "Custom varmala preservation artwork crafted in premium resin with timeless decorative appeal.",
  image: "https://i.pinimg.com/736x/cf/9a/a4/cf9aa45682b073a4d2ff85b5699f2355.jpg",
  featured: true
}
];

async function seed() {
  await connectDB();
  await Product.insertMany(products);
  console.log("Seeded all products");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
