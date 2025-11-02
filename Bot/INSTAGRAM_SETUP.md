# 📱 Instagram Shopping Bot Setup Guide

## Prerequisites
1. An Instagram Business Account or Creator Account
2. A Facebook Page (linked to your Instagram account)
3. A Meta Developer Account

---

## Step-by-Step Setup

### 1. Create a Meta Developer Account
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Business"** type
4. Fill in app details:
   - App Name: `ILYZLY Shopping Bot` (or your choice)
   - App Contact Email: Your email
   - Business Account: Select or create one
5. Click **"Create App"**

### 2. Add Instagram Product
1. In your app dashboard, go to **"Add Products"**
2. Find **"Instagram"** and click **"Set Up"**
3. This will add Instagram capabilities to your app

### 3. Configure Instagram Basic Display (Optional)
If you only need messaging, you can skip this. For Instagram Direct, you need:
- **Instagram Graph API** product (not Basic Display)

### 4. Get Access Tokens

#### Option A: Using Graph API Explorer (Testing)
1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from dropdown
3. Click **"Generate Access Token"**
4. Add permissions:
   - `instagram_basic`
   - `instagram_manage_messages`
   - `pages_show_list`
   - `pages_read_engagement`
5. Copy the token → Use as `META_ACCESS_TOKEN` in `.env`

#### Option B: Create System User Token (Production)
1. Go to **Settings** → **System Users**
2. Create a new system user
3. Assign roles: **Instagram App**
4. Generate token with permissions:
   - `instagram_basic`
   - `instagram_manage_messages`
   - `pages_show_list`

### 5. Get Your Instagram Business Account ID
1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Use your access token
3. Query: `me/accounts` (to get Facebook Page ID)
4. Then query: `{page-id}?fields=instagram_business_account`
5. Copy the `instagram_business_account.id` value

**OR** simpler method:
1. Query: `me?fields=instagram_business_account`
2. Copy the `id` from the response

### 6. Set Up Webhook

#### 6a. Make Your Server Publicly Accessible
Your server needs to be accessible from the internet. Options:

**Option 1: ngrok (Quick Testing)**
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 5000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

**Option 2: Deploy to Cloud (Production)**
- Heroku
- Railway
- Render
- AWS EC2
- DigitalOcean

#### 6b. Configure Webhook in Meta Dashboard
1. Go to your app dashboard
2. Navigate to **Instagram** → **Settings** → **Basic**
3. Scroll to **"Webhooks"** section
4. Click **"Add Callback URL"**
5. Enter:
   - **Callback URL**: `https://your-domain.com/webhook`
   - **Verify Token**: Your `VERIFY_TOKEN` from `.env`
6. Click **"Verify and Save"**
7. After verification, click **"Subscribe"** to webhook fields:
   - ✅ `messages`
   - ✅ `messaging_postbacks`
   - ✅ `messaging_seen` (optional)

### 7. Update Your .env File
```bash
PORT=5000
META_ACCESS_TOKEN=your_instagram_access_token_here
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_business_account_id_here
VERIFY_TOKEN=your_custom_verify_token_here
```

### 8. Link Instagram Account to App
1. In Meta Dashboard → **Instagram** → **Settings**
2. Click **"Add Instagram Account"**
3. Authenticate with your Instagram Business account
4. Grant necessary permissions

### 9. Test Your Bot
1. Open Instagram app on your phone
2. Navigate to your Instagram Business account
3. Send a message (or have someone message your account)
4. Your bot should respond automatically!

---

## Quick Test Commands

### Test Webhook Verification
```bash
curl "http://localhost:5000/webhook?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=test123"
# Should return: test123
```

### Test Message Sending (using curl)
```bash
curl -X POST https://graph.facebook.com/v17.0/{INSTAGRAM_BUSINESS_ACCOUNT_ID}/messages \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": {"id": "USER_IGSP_ID"},
    "message": {"text": "Hello from bot!"}
  }'
```

---

## Troubleshooting

### ❌ "Invalid OAuth access token"
- Your token may have expired (they expire after 60 days for user tokens)
- Regenerate token in Graph API Explorer
- For production, use long-lived tokens or System User tokens

### ❌ "Webhook verification failed"
- Make sure your server is publicly accessible
- Verify token must match exactly in `.env` and Meta Dashboard
- Check that `GET /webhook` endpoint is working

### ❌ "This app doesn't have permission to access Instagram"
- Make sure you added **Instagram** product to your app
- Check that your Instagram account is linked in app settings
- Verify permissions in token include `instagram_manage_messages`

### ❌ "No messages received"
- Ensure webhook is subscribed to `messages` field
- Check that Instagram account is Business or Creator type
- Verify your server logs for incoming webhook requests

### ❌ "Can't send message to this user"
- User must have messaged your Instagram account first (24-hour window)
- For outside 24 hours, you need Instagram messaging permissions approved
- User must follow your account (for some account types)

---

## Important Notes

1. **Instagram vs Facebook Messenger**: The API structure is similar, but endpoints differ
   - Instagram uses: `{ig-user-id}/messages`
   - Messenger uses: `me/messages` (uses Page ID automatically)

2. **24-Hour Messaging Window**: 
   - You can only send messages to users who messaged you in the last 24 hours
   - For extended messaging, apply for Instagram messaging permissions in App Review

3. **Access Token Types**:
   - **Short-lived** (1-2 hours): From Graph API Explorer
   - **Long-lived** (60 days): Exchange short-lived token
   - **Permanent** (System User): Best for production

4. **Rate Limits**: Instagram API has rate limits - be mindful of message frequency

---

## Next Steps
1. ✅ Complete webhook setup
2. ✅ Test basic messaging
3. ✅ Test product card sending
4. ⚠️ Apply for Instagram messaging permissions (if needed for 24h+ messaging)
5. 🚀 Deploy to production
6. 📊 Set up analytics and monitoring

---

## Resources
- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api/)
- [Instagram Messaging API](https://developers.facebook.com/docs/instagram-api/guides/messaging)
- [Meta Webhooks Guide](https://developers.facebook.com/docs/graph-api/webhooks)

