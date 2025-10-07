# Agent Interaction Demo Implementation

## Overview
A new two-pane UI demo has been added to the OCN Demo application, showcasing real-time agent decision-making explanations in a professional, evidential format.

## Features Implemented

### 🎨 Design System
- **OCN Color Palette**: Integrated custom colors into Tailwind CSS
  - `ocn-purple`: #5063BF
  - `ocn-aqua`: #8EDFEB  
  - `ocn-dark`: #414B77
  - `ocn-medium`: #6F6F77
  - `ocn-light`: #FAFAFD
  - Custom shadows with OCN brand colors

### 🛒 Cart Component (`AgentInteractionCart.tsx`)
- Displays Oxfords cart with 2 × Slim-Fit Crew Oxfords ($120 ea) + 1 × Navy Blazer ($140)
- Shows item details, quantities, pricing breakdown
- Total: $410.40 USD
- Professional styling with OCN brand colors

### 💬 Explanation Chat (`ExplanationChat.tsx`)
- Real-time agent explanation bubbles
- Agent sequence: Onyx → Okra → Opal → Olive → Weave → Orca → Weave
- Each bubble shows:
  - **Summary**: 1-3 sentence explanation
  - **Decision**: Clear agent decision
  - **Score**: Risk/cost/suitability with color coding
  - **Uncertainty**: Confidence percentage
  - **Policy/Model versions**: Transparency
  - **Trace ID**: Audit trail
  - **Evidence**: Collapsible detailed information

### 🎛️ Interactive Controls
- **Verbosity Toggle**: Brief / Standard / Forensics
  - Brief: Basic summary and decision only
  - Standard: Includes uncertainty, versions, key signals
  - Forensics: Full evidence with redacted fields
- **Credit Option Selector**: BNPL vs Revolving
  - BNPL: $15 credit + free shipping, no cashback
  - Revolving: 5% cashback on purchase

### 🤖 Mock Orchestrator (`MockOrchestrator.ts`)
- **Deterministic Payloads**: Consistent explanations for Oxfords cart
- **Real-time Simulation**: 1.5-2.5 second delays between agents
- **Dynamic Content**: BNPL vs revolving affects explanations
- **Professional Tone**: Evidential language with technical details

## Agent Explanation Sequence

### 1. Onyx (Trust) - 4.8/10 Risk Score
- Identity verification via SSN
- Employment verification
- Address stability 3+ years
- No fraud alerts

### 2. Okra (Credit+BNPL) - 7.2/10 (BNPL) or 6.8/10 (Revolving)
- **BNPL**: 4-payment plan approved
- **Revolving**: $2,500 credit limit
- Credit score 720+, DTI 28%

### 3. Opal (Wallet) - 8.5/10 Suitability
- Premium Rewards Card selected
- 2% cashback + ACH backup
- Fee minimization strategy

### 4. Olive (Loyalty) - 7.8/10 (BNPL) or 8.2/10 (Revolving)
- **BNPL**: $15 credit + free shipping
- **Revolving**: 5% cashback
- Gold customer tier benefits

### 5. Weave (Auction) - 9.1/10 Cost
- Carat processor selected
- 45 bps fee vs 280 bps (Stripe)
- 15 bps rebate, 22h settlement

### 6. Orca (Finalize) - 9.6/10 Suitability
- Multi-rail optimization
- Premium Card + ACH backup
- Full fraud protection enabled

### 7. Weave (Post-Auth) - 10.0/10 Suitability
- Transaction authorized
- Approval code generated
- Settlement scheduled

## Technical Implementation

### File Structure
```
ui/
├── components/
│   ├── AgentInteractionDemo.tsx      # Main demo component
│   ├── AgentInteractionCart.tsx      # Left panel cart
│   └── ExplanationChat.tsx           # Right panel explanations
├── lib/
│   ├── types.ts                      # TypeScript interfaces
│   └── mockOrchestrator.ts          # Deterministic data generator
└── __tests__/
    └── AgentInteractionDemo.test.tsx # Comprehensive tests
```

### TypeScript Types
- `ExplanationPayload`: Complete agent explanation structure
- `Evidence`: Collapsible detailed information
- `Cart`: Shopping cart structure
- `VerbosityLevel`: Brief/Standard/Forensics
- `CreditOption`: BNPL/Revolving

### Integration
- Added as new tab in main navigation: "Agent Interaction"
- Self-contained demo with no external dependencies
- Responsive design for desktop and mobile

## Usage Instructions

1. **Navigate**: Click "Agent Interaction" tab
2. **Configure**: 
   - Select verbosity level (Brief/Standard/Forensics)
   - Choose credit option (BNPL/Revolving)
3. **Start Demo**: Click "Start Demo" button
4. **Watch**: Real-time agent explanations appear in sequence
5. **Explore**: Click "Evidence" sections for detailed information
6. **Reset**: Use "Reset" button to clear and restart

## Testing
- Comprehensive Jest tests covering all functionality
- Mock orchestrator for consistent test results
- UI interaction testing with React Testing Library
- Responsive design validation

## Future Enhancements
- Real backend integration
- Additional agent types
- Custom explanation templates
- Export functionality for audit trails
- Real-time collaboration features








