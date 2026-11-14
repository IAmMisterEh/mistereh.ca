# Cloudflare Pages Project Memory
*Context for the `mistereh-games-auto` project.*

## Account Tier: **FREE**
- **Plan:** Cloudflare Pages Free Tier
- **Build Limits:** 500 builds/month (sufficient for static games).
- **Custom Domains:** Unlimited, but **manual DNS verification** may be required for new routes.
- **Production vs. Preview:** 
  - Free accounts often default to "Preview" deployments on push.
  - **Production deployments** must be explicitly triggered or promoted.
  - Custom domains serve the **Production** deployment by default.

## Project Configuration
- **Project Name:** `mistereh-games-auto`
- **GitHub Repo:** `IAmMisterEh/mistereh.ca`
- **Production Branch:** `main`
- **Root Directory:** `steam-punk-games` (Critical: This tells Pages where the game files are).
- **Build Command:** (Empty - Static HTML/CSS/JS)
- **Build Output Directory:** `.` (Root of the source folder)

## Current Status (as of 2026-10-13)
- **Git Connection:** ✅ Connected to GitHub.
- **Root Directory:** ✅ Set to `steam-punk-games`.
- **Last Issue:** 404 on preview URL (stale deployment from before Root Directory was set).
- **Next Step:** Trigger a **Production deployment** to serve the v3.0 game.
- **Custom Domain:** `mistereh.ca` → Route `steam-punk-games/*` (Pending verification/activation).

## Troubleshooting Notes (Free Tier Specific)
1. **404 on `...pages.dev`:** Usually means the deployment is still "Preview" or the Root Directory was wrong. Check "Deployments" tab for "Success" status.
2. **Custom Domain not working:** Ensure the route `steam-punk-games/*` is added in **Settings → Domains & Routes**, and DNS is propagated (usually instant for Cloudflare-managed domains).
3. **Build Failures:** Free tier builds timeout after 10 minutes. Static sites (no build command) rarely hit this.
4. **Deployment Limits:** If builds hit the 500/month limit, consider using "Preview" URLs for testing and only trigger "Production" for final releases.

## Automation Tool
- **Tool:** `tools/cloudflare-connect.py` (uses Playwright + system Chromium).
- **Purpose:** Automate the one-time GitHub OAuth connection and Root Directory setup.
- **Status:** Ready, but requires the one-time manual OAuth handshake (already done).
- **Future Use:** For new games, run: `./tools/setup-cloudflare.sh --project mistereh-games-auto --repo IAmMisterEh/mistereh.ca --root <new-game-folder>`.

## Key URLs
- **Dashboard:** `https://dash.cloudflare.com/pages/mistereh-games-auto`
- **Custom Domain (Pending):** `https://mistereh.ca/steam-punk-games/`
- **Preview URL (Stale):** `https://2346b3f0.mistereh-games-auto.pages.dev` (Ignore, use Production URL).

---
*Updated: 2026-10-13 | Free Tier | Root Dir: steam-punk-games*
