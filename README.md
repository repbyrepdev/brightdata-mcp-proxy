# BrightData MCP Proxy

REST API proxy for BrightData MCP (Model Context Protocol) server. Enables cloud services (like Google Cloud Run) to use BrightData's web scraping capabilities via simple HTTP endpoints.

**IMPORTANT:** This service returns **MARKDOWN** content, not HTML. Callers must use markdown parsing/regex, not HTML parsers like BeautifulSoup.

---

## 🌳 Branch Workflow (Development vs Production)

### Branches:
- **`master`** = Production (stable, tested code)
  - Auto-deploys to Render when pushed
  - Tagged with stable versions (v1.0, v1.1, v1.2)
  - Only merge here when fully tested and ready for production

- **`development`** = Testing (work-in-progress code)
  - Does NOT auto-deploy (safe to push without affecting production)
  - Use for testing new scraping features, experimental changes
  - Manually deploy via Render dashboard if needed for testing

### How to Interact with Claude Code:

**Working on New Features:**
```
"Switch to development branch and update scraping logic"
```
Claude will: `git checkout development`, make changes, commit, push to development (no auto-deploy)

**Testing Development Branch Live:**
```
"Check Render dashboard to manually deploy development branch"
```
Manual steps: Visit https://dashboard.render.com, select brightdata-mcp-proxy, click "Manual Deploy"

**Merging to Production:**
```
"The development branch works great - merge to master and tag as v1.1"
```
Claude will: `git checkout master`, `git merge development`, `git tag -a v1.1 -m "message"`, `git push` (auto-deploys!)

**Switching Back to Production:**
```
"Switch back to master branch"
```
Claude will: `git checkout master` (instantly back to production code)

### Version Tagging Convention:
- `v1.0` = Stable production
- `v1.1-dev` = Development/testing tag (not a release)
- `v1.1` = Stable production (tested and ready)

---

## 🚀 QUICK START FOR CLAUDE CODE

### Commands to Ingest Before Working on This Project

**Copy-paste this into Claude Code when debugging, testing, or adding features:**

```
I need your help with the brightdata-mcp-proxy project. Before we start:

1. Read the comprehensive documentation:
   - Main README: C:\Langchain\brightdata-mcp-proxy\README.md

2. Key facts to remember:
   - Local repo: C:\Langchain\brightdata-mcp-proxy
   - Hosted on: Render.com (free tier)
   - Auto-deploy: Push to 'master' branch
   - GitHub repo: repbyrepdev/brightdata-mcp-proxy (PUBLIC)
   - Production URL: https://brightdata-mcp-proxy.onrender.com
   - Returns: MARKDOWN content (not HTML)
   - Package: @brightdata/mcp (NOT @brightdatapublic/mcp-server-brightdata)

3. Follow the testing workflow:
   - ALWAYS test locally first with mock inputs
   - Iterate until outputs make sense (not just status codes)
   - Ask for my approval before pushing to GitHub
   - Track deployment status using Render dashboard
   - Provide copy-paste test commands for production

Now, here's what I need help with: [describe your task]
```

---

## 🚨 CRITICAL RULES FOR CLAUDE CODE - READ FIRST!

### ⛔ NEVER PUSH TO GITHUB WITHOUT EXPLICIT USER APPROVAL

**ABSOLUTE RULE**: You must **NEVER, EVER** push code to GitHub unless the user has explicitly approved it.

**What "explicit approval" means**:
- Show detailed test results from local testing
- Wait for user to type "yes", "approved", "push it", etc.
- Each push requires NEW approval
- If unsure, **ASK AGAIN**

### 🔬 DEEP TESTING IS REQUIRED

**Testing Checklist**:
- [ ] Server starts without errors?
- [ ] MCP client initializes successfully?
- [ ] `/health` returns `{"status":"ok"}`?
- [ ] `/scrape` returns markdown content in `data[0].text`?
- [ ] Markdown content looks correct (has brand, price, part numbers)?
- [ ] `/scrape/batch` returns array of results with markdown?
- [ ] No connection errors to BrightData?
- [ ] Test with multiple URLs?

### 📁 Creating New Repositories

**Location**: ALWAYS create in `C:\Langchain\<new-repo-name>`
**Privacy**: ALWAYS create as **PRIVATE** repository

