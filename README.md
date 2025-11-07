# OCN AI Explainability Demo

[![CI Smoke Tests](https://github.com/ahsanazmi1/ocn-demo/workflows/OCN%20Demo%20Smoke%20Tests/badge.svg)](https://github.com/ahsanazmi1/ocn-demo/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive demonstration of AI-powered explainability and payment orchestration across the Open Checkout Network (OCN), showcasing deterministic decision engines, CloudEvents integration, transparent reasoning, ML-powered agents, and comprehensive payment tracking capabilities.

## 🎯 Overview

This repository contains multiple demo implementations showcasing the complete OCN payment ecosystem:

- **8 OCN Agents**: Complete fintech orchestration across checkout, credit, wallet, loyalty, trust, payout, treasury, and audit
- **Multiple Demo Modes**: Next.js UI, Streamlit, Gateway API, and plugin adapters
- **Phase 3 & 4 Features**: Negotiation, live fee bidding, payment instructions, and settlement visibility
- **ML-Powered Decisions**: Real-time agent decision making with explainability
- **E-Commerce Integration**: WooCommerce, Shopify, and BigCommerce plugin adapters

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/ahsanazmi1/ocn-demo.git
cd ocn-demo

# 2. Configure environment (optional - works without LLM keys)
# Create .env file with Azure OpenAI keys for enhanced LLM explanations:
# AZURE_OPENAI_API_KEY=your-key-here
# AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
# AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name

# 3. Initialize submodules and start services
make submodules
make pin
make up

# 4. Wait for services to start, then run demo
sleep 10
make smoke

# 5. Access the demo UI
open http://localhost:3000
```

## 📋 Prerequisites

- **Docker & Docker Compose**: For containerized services
- **Git**: For submodule management
- **Make**: For convenient commands (optional but recommended)
- **Azure OpenAI Account** (optional): For enhanced LLM explanations

## 🤖 OCN Agents

The demo showcases 8 specialized agents working together:

| Agent | Port | Purpose | Key Features |
|-------|------|---------|--------------|
| 🦈 **Orca** | 8080 | Checkout Decision Engine | Risk assessment, rail selection, LLM explanations |
| 🚀 **Orion** | 8081 | Payout Optimization | Rail optimization, cost/speed analysis |
| 🌊 **Weave** | 8082 | Audit & Receipt Engine | CloudEvents storage, processor auctions, audit trails |
| 🦏 **Okra** | 8083 | BNPL & Credit Scoring | Credit quotes, risk scoring, BNPL underwriting |
| 💎 **Opal** | 8084 | Wallet Selection | Consumer payment optimization, instrument scoring |
| 🏛️ **Oasis** | 8085 | Treasury Planning | Liquidity forecasting, cash flow management |
| 🖤 **Onyx** | 8086 | KYB & Trust Verification | Trust signals, KYB verification, risk assessment |
| 🫒 **Olive** | 8087 | Loyalty Incentives | Policy application, reward optimization |

## 🎬 Available Demos

### 1. Next.js Web UI (Recommended)

**Features:**
- Multiple demo modes (ShirtCo 8-agent, Oxfords 6-agent, Agent Interaction)
- Real-time agent status and CloudEvents timeline
- Phase 4 dashboards (Consumer, Merchant, Processor)
- Interactive agent explanations with verbosity levels
- JSON inspectors and audit trails

**Quick Start:**
```bash
# Full 8-agent ShirtCo demo
make demo-shirtco
open http://localhost:3000

# 6-agent Oxfords demo
make demo-oxfords
open http://localhost:3000
```

**Available Tabs:**
- **Main Demo**: Run ShirtCo or Oxfords checkout flows
- **Agent Interaction Demo**: Interactive chat-style agent explanations
- **Phase 4 Flow**: Payment instruction and settlement visibility
- **Consumer Dashboard**: Rewards, savings, payment insights
- **Merchant Dashboard**: Processor bids, route analysis, fee optimization
- **Processor Dashboard**: Bid history, authorization results, monitoring

### 2. Streamlit ML-Powered Demo

**Features:**
- Step-by-step payment flow (6 steps)
- ML model performance visualization
- Real-time agent decision transparency
- Cross-agent ML insights
- Audit trail and transparency reporting

**Quick Start:**
```bash
# Install dependencies
pip install -r requirements_streamlit.txt

# Run Streamlit demo
streamlit run streamlit_demo.py --server.port 8501

# Or use the helper script
./run_streamlit_demo.sh
```

**Access:** http://localhost:8501

**Demo Steps:**
1. **Cart Creation**: AI assistant creates shopping cart
2. **Pre-Auth Checks**: Okra (credit) + Onyx (trust) risk assessment
3. **Negotiation**: Opal (consumer) vs Orca (merchant) + Olive (loyalty)
4. **Fee Competition**: Weave processor auction
5. **Finalization**: Orca payment mandate creation
6. **Auth & Post-Auth**: Processor authorization and audit trail

### 3. Gateway API Demo

**Features:**
- RESTful API orchestration
- Direct agent endpoint integration
- Phase 3 & 4 negotiation flows
- Deterministic transaction processing

**Quick Start:**
```bash
# Start all services
make up

# Gateway runs on port 8090
curl http://localhost:8090/health
curl http://localhost:8090/docs  # API documentation
```

### 4. Plugin Adapters (E-Commerce Integration)

**Supported Platforms:**
- WooCommerce
- Shopify
- BigCommerce

**Features:**
- Platform-specific cart transformation
- Orca MCP integration
- Webhook result publishing
- Real-time rail evaluation

**Quick Start:**
```bash
cd plugins
pip install -r requirements.txt

# Start webhook simulator
python simulate_webhook.py

# Run demo (in another terminal)
python demo.py
```

See [plugins/README.md](plugins/README.md) for detailed documentation.

### 5. Command-Line Smoke Test

**Features:**
- Automated agent testing
- CloudEvents verification
- Deterministic output validation

**Quick Start:**
```bash
make smoke
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Demo Interfaces                          │
├──────────────┬──────────────┬──────────────┬───────────────┤
│  Next.js UI  │  Streamlit   │ Gateway API  │   Plugins     │
│   Port 3000  │  Port 8501   │  Port 8090   │  Port 9000    │
└──────┬───────┴──────┬───────┴──────┬───────┴───────┬───────┘
       │              │               │               │
       └──────────────┴───────────────┴───────────────┘
                           │
                    ┌──────▼──────┐
                    │   Gateway   │
                    │  Port 8090  │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│    Orca      │  │     Opal     │  │     Okra     │
│   Port 8080  │  │   Port 8084  │  │   Port 8083  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│    Onyx      │  │    Olive     │  │    Oasis     │
│   Port 8086  │  │   Port 8087  │  │   Port 8085  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│    Orion     │  │    Weave     │  │              │
│   Port 8081  │  │   Port 8082  │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │
        │    CloudEvents  │
        │    trace_id     │
        │                 │
        └────────┬────────┘
                 │
          ┌──────▼──────┐
          │    Weave    │
          │  (Audit)    │
          └─────────────┘
```

## 🛠️ Available Commands

```bash
make help          # Show all available commands
make submodules    # Initialize and update git submodules
make pin           # Pin all submodules to phase-2-explainability branches
make up            # Start all services with Docker Compose
make down          # Stop all services and remove volumes
make logs          # Show logs from all services
make smoke         # Run the complete demo smoke test
make demo-shirtco  # Start ShirtCo 8-agent demo
make demo-down     # Stop ShirtCo demo and cleanup
make demo-oxfords  # Start Demo 1: Oxfords Checkout (6 agents)
make demo1-down    # Stop Demo 1 and cleanup
make clean         # Clean up demo outputs and containers
make health        # Check service health status
make health-shirtco # Check all ShirtCo demo services
make health-oxfords # Check Demo 1 Oxfords services
```

## 📊 Demo Scenarios

### ShirtCo Demo (8 Agents)

**Scenario:** Mid-market apparel B2B transaction
- **Merchant**: ShirtCo
- **Customer**: Acme Dev LLC (Gold loyalty tier)
- **Order**: 3 shirt types, 60 units, $5,454.00
- **Vendor**: CottonSupply LLC

**Agent Flow:**
1. 🦈 Orca: Checkout risk & approval
2. 🦏 Okra: BNPL net-30 underwriting
3. 💎 Opal: Corporate Visa selection
4. 🚀 Orion: ACH payout optimization
5. 🏛️ Oasis: 14-day liquidity forecast
6. 🖤 Onyx: Vendor KYB verification
7. 🫒 Olive: Gold tier 5% discount
8. 🌊 Weave: Audit trail storage

### Oxfords Demo (6 Agents)

**Scenario:** Streamlined checkout flow
- **Merchant**: Example LLC (B2B apparel)
- **Customer**: Corporate buyer
- **Order**: Oxfords (Brown 10D) + Blazer (Navy 40R) = $700.00

**Agent Flow:**
1. 🦈 Orca: Checkout decision & explanation
2. 💎 Opal: Corporate Visa selection
3. 🫒 Olive: Gold tier 5% rebate
4. 🦏 Okra: 30-day BNPL quote
5. 🖤 Onyx: Vendor KYB verification
6. 🌊 Weave: Receipt logging

### Agent Interaction Demo

**Features:**
- Interactive chat-style agent explanations
- BNPL vs Credit choice flow
- Verbosity levels (Brief/Standard/Forensics)
- Real-time agent decision visualization
- Evidence viewer with masked JSON

**Access:** http://localhost:3000 → "Agent Interaction Demo" tab

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Azure OpenAI Configuration (optional, for LLM explanations)
AZURE_OPENAI_API_KEY=your-azure-openai-api-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Agent-specific deployment names (optional overrides)
# ORCA_OPENAI_DEPLOYMENT_NAME=orca-llm
# OPAL_OPENAI_DEPLOYMENT_NAME=opal-llm
# WEAVE_OPENAI_DEPLOYMENT_NAME=weave-llm

# Phase 3 Configuration
DETERMINISTIC_SEED=42

# Logging
LOG_LEVEL=info
```

### Phase 3 & 4 Features

**Phase 3 — Negotiation & Live Fee Bidding:**
- 🔄 Orca vs Opal negotiation comparison
- 🌊 Weave processor auction (Carat, Adyen, Stripe)
- 🎯 Final settlement path optimization
- 📡 CloudEvents for comprehensive audit trails
- 🤖 LLM-powered explanations

**Phase 4 — Payment Instruction & Visibility:**
- Payment instruction schemas
- Settlement visibility
- Payment tracking
- Instruction validation

**CloudEvents Emitted:**
- `ocn.orca.explanation.v1` - Rail selection explanations
- `ocn.opal.explanation.v1` - Consumer instrument explanations
- `ocn.weave.bid_request.v1` - Processor bid requests
- `ocn.weave.bid_response.v1` - Processor bid responses
- `ocn.olive.policy_applied.v1` - Policy application events
- `ocn.onyx.trust_signal.v1` - Trust signal events
- `ocn.onyx.kyb_verified.v1` - KYB verification events

## 📊 What You'll See

### Orca Decision Flow
```json
{
  "outcome": "approve",
  "confidence": 0.85,
  "reason": "Low risk transaction within normal parameters",
  "key_signals": ["amount_below_threshold", "known_merchant", "standard_channel"],
  "trace_id": "demo_trace_orca_001"
}
```

### Orion Optimization Flow
```json
{
  "best_rail": "ach",
  "ranked_rails": [
    {"rail": "ach", "score": 0.85, "cost": 1.50, "speed": "24h"},
    {"rail": "wire", "score": 0.72, "cost": 15.00, "speed": "4h"}
  ],
  "explanation": {
    "reason": "ACH provides optimal cost-benefit ratio",
    "confidence": 0.90
  },
  "trace_id": "demo_trace_orion_001"
}
```

### Weave CloudEvents Logs
```
[INFO] Received CloudEvent: ocn.orca.explanation.v1
[INFO] Subject: demo_trace_orca_001
[INFO] Receipt stored: hash_abc123...

[INFO] Received CloudEvent: ocn.orion.explanation.v1
[INFO] Subject: demo_trace_orion_001
[INFO] Receipt stored: hash_def456...
```

## 🔍 Sample Data

### Checkout Samples
- `samples/ap2/checkout_small.json` - $125.50 grocery transaction
- `samples/demo1_oxfords/` - Oxfords + Blazer checkout ($700)
- `samples/shirt_demo/` - ShirtCo B2B transaction ($5,454)
- `samples/vendor/payout_basic.json` - $2,500 vendor payout

All samples use synthetic, non-PII data safe for demos.

## 🐛 Troubleshooting

### Port Conflicts
```bash
# Check what's using ports 8080-8090, 3000, 8501, 9000
lsof -i :8080 -i :8081 -i :8082 -i :3000 -i :8501 -i :9000

# Stop conflicting services or change ports in docker-compose.yml
```

### Missing API Key
```bash
# Demo works without OpenAI API key
# Agents will use deterministic explanation stubs
echo "AZURE_OPENAI_API_KEY=" > .env
```

### Submodule Issues
```bash
# Reset submodules to clean state
make clean
git submodule deinit -f --all
make submodules
make pin
```

### Service Health Issues
```bash
# Check service health
make health
make health-shirtco
make health-oxfords

# View detailed logs
make logs

# Restart services
make down
make up
```

### Docker Issues
```bash
# Clean Docker state
docker system prune -f
docker volume prune -f

# Rebuild from scratch
make down
make up
```

## 🔧 Development

### Adding New Samples
1. Create JSON files in `samples/` directory
2. Ensure they contain required fields (`amount`, `trace_id`, etc.)
3. Test with `make smoke`

### Modifying Services
1. Update submodule references in `docker-compose.yml`
2. Pin to new versions with `make pin`
3. Test with `make smoke`

### Customizing the Demo
1. Edit `scripts/smoke_demo.sh` for different API calls
2. Modify sample JSON files for different scenarios
3. Update environment variables in `.env`
4. Customize UI components in `ui/` directory
5. Modify Streamlit flow in `streamlit_demo.py`

## 📚 Related Documentation

### Repository Documentation
- [SUBMODULES.md](SUBMODULES.md) - Git submodule management guide
- [README_STREAMLIT_DEMO.md](README_STREAMLIT_DEMO.md) - Streamlit demo details
- [plugins/README.md](plugins/README.md) - E-commerce plugin adapters
- [ui/README.md](ui/README.md) - Next.js UI documentation

### Agent Repositories
- [Orca Repository](https://github.com/ahsanazmi1/orca) - Checkout decision engine
- [Orion Repository](https://github.com/ahsanazmi1/orion) - Payout optimization engine
- [Weave Repository](https://github.com/ahsanazmi1/weave) - Audit and receipt engine
- [Okra Repository](https://github.com/ahsanazmi1/okra) - BNPL & credit scoring
- [Opal Repository](https://github.com/ahsanazmi1/opal) - Wallet selection
- [Olive Repository](https://github.com/ahsanazmi1/olive) - Loyalty incentives
- [Onyx Repository](https://github.com/ahsanazmi1/onyx) - KYB & trust verification
- [Oasis Repository](https://github.com/ahsanazmi1/oasis) - Treasury planning

### External Resources
- [OCN Common](https://github.com/ahsanazmi1/ocn-common) - Shared schemas and utilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `make smoke` or relevant demo command
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/ahsanazmi1/ocn-demo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ahsanazmi1/ocn-demo/discussions)
- **Documentation**: [Project Wiki](https://github.com/ahsanazmi1/ocn-demo/wiki)

---

**Ready to see AI explainability in action?** 

- Run `make demo-shirtco` for the full 8-agent experience
- Run `make demo-oxfords` for the streamlined 6-agent flow
- Run `streamlit run streamlit_demo.py` for the ML-powered step-by-step demo
- Check out the plugin adapters for e-commerce integration

✨
