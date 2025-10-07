# OCN Plugin Adapters

Scaffold plugin adapters for WooCommerce, Shopify, and BigCommerce that integrate with the OCN (Open Checkout Network) Orca MCP `negotiateCheckout` functionality and publish results to webhook endpoints.

## 🎯 Overview

This repository contains plugin adapters that demonstrate how to integrate OCN's Phase 3 — Negotiation & Live Fee Bidding capabilities with popular e-commerce platforms. The adapters:

- Transform platform-specific cart data to Orca MCP format
- Call Orca's `negotiateCheckout` endpoint for rail evaluation
- Transform Orca responses back to platform-specific formats
- Publish results to webhook endpoints for further processing

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WooCommerce   │    │     Shopify     │    │   BigCommerce   │
│     Plugin      │    │     Plugin      │    │     Plugin      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Base Plugin Adapter   │
                    │   (Common Functionality)  │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │      Orca MCP Client      │
                    │   negotiateCheckout API   │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │      Orca Agent           │
                    │   (Rail Evaluation)       │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │     Webhook Simulator     │
                    │   (Results Publishing)    │
                    └───────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Orca agent running on `http://localhost:8080`
- Required Python packages (see `requirements.txt`)

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   cd /path/to/ocn-demo/plugins
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start Orca agent** (in another terminal):
   ```bash
   cd /path/to/ocn-demo
   docker-compose up orca
   ```

### Running the Demo

1. **Start the webhook simulator**:
   ```bash
   python simulate_webhook.py
   ```
   This will start a webhook simulator on `http://localhost:9000`

2. **Run the plugin demo** (in another terminal):
   ```bash
   python demo.py
   ```

3. **View results**:
   - Webhook history: `http://localhost:9000/webhooks`
   - Simulator status: `http://localhost:9000/`

## 📋 Platform Adapters

### WooCommerce Adapter

**File**: `woocommerce/woocommerce_adapter.py`

**Features**:
- Transforms WooCommerce cart data to Orca MCP format
- Maps Orca rail types to WooCommerce payment methods
- Supports credit card, debit card, bank transfer, and wire transfer

**Sample Cart Format**:
```json
{
  "total": 299.99,
  "currency": "USD",
  "items": [
    {
      "id": "WC-001",
      "name": "Premium Headphones",
      "quantity": 1,
      "price": 199.99
    }
  ],
  "customer": {
    "id": "customer_123",
    "email": "customer@example.com"
  },
  "shipping": {
    "country": "US",
    "method": "standard"
  },
  "payment_method": "card",
  "store_id": "woocommerce_store_001",
  "category": "electronics"
}
```

### Shopify Adapter

**File**: `shopify/shopify_adapter.py`

**Features**:
- Transforms Shopify cart data to Orca MCP format
- Maps Orca rail types to Shopify payment gateways
- Supports Stripe, Shopify Payments, PayPal, and manual gateways

**Sample Cart Format**:
```json
{
  "total_price": 29999,
  "currency": "USD",
  "line_items": [
    {
      "id": "SH-001",
      "title": "Premium Headphones",
      "quantity": 1,
      "price": 19999
    }
  ],
  "customer": {
    "id": "customer_456",
    "email": "customer@shopify-store.com"
  },
  "shipping_address": {
    "country_code": "US"
  },
  "shop_domain": "demo-shopify-store.myshopify.com",
  "category": "electronics"
}
```

### BigCommerce Adapter

**File**: `bigcommerce/bigcommerce_adapter.py`

**Features**:
- Transforms BigCommerce cart data to Orca MCP format
- Maps Orca rail types to BigCommerce payment providers
- Supports Stripe, Square, PayPal, and manual providers

**Sample Cart Format**:
```json
{
  "base_total": 299.99,
  "currency": "USD",
  "line_items": {
    "physical_items": [
      {
        "id": "BC-001",
        "name": "Premium Headphones",
        "quantity": 1,
        "sale_price": 199.99
      }
    ]
  },
  "customer": {
    "id": "customer_789",
    "email": "customer@bigcommerce-store.com"
  },
  "shipping_addresses": [
    {
      "country_iso2": "US"
    }
  ],
  "store_hash": "bigcommerce_store_001",
  "category": "electronics"
}
```

## 🔧 API Reference

### BasePluginAdapter

**Class**: `common.base_adapter.BasePluginAdapter`

**Methods**:
- `transform_cart_to_orca_request(platform_cart)`: Transform platform cart to Orca format
- `transform_orca_response_to_platform(orca_response)`: Transform Orca response to platform format
- `call_orca_negotiate_checkout(cart_data)`: Call Orca MCP negotiateCheckout
- `publish_to_webhook(webhook_url, data)`: Publish data to webhook endpoint
- `process_checkout(platform_cart, webhook_url)`: Complete checkout processing workflow

### OrcaMCPClient

**Class**: `common.orca_client.OrcaMCPClient`

**Methods**:
- `negotiate_checkout(cart_data)`: Call Orca MCP negotiateCheckout endpoint
- `health_check()`: Check Orca endpoint health
- `get_capabilities()`: Get Orca MCP capabilities

### WebhookSimulator

**Class**: `common.webhook_simulator.WebhookSimulator`

**Methods**:
- `start_server()`: Start webhook simulator server
- `stop_server()`: Stop webhook simulator server
- `get_webhook_url()`: Get webhook endpoint URL
- `get_webhooks()`: Get all received webhooks
- `clear_webhooks()`: Clear webhook history

## 📡 Webhook Integration

### Webhook Payload Format

