# Cloudflare Connect Tool

Automate the one-time setup of Cloudflare Pages + GitHub integration for any project.

## Why This Tool?

Cloudflare Pages has a fantastic **native GitHub integration** that handles deployments automatically, but the **one-time setup** (OAuth, dropdowns, 2FA, route configuration) is tedious to do manually every time you add a new game.

This tool uses **browser automation** to:
1.  Navigate to Cloudflare Dashboard.
2.  Log in (with cookie caching for future runs).
3.  Connect GitHub, set the root directory, and add custom routes.
4.  Report success/failure.

Once set up, **every push to GitHub auto-deploys** with zero maintenance.

## Installation

The tool is self-contained in this repo. It uses a Python virtual environment to avoid conflicts:

```bash
# First run will auto-setup the environment
./tools/setup-cloudflare.sh --help
```

## Usage

### Basic Setup (One-Time)

```bash
cd ~/mistereh.ca
./tools/setup-cloudflare.sh --project mistereh-games-auto \
                            --repo IAmMisterEh/mistereh.ca \
                            --root steam-punk-games
```

### For a New Game

When you add a new game (e.g., `future-game/`):

```bash
./tools/setup-cloudflare.sh --project mistereh-games-auto \
                            --repo IAmMisterEh/mistereh.ca \
                            --root future-game
```

### Visible Browser Mode (Debug)

If you want to **watch** the automation (or handle 2FA/CAPTCHA manually):

```bash
./tools/setup-cloudflare.sh --project mistereh-games-auto \
                            --repo IAmMisterEh/mistereh.ca \
                            --root steam-punk-games \
                            --visible
```

## Configuration

### Arguments

| Argument | Required | Description |
| :--- | :--- | :--- |
| `--project` | ✅ | Cloudflare Pages project name (e.g., `mistereh-games-auto`) |
| `--repo` | ✅ | GitHub repository in `owner/repo` format (e.g., `IAmMisterEh/mistereh.ca`) |
| `--root` | ✅ | Root directory inside the repo (e.g., `steam-punk-games`) |
| `--visible` | ❌ | Show browser window (default: headless) |

### Environment Variables (Optional)

Create a `.env` file in the repo root (not tracked by Git):

```bash
# ~/.cloudflare-cookies.json is auto-generated on first run
# No other env vars needed!
```

## How It Works

1.  **Cookie Caching:** On first run, you log in manually. Cookies are saved to `~/.cloudflare-cookies.json`.
2.  **Headless Automation:** Subsequent runs use saved cookies to skip login.
3.  **Smart Retries:** The tool waits for UI elements with intelligent retries (handles slow loads).
4.  **Fallback Handling:** If something fails, it pauses and waits for you to fix it manually.

## Troubleshooting

### "Cookies expired"
- Run with `--visible` flag.
- Log in manually when prompted.
- Tool will re-save cookies.

### "Project not found"
- Create the project manually in Cloudflare Dashboard first.
- Then run the tool again.

### "GitHub authorization required"
- Click "Authorize" in the browser.
- If using `--visible`, just click the button.
- If headless, the tool waits for timeout and retries.

### "Element not found"
- Run with `--visible` to see what's happening.
- Cloudflare UI might have changed; update the selectors in `cloudflare-connect.py`.

## File Structure

```
mistereh.ca/
├── tools/
│   ├── cloudflare-connect.py   # Main automation script
│   ├── setup-cloudflare.sh     # Wrapper to activate venv
│   └── CLOUDFLARE-CONNECT-README.md
├── .venv/                       # Python virtual environment (gitignored)
└── .cloudflare-cookies.json     # Auto-generated (gitignored)
```

## Next Steps After Setup

Once the tool finishes successfully:
1.  Go to Cloudflare Dashboard → **Deployments** tab.
2.  Wait for the first deployment to show **Success**.
3.  Test the live URL: `https://mistereh.ca/steam-punk-games/`.
4.  **Done!** Future pushes auto-deploy.

## Future Use Cases

- **New Game:** Add `new-game/` folder → run tool with `--root new-game`.
- **New Project:** Create a new Cloudflare project → run tool with `--project new-project`.
- **Team Setup:** Give the `cookies.json` file to a teammate (or re-run on their machine).

## License

MIT License. Free to use, modify, and share.

---

*Created: 2026-10-13 | Part of the OpenClaw automation suite*
