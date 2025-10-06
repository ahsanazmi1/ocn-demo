# Agent Interaction Demo

## Purpose

The Agent Interaction Demo showcases LLM explanations rendered as a chat interface, demonstrating how different agents (Onyx, Okra, Opal, Olive, Weave, Orca) process a transaction and make decisions. The demo features a unique BNPL vs Credit choice flow where users can see how different payment methods affect rewards and agent reasoning.

## How to Run

### Route Path
- **URL**: `/demos/agent-interaction` or via the main demo interface at `/` → "Agent Interaction Demo" tab
- **Component**: `src/demos/agent/AgentInteractionDemo.tsx`
- **Page**: `app/demos/agent-interaction/page.tsx`

### Getting Started
1. Navigate to the demo URL
2. Click "Start Demo" to begin the agent flow
3. After Okra proposes alternatives, choose between "Use Revolving Credit" or "Use BNPL"
4. Watch as the downstream agents (Olive, Weave, Orca, Weave) adjust their reasoning based on your choice

## Mock Payloads

### Where to Edit
- **Main orchestrator**: `src/demos/agent/mockOrchestrator.ts`
- **Types**: `src/demos/agent/types.ts`
- **Constants**: `src/demos/agent/constants.ts`

### Key Configuration
```typescript
// Cart configuration
export const OXFORD_CART: Cart = {
  currency: "USD",
  items: [
    { sku: "OXFORDS-SLIM-M", name: "Slim-Fit Crew Oxfords (M)", qty: 2, price: 120.00 },
    { sku: "BLAZER-NAVY", name: "Navy Blazer", qty: 1, price: 140.00 },
  ],
  total: 380.00,
};

// Agent sequence
export const AGENT_SEQUENCE: Agent[] = ["onyx", "okra", "opal", "olive", "weave", "orca", "weave"];
```

## Verbosity Modes

### Brief
- Shows only summary and decision
- Minimal information for quick scanning
- No evidence sections

### Standard
- Includes uncertainty, policy/model versions
- Shows key signals when available
- Basic decision context

### Forensics
- Full evidence sections with collapsible details
- Complete key signals with weights
- AP2 reference audit trail
- Redacted fields indicators
- Masked JSON viewer with PII protection

## Evidence Viewer

### Key Signals
- **Format**: `path: value (weight: X)`
- **Purpose**: Show the most important factors in agent decision-making
- **Example**: `device.recognized: true (weight: 0.12)`

### AP2 References
- **Format**: Audit trail badges (e.g., `AP2-TRUST-001`)
- **Purpose**: Link to specific audit policies and procedures
- **Color**: Purple badges for easy identification

### Redacted Fields
- **Format**: Gray badges showing PII paths
- **Purpose**: Indicate which fields are masked for privacy
- **Example**: `payer.ip.address`, `payer.device.id`

### Masked JSON Viewer
- **Format**: Preformatted JSON with `***` for redacted values
- **Purpose**: Complete explanation data with privacy protection
- **Functionality**: Uses `maskJsonEnhanced()` utility for recursive masking

## Redaction Behavior

### Implementation
- **Utility**: `src/demos/agent/utils/maskJson.ts`
- **Function**: `maskJsonEnhanced(obj, redactionPaths)`
- **Behavior**: Deep-clones object and replaces values at specified paths with `***`

### Path Matching
- **Exact match**: `user.ssn_last4` → masks exactly that path
- **Partial match**: `user.ssn` → masks `user.ssn_last4`, `user.ssn_full`, etc.
- **Wildcard support**: `user.*` → masks all user properties

### Examples
```typescript
const explanation = {
  user: { ssn_last4: "1234", name: "John" },
  payment: { card_number: "1234-5678-9012-3456" }
};

const redactions = ["user.ssn_last4", "payment.card_number"];
const masked = maskJsonEnhanced(explanation, redactions);
// Result: { user: { ssn_last4: "***", name: "John" }, payment: { card_number: "***" } }
```

