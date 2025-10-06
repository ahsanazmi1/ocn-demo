# Agent Interaction Demo - Types & Constants

## Overview
This directory contains the TypeScript types and constants for the Agent Interaction Demo, providing a structured foundation for agent explanations and UI components.

## File Structure

### `types.ts`
Strict TypeScript types for agent explanations and demo components:

#### Core Types
- **`Agent`**: Union type for all supported agents (`"orca" | "opal" | "okra" | "onyx" | "olive" | "weave"`)
- **`Explanation`**: Main explanation payload structure with all required fields
- **`KeySignal`**: Individual signal with path, value, and optional weight
- **`Verbosity`**: UI verbosity levels (`"brief" | "standard" | "forensics"`)
- **`CreditOption`**: Credit processing options (`"bnpl" | "revolving"`)
- **`Cart`** & **`CartItem`**: Shopping cart structure

#### Extended Types
- **`ScoreType`**: Score categorization (`"risk" | "cost" | "suitability"`)
- **`Evidence`**: Detailed evidence structure for forensics mode
- **`ExplanationPayload`**: Legacy compatibility type

### `constants.ts`
Centralized constants and helper functions:

#### Color Palette
```typescript
COLORS = {
  purple: "#5063BF",
  aqua: "#8EDFEB", 
  dark: "#414B77",
  medium: "#6F6F77",
  light: "#FAFAFD",
  shadow8: "rgba(80,99,191,0.08)",
  shadow25: "rgba(80,99,191,0.25)"
}
```

#### Agent Configuration
- **`AGENT_LABEL`**: Human-readable agent names
- **`AGENT_EMOJI`**: Emoji representations for each agent
- **`AGENT_COLORS`**: CSS classes for agent styling
- **`AGENT_SEQUENCE`**: Processing order for agents

#### UI Constants
- **`VERBOSITY_LEVELS`**: Display names for verbosity modes
- **`CREDIT_OPTIONS`**: Display names for credit options
- **`DECISION_TYPES`**: Human-readable decision labels
- **`SCORE_TYPES`**: Score category labels

#### Demo Data
- **`OXFORD_CART`**: Predefined cart with Oxfords items
- **`TIMING_CONFIG`**: Agent processing delays
- **`SCORE_THRESHOLDS`**: Score interpretation thresholds
- **`UNCERTAINTY_LEVELS`**: Uncertainty classification levels

#### Helper Functions
- **`getScoreColor(score, scoreType)`**: Returns appropriate color for score display
- **`getUncertaintyColor(uncertainty)`**: Returns color based on uncertainty level
- **`formatTimestamp(timestamp)`**: Formats timestamps for display
- **`generateTraceId()`**: Creates unique trace identifiers
- **`getAgentDisplayName(agent)`**: Gets human-readable agent name
- **`getAgentEmoji(agent)`**: Gets agent emoji
- **`getAgentColor(agent)`**: Gets agent CSS classes

### `index.ts`
Barrel export file for easy imports:
```typescript
import { Agent, Explanation, COLORS, getScoreColor } from '../src/demos/agent';
```

## Usage Examples

### Type-Safe Agent Processing
```typescript
import { Agent, Explanation, AGENT_SEQUENCE } from '../src/demos/agent';

const processAgent = (agent: Agent): Explanation => {
  // Type-safe agent processing
  return {
    trace_id: generateTraceId(),
    step_id: `step_${Date.now()}`,
    agent,
    model_version: 'v1.0.0',
    policy_version: 'v2.0.0',
    summary: 'Agent processed successfully',
    decision: 'allow',
    score: 8.5,
    uncertainty: 0.1,
    timestamp: new Date().toISOString()
  };
};
```

### UI Component Integration
```typescript
import { getAgentColor, getScoreColor, VERBOSITY_LEVELS } from '../src/demos/agent';

const AgentBubble = ({ explanation, verbosity }: { explanation: Explanation, verbosity: Verbosity }) => {
  return (
    <div className={`p-4 rounded-lg ${getAgentColor(explanation.agent)}`}>
      <h3>{explanation.summary}</h3>
      <div className={getScoreColor(explanation.score, explanation.score_type)}>
        Score: {explanation.score}
      </div>
      {verbosity !== 'brief' && (
        <div>Uncertainty: {explanation.uncertainty}</div>
      )}
    </div>
  );
};
```

### Configuration Management
```typescript
import { OXFORD_CART, TIMING_CONFIG, SCORE_THRESHOLDS } from '../src/demos/agent';

const demoConfig = {
  cart: OXFORD_CART,
  timing: TIMING_CONFIG,
  thresholds: SCORE_THRESHOLDS
};
```

## Benefits

1. **Type Safety**: Strict TypeScript types prevent runtime errors
2. **Centralized Configuration**: Single source of truth for all constants
3. **Reusability**: Helper functions reduce code duplication
4. **Maintainability**: Easy to update colors, labels, and configurations
5. **Consistency**: Ensures uniform styling and behavior across components
6. **Developer Experience**: IntelliSense support and compile-time validation

## Integration Status

✅ **Updated Files:**
- `lib/mockOrchestrator.ts` - Uses new types and constants
- `components/AgentInteractionDemo.tsx` - Updated imports and constants
- `components/ExplanationChat.tsx` - Uses helper functions
- `components/AgentInteractionCart.tsx` - Updated type imports

✅ **Server Status:** All changes tested and working (HTTP 200)
✅ **Linting:** No errors detected
✅ **Type Safety:** Full TypeScript compliance








