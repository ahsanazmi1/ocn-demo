# Real Agent Integration

The Agent Interaction Demo now supports both **Mock** and **Real** agent modes. When using real agents, the demo makes actual API calls to the OCN agent services.

## Quick Start

1. **Start the agent services:**
   ```bash
   make up
   ```

2. **Verify agents are running:**
   ```bash
   curl http://localhost:8090/status
   ```
   Should return: `{"orca": true, "okra": true, "opal": true, "onyx": true, "olive": true, "weave": true}`

3. **Open the demo:**
   - Visit: http://localhost:3001/demos/agent-interaction
   - Select "🚀 Real" mode in the Agent Mode toggle
   - Click "Start Demo"

## How It Works

### Real Agent Flow

When "🚀 Real" mode is selected, the demo:

1. **Onyx (Trust)** - Calls `onyx/mcp/invoke` with `getTrustSignal` verb
2. **Okra (Credit)** - Calls `okra/mcp/invoke` with `getCreditQuote` verb  
3. **Okra (BNPL)** - Calls `okra/bnpl/quote` endpoint
4. **Opal (Wallet)** - Calls `opal/wallet/methods` and `opal/wallet/select`
5. **Olive (Loyalty)** - Calls `olive/mcp/invoke` with `listIncentives` verb
6. **Weave (Auction)** - Calls `weave/auction/run` endpoint
7. **Orca (Finalize)** - Calls `orca/decision` endpoint
8. **Weave (Post-Auth)** - Calls `weave/receipts/trace/{trace_id}`

### API Proxy

The frontend uses Next.js API routes to proxy requests to the agent services:

- `/api/gateway/proxy/{agent}/{endpoint}` - Proxies to `http://localhost:8{port}/{endpoint}`
- `/api/gateway/status` - Returns agent health status

### Error Handling

- If real agents fail, the demo falls back to mock data
- Network errors are displayed as system explanations
- Each agent call has a 30-second timeout

## Agent Endpoints

### Onyx (Trust Registry)
- **Port:** 8086
- **MCP:** `/mcp/invoke` with `getTrustSignal` verb
- **Purpose:** Device reputation, velocity, risk scoring

### Okra (Credit & BNPL)
- **Port:** 8083  
- **MCP:** `/mcp/invoke` with `getCreditQuote` verb
- **API:** `/bnpl/quote` for BNPL quotes
- **Purpose:** Credit approval, BNPL underwriting

### Opal (Wallet)
- **Port:** 8084
- **API:** `/wallet/methods`, `/wallet/select`
- **Purpose:** Payment method selection, rewards optimization

### Olive (Loyalty)
- **Port:** 8087
- **MCP:** `/mcp/invoke` with `listIncentives` verb
- **Purpose:** Loyalty rewards, policy evaluation

### Weave (Auction & Receipts)
- **Port:** 8082
- **API:** `/auction/run`, `/receipts/trace/{trace_id}`
- **Purpose:** Processor auction, receipt storage

### Orca (Decision Engine)
- **Port:** 8080
- **API:** `/decision`
- **Purpose:** Final approval, fraud detection

## Testing

### Test Page
Visit http://localhost:3001/test-real-agents to:
- Check agent status
- Test individual agent calls
- Debug connectivity issues

### Console Logs
Real agent calls are logged to the browser console:
```
🚀 Using REAL agents via API calls...
🖤 Calling Onyx trust evaluation...
🦏 Calling Okra credit evaluation...
💎 Calling Opal wallet methods...
```

## Troubleshooting

### Agents Not Responding
```bash
# Check if services are running
docker ps | grep -E "(orca|okra|opal|onyx|olive|weave)"

# Check agent health
curl http://localhost:8090/status

# View logs
make logs
```

### CORS Issues
The API proxy handles CORS automatically. If you see CORS errors:
1. Ensure you're using the proxy endpoints (`/api/gateway/proxy/...`)
2. Check that the agent services are running on the correct ports

### Network Timeouts
- Agent calls have a 30-second timeout
- If agents are slow to respond, the demo will show error messages
- Switch to "🎭 Mock" mode for reliable demo functionality

## Development

### Adding New Agent Calls
1. Add the endpoint to `realOrchestrator.ts`
2. Use the proxy pattern: `${PROXY_BASE}/{agent}/{endpoint}`
3. Handle errors gracefully with fallback data

### MCP Integration
MCP calls use the `makeMCPRequest` helper:
```typescript
const response = await this.makeMCPRequest('onyx', 'getTrustSignal', {
  trace_id: this.traceId,
  context: { /* ... */ }
});
```

This automatically calls `/api/gateway/proxy/onyx/mcp/invoke` with the proper MCP request format.








