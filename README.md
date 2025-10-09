# BrightData MCP Proxy

REST API proxy for BrightData MCP (Model Context Protocol) server. Enables cloud services (like Google Cloud Run) to use BrightData's web scraping capabilities via simple HTTP endpoints.

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
   - Auto-deploy: Push to 'main' branch (NOT 'master')
   - GitHub repo: repbyrepdev/brightdata-mcp-proxy
   - Production URL: https://brightdata-mcp-proxy.onrender.com
   - Returns: MARKDOWN content (not HTML)

3. Follow the testing workflow:
   - ALWAYS test locally first with mock inputs
   - Iterate until outputs make sense (not just status codes)
   - Ask for my approval before pushing to GitHub
   - Track deployment status using Render CLI
   - Provide copy-paste test commands for production

Now, here's what I need help with: [describe your task]
```

---

## 🚨 CRITICAL RULES FOR CLAUDE CODE - READ FIRST!

### ⛔ NEVER PUSH TO GITHUB WITHOUT EXPLICIT USER APPROVAL

**ABSOLUTE RULE**: You must **NEVER, EVER** push code to GitHub unless the user has explicitly approved it in the chat conversation.

**What "explicit approval" means**:
- You must show the user detailed test results
- You must wait for the user to type "yes", "approved", "go ahead", "push it", or similar confirmation
- Each push requires NEW approval - previous approvals don't carry over
- If unsure whether you have approval, **ASK AGAIN**

**This applies to**:
- ✅ `git push origin main`
- ✅ `git push origin master`
- ✅ `git push --force`
- ✅ Any command that pushes code to remote repository

**❌ WRONG Approach**:
```
I got a 200 response, looks good! Pushing to GitHub now...
```

**✅ CORRECT Approach**:
```
I've tested the changes locally. Here are the DETAILED results:

Test 1: Health endpoint
- Response: {"status":"healthy","timestamp":"2025-10-08..."}
- ✅ Status code: 200
- ✅ Response format: Valid JSON
- ✅ Contains expected fields: status, timestamp

Test 2: Single scrape
- URL: https://www.ecstuning.com/b-bosch-parts/ignition-coil/12138616153/
- Response size: 3456 bytes
- ✅ Status code: 200
- ✅ data[0].type: "text"
- ✅ data[0].text contains: "Bosch - 12138616153 - Ignition Coil"
- ✅ Extracted brand: "Bosch" (verified in markdown)
- ✅ Extracted price: "$45.99" (verified in markdown)
- ✅ Markdown structure looks correct

Test 3: Batch scrape
- URLs tested: 2
- Both returned 200
- Both have valid markdown content
- Verified brands extracted correctly from both

All tests passed. Do you approve pushing this to GitHub?
```

### 🔬 DEEP TESTING IS REQUIRED

**Don't just check if you "got a response"** - validate EVERY aspect:

**❌ Superficial Testing**:
- "Got 200 status code" ✓
- "Response looks good" ✓
- Push to GitHub ✗

**✅ Deep Testing**:
- ✅ Status code is 200
- ✅ Response is valid JSON
- ✅ All expected fields are present
- ✅ Field VALUES are correct (not just present)
- ✅ Markdown content has brand name (extract and verify it)
- ✅ Markdown content has price (extract and verify format)
- ✅ Markdown content has part numbers (extract and verify)
- ✅ Test with multiple URLs to ensure consistency
- ✅ Test edge cases (empty responses, errors, timeouts)
- ✅ Verify extracted data makes sense in context

**Testing Checklist**:
- [ ] Does response have correct status code?
- [ ] Does response have correct structure?
- [ ] Does response have ALL expected fields?
- [ ] Are field VALUES correct and sensible?
- [ ] Does extracted data match what's expected?
- [ ] Did you test multiple scenarios?
- [ ] Did you test error cases?
- [ ] Would this work in production?

**Only after ALL of these are verified should you show results to user and ask for approval.**

### 📁 Creating New Repositories

When creating a new repository for this project:

**Location**: ALWAYS create in `C:\Langchain\<new-repo-name>`
```bash
# Correct
cd C:\Langchain
mkdir new-project-name
cd new-project-name
git init

# Wrong - don't create elsewhere
cd C:\Users\...
cd C:\Projects\...
cd C:\Claude Project Folder\...
```

**Privacy**: ALWAYS create as **PRIVATE** repository
```bash
# When creating GitHub repo, use --private flag
gh repo create repbyrepdev/new-project-name --private --source=. --remote=origin

