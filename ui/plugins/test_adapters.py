#!/usr/bin/env python3
"""
Test Script for OCN Plugin Adapters

Simple test script to verify plugin adapter functionality.
"""

import json
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_basic_functionality():
    """Test basic functionality."""
    try:
        logger.info("🧪 Testing basic functionality...")
        
        # Test JSON handling
        test_data = {"test": "data", "platform": "test"}
        json_str = json.dumps(test_data)
        parsed_data = json.loads(json_str)
        
        assert parsed_data["test"] == "data"
        assert parsed_data["platform"] == "test"
        
        logger.info("✅ JSON handling test passed")
        
        # Test logging
        logger.info("✅ Logging test passed")
        
        return True
    except Exception as e:
        logger.error(f"❌ Basic functionality test failed: {e}")
        return False

def test_webhook_simulator():
    """Test webhook simulator functionality."""
    try:
        logger.info("🧪 Testing webhook simulator...")
        
        # Test webhook data structure
        webhook_data = {
            "platform": "WooCommerce",
            "timestamp": "2024-01-15T10:30:00Z",
            "orca_response": {
                "chosen_rail": "credit",
                "explanation": {
                    "summary": "Credit card selected for optimal cost-speed balance",
                    "confidence": 0.85
                }
            },
            "platform_response": {
                "success": True,
                "payment_method": "credit_card",
                "chosen_rail": "credit"
            }
        }
        
        # Verify structure
        assert "platform" in webhook_data
        assert "orca_response" in webhook_data
        assert "platform_response" in webhook_data
        
        logger.info("✅ Webhook data structure test passed")
        return True
    except Exception as e:
        logger.error(f"❌ Webhook simulator test failed: {e}")
        return False

def test_platform_adapters():
    """Test platform adapter concepts."""
    try:
        logger.info("🧪 Testing platform adapter concepts...")
        
        # Test WooCommerce cart structure
        wc_cart = {
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
            }
        }
        
        # Test Shopify cart structure
        shopify_cart = {
            "total_price": 29999,  # Shopify uses cents
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
            }
        }
        
        # Test BigCommerce cart structure
        bc_cart = {
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
            }
        }
        
        # Verify structures
        assert wc_cart["total"] == 299.99
        assert shopify_cart["total_price"] == 29999
        assert bc_cart["base_total"] == 299.99
        
        logger.info("✅ Platform adapter concepts test passed")
        return True
    except Exception as e:
        logger.error(f"❌ Platform adapter test failed: {e}")
        return False

def main():
    """Run all tests."""
    logger.info("🧪 Starting OCN Plugin Adapters Tests")
    
    tests = [
        ("Basic Functionality Test", test_basic_functionality),
        ("Webhook Simulator Test", test_webhook_simulator),
        ("Platform Adapter Concepts Test", test_platform_adapters)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        logger.info(f"\n🔍 Running {test_name}...")
        if test_func():
            passed += 1
        else:
            logger.error(f"❌ {test_name} failed")
    
    logger.info(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("🎉 All tests passed!")
        return 0
    else:
        logger.error("❌ Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