```bash
# Correct
cd C:\Langchain
mkdir new-project
cd new-project
git init
gh repo create repbyrepdev/new-project --private --source=. --remote=origin
```

---

## 🏗️ Architecture Overview

```
Competitor Verifier API (Cloud Run)
    ↓ HTTP POST /scrape/batch
BrightData MCP Proxy (THIS SERVICE - Render)
    ↓ MCP protocol calls
BrightData MCP Server (@brightdata/mcp)
    ↓ Scrapes web pages
Competitor Websites
    ↓ Returns markdown content
BrightData MCP Proxy
    ↓ JSON response
Competitor Verifier API
```

### System Flow

1. **Receive scrape request** via REST API (`/scrape` or `/scrape/batch`)
2. **Connect to BrightData MCP server** using stdio transport (`@brightdata/mcp` package)
3. **Call `scrape_as_markdown` tool** with target URL(s)
4. **Return markdown content** as JSON response
5. **Caller extracts data** from markdown using regex patterns

**Key Point**: This service always returns **markdown**, not HTML. Callers must use markdown parsing, not HTML parsers like BeautifulSoup.

---

## 📍 Repository & Hosting Information

### Local Development
- **Local Path**: `C:\Langchain\brightdata-mcp-proxy`
- **GitHub Repo**: `repbyrepdev/brightdata-mcp-proxy` (PUBLIC)
- **Branch**: `master`

### Hosting
- **Platform**: Render.com (Web Service, free tier)
- **Service Name**: `brightdata-mcp-proxy`
- **URL**: `https://brightdata-mcp-proxy.onrender.com`
- **Auto-Deploy**: ✅ Render auto-deploys on push to **master** branch
- **Deploy Time**: ~2-3 minutes after GitHub push
- **Free Tier**: ✅ Yes (service sleeps after 15 min inactivity, 750 hrs/month free)

**Important**: Free tier services sleep after inactivity. First request after sleep takes 30-60 seconds to wake up.

---

## 🔑 Environment Variables

Set in Render dashboard:

| Variable Name | Description | Value |
|---------------|-------------|-------|
| `BRIGHTDATA_API_TOKEN` | BrightData API token for MCP authentication | Get from https://brightdata.com |

**Free tier**: 5,000 scrapes/month

---

## 📡 API Endpoints

### Health Check
```bash
GET /health

Response:
{
  "status": "ok",
  "mcp_connected": true,
  "api_token_configured": true,
  "timestamp": "2025-10-09T12:34:56.789Z"
}
```

### Scrape Single URL
```bash
POST /scrape
Content-Type: application/json

{
  "url": "https://www.ecstuning.com/b-bosch-parts/test/",
  "options": {}
}

Response:
{
  "success": true,
  "url": "https://www.ecstuning.com/b-bosch-parts/test/",
  "data": [
    {
      "type": "text",
      "text": "# Product Page\n\nBosch - 12345 - Test Product\n\n..."
    }
  ],
  "timestamp": "2025-10-09T12:34:56.789Z"
}
```

### Batch Scrape (Multiple URLs)
```bash
POST /scrape/batch
Content-Type: application/json

{
  "urls": [
    "https://www.ecstuning.com/product1",
    "https://www.eeuroparts.com/product2"
  ],
  "options": {}
}

Response:
{
  "success": true,
  "total": 2,
  "successful": 2,
  "failed": 0,
  "results": [
    {
      "url": "https://www.ecstuning.com/product1",
      "success": true,
      "data": [{"type": "text", "text": "...markdown..."}],
      "error": null
    },
    {
      "url": "https://www.eeuroparts.com/product2",
      "success": true,
      "data": [{"type": "text", "text": "...markdown..."}],
      "error": null
    }
  ],
  "timestamp": "2025-10-09T12:34:56.789Z"
}
```

### List Available MCP Tools
```bash
GET /tools

Response:
{
  "success": true,
  "tools": [
    {
      "name": "scrape_as_markdown",
      "description": "Scrape a URL and return content as markdown",
      "inputSchema": {
        "type": "object",
        "properties": {
          "url": {"type": "string"},
          "options": {"type": "object"}
        }
      }
    }
  ],
  "timestamp": "2025-10-09T12:34:56.789Z"
}
```

