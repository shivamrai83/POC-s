# 🚀 Quick Start: Instagram Bot Setup

## 1. Meta Developer Setup (5 minutes)

1. **Create Meta App**
   - Visit: https://developers.facebook.com/apps/
   - Create App → Select "Business" type
   - Add **Instagram** product to your app

2. **Get Access Token**
   - Go to: https://developers.facebook.com/tools/explorer/
   - Select your app
   - Generate token with permissions:
     - `instagram_basic`
     - `instagram_manage_messages`
     - `pages_show_list`

3. **Get Instagram Business Account ID**
   - In Graph API Explorer, query: `me?fields=instagram_business_account`
   - Copy the `id` from `instagram_business_account.id`

## 2. Configure .env

Update `/home/shivam/POC-s/Bot/.env`:

```bash
PORT=5000
META_ACCESS_TOKEN=paste_your_token_here
INSTAGRAM_BUSINESS_ACCOUNT_ID=paste_ig_account_id_here
VERIFY_TOKEN=create_a_random_secret_word_here
```

## 3. Expose Your Server (Choose One)

### Option A: ngrok (Testing)
```bash
# Install: https://ngrok.com/download
ngrok http 5000
# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

### Option B: Deploy (Production)
- **Heroku**: `heroku create && git push heroku main`
- **Railway**: Connect GitHub repo
- **Render**: Connect GitHub repo

## 4. Configure Webhook

1. Go to: Meta Dashboard → Your App → Instagram → Settings → Basic
2. Scroll to **Webhooks** section
3. Click **"Add Callback URL"**
   - URL: `https://your-domain.com/webhook`
   - Verify Token: (same as `VERIFY_TOKEN` in .env)
4. After verification, **Subscribe** to:
   - ✅ `messages`
   - ✅ `messaging_postbacks`

## 5. Test It!

1. Open Instagram app
2. Message your Instagram Business account
3. Bot should respond automatically!

---

## Common Issues

- **"Invalid token"**: Regenerate in Graph API Explorer
- **"Webhook failed"**: Make sure server is public & verify token matches
- **"No messages"**: Check webhook subscriptions are enabled

See `INSTAGRAM_SETUP.md` for detailed troubleshooting.

