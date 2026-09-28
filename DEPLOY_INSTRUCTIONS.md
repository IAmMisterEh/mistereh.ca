🚀 CLOCKWORK WORDS V2.0 - CLOUDFLARE PAGES DEPLOYMENT

Your game is ready to deploy! Here's what you need to do (takes ~3 minutes):

## Step 1: Get Cloudflare Credentials (~1 minute)

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token" → "Custom Token"
3. Select these permissions:
   - ✅ Account:Cloudflare Pages:Edit
   - ✅ Account:Account Settings:Read
4. Name it: "Clockwork Words Deploy"
5. Copy the token value (starts with r0_t...)

6. Your Account ID is at https://dash.cloudflare.com/ (top right corner)
   - It's a 32-character hex string like: abc123def456...

## Step 2: Add GitHub Secrets (~1 minute)

1. Go to: https://github.com/IAmMisterEh/mistereh.ca/settings/secrets/actions
2. Click "New repository secret"
3. Create these two secrets:

   **Secret 1:**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: [Paste your API token from Step 1]

   **Secret 2:**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: [Paste your Account ID from Step 1]

## Step 3: Push to GitHub (~30 seconds)

Run these commands in your terminal:

```bash
cd ~/steampunk-clock-games
git add .github/workflows/deploy-cloudflare.yml DEPLOY_INSTRUCTIONS.md
git commit -m "Add Cloudflare Pages auto-deployment for v2.0"
git push origin main
```

## 🎉 AUTOMATIC DEPLOYMENT!

Once you push, GitHub Actions will automatically:
- ✅ Build your game
- ✅ Deploy to Cloudflare Pages  
- ✅ Publish live URL

**Your game will be live at:** https://clockwork-words-v2.pages.dev

The deployment happens within 1-2 minutes of pushing. You'll get a notification when it's done!

---

📖 **What's in v2.0?**
- Smooth spiral reveal animation
- Enemy movement physics
- Visual feedback on typing
- Professional polish for students

Good luck! 🚀