---

## 🔧 Development Workflow (For Claude Code)

### **CRITICAL RULES**
1. ✅ **ALWAYS test locally FIRST**
2. ✅ **NEVER push to GitHub without user approval**
3. ✅ **Push to 'master' branch**
4. ✅ **Changes deploy automatically** when pushed to master
5. ✅ **Track deployment** using Render dashboard
6. ✅ **New repos ALWAYS in** `C:\Langchain\`

### Step-by-Step Workflow

#### 1️⃣ Make Changes Locally
```bash
cd C:\Langchain\brightdata-mcp-proxy
# Edit server.js, package.json, etc.
```

#### 2️⃣ Test Locally

**Set up local environment** (PowerShell):
```powershell
# Create .env file
echo "BRIGHTDATA_API_TOKEN=your-token-here" > .env

# Install dependencies
npm install

# Run locally
npm run dev
```

**Expected output**:
```
🚀 BrightData MCP Proxy running on port 3000
   Health check: http://localhost:3000/health
```

**Send test requests**:
```powershell
# Test health endpoint
curl http://localhost:3000/health

# Test single URL scrape
curl -X POST http://localhost:3000/scrape `
  -H "Content-Type: application/json" `
  -d '{"url": "https://www.ecstuning.com/b-bosch-parts/ignition-coil/12138616153/"}'

# Test batch scrape
curl -X POST http://localhost:3000/scrape/batch `
  -H "Content-Type: application/json" `
  -d '{
    "urls": [
      "https://www.ecstuning.com/b-bosch-parts/ignition-coil/12138616153/",
      "https://www.eeuroparts.com/Parts/123456/"
    ]
  }'
```

**What to check in test output**:
- ✅ Server starts without errors
- ✅ MCP client initializes: `✓ BrightData MCP connected successfully`
- ✅ `/health` returns `{"status":"ok"}`
- ✅ `/scrape` returns markdown content
- ✅ Markdown contains brand, price, part numbers
- ✅ `/scrape/batch` returns array with all results
- ✅ No timeout or connection errors

#### 3️⃣ Present to User

Show the user your test results and **wait for approval** before proceeding.

#### 4️⃣ Push to GitHub (After Approval)
```bash
cd C:\Langchain\brightdata-mcp-proxy
git add .
git commit -m "Descriptive commit message

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# IMPORTANT: Push to 'master' branch
git push origin master
```

#### 5️⃣ Track Deployment on Render

**Option 1: Render Dashboard** (recommended for visual monitoring):
1. Go to https://dashboard.render.com
2. Click on `brightdata-mcp-proxy` service
3. Go to "Events" tab to see deployment progress
4. Wait for "Deploy succeeded" message (green check mark)

**Expected timeline**:
- 0-1 min: Build starts
- 1-2 min: Build completes, deploy starts
- 2-3 min: Service is live

#### 6️⃣ Test Production
```bash
# Test health endpoint
curl https://brightdata-mcp-proxy.onrender.com/health

# Test scraping (use real competitor URL)
curl -X POST https://brightdata-mcp-proxy.onrender.com/scrape `
  -H "Content-Type: application/json" `
  -d '{"url": "https://www.ecstuning.com/b-bosch-parts/ignition-coil/12138616153/"}'
```

**Expected response**: Should return markdown content within 5-30 seconds (first request may be slower if service was sleeping).

#### 7️⃣ Provide User Test Commands

Give the user clear, copy-paste commands to test:
```
✅ Deployment complete! Here are commands to test the live service:

# Test health:
curl https://brightdata-mcp-proxy.onrender.com/health

# Test scraping:
curl -X POST https://brightdata-mcp-proxy.onrender.com/scrape -H "Content-Type: application/json" -d '{"url":"https://www.ecstuning.com/b-bosch-parts/test/"}'

Expected: JSON with markdown content in "data[0].text"

Note: First request after inactivity may take 30-60 seconds (Render free tier wakes up).
```

---

## 🧪 Debugging Production Issues

### Common Issues & Solutions

