#!/usr/bin/env python3
"""
Test Script for OCN Plugin Adapters

Simple test script to verify plugin adapter functionality.
"""

import json
import logging
import sys
from typing import Dict, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_imports():
    """Test that all modules can be imported."""
    try:
        from woocommerce.woocommerce_adapter import WooCommerceAdapter
        from shopify.shopify_adapter import ShopifyAdapter
        from bigcommerce.bigcommerce_adapter import BigCommerceAdapter
        from common.webhook_simulator import WebhookSimulator
        from common.orca_client import OrcaMCPClient
        
        logger.info("✅ All modules imported successfully")
        return True
    except ImportError as e:
        logger.error(f"❌ Import failed: {e}")
        return False


def test_adapters():
    """Test adapter instantiation and basic functionality."""
    try:
        from woocommerce.woocommerce_adapter import WooCommerceAdapter
        from shopify.shopify_adapter import ShopifyAdapter
        from bigcommerce.bigcommerce_adapter import BigCommerceAdapter
        
        # Test WooCommerce adapter
        wc_adapter = WooCommerceAdapter()
        wc_info = wc_adapter.get_platform_info()
        logger.info(f"✅ WooCommerce adapter: {wc_info['platform']}")
        
        # Test Shopify adapter
        shopify_adapter = ShopifyAdapter()
        shopify_info = shopify_adapter.get_platform_info()
        logger.info(f"✅ Shopify adapter: {shopify_info['platform']}")
        
        # Test BigCommerce adapter
        bc_adapter = BigCommerceAdapter()
        bc_info = bc_adapter.get_platform_info()
        logger.info(f"✅ BigCommerce adapter: {bc_info['platform']}")
        
        return True
    except Exception as e:
        logger.error(f"❌ Adapter test failed: {e}")
        return False


def test_webhook_simulator():
    """Test webhook simulator functionality."""
    try:
        from common.webhook_simulator import WebhookSimulator
        
        # Create simulator
        simulator = WebhookSimulator(port=9001)
        
        # Test basic functionality
        webhook_url = simulator.get_webhook_url()
        logger.info(f"✅ Webhook simulator URL: {webhook_url}")
        
        # Test webhook count
        count = simulator.get_webhook_count()
        logger.info(f"✅ Webhook count: {count}")
        
        return True
    except Exception as e:
        logger.error(f"❌ Webhook simulator test failed: {e}")
        return False


def test_orca_client():
    """Test Orca MCP client functionality."""
    try:
        from common.orca_client import OrcaMCPClient
        
        # Create client
        client = OrcaMCPClient()
        
        # Test health check (may fail if Orca is not running)
        health = client.health_check()
        if health:
            logger.info("✅ Orca MCP client: Orca agent is healthy")
        else:
            logger.info("⚠️  Orca MCP client: Orca agent is not running (expected in test)")
        
        return True
    except Exception as e:
        logger.error(f"❌ Orca client test failed: {e}")
        return False


def test_cart_transformation():
    """Test cart data transformation."""
    try:
        from woocommerce.woocommerce_adapter import WooCommerceAdapter
        
        # Create sample cart
        sample_cart = {
            'total': 100.00,
            'currency': 'USD',
            'items': [
                {
                    'id': 'WC-001',
                    'name': 'Test Product',
                    'quantity': 1,
                    'price': 100.00
                }
            ],
            'customer': {
                'id': 'test_customer',
                'email': 'test@example.com'
            },
            'shipping': {
                'country': 'US',
                'method': 'standard'
            },
            'payment_method': 'card',
            'store_id': 'test_store',
            'category': 'test'
        }
        
        # Test transformation
        adapter = WooCommerceAdapter()
        orca_request = adapter.transform_cart_to_orca_request(sample_cart)
        
        # Verify transformation
        assert 'cart_summary' in orca_request
        assert 'rail_candidates' in orca_request
        assert 'customer_context' in orca_request
        
        logger.info("✅ Cart transformation test passed")
        return True
    except Exception as e:
        logger.error(f"❌ Cart transformation test failed: {e}")
        return False


def main():
    """Run all tests."""
    logger.info("🧪 Starting OCN Plugin Adapters Tests")
    
    tests = [
        ("Import Test", test_imports),
        ("Adapter Test", test_adapters),
        ("Webhook Simulator Test", test_webhook_simulator),
        ("Orca Client Test", test_orca_client),
        ("Cart Transformation Test", test_cart_transformation)
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