When a checkout is processed, the following payload is sent to the webhook endpoint:

```json
{
  "platform": "WooCommerce",
  "timestamp": "2024-01-15T10:30:00Z",
  "orca_response": {
    "chosen_rail": "credit",
    "explanation": {
      "summary": "Credit card selected for optimal cost-speed balance",
      "reasoning": "Credit card offers best combination of low cost and fast settlement",
      "confidence": 0.85,
      "key_signals": ["low_risk_customer", "standard_transaction"]
    },
    "rail_evaluations": [
      {
        "rail_type": "credit",
        "cost_score": 0.6,
        "speed_score": 0.9,
        "risk_score": 0.7,
        "final_score": 0.73
      }
    ],
    "trace_id": "orca-trace-123"
  },
  "platform_response": {
    "success": true,
    "payment_method": "credit_card",
    "chosen_rail": "credit",
    "explanation": {
      "summary": "Credit card selected for optimal cost-speed balance",
      "reasoning": "Credit card offers best combination of low cost and fast settlement",
      "confidence": 0.85,
      "key_signals": ["low_risk_customer", "standard_transaction"]
    },
    "rail_details": {
      "cost_score": 0.6,
      "speed_score": 0.9,
      "risk_score": 0.7,
      "final_score": 0.73
    }
  }
}
```

### Webhook Endpoints

- **POST** `/webhook` - Receive webhook notifications
- **GET** `/webhooks` - View webhook history
- **GET** `/` - Get simulator status

## 🧪 Testing

### Manual Testing

1. **Start the webhook simulator**:
   ```bash
   python simulate_webhook.py
   ```

2. **Send a test webhook**:
   ```bash
   curl -X POST http://localhost:9000/webhook \
     -H "Content-Type: application/json" \
     -d '{"test": "data", "platform": "test"}'
   ```

3. **View webhook history**:
   ```bash
   curl http://localhost:9000/webhooks
   ```

### Automated Testing

Run the complete demo:
```bash
python demo.py
```

This will:
1. Start the webhook simulator
2. Process sample carts for all three platforms
3. Call Orca MCP negotiateCheckout for each
4. Publish results to webhooks
5. Display comprehensive results

## 🔧 Configuration

### Environment Variables

- `ORCA_ENDPOINT`: Orca MCP endpoint URL (default: `http://localhost:8080`)
- `WEBHOOK_PORT`: Webhook simulator port (default: `9000`)
- `LOG_LEVEL`: Logging level (default: `INFO`)

### Customization

Each platform adapter can be customized by:

1. **Extending the base adapter**:
   ```python
   from common.base_adapter import BasePluginAdapter
   
   class CustomAdapter(BasePluginAdapter):
       def transform_cart_to_orca_request(self, cart):
           # Custom transformation logic
           pass
   ```

2. **Modifying rail mappings**:
   ```python
   def _map_rail_to_platform_method(self, rail_type):
       # Custom rail-to-method mapping
       pass
   ```

3. **Adding platform-specific features**:
   ```python
   def get_platform_info(self):
       # Add platform-specific capabilities
       pass
   ```

## 🚀 Deployment

### Local Development

1. **Start Orca agent**:
   ```bash
   docker-compose up orca
   ```

2. **Run plugin adapters**:
   ```bash
   python demo.py
   ```

### Production Considerations

For production deployment:

1. **Replace webhook simulator** with real webhook endpoints
2. **Add authentication** for Orca MCP calls
3. **Implement error handling** and retry logic
4. **Add monitoring** and logging
5. **Configure SSL/TLS** for webhook endpoints
6. **Add rate limiting** and security measures

## 📚 Examples

### Basic Usage

```python
from woocommerce.woocommerce_adapter import WooCommerceAdapter

# Create adapter
adapter = WooCommerceAdapter()

# Process checkout
cart_data = {
    "total": 100.00,
    "currency": "USD",
    "items": [{"id": "1", "name": "Product", "quantity": 1, "price": 100.00}],
    "customer": {"id": "123", "email": "test@example.com"}
}

result = adapter.process_checkout(cart_data, "http://localhost:9000/webhook")
print(f"Chosen rail: {result['platform_response']['chosen_rail']}")
```

### Custom Webhook Handler

```python
from common.webhook_simulator import WebhookSimulator

# Create custom simulator
simulator = WebhookSimulator(port=9001)
simulator.start_server()

# Process webhooks
webhooks = simulator.get_webhooks()
for webhook in webhooks:
    platform = webhook['platform']
    chosen_rail = webhook['orca_response']['chosen_rail']
    print(f"{platform}: {chosen_rail}")
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Add tests** for new functionality
4. **Submit a pull request**

### Adding New Platforms

To add support for a new e-commerce platform:

1. **Create platform directory**: `plugins/newplatform/`
2. **Implement adapter**: Extend `BasePluginAdapter`
3. **Add sample data**: Include in `demo.py`
4. **Update documentation**: Add platform details to README

## 📄 License

This project is part of the OCN (Open Checkout Network) demo and follows the same licensing terms.

## 🆘 Support

For issues and questions:

1. **Check the logs** for error messages
2. **Verify Orca agent** is running and accessible
3. **Test webhook endpoints** manually
4. **Review sample data** formats

## 🔮 Future Enhancements

- **Async support** for better performance
- **OAuth integration** for platform authentication
- **App store packaging** for easy installation
- **Real-time webhooks** with WebSocket support
- **Advanced error handling** and retry logic
- **Configuration management** with environment files
- **Monitoring and metrics** collection
- **Multi-tenant support** for multiple stores

