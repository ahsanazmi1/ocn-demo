# Mock Orchestrator with BNPL Branch - Implementation Summary

## Overview
The new mock orchestrator provides a comprehensive agent flow simulation with BNPL vs Credit branching logic, deterministic explanations, and professional evidential formatting.

## Key Features

### 🔄 Agent Flow Sequence
1. **Onyx (Trust)** → `allow`, risk_score≈0.07
2. **Okra (Credit+BNPL)** → `propose_alt` with both options in `extra`
3. **Opal (Wallet)** → recommends default card, notes MCC 5651
4. **Olive (Loyalty)** → conditional rewards based on choice
5. **Weave (Auction)** → auction result 1.65% + $0.05
6. **Orca (Finalize)** → mandate reflecting the choice
7. **Weave (Post-Auth)** → approved, receipt hash placeholder

### 💳 BNPL vs Credit Branching

#### BNPL Path (`choice === "bnpl"`)
- **Okra**: 4×$95 payments, 0% interest, $0 fees, suitability score≈0.06
- **Olive**: No rewards (0% cashback, $0.00)
- **Orca**: Final instrument: `BNPL_4_PAYMENTS`

#### Credit Path (`choice === "credit"`)
- **Okra**: APR 19.9%, utilization stable, credit risk≈0.12
- **Olive**: 5% cashback = $19.00 reward
- **Orca**: Final instrument: `REVOLVING_CREDIT`

### 📊 Explanation Structure

Each explanation includes:
- **Core Fields**: `trace_id`, `step_id`, `agent`, `model_version`, `policy_version`
- **Decision**: `summary`, `decision`, `score`, `uncertainty`
- **Evidence**: `key_signals[]`, `ap2_refs[]`, `redactions[]`
- **Metadata**: `timestamp`, `extra{}`

### 🔍 Key Signals Examples

#### Onyx (Trust)
```typescript
key_signals: [
  { path: "identity.verified", value: true, weight: 0.4 },
  { path: "employment.stable", value: true, weight: 0.3 },
  { path: "address.stability_years", value: 3.2, weight: 0.2 },
  { path: "fraud.alerts", value: 0, weight: 0.1 }
]
```

#### Okra (Credit+BNPL)
```typescript
extra: {
  bnpl_quote: {
    installments: 4,
    amount_per_payment: 95,
    interest_rate: 0,
    fees: 0,
    total_amount: 380
  },
  credit_approval: {
    apr: 19.9,
    credit_limit: 2500,
    utilization_impact: "stable"
  }
}
```

#### Weave (Auction)
```typescript
key_signals: [
  { path: "processing_fee_rate", value: 0.0165, weight: 0.4 },
  { path: "fixed_fee", value: 0.05, weight: 0.2 },
  { path: "settlement_time", value: "22h", weight: 0.2 },
  { path: "rebate_rate", value: 0.0015, weight: 0.2 }
]
```

## API Methods

### `getOxfordsCart(): Cart`
Returns the predefined Oxfords cart:
- 2× Slim-Fit Crew Oxford (M) @ $120 each
- 1× Navy Blazer @ $140
- Total: $380 USD

### `runAgentFlow(choice?: "credit" | "bnpl"): Explanation[]`
Returns deterministic explanations for the complete agent flow:
- **No choice**: Defaults to credit path
- **"credit"**: Full credit flow with 5% cashback
- **"bnpl"**: BNPL flow with 4 payments, no rewards

### `simulateAgentFlow(choice?: "credit" | "bnpl"): Promise<Explanation[]>`
Same as `runAgentFlow` but with realistic timing delays (1.5-2.5 seconds between agents).

## Deterministic Features

### 🕐 Timestamps
- Base timestamp frozen at construction
- Each agent gets +1000ms increment
- Consistent across runs

### 🎯 Scores
- **Risk scores**: Lower = better (0.07 = excellent)
- **Cost scores**: Lower = better (0.15 = low cost)
- **Suitability scores**: Lower = better (0.04 = excellent)

### 🔒 Redactions
Consistent PII redaction paths:
- `ssn_last4`, `ssn_full`
- `employer_tax_id`, `income_amount`
- `card_number`, `account_balance`, `cvv`
- `fraud_rules`, `internal_algorithms`

### 📋 AP2 References
Deterministic audit trail references:
- `AP2-TRUST-001`, `AP2-IDENTITY-045`
- `AP2-CREDIT-089`, `AP2-BNPL-012`
- `AP2-WALLET-156`, `AP2-REWARDS-078`
- `AP2-AUCTION-334`, `AP2-PROCESSOR-156`

## Integration Status

✅ **Updated Components:**
- `AgentInteractionDemo.tsx` - Uses new orchestrator and BNPL/Credit selector
- `ExplanationChat.tsx` - Displays new explanation structure with key signals
- `AgentInteractionCart.tsx` - Uses new cart structure

✅ **Type Safety:** Full TypeScript compliance with strict types
✅ **Server Status:** HTTP 200 - All changes working
✅ **Linting:** No errors detected

## Usage Examples

### Basic Usage
```typescript
import { MockOrchestrator, simulateAgentFlow } from '../src/demos/agent/mockOrchestrator';

const orchestrator = new MockOrchestrator();
const cart = orchestrator.getOxfordsCart();
const explanations = await simulateAgentFlow('bnpl');
```

### Credit vs BNPL Comparison
```typescript
const creditFlow = runAgentFlow('credit');  // 5% cashback = $19.00
const bnplFlow = runAgentFlow('bnpl');      // 4 payments, no rewards

// Compare Olive's rewards
const creditRewards = creditFlow[3].extra.rewards_amount;  // $19.00
const bnplRewards = bnplFlow[3].extra.rewards_amount;      // $0.00
```

### Evidence Inspection
```typescript
const explanation = explanations[1]; // Okra
console.log(explanation.extra.bnpl_quote);
// { installments: 4, amount_per_payment: 95, interest_rate: 0, fees: 0 }

console.log(explanation.key_signals);
// [{ path: "credit_score", value: 720, weight: 0.3 }, ...]
```

## Benefits

1. **Deterministic**: Same inputs always produce same outputs
2. **Professional**: Evidential tone with technical transparency
3. **Branching**: Clear BNPL vs Credit differentiation
4. **Auditable**: Complete trace IDs and AP2 references
5. **Extensible**: Easy to add new agents or modify logic
6. **Type-Safe**: Full TypeScript support with strict validation








