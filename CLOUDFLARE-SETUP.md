# Cloudflare Pages Setup - Quick Reference

## 🚀 Working Token
**Token Type:** User API Token (`cfut_`)  
**Token:** `cfut_***REDACTED***` (see `~/Desktop/agent-credentials.md` for full token)  
**GitHub Secret Name:** `CLOUDFLARE_API_TOKEN`  
**Account ID:** `a60a4cc516ca31e22aa31f41283edf06`  
**Project Name:** `mistereh-games-auto`

### ⚠️ Critical: Token Format
The token must be passed **explicitly** in the `Authorization` header:
```bash
curl -H "Authorization: Bearer ***" ...
```
Don't rely on `wrangler`'s environment variable handling (it has a bug).

## 📁 Repo Structure
```
mistereh.ca/
├── index.html                 # "Coming soon" page (root)
├── steam-punk-games/          # Game files
│   ├── index.html
│   ├── game.js
│   └── game.css
└── future-game/               # Future games (when added)
    ├── index.html
    └── ...
```

## 🌐 Live URLs
- **Main site:** `https://mistereh.ca/` → "Coming soon"
- **Game:** `https://mistereh.ca/steam-punk-games/` → Clockwork Words

## 🔄 Deployment Workflow
**File:** `.github/workflows/deploy-cloudflare.yml`  
**Trigger:** Push to `main` branch  
**Method:** Direct Cloudflare API upload (manifest + files via `curl`)  
**Deploy Time:** ~2-5 minutes

### Manual Deploy Command (if needed):
```bash
export CLOUDFLARE_API_TOKEN="***"
cd /home/vboxuser/mistereh.ca

# Create manifest and upload
# (See .github/workflows/deploy-cloudflare.yml for full script)
```

## 🧪 Testing
```bash
# Check main site
curl -I https://mistereh.ca/

# Check game
curl -I https://mistereh.ca/steam-punk-games/

# Check deployment status
curl -s "https://api.cloudflare.com/client/v4/accounts/a60a4cc516ca31e22aa31f41283edf06/pages/projects/mistereh-games-auto/deployments" \
  -H "Authorization: Bearer ***" | jq '.result | {id, status, url}'
```

## 🐛 Troubleshooting
- **"Invalid format"** → Use explicit `Authorization` header, not env var in `wrangler`
- **"Project not found"** → Project is `mistereh-games-auto`, not `mistereh-ca`
- **Deployment stuck** → Check GitHub Actions run at: `https://github.com/IAmMisterEh/mistereh.ca/actions`

## 📝 Token Types (Never Mix These Up!)
| Format | Name | Use Case | Status |
|--------|------|----------|--------|
| `cfut_` | User API Token | Pages create/deploy, Workers | ✅ **Working** |
| `cfk_` | Global API Key | Old format, wrong for Pages | ❌ Wrong |
| `cfat_` | Scoped API Token | R2 only | ❌ Limited |

---
*Generated: 2026-10-12 18:50 UTC*
