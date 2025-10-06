# OCN Plugin Adapters

Scaffold plugin adapters for WooCommerce, Shopify, and BigCommerce that integrate with the OCN (Open Checkout Network) Orca MCP `negotiateCheckout` functionality and publish results to webhook endpoints.

## 🎯 Overview

This repository contains plugin adapters that demonstrate how to integrate OCN's Phase 3 — Negotiation & Live Fee Bidding capabilities with popular e-commerce platforms.

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Orca agent running on `http://localhost:8080`
- Required Python packages: `requests`

### Installation

1. **Install dependencies**:
   ```bash
   pip install requests
   ```

2. **Start Orca agent** (in another terminal):
   ```bash
   cd /path/to/ocn-demo
   docker-compose up orca
   ```

### Running the Demo

1. **Start the webhook simulator**:
   ```bash
   python simulate_webhook.py
   ```

2. **Run the plugin demo** (in another terminal):
   ```bash
   python demo.py
   ```

## 📋 Platform Adapters

### WooCommerce Adapter
- Transforms WooCommerce cart data to Orca MCP format
- Maps Orca rail types to WooCommerce payment methods
- Supports credit card, debit card, bank transfer, and wire transfer

### Shopify Adapter
- Transforms Shopify cart data to Orca MCP format
- Maps Orca rail types to Shopify payment gateways
- Supports Stripe, Shopify Payments, PayPal, and manual gateways

### BigCommerce Adapter
- Transforms BigCommerce cart data to Orca MCP format
- Maps Orca rail types to BigCommerce payment providers
- Supports Stripe, Square, PayPal, and manual providers

## 🔧 API Reference

### BasePluginAdapter
- `transform_cart_to_orca_request(platform_cart)`: Transform platform cart to Orca format
- `transform_orca_response_to_platform(orca_response)`: Transform Orca response to platform format
- `call_orca_negotiate_checkout(cart_data)`: Call Orca MCP negotiateCheckout
- `publish_to_webhook(webhook_url, data)`: Publish data to webhook endpoint
- `process_checkout(platform_cart, webhook_url)`: Complete checkout processing workflow

## 📡 Webhook Integration

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
      "confidence": 0.85
    }
  },
  "platform_response": {
    "success": true,
    "payment_method": "credit_card",
    "chosen_rail": "credit"
  }
}
```

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

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Add tests** for new functionality
4. **Submit a pull request**

## 📄 License

This project is part of the OCN (Open Checkout Network) demo and follows the same licensing terms.