# Or via GitHub website: ensure "Private" is selected
```

**Never create public repos for this project** - all code should be private.

---

## 🏗️ Architecture Overview

```
Competitor Verifier API (Cloud Run)
    ↓ HTTP POST /scrape/batch
BrightData MCP Proxy (THIS SERVICE - Render)
    ↓ MCP protocol calls
BrightData MCP Server (brightdata.com)
    ↓ Scrapes web pages
Competitor Websites
    ↓ Returns markdown content
BrightData MCP Proxy
    ↓ JSON response
Competitor Verifier API
```

### System Flow

1. **Receive scrape request** via REST API (`/scrape` or `/scrape/batch`)
2. **Connect to BrightData MCP server** using stdio transport
3. **Call `scrape_as_markdown` tool** with target URL(s)
4. **Return markdown content** as JSON response
5. **Caller extracts data** from markdown using regex patterns

**Key Point**: This service always returns **markdown**, not HTML. Callers must use markdown parsing, not HTML parsers like BeautifulSoup.

## 📍 Hosting & Deployment

- **Hosting**: Render.com (Web Service)
- **Service Name**: `brightdata-mcp-proxy`
- **GitHub Repo**: `repbyrepdev/brightdata-mcp-proxy`
- **Local Path**: `C:\Langchain\brightdata-mcp-proxy`
- **Auto-Deploy**: ✅ Render auto-deploys on push to **main** branch
- **Deploy Time**: ~2-3 minutes after GitHub push
- **Free Tier**: ✅ Yes (service sleeps after 15 min inactivity, 750 hrs/month free)

### Current Deployment URL
```
https://brightdata-mcp-proxy.onrender.com
```

**Important**: Free tier services sleep after inactivity. First request after sleep takes 30-60 seconds to wake up.

## 🔑 Environment Variables

Set in Render dashboard:

- `BRIGHTDATA_API_TOKEN` - BrightData API token for MCP authentication
  - Get from: https://brightdata.com (free tier: 5,000 scrapes/month)

## 📡 API Endpoints

### Health Check
```bash
GET /health

Response:
{
  "status": "healthy",
  "timestamp": "2025-10-08T12:34:56.789Z"
}
```

### Scrape Single URL
```bash
POST /scrape
Content-Type: application/json

{
  "url": "https://www.ecstuning.com/b-bosch-parts/test/",
  "options": {
    // optional BrightData options
  }
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
  ]
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
      "data": [{"type": "text", "text": "...markdown..."}]
    },
    {
      "url": "https://www.eeuroparts.com/product2",
      "success": true,
      "data": [{"type": "text", "text": "...markdown..."}]
    }
  ]
}
```

### List Available MCP Tools
```bash
GET /tools

Response:
{
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
  ]
}
```

## 🧪 CLAUDE CODE TESTING WORKFLOW

### ⚠️ CRITICAL: Iterative Testing Protocol

When adding features or debugging, follow this workflow:

1. **Make code changes** in local repo
2. **Test locally** with mock/real inputs
3. **Analyze outputs** - Check actual response content, not just status codes
4. **Iterate** - If output doesn't make sense, adjust code and re-test
5. **Repeat steps 2-4** until output is correct
6. **Ask user for approval** - Show them the test results
7. **Push to GitHub** (only after approval)
8. **Track deployment** - Monitor Render deployment status
9. **Test production** - Verify live endpoint works
10. **Provide test commands** - Give user copy-paste commands to verify

### Step 1: Local Testing Setup

```bash
# Navigate to local repo
cd C:\Langchain\brightdata-mcp-proxy

# Install dependencies (if not already installed)
npm install

# Create .env file with your BrightData token
echo BRIGHTDATA_API_TOKEN=your-token-here > .env

# Run locally
npm run dev
```

**Expected output**:
```
BrightData MCP Proxy Server listening on port 3000
MCP client initialized successfully
```

### Step 2: Send Test Requests & Analyze Outputs

**Test health endpoint**:
```bash
curl http://localhost:3000/health
```

**Test single URL scrape** (ask user for a test URL if needed):
```bash
curl -X POST http://localhost:3000/scrape `
  -H "Content-Type: application/json" `
  -d '{"url": "https://www.ecstuning.com/b-bosch-parts/ignition-coil/12138616153/"}'
```

**Test batch scrape**:
```bash
curl -X POST http://localhost:3000/scrape/batch `
  -H "Content-Type: application/json" `
  -d '{
    "urls": [
      "https://www.ecstuning.com/b-bosch-parts/ignition-coil/12138616153/",
      "https://www.eeuroparts.com/Parts/123456/"
    ]
  }'
```

