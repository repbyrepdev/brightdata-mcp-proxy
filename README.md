# BrightData MCP Proxy

REST API proxy for BrightData MCP server. Enables cloud services (like LangGraph Cloud) to use BrightData's free MCP credits for web scraping.

## Features

- 🌐 REST API wrapper for BrightData MCP
- 🆓 Uses BrightData's free 5,000 calls/month
- 🚀 Deployed on Render (free tier)
- 📦 Single and batch scraping endpoints

## API Endpoints

### Health Check
```bash
GET /health
```

### Scrape Single URL
```bash
POST /scrape
Content-Type: application/json

{
  "url": "https://example.com",
  "options": {
    // optional BrightData options
  }
}
```

### Batch Scrape
```bash
POST /scrape/batch
Content-Type: application/json

{
  "urls": [
    "https://example1.com",
    "https://example2.com"
  ],
  "options": {}
}
```

### List Available Tools
```bash
GET /tools
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
# Edit .env and add your BRIGHTDATA_API_TOKEN
```

3. Run server:
```bash
npm run dev
```

4. Test:
```bash
curl http://localhost:3000/health
```

## Deployment to Render

1. Push to GitHub:
```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/brightdata-mcp-proxy.git
git push -u origin main
```

2. Connect to Render:
   - Go to https://render.com
   - New -> Web Service
   - Connect your GitHub repo
   - Render will auto-detect `render.yaml`

3. Add environment variable:
   - In Render dashboard, add `BRIGHTDATA_API_TOKEN`

4. Deploy!

## Usage from LangGraph

```python
import requests

PROXY_URL = "https://your-render-app.onrender.com"

# Scrape a single URL
response = requests.post(
    f"{PROXY_URL}/scrape",
    json={"url": "https://competitor.com/product"}
)
data = response.json()
```
