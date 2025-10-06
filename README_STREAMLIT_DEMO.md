# OCN ML-Powered Payment Demo

This Streamlit demo showcases the complete Open Checkout Network (OCN) payment flow with ML-powered agents making intelligent decisions at each step.

## 🎯 Demo Overview

The demo walks through a complete payment transaction with the following steps:

### Step 0: Cart Creation
- **Actor**: AI Assistant (ChatGPT)
- **Flow**: User requests "Buy two slim-fit Crew Oxfords (M) and a navy blazer"
- **Result**: Cart created with $380 total (Oxfords x2 + Blazer)

### Step 1: Pre-Auth Checks
- **Okra (Credit Agent)**: Offers credit options including BNPL, runs ML-powered risk scoring
- **Onyx (Trust Agent)**: Runs trust/compliance checks, returns trust score + signals

### Step 2: Negotiation
- **Opal (Wallet Agent)**: Negotiates on consumer's behalf (lowest fees, loyalty maximization)
- **Orca (Checkout Agent)**: Negotiates on merchant's behalf (highest approval rates, lowest interchange)
- **Olive (Loyalty Agent)**: Surfaces loyalty opportunities ("5% rewards on store card")

### Step 3: Fee Competition
- **Weave (Processor Agent)**: Detects multi-bank routing, runs live fee auction across processors
- **Result**: Returns ranked fee outcomes with transparency

### Step 4: Finalization
- **Orca (Checkout Agent)**: Consolidates all inputs, creates PaymentMandate
- **Result**: Optimal configuration balancing all agent inputs

### Step 5: Auth & Post-Auth
- **Processor + Bank**: Authorization response
- **Weave (Audit)**: Logs decision, auction, and outcome trace
- **Transparency**: Consumer sees complete decision breakdown

## 🤖 ML-Powered Features

Each agent uses machine learning models for decision making:

- **Okra**: XGBoost Credit Risk v2.1 - Credit scoring and risk assessment
- **Onyx**: TrustNet v1.3 - Trust and compliance evaluation
- **Opal**: ConsumerPreferenceNet v1.2 - Consumer preference optimization
- **Orca**: MerchantOptimizer v2.0 - Merchant-side optimization
- **Olive**: LoyaltyOptimizer v1.5 - Loyalty and retention optimization
- **Weave**: AuctionOptimizer v2.3 - Fee auction and processor selection

## 🚀 Running the Demo

### Prerequisites
- Python 3.8+
- pip3

### Quick Start
```bash
# Make the script executable
chmod +x run_streamlit_demo.sh

# Run the demo
./run_streamlit_demo.sh
```

### Manual Installation
```bash
# Install requirements
pip3 install -r requirements_streamlit.txt

# Start Streamlit
streamlit run streamlit_demo.py --server.port 8501
```

### Access the Demo
Open your browser and navigate to: http://localhost:8501

## 📊 Demo Features

### Interactive Flow
- Step-by-step progression through the payment flow
- Real-time agent status monitoring
- ML model performance visualization
- Audit trail and transparency reporting

### ML Decision Transparency
- Model confidence scores
- Feature importance analysis
- Processing time metrics
- Human-readable explanations

### Visualizations
- Bid comparison charts
- ML model performance graphs
- Agent status indicators
- Progress tracking

## 🔧 Configuration

The demo is configured to work with the following agent ports:
- Okra: 8001
- Onyx: 8002
- Opal: 8003
- Orca: 8004
- Olive: 8005
- Weave: 8006

## 📈 Key Metrics

The demo tracks and displays:
- **Cost Optimization**: Fee auction savings
- **Approval Rates**: ML-predicted success rates
- **Processing Times**: Model inference performance
- **Confidence Scores**: ML model certainty
- **Feature Importance**: Decision factor weights

## 🎁 Benefits Demonstrated

- **For Consumers**: Lower fees, better rewards, higher approval rates
- **For Merchants**: Optimized costs, fraud protection, customer satisfaction
- **For Processors**: Fair competition, transparent pricing, performance metrics
- **For the Network**: End-to-end optimization, audit trails, ML-driven decisions

## 🔍 Audit Trail

The demo provides complete transparency with:
- Decision trace IDs
- ML model versions and confidence scores
- Feature importance analysis
- Processing time metrics
- Agent interaction logs
- Final outcome explanations

## 🛠️ Technical Details

### Dependencies
- Streamlit: Web application framework
- Requests: HTTP client for agent communication
- Pandas: Data manipulation and analysis
- Plotly: Interactive visualizations
- Pydantic: Data validation and serialization

### Architecture
- **Frontend**: Streamlit web interface
- **Backend**: Simulated agent responses with ML model data
- **Data Flow**: Sequential step-by-step processing
- **State Management**: Session-based state tracking
- **Visualization**: Real-time charts and metrics

## 📝 Notes

- This is a demonstration version with simulated agent responses
- In production, agents would be running as separate services
- ML models are simulated but represent real-world capabilities
- All data is generated for demonstration purposes
- The demo showcases the complete OCN payment flow with ML optimization

## 🤝 Contributing

To contribute to the demo:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the demo
5. Submit a pull request

## 📄 License

This demo is part of the Open Checkout Network (OCN) project.