## BNPL vs Credit Flow

### Choice Impact
- **Credit Choice**: 5% cashback ($19.00), Olive shows rewards, Orca includes rewards in final mandate
- **BNPL Choice**: 0% rewards, Olive shows no cashback, Orca shows no rewards in mandate

### Agent Adjustments
1. **Okra**: Always proposes both options with `decision: "propose_alt"`
2. **Olive**: Adjusts summary and rewards based on choice
3. **Orca**: Updates final mandate to reflect chosen payment method
4. **Weave**: Post-auth remains the same regardless of choice

### Deterministic Values
- **Risk Scores**: Onyx (0.07), Okra (0.12), Orca (0.09)
- **Cost Scores**: Weave Auction (0.1655)
- **Processor Result**: Carat wins with 1.65% + $0.05

## Next Steps

### Real Orchestrator Integration
1. **Replace Mock**: Swap `mockOrchestrator.ts` with real API calls
2. **WebSocket Support**: Add real-time streaming for agent explanations
3. **Error Handling**: Implement fallback behaviors for agent failures
4. **Caching**: Add explanation caching for repeated requests

### Counterfactuals Bubble
- **Feature**: Show "What if?" scenarios for alternative choices
- **Implementation**: Add counterfactual explanation type
- **UI**: Toggle between actual and counterfactual explanations

### Scorecard Toggle
- **Feature**: Switch between chat view and scorecard metrics
- **Data**: Aggregate performance metrics across agents
- **Visualization**: Charts and graphs for decision quality

### Enhanced Features
- **Export**: PDF/JSON export of explanations
- **Search**: Filter explanations by agent, decision, or content
- **Bookmarks**: Save interesting explanation sequences
- **Sharing**: Share explanation URLs with colleagues

## Technical Architecture

### Components
- **CartPanel**: Left side cart display and checkout trigger
- **AgentChat**: Right side explanation chat with choice handling
- **ChatBubble**: Individual explanation rendering with evidence
- **VerbosityToggle**: Control explanation detail level

### Styling
- **CSS**: `src/demos/agent/ui/agent-demo.css`
- **Colors**: OCN color palette (purple, aqua, dark, medium, light)
- **Layout**: Responsive two-column design
- **Accessibility**: Focus states, reduced motion support

### Testing
- **Location**: `src/demos/agent/__tests__/mockOrchestrator.test.ts`
- **Coverage**: Deterministic values, choice flows, seeded data validation
- **Run**: `npm test` or `yarn test`

## API Integration

### Future Endpoints
```typescript
// Agent flow orchestration
POST /api/agent-flow/start
GET  /api/agent-flow/{traceId}/status
GET  /api/agent-flow/{traceId}/explanations

// Choice handling
POST /api/agent-flow/{traceId}/choice
{
  "choice": "credit" | "bnpl",
  "timestamp": "2024-07-20T10:00:00Z"
}

// Explanation streaming
GET /api/agent-flow/{traceId}/stream
// Server-sent events for real-time updates
```

### Error Handling
- **Agent Timeouts**: Graceful degradation with fallback explanations
- **Network Issues**: Retry logic with exponential backoff
- **Invalid Choices**: Validation and user feedback
- **Rate Limiting**: Queue management for high-volume usage

## Security Considerations

### PII Protection
- **Redaction**: Automatic masking of sensitive fields
- **Audit Trail**: Complete AP2 reference logging
- **Access Control**: Role-based explanation viewing
- **Data Retention**: Configurable explanation lifecycle

### Compliance
- **GDPR**: Right to explanation and data portability
- **PCI DSS**: Payment data handling requirements
- **SOX**: Audit trail and documentation standards
- **CCPA**: California privacy law compliance

This demo provides a comprehensive foundation for understanding agent decision-making processes while maintaining security and compliance standards.








