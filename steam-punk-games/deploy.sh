#!/bin/bash
# Clockwork Words v3.0 - Deployment Script for Cloudflare Pages
# Steampunk Typing Game Deployment

set -e

PROJECT_DIR="$(dirname "$(readlink -f "$0")")"
DEPLOY_TARGET="steam-punk-games"

echo "🔧 Deploying Clockwork Words v3.0 to Cloudflare Pages..."

# Validate files exist
for file in index.html game.css game.js; do
    if [ ! -f "${PROJECT_DIR}/${file}" ]; then
        echo "❌ Error: ${file} not found!"
        exit 1
    fi
done

echo "✅ All game files present"

# Build step (no build needed for static site)
echo "📦 Game is ready to deploy"

# Check if Cloudflare CLI is installed
if ! command -v cf &> /dev/null; then
    echo "⚠️  Cloudflare CLI not found. Manual deployment required."
    echo ""
    echo "To deploy manually:"
    echo "1. Install wrangler: npm install -g wrangler"
    echo "2. Login: npx wrangler login"
    echo "3. Create project in Cloudflare Dashboard"
    echo "4. Deploy with: cf pages project ${DEPLOY_TARGET} deploy ${PROJECT_DIR} --dir=${PROJECT_DIR}"
    exit 0
fi

# Check for wrangler
if ! command -v wrangler &> /dev/null; then
    echo "⚠️  Wrangler CLI not found. Manual deployment required."
    echo ""
    echo "To deploy with wrangler:"
    echo "1. Install: npm install -g wrangler"
    echo "2. Create wrangler.toml in project root"
    echo "3. Run: npx wrangler pages deploy ${PROJECT_DIR} --project-name=steam-punk-games"
    exit 0
fi

# Deploy with wrangler
echo "🚀 Deploying..."
cd "${PROJECT_DIR}"

if [ -f "wrangler.toml" ]; then
    echo "✅ Using existing wrangler.toml configuration"
    npx wrangler pages deploy . --project-name=steam-punk-games
else
    echo "⚠️  No wrangler.toml found. Creating minimal config..."
    
    cat > wrangler.toml << 'EOF'
name = "steam-punk-games"
compatibility_date = "2024-01-01"

[placement]
mode = "smart"
EOF

    echo "✅ Created wrangler.toml"
    
    # Login if not already logged in
    echo "🔐 Authenticating with Cloudflare..."
    npx wrangler login --ip-header=x-forwarded-for
    
    echo "🚀 Deploying to ${DEPLOY_TARGET}..."
    npx wrangler pages deploy . --project-name=steam-punk-games
fi

echo ""
echo "✅ Deployment complete!"
echo "   Check your Cloudflare Pages dashboard at:"
echo "   https://dash.cloudflare.com/pages"
