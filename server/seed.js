import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Category from "./models/Category.js";

dotenv.config();

async function seed() {
  await connectDB();

  const defaultCategories = [
    "All",
    "Rakhi 🌸",
    "Keychains",
    "Hammering Glass Art",
    "Preservation",
    "Lipan Art",
    "Photo frame",
    "Portrait",
    "String Art"
  ];

  for (const name of defaultCategories) {
    await Category.findOneAndUpdate(
      { name },
      { $setOnInsert: { name } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log("Seeded default categories");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
