import fs from "fs";
import { sendMessage, sendProductCard } from "../services/metaAPI.js";

const products = JSON.parse(fs.readFileSync("./data/products.json", "utf-8"));

export const handleMessage = async (senderId, text) => {
  const message = text.toLowerCase();

  if (message.includes("hi") || message.includes("hello")) {
    await sendMessage(senderId, "👋 Hi! Are you shopping Retail or Online?");
  }
  else if (message.includes("retail")) {
    await sendMessage(
      senderId,
      "Here are nearby stores:\n1️⃣ ILYZLY Mumbai - [📍Map Link]\n📞 +91 98765 43210"
    );
  }
  else if (message.includes("online")) {
    await sendMessage(senderId, "Select a category:\n👕 Shirt\n👖 Pants\n🧥 Jackets");
  }
  else if (message.includes("shirt")) {
    await sendMessage(senderId, "Select Subcategory:\n1️⃣ Designer Wear New\n2️⃣ Casual");
  }
  else if (message.includes("designer")) {
    await sendMessage(senderId, "Choose Size: S | M | L | XL | XXL");
  }
  else if (["s", "m", "l", "xl", "xxl"].includes(message)) {
    const filtered = products.filter(p => p.size === message);
    if (filtered.length > 0) {
      for (const product of filtered) {
        await sendProductCard(senderId, product);
      }
    } else {
      await sendMessage(senderId, "No products found for that size 😔");
    }
  }
  else if (message.includes("track order")) {
    await sendMessage(senderId, "📦 Your order is *Out for Delivery* — arriving by Nov 2, 2025!");
  }
  else {
    await sendMessage(senderId, "I didn't get that 🤔 Try 'Online' or 'Retail'");
  }
};
