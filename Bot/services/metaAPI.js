import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const META_API_URL = "https://graph.facebook.com/v17.0/me/messages";

export const sendMessage = async (recipientId, message) => {
  try {
    await axios.post(
      META_API_URL,
      {
        recipient: { id: recipientId },
        message: { text: message },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
        },
      }
    );
  } catch (error) {
    console.error("Meta API Error:", error.response?.data || error.message);
  }
};

export const sendProductCard = async (recipientId, product) => {
  const messageData = {
    recipient: { id: recipientId },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: product.title,
              image_url: product.image,
              subtitle: `${product.price}`,
              buttons: [
                {
                  type: "postback",
                  title: "🛒 Add to Cart",
                  payload: `ADD_CART_${product.id}`,
                },
              ],
            },
          ],
        },
      },
    },
  };

  try {
    await axios.post(META_API_URL, messageData, {
      headers: {
        Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
      },
    });
  } catch (error) {
    console.error("Send Product Card Error:", error.message);
  }
};
