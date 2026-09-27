📋 CLOUDFLARE PAGES DEPLOYMENT SETUP

Step 1: Get Cloudflare API Token
   1. Go to: https://dash.cloudflare.com/profile/api-tokens
   2. Click "Create Token" → "Custom Token"
   3. Permissions: Account:Cloudflare Pages:Edit + Account:Account Settings:Read
   4. Name it: "Cloudflare Pages Deploy"
   5. Save the token value

Step 2: Get Your Cloudflare Account ID
   1. Go to: https://dash.cloudflare.com/
   2. Account ID is in top right (32-char hex string)

Step 3: Add Secrets to GitHub Repository
   1. Go to: https://github.com/IAmMisterEh/mistereh.ca/settings/secrets/actions
   2. Click "New repository secret"
   3. Add these two secrets:
      - CLOUDFLARE_API_TOKEN: [your token from Step 1]
      - CLOUDFLARE_ACCOUNT_ID: [your account ID from Step 2]

✅ After setup, every git push to main will automatically deploy!

🌐 Your game will be live at: https://clockwork-words-v2.pages.dev

Ready files have been created in ~/steampunk-clock-games/