### Step 3: What to Check in Test Outputs

**Don't just check status codes!** Analyze the actual response content:

- ✅ Server starts without errors
- ✅ MCP client initializes successfully
- ✅ `/health` returns `{"status":"healthy"}`
- ✅ `/scrape` returns markdown content in `data[0].text`
- ✅ Markdown content looks correct (has brand, price, part numbers)
- ✅ `/scrape/batch` returns array of results with markdown
- ✅ No connection errors to BrightData
- ✅ No timeouts or crashes

**Example of good output analysis**:
```json
{
  "success": true,
  "data": [{
    "type": "text",
    "text": "Bosch - 12138616153 - Ignition Coil\n\nPrice: $45.99\n\nBrand\n  Bosch"
  }]
}
```

✅ **Good**: Has brand name, part number, price - extraction will work

```json
{
  "success": true,
  "data": [{
    "type": "text",
    "text": ""
  }]
}
```

❌ **Bad**: Empty markdown - URL may be invalid or BrightData quota exceeded

### Step 4: Iterate Until Perfect

**If output doesn't look right**:
1. Check logs for errors
2. Verify BrightData token is valid
3. Test URL manually in browser
4. Adjust code if needed
5. Re-test locally
6. Repeat until output makes sense

**Do NOT proceed to deployment if**:
- Responses are empty
- Status codes are errors (4xx, 5xx)
- Markdown content is malformed
- Timeout errors occur

### Step 5: Get User Approval

Show the user your test results:

```
I've tested the changes locally. Here are the results:

✅ Health check: Returns {"status":"healthy"}
✅ Single scrape: Successfully scraped ECS URL, extracted brand "Bosch" and price "$45.99"
✅ Batch scrape: Processed 2 URLs, both returned markdown content

Sample output:
[paste actual JSON response here]

The outputs look correct. Ready to push to GitHub and deploy to Render?
```

**Wait for user confirmation before proceeding.**

### Step 6: Deploy to Production

Once user approves:

```bash
# Commit changes
cd C:\Langchain\brightdata-mcp-proxy
git add .
git commit -m "Your descriptive message

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to trigger auto-deploy (main branch, NOT master!)
git push origin main
```

### Step 7: Track Deployment on Render

#### Option 1: Render CLI (Recommended)

```bash
# Authenticate (first time only)
render login

# List recent deploys
render deploys list

# Create deploy and wait for completion
render deploys create --wait

# This will block for ~2-3 minutes until deploy completes
# Watch for "Deploy succeeded" message
```

#### Option 2: Render Dashboard (Visual)
1. Go to https://dashboard.render.com
2. Click on `brightdata-mcp-proxy` service
3. Go to "Events" tab to see deployment progress
4. Wait for "Deploy succeeded" message (green check mark)

#### Option 3: Poll Health Endpoint

```bash
# Keep checking until service responds (PowerShell)
while ($true) {
  $response = curl https://brightdata-mcp-proxy.onrender.com/health 2>&1
  Write-Host $response
  if ($response -match "healthy") {
    Write-Host "✅ Service is live!"
    break
  }
  Start-Sleep -Seconds 30
}
```

**Expected timeline**:
- 0-1 min: Build starts
- 1-2 min: Build completes, deploy starts
- 2-3 min: Service is live

### Step 8: Test Production

```bash
# Test health endpoint
curl https://brightdata-mcp-proxy.onrender.com/health

# Test scraping (use real competitor URL)
curl -X POST https://brightdata-mcp-proxy.onrender.com/scrape `
  -H "Content-Type: application/json" `
  -d '{"url": "https://www.ecstuning.com/b-bosch-parts/ignition-coil/12138616153/"}'
```

**Expected response**: Should return markdown content within 5-30 seconds (first request may be slower if service was sleeping).

### Step 9: Provide User Test Commands

Give the user clear, copy-paste commands to test:

```
✅ Deployment complete! Here are commands to test the live service:

# Test health:
curl https://brightdata-mcp-proxy.onrender.com/health

# Test scraping:
curl -X POST https://brightdata-mcp-proxy.onrender.com/scrape -H "Content-Type: application/json" -d '{"url":"https://www.ecstuning.com/b-bosch-parts/test/"}'

Expected: Should return JSON with markdown content in "data[0].text"

Note: First request after inactivity may take 30-60 seconds (Render free tier wakes up).
```

