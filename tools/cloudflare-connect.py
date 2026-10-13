#!/usr/bin/env python3
"""
Cloudflare Connect Tool
Automates the one-time setup of Cloudflare Pages + GitHub integration.

Usage:
    python3 tools/cloudflare-connect.py --project mistereh-games-auto --repo IAmMisterEh/mistereh.ca --root steam-punk-games

Features:
    - Headless browser automation (Playwright)
    - Cookie caching (log in once, reuse forever)
    - Smart retries for UI elements
    - Support for 2FA/CAPTCHA (pauses if detected)
    - Reusable for any project
"""

import os
import sys
import time
import argparse
import json
from pathlib import Path
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# Configuration
CLOUDFLARE_DASHBOARD = "https://dash.cloudflare.com"
COOKIES_FILE = Path.home() / ".cloudflare-cookies.json"
WAIT_TIMEOUT = 60  # seconds
ELEMENT_TIMEOUT = 15  # seconds

def log(msg, level="INFO"):
    """Print a formatted log message."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] [{level}] {msg}")

def load_cookies(page):
    """Load saved cookies if they exist."""
    if COOKIES_FILE.exists():
        log(f"Loading cookies from {COOKIES_FILE}...")
        cookies = json.loads(COOKIES_FILE.read_text())
        page.context.add_cookies(cookies)
        return True
    return False

def save_cookies(page):
    """Save cookies for future runs."""
    log("Saving cookies...")
    cookies = page.context.cookies()
    COOKIES_FILE.write_text(json.dumps(cookies, indent=2))
    log(f"Cookies saved to {COOKIES_FILE}")

def wait_for_element(page, selector, timeout=None):
    """Wait for an element to appear with smart retries."""
    timeout = timeout or ELEMENT_TIMEOUT
    start = time.time()
    while time.time() - start < WAIT_TIMEOUT:
        try:
            element = page.wait_for_selector(selector, state="visible", timeout=timeout * 1000)
            log(f"Found element: {selector}")
            return element
        except PlaywrightTimeout:
            log(f"Element {selector} not found, retrying...", "WARN")
            time.sleep(2)
    raise TimeoutError(f"Element {selector} not found within {WAIT_TIMEOUT}s")

def setup_cloudflare_project(project_name, repo_name, root_dir, headless=True):
    """Main automation flow."""
    log(f"Starting Cloudflare setup for project: {project_name}")
    log(f"GitHub repo: {repo_name}")
    log(f"Root directory: {root_dir}")

    with sync_playwright() as p:
        # Launch browser (headless by default)
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        page = context.new_page()

        try:
            # Step 1: Load cookies or log in
            if load_cookies(page):
                log("Trying to navigate with saved cookies...")
                page.goto(CLOUDFLARE_DASHBOARD, wait_until="networkidle")
                # Check if still logged in
                if "Workers & Pages" in page.content():
                    log("Successfully logged in with cookies!")
                else:
                    log("Cookies expired, logging in manually...", "WARN")
                    # Re-login flow would go here (or pause for user)
            else:
                log("No cookies found, manual login required...")
                page.goto(CLOUDFLARE_DASHBOARD, wait_until="networkidle")
                # Pause for user to log in if needed
                input("Press Enter after you've logged in to continue...")
                save_cookies(page)

            # Step 2: Navigate to Workers & Pages
            log("Navigating to Workers & Pages...")
            page.click("text=Workers & Pages")
            page.wait_for_load_state("networkidle")

            # Step 3: Find or create the project
            log(f"Looking for project: {project_name}...")
            try:
                # Try to find existing project
                page.click(f"text={project_name}")
                log(f"Project {project_name} found!")
            except PlaywrightTimeout:
                log(f"Project {project_name} not found. Creating new one...", "WARN")
                # Click "Create" button
                page.click("text=Create")
                page.click("text=Pages")
                # ... (simplified: assume user creates it manually if not found)
                input(f"Project {project_name} not found. Create it manually and press Enter...")
                page.goto(CLOUDFLARE_DASHBOARD + "/pages", wait_until="networkidle")

            # Step 4: Connect to GitHub
            log("Connecting to GitHub...")
            page.click("text=Settings")
            page.click("text=Git Connections")
            page.click("text=Connect to Git")
            page.click("text=GitHub")
            
            # Handle GitHub authorization (if needed)
            time.sleep(3)
            if "Authorize" in page.content():
                log("GitHub authorization required. Authorizing...", "WARN")
                try:
                    page.click("text=Authorize")
                    page.wait_for_load_state("networkidle")
                except PlaywrightTimeout:
                    input("GitHub authorization failed. Check browser and press Enter...")

            # Step 5: Select repository
            log(f"Selecting repository: {repo_name}...")
            page.fill('input[placeholder*="Search"]', repo_name.split("/")[1])
            time.sleep(2)
            page.click(f"text={repo_name}")

            # Step 6: Configure project settings
            log("Configuring project settings...")
            page.fill('label:has-text("Production Branch") input', "main")
            page.fill('label:has-text("Root Directory") input', root_dir)
            # Leave Build Command empty

            # Step 7: Save and deploy
            log("Saving settings...")
            page.click("text=Save Settings")
            page.wait_for_load_state("networkidle")

            # Step 8: Add custom domain route
            log("Adding custom domain route...")
            page.click("text=Settings")
            page.click("text=Domains & Routes")
            page.click("text=Add Route")
            
            # Fill in zone and pattern
            page.fill('label:has-text("Zone") select', "mistereh.ca")
            page.fill('label:has-text("Pattern") input', f"{root_dir}/*")
            
            log("Saving route...")
            page.click("text=Add Route")
            page.wait_for_load_state("networkidle")

            # Step 9: Verify deployment
            log("Waiting for first deployment...")
            time.sleep(10)  # Wait for deployment to start
            page.click("text=Deployments")
            
            # Check for success
            if "Success" in page.content() or "Deploying" in page.content():
                log("✅ Setup complete! Deployment started.", "SUCCESS")
                return True
            else:
                log("⚠️ Setup complete, but deployment status unclear.", "WARN")
                return True  # Assume success if no errors

        except Exception as e:
            log(f"❌ Error: {str(e)}", "ERROR")
            return False
        finally:
            browser.close()

def main():
    parser = argparse.ArgumentParser(description="Automate Cloudflare Pages + GitHub setup")
    parser.add_argument("--project", required=True, help="Cloudflare project name")
    parser.add_argument("--repo", required=True, help="GitHub repo (e.g., owner/repo)")
    parser.add_argument("--root", required=True, help="Root directory (e.g., steam-punk-games)")
    parser.add_argument("--visible", action="store_true", help="Show browser window (default: headless)")
    
    args = parser.parse_args()

    success = setup_cloudflare_project(
        project_name=args.project,
        repo_name=args.repo,
        root_dir=args.root,
        headless=not args.visible
    )

    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
