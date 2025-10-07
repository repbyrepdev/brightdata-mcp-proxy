/**
 * BrightData MCP Proxy Service
 * Exposes BrightData MCP functionality via REST API for LangGraph Cloud
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MCP Client instance
let mcpClient = null;

/**
 * Initialize MCP connection to BrightData
 */
async function initializeMCP() {
  try {
    console.log('Initializing BrightData MCP connection...');

    // Create MCP client transport with command and args
    // Use npx.cmd on Windows, npx on Unix
    const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

    const transport = new StdioClientTransport({
      command: npxCommand,
      args: ['-y', '@brightdata/mcp'],
      env: {
        ...process.env,
        API_TOKEN: process.env.BRIGHTDATA_API_TOKEN
      }
    });

    // Initialize client
    mcpClient = new Client({
      name: 'brightdata-proxy',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await mcpClient.connect(transport);

    console.log('✓ BrightData MCP connected successfully');

    // List available tools
    const tools = await mcpClient.listTools();
    console.log('Available tools:', tools.tools.map(t => t.name));

  } catch (error) {
    console.error('Failed to initialize MCP:', error);
    throw error;
  }
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mcp_connected: mcpClient !== null,
    timestamp: new Date().toISOString()
  });
});

/**
 * Scrape a URL using BrightData MCP
 * POST /scrape
 * Body: { url: string, options?: object }
 */
app.post('/scrape', async (req, res) => {
  try {
    const { url, options = {} } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!mcpClient) {
      return res.status(503).json({ error: 'MCP client not initialized' });
    }

    console.log(`Scraping URL: ${url}`);

    // Call BrightData MCP tool
    const result = await mcpClient.callTool({
      name: 'scrape_as_markdown',
      arguments: {
        url,
        ...options
      }
    });

    res.json({
      success: true,
      url,
      data: result.content,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Scrape error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Batch scrape multiple URLs
 * POST /scrape/batch
 * Body: { urls: string[], options?: object }
 */
app.post('/scrape/batch', async (req, res) => {
  try {
    const { urls, options = {} } = req.body;

    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'urls array is required' });
    }

    if (!mcpClient) {
      return res.status(503).json({ error: 'MCP client not initialized' });
    }

    console.log(`Batch scraping ${urls.length} URLs`);

    // Scrape all URLs in parallel (consider rate limiting in production)
    const results = await Promise.allSettled(
      urls.map(url =>
        mcpClient.callTool({
          name: 'scrape_as_markdown',
          arguments: { url, ...options }
        })
      )
    );

    const response = results.map((result, index) => ({
      url: urls[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value.content : null,
      error: result.status === 'rejected' ? result.reason.message : null
    }));

    res.json({
      success: true,
      total: urls.length,
      successful: response.filter(r => r.success).length,
      failed: response.filter(r => !r.success).length,
      results: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch scrape error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get available MCP tools
 */
app.get('/tools', async (req, res) => {
  try {
    if (!mcpClient) {
      return res.status(503).json({ error: 'MCP client not initialized' });
    }

    const tools = await mcpClient.listTools();
    res.json({
      success: true,
      tools: tools.tools,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Tools list error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Start server
 */
async function startServer() {
  try {
    // Initialize MCP first
    await initializeMCP();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 BrightData MCP Proxy running on port ${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
      console.log(`   Scrape endpoint: POST http://localhost:${PORT}/scrape`);
      console.log(`   Batch endpoint: POST http://localhost:${PORT}/scrape/batch\n`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  if (mcpClient) {
    await mcpClient.close();
  }
  process.exit(0);
});

// Start the server
startServer();