## 🐛 Debugging Production Issues

### View Live Logs on Render

#### Method 1: Render CLI
```bash
# View recent logs
render services

# Select the service, then view logs
# Logs will stream in real-time
```

#### Method 2: Render Dashboard
1. Go to https://dashboard.render.com
2. Click on `brightdata-mcp-proxy` service
3. Click "Logs" tab
4. Logs update in real-time

#### Method 3: Download Logs
- In Logs tab, click "Download Logs"
- Search locally using text editor

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

**Issue**: Timeout errors after 120 seconds
- **Cause**: Website is very slow or blocking scraper
- **Debug**: Test URL manually in browser
- **Fix**: Increase timeout in `server.js` or add retry logic

### Finding Last Working Version

If something breaks after a deploy:

```bash
# View recent commits
cd C:\Langchain\brightdata-mcp-proxy
git log --oneline -10

# View Render deploy history to find when it last worked
render deploys list

# Revert to previous commit
git revert <commit-hash>
# OR
git reset --hard <commit-hash>
git push origin main --force
```

## 📂 Project Structure

```
C:\Langchain\brightdata-mcp-proxy/
├── server.js           # Express server + MCP client + API endpoints
├── package.json        # Node.js dependencies
├── .env.example        # Example environment variables
├── .env                # Local env vars (NOT committed to git)
└── render.yaml         # Render deployment configuration
```

## 🔧 How It Works (Detailed)

### MCP Client Initialization

```javascript
// server.js excerpt
const client = new Client({
  name: "brightdata-proxy",
  version: "1.0.0"
}, {
  capabilities: {}
});

const transport = new StdioClientTransport({
  command: "npx",
  args: [
    "-y",
    "@brightdatapublic/mcp-server-brightdata",
    process.env.BRIGHTDATA_API_TOKEN
  ]
});

await client.connect(transport);
```

### Single URL Scraping

1. **Receive POST /scrape** with `{"url": "..."}`
2. **Call MCP tool**:
   ```javascript
   const result = await client.callTool({
     name: "scrape_as_markdown",
     arguments: { url, options }
   });
   ```
3. **Return response**:
   ```javascript
   res.json({
     success: true,
     url: url,
     data: result.content  // Array of {type: "text", text: "..."}
   });
   ```

### Batch URL Scraping

1. **Receive POST /scrape/batch** with `{"urls": [...]}`
2. **For each URL**, call MCP tool (sequentially to avoid rate limits)
3. **Collect results**:
   ```javascript
   results.push({
     url: url,
     success: true,
     data: result.content
   });
   ```
4. **Return aggregated response** with success/failure counts

### Why Markdown vs HTML?

BrightData's MCP `scrape_as_markdown` tool:
- Converts HTML to clean markdown text
- Removes ads, navigation, footers
- Focuses on main content
- Easier to parse with regex than HTML

**Consequence**: All callers must use **regex patterns on markdown**, not BeautifulSoup on HTML.

Example markdown output:
```
Bosch - 12138616153 - Ignition Coil

Price: $45.99

Brand
  Bosch

Mfg Part # 12138616153
OE # 06E905115E
```

## 🔗 Related Services

- **Competitor Verifier API**: `C:\Langchain\competitor-verifier` (calls this service to scrape URLs)
  - Hosted on: Google Cloud Run
  - URL: `https://competitor-verifier-lsh5k3lmoa-uc.a.run.app`

- **Competitor Chat Bot**: `C:\Langchain\competitor-chat-bot` (triggers verifier, which then calls this service)
  - Hosted on: Google Cloud Run
  - URL: `https://competitor-chat-bot-914431200358.us-central1.run.app`

See their respective READMEs for debugging those components.

---

## 🤖 NOTES FOR FUTURE CLAUDE CODE SESSIONS

### Where Things Are

| Item | Value |
|------|-------|
| **Local Repo** | `C:\Langchain\brightdata-mcp-proxy` |
| **GitHub Repo** | `repbyrepdev/brightdata-mcp-proxy` |
| **Deploy Branch** | `main` (NOT master!) |
| **Hosting** | Render.com (Web Service, free tier) |
| **Service Name** | `brightdata-mcp-proxy` |
| **Production URL** | `https://brightdata-mcp-proxy.onrender.com` |
| **Dashboard** | https://dashboard.render.com |
| **Auto-Deploy** | ✅ Enabled (push to main = auto-deploy) |

### Quick Reference Commands

