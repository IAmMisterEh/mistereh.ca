#!/bin/bash
# Helper script to run cloudflare-connect with the correct environment
# Usage: ./tools/setup-cloudflare.sh --project mistereh-games-auto --repo IAmMisterEh/mistereh.ca --root steam-punk-games

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VENV_DIR="$PROJECT_ROOT/.venv"

# Activate virtual environment
if [ -d "$VENV_DIR" ]; then
    source "$VENV_DIR/bin/activate"
else
    echo "❌ Virtual environment not found. Running: python3 -m venv .venv && pip install playwright python-dotenv"
    cd "$PROJECT_ROOT"
    python3 -m venv .venv
    source .venv/bin/activate
    pip install playwright python-dotenv
    playwright install chromium
fi

# Run the tool
echo "🚀 Running Cloudflare Connect Tool..."
python3 "$SCRIPT_DIR/cloudflare-connect.py" "$@"
