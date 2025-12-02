# 🤖 Instagram E-commerce Bot

An Instagram Business messaging bot that enables customers to browse products, check store locations, and track orders through Instagram Direct Messages.

## 📋 Overview

This bot integrates with Instagram Business API to provide automated customer service for e-commerce businesses. It handles product catalog browsing, store locator, and order tracking through conversational messaging.

## ✨ Features

- **Product Catalog Browsing**: Browse products by category and size
- **Store Locator**: Find nearby retail stores
- **Order Tracking**: Check order status and delivery information
- **Interactive Messaging**: Natural language processing for user queries
- **Product Cards**: Rich media product displays
- **Quick Replies**: Fast navigation with button-based interactions

## 🏗 Architecture

```
Bot/
├── server.js                 # Express webhook server
├── controllers/
│   ├── messageController.js  # Handles text messages
│   └── orderController.js    # Handles postback events
├── services/
│   └── metaAPI.js           # Meta Graph API integration
├── data/
│   └── products.json        # Product catalog
└── package.json
```

## 🛠 Technology Stack

- **Node.js** (ES Modules)
- **Express.js** - Web framework
- **Meta Graph API** - Instagram/Facebook integration
- **Axios** - HTTP client

## 📦 Installation

1. **Clone and navigate to the project**:
   ```bash
   cd Bot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file:
   ```env
   PORT=5000
   META_ACCESS_TOKEN=your_meta_access_token
   INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_account_id
   VERIFY_TOKEN=your_webhook_verify_token
   ```

## 🚀 Quick Start

### 1. Meta Developer Setup

1. Create a Meta App at [developers.facebook.com/apps/](https://developers.facebook.com/apps/)
2. Add **Instagram** product to your app
3. Generate access token with permissions:
   - `instagram_basic`
   - `instagram_manage_messages`
   - `pages_show_list`
4. Get Instagram Business Account ID from Graph API Explorer

### 2. Configure Webhook

1. Expose your server (use ngrok for testing):
   ```bash
   ngrok http 5000
   ```

2. Configure webhook in Meta Dashboard:
   - URL: `https://your-domain.com/webhook`
   - Verify Token: (same as `VERIFY_TOKEN` in .env)
   - Subscribe to: `messages` and `messaging_postbacks`

### 3. Run the Server

```bash
npm start
```

The server will run on `http://localhost:5000` (or your configured PORT).

## 📡 API Endpoints

### `GET /webhook`
Webhook verification endpoint (required by Meta).

**Query Parameters**:
- `hub.mode`: Must be "subscribe"
- `hub.verify_token`: Must match `VERIFY_TOKEN`
- `hub.challenge`: Challenge string from Meta

**Response**: Returns challenge string if verification succeeds.

### `POST /webhook`
Receives webhook events from Instagram.

**Handles**:
- Text messages → `messageController.handleMessage()`
- Postback events → `orderController.handlePostback()`

## 💬 Bot Commands

The bot responds to various natural language inputs:

- **Greetings**: "hi", "hello" → Shows shopping options
- **Shopping Mode**: "retail" → Shows store locations
- **Online Shopping**: "online" → Shows product categories
- **Categories**: "shirt", "pants", "jackets" → Shows subcategories
- **Sizes**: "s", "m", "l", "xl", "xxl" → Shows products in that size
- **Order Tracking**: "track order" → Shows order status

## 📁 Project Structure

### `server.js`
Main Express server that:
- Sets up webhook endpoints
- Handles webhook verification
- Routes messages to appropriate controllers

### `controllers/messageController.js`
Handles incoming text messages:
- Parses user intent
- Routes to appropriate responses
- Sends product cards for product queries
- Manages conversation flow

### `controllers/orderController.js`
Handles postback events (button clicks):
- Processes order-related actions
- Handles order tracking requests

### `services/metaAPI.js`
Meta Graph API wrapper:
- `sendMessage()` - Sends text messages
- `sendProductCard()` - Sends rich product cards
- Handles API authentication

### `data/products.json`
Product catalog with:
- Product name, description, price
- Images
- Sizes and availability

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `META_ACCESS_TOKEN` | Meta Graph API access token | Yes |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Instagram Business Account ID | Yes |
| `VERIFY_TOKEN` | Webhook verification token | Yes |

### Product Catalog

Edit `data/products.json` to customize your product catalog:

```json
[
  {
    "id": 1,
    "name": "Designer Shirt",
    "description": "Premium quality shirt",
    "price": 2999,
    "image": "https://example.com/shirt.jpg",
    "size": "M",
    "category": "shirt"
  }
]
```

## 🧪 Testing

### Local Testing with ngrok

1. Start the server:
   ```bash
   npm start
   ```

2. Expose with ngrok:
   ```bash
   ngrok http 5000
   ```

3. Update webhook URL in Meta Dashboard to ngrok URL

4. Send a message to your Instagram Business account

### Testing Commands

Test the bot by sending these messages:
- "hi" or "hello"
- "online"
- "shirt"
- "designer"
- "m" (or any size)

## 🐛 Troubleshooting

### Webhook Verification Fails
- Ensure `VERIFY_TOKEN` matches in both `.env` and Meta Dashboard
- Check that server is accessible from internet
- Verify webhook URL is correct

### Messages Not Received
- Check webhook subscriptions are enabled
- Verify access token has correct permissions
- Ensure Instagram Business Account is connected

### API Errors
- Regenerate access token if expired
- Check token permissions in Graph API Explorer
- Verify Instagram Business Account ID is correct

## 📚 Additional Resources

- [Meta Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Instagram Messaging API](https://developers.facebook.com/docs/instagram-platform/instagram-messaging)
- [Webhook Setup Guide](./INSTAGRAM_SETUP.md)
- [Quick Start Guide](./QUICK_START.md)

## 🚀 Deployment

### Option 1: Heroku
```bash
heroku create your-bot-name
git push heroku main
```

### Option 2: Railway
1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Option 3: Render
1. Create new Web Service
2. Connect repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Contains sensitive tokens
2. **Rotate access tokens** regularly
3. **Use environment variables** for all secrets
4. **Validate webhook requests** (implement request signature verification)
5. **Rate limiting** - Implement rate limiting for webhook endpoint

## 📈 Future Enhancements

- [ ] Payment integration
- [ ] Shopping cart functionality
- [ ] User authentication
- [ ] Analytics and reporting
- [ ] Multi-language support
- [ ] AI-powered natural language understanding
- [ ] Integration with inventory management systems

## 📝 License

ISC License

---

**Made for Instagram Business messaging automation**