```bash
# Navigate to repo
cd C:\Langchain\brightdata-mcp-proxy

# View recent changes
git log --oneline -10

# Pull latest
git pull origin main

# Install dependencies
npm install

# Test locally (set BRIGHTDATA_API_TOKEN in .env first)
npm run dev

# Test local health
curl http://localhost:3000/health

# Test local scraping
curl -X POST http://localhost:3000/scrape -H "Content-Type: application/json" -d '{"url":"https://www.ecstuning.com/b-bosch-parts/test/"}'

# Deploy to production (push to main branch)
git add .
git commit -m "Your message

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main

# Track deployment (Render CLI)
render login
render deploys list
render deploys create --wait

# Test production health
curl https://brightdata-mcp-proxy.onrender.com/health

# Test production scraping
curl -X POST https://brightdata-mcp-proxy.onrender.com/scrape -H "Content-Type: application/json" -d '{"url":"https://www.ecstuning.com/b-bosch-parts/test/"}'

# View logs (Render CLI)
render services
# Then select service to view logs
```

### Common Mistakes to Avoid

| ❌ DON'T | ✅ DO |
|----------|--------|
| Push to `master` branch | Push to `main` branch |
| Skip local testing | Always test locally first |
| Only check status codes | Analyze actual response content |
| Assume HTML responses | Remember: returns markdown |
| Deploy without user approval | Ask user to approve test results first |
| Forget Render sleeps on free tier | Expect 30-60s delay after inactivity |
| Use wrong local path | Use `C:\Langchain\brightdata-mcp-proxy` |
| Push untested code | Iterate locally until perfect |

### Deployment Checklist

- [ ] Changes made in correct local directory: `C:\Langchain\brightdata-mcp-proxy`
- [ ] Tested locally with `npm run dev`
- [ ] Sent test requests and analyzed responses
- [ ] Verified markdown content looks correct (not just status 200)
- [ ] Iterated until outputs make sense
- [ ] Showed user test results
- [ ] Got user approval
- [ ] Committed with descriptive message
- [ ] Pushed to `main` branch (not master)
- [ ] Tracked deployment with Render CLI or dashboard
- [ ] Tested production endpoint
- [ ] Provided user with copy-paste test commands

### Integration Notes

**How Competitor Verifier calls this service**:

```python
# competitor-verifier/tools/competitor_scraper.py
response = await self.client.post(
    f"{self.proxy_url}/scrape/batch",
    json={"urls": urls}
)
```

**Expected response format from this service**:
```json
{
  "success": true,
  "results": [
    {
      "url": "...",
      "success": true,
      "data": [{"type": "text", "text": "...markdown..."}]
    }
  ]
}
```

**How Verifier extracts data from markdown**:
```python
markdown_content = self._extract_text_from_mcp(result['data'])
brand = self._extract_brand_from_markdown(markdown_content)
price = self._extract_price_from_markdown(markdown_content)
```

If `verified_count` is 0 in verifier results, the problem is likely:
1. This service returned empty markdown (check BrightData quota)
2. Extraction regex patterns in verifier don't match markdown format

---

## 🎯 BrightData Free Tier Limits

- **Scrapes**: 5,000 requests per month
- **Rate**: No official limit, but avoid rapid-fire requests
- **Timeout**: 120 seconds per request
- **Usage Dashboard**: https://brightdata.com/dashboard

When limit exceeded, you'll get errors. Either wait until next month or upgrade plan.

---

## 📝 Recent Actions Log

Track recent changes, fixes, and feature additions with timestamps and working commit references.

### 2025-10-09 04:25 UTC - No Code Changes (Documentation Review)

**Most Recent Working Commit:** `6c8b6f4` (2025-10-09 00:15 UTC)
- Commit message: "Add comprehensive README with debugging workflow and Claude Code guidelines"

**Action Taken:**
- No code changes made to brightdata-mcp-proxy
- Service remains stable and operational
- **Related work in other services:**
  - competitor-verifier: Fixed UPC scientific notation bug (see competitor-verifier README)
  - competitor-chat-bot: Documentation updates only (see competitor-chat-bot README)

**Testing:** Not applicable (no code changes)

**Current Status:** Service is operational at https://brightdata-mcp-proxy.onrender.com

**Revert Command** (if needed for previous working code):
```bash
cd C:\Langchain\brightdata-mcp-proxy
git reset --hard 6c8b6f4
git push origin main --force
```

---

Last updated: 2025-10-09

<!-- Deployment trigger: 2025-10-09_15:13:19_UTC -->
