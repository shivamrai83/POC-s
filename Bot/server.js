import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { handleMessage } from "./controllers/messageController.js";
import { handlePostback } from "./controllers/orderController.js";

dotenv.config();
const app = express();
app.use(bodyParser.json());

// Verify webhook (Meta requirement)
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle messages
app.post("/webhook", async (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.messaging?.[0];

  if (changes?.message) {
    const senderId = changes.sender.id;
    const text = changes.message.text;
    await handleMessage(senderId, text);
  } else if (changes?.postback) {
    const senderId = changes.sender.id;
    const payload = changes.postback.payload;
    await handlePostback(senderId, payload);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
