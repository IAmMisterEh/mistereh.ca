# Cloudflare Native Git Integration Setup Guide

**Objective:** Connect your GitHub repo to Cloudflare Pages for automatic, zero-maintenance deployments.

## One-Time Setup (5 minutes)

### Step 1: Navigate to Your Project
1. Go to: **https://dash.cloudflare.com/**
2. Log in (if needed)
3. Click **Workers & Pages** on the left sidebar
4. Find and click on the project: **`mistereh-games-auto`**
   - *If you don't see it:* Check the account dropdown (top-right) to ensure you're in the correct account.

### Step 2: Connect to GitHub
1. Click **Settings** (left sidebar)
2. Click **Git Connections** (or "Connect to Git")
3. Click **Connect to Git** → Select **GitHub**
4. Authorize Cloudflare to access your GitHub account (if prompted)
5. Select your repository: **`IAmMisterEh/mistereh.ca`**

### Step 3: Configure the Project (CRITICAL)
Configure these settings **exactly** as shown:

| Setting | Value |
| :--- | :--- |
| **Production Branch** | `main` |
| **Root Directory** | `steam-punk-games` |
| **Build Command** | *(Leave **empty**)* |
| **Build Output Directory** | `.` (or leave default) |

> **Why Root Directory = `steam-punk-games`?**  
> This tells Cloudflare: "Treat the `steam-punk-games` folder as the website root."  
> Without this, Cloudflare would try to serve the entire repo root (which includes `index.html` "Coming soon" page).

### Step 4: Save & Deploy
1. Click **Save Settings** (or "Deploy")
2. Cloudflare will immediately:
   - Pull the latest code from `main` branch
   - Deploy the `steam-punk-games` folder
   - Show a "Deployment in progress" message

### Step 5: Add Custom Domain Route
Once the project is connected:
1. Go to **Settings** → **Domains & Routes**
2. Click **Add Route**
3. Configure:
   - **Zone:** `mistereh.ca`
   - **Pattern:** `steam-punk-games/*`
4. Click **Add Route** (or **Save**)

### Step 6: Verify
- Go to the **Deployments** tab
- Wait for the first deployment to show **Success** (usually 30-60 seconds)
- Test: **https://mistereh.ca/steam-punk-games/**

## What Happens Next? (The "Forever" Part)

From this point forward:
1. You edit files in `steam-punk-games/` locally.
2. You run: `git add . && git commit -m "message" && git push`
3. Cloudflare **automatically**:
   - Detects the push
   - Pulls the new code
   - Deploys it
   - Clears the edge cache
4. Your game is live in ~30 seconds.

**No API tokens. No GitHub Actions. No manual cache purges.**

## Troubleshooting

| Issue | Solution |
| :--- | :--- |
| "Project not found" in dashboard | Check the account dropdown (top-right) for the correct Cloudflare account |
| "Root Directory" shows `null` | Edit project settings and set it to `steam-punk-games` |
| Deployment stuck on "Building" | Wait 2-3 minutes; if stuck, check the deployment logs in the dashboard |
| Old version still showing | Force a hard refresh in browser (`Ctrl+Shift+R`) or wait 5 minutes for cache to expire |
| 404 on `mistereh.ca/steam-punk-games/` | Verify the custom domain route was added correctly in **Domains & Routes** |

## Current Status (as of setup)
- **Repo:** `IAmMisterEh/mistereh.ca`
- **Project:** `mistereh-games-auto`
- **Root Directory:** `steam-punk-games`
- **Live Game:** Clockwork Words v3.0 (Spiral Escape)
- **Custom Domain Route:** `mistereh.ca/steam-punk-games/*`

---

*Created: 2026-10-13 | Ready for one-click setup*