**Issue**: Service returns 503 or takes 30-60 seconds to respond
- **Cause**: Free tier service was sleeping after 15 min inactivity
- **Debug**: Check Render dashboard for "Service is starting" message
- **Fix**: Wait for service to wake up, or upgrade to paid tier ($7/month = always on)

**Issue**: "MCP client initialization failed" error
- **Cause**: Missing or invalid `BRIGHTDATA_API_TOKEN`
- **Debug**: Check Render environment variables in dashboard
- **Fix**: Verify token is correct in Render dashboard → Environment

**Issue**: "Failed to scrape URL" errors
- **Cause**: BrightData rate limit exceeded (5,000/month free tier)
- **Debug**: Check BrightData dashboard for usage stats
- **Fix**: Wait until next month or upgrade BrightData plan

**Issue**: Markdown extraction returns empty/null values
- **Cause**: Website structure changed, or BrightData returned empty content
- **Debug**: Log raw markdown content to see actual format
- **Fix**: If markdown is empty, check BrightData status; if markdown has content but extraction fails, update regex patterns in `competitor-verifier/tools/competitor_scraper.py`

### View Live Logs on Render

**Method 1: Render Dashboard**
1. Go to https://dashboard.render.com
2. Click on `brightdata-mcp-proxy` service
3. Click "Logs" tab
4. Logs update in real-time

**Method 2: Download Logs**
- In Logs tab, click "Download Logs"
- Search locally using text editor

---

## 📂 Project Structure

```
C:\Langchain\brightdata-mcp-proxy/
├── server.js           # Express server + MCP client + API endpoints
├── package.json        # Node.js dependencies (@brightdata/mcp)
├── .env.example        # Example environment variables
├── .env                # Local env vars (NOT committed to git)
├── render.yaml         # Render deployment configuration
└── README.md           # This file
```

### Key Files

**server.js** - Main application:
- MCP Client initialization using `@brightdata/mcp` package
- Platform detection (Windows: npx.cmd vs Unix: npx)
- Express API endpoints: `/health`, `/scrape`, `/scrape/batch`, `/tools`

**package.json** - Dependencies:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "@modelcontextprotocol/sdk": "^0.5.0",
    "@brightdata/mcp": "latest"
  }
}
```

**IMPORTANT**: Uses `@brightdata/mcp`, NOT `@brightdatapublic/mcp-server-brightdata`

---

## 🔗 Related Services

| Service | Local Path | Hosting | Purpose |
|---------|------------|---------|---------|
| **competitor-verifier** | `C:\Langchain\competitor-verifier` | Google Cloud Run | Calls THIS service to scrape URLs |
| **competitor-chat-bot** | `C:\Langchain\competitor-chat-bot` | Google Cloud Run (Function) | Triggers verifier, which then calls THIS |

**Full Data Flow**:
```
User (Google Chat) → competitor-chat-bot → competitor-verifier → THIS (brightdata-mcp-proxy) → BrightData → Competitor Websites
```

---

## 🚨 Important Reminders for Claude

- **NEVER push to GitHub without user approval**
- **ALWAYS test locally first** with mock/real inputs
- **ALWAYS push to 'master' branch**
- **ALWAYS analyze response content** (not just status codes)
- **Returns MARKDOWN** not HTML (callers use regex, not BeautifulSoup)
- **New repos go in** `C:\Langchain\` and are **PRIVATE on GitHub**
- **Free tier sleeps** after 15 minutes (expect 30-60s first request delay)
- **Package name**: `@brightdata/mcp` (NOT `@brightdatapublic/mcp-server-brightdata`)
- **Windows support**: Code uses `npx.cmd` on Windows, `npx` on Unix (server.js:32)

---

## 🔄 Git Rollback & Redeployment

**NOTE:** Render *may* auto-deploy when you force push to master, but it's not guaranteed.

When rolling back with `git reset --hard <commit>` and `git push --force`:
- The code is reverted in GitHub ✅
- Render *might* auto-deploy ⚠️

**To be safe, check Render dashboard and manually trigger redeploy if needed:**
1. Go to https://dashboard.render.com
2. Select brightdata-mcp-proxy service
3. Click "Manual Deploy" → "Deploy latest commit" if not auto-triggered

---

Last Updated: 2025-10-09
Version: v1.0

<!-- Deployment trigger: 2025-10-09_20:30:00_UTC -->
