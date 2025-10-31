import { sendMessage } from "../services/metaAPI.js";

export const handlePostback = async (senderId, payload) => {
  if (payload.startsWith("ADD_CART_")) {
    const productId = payload.replace("ADD_CART_", "");
    await sendMessage(senderId, `✅ Product added to cart (ID: ${productId})`);
    await sendMessage(
      senderId,
      "💳 Ready to checkout? Click here: https://yourshopifycart.com/checkout"
    );
  }
};
