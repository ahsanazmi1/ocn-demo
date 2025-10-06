#!/usr/bin/env python3
"""
OCN Plugin Adapters Demo

Demonstrates the OCN plugin adapters for WooCommerce, Shopify, and BigCommerce
with Orca MCP negotiateCheckout integration and webhook publishing.
"""

import json
import logging
import time
from typing import Dict, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import plugin adapters
from woocommerce.woocommerce_adapter import WooCommerceAdapter
from shopify.shopify_adapter import ShopifyAdapter
from bigcommerce.bigcommerce_adapter import BigCommerceAdapter
from common.webhook_simulator import WebhookSimulator


def create_sample_carts() -> Dict[str, Dict[str, Any]]:
    """
    Create sample cart data for each platform.
    
    Returns:
        Dictionary of sample cart data for each platform
    """
    return {
        'woocommerce': {
            'total': 299.99,
            'currency': 'USD',
            'items': [
                {
                    'id': 'WC-001',
                    'name': 'Premium Headphones',
                    'quantity': 1,
                    'price': 199.99
                },
                {
                    'id': 'WC-002', 
                    'name': 'Wireless Charger',
                    'quantity': 2,
                    'price': 50.00
                }
            ],
            'customer': {
                'id': 'customer_123',
                'email': 'customer@example.com'
            },
            'shipping': {
                'country': 'US',
                'method': 'standard'
            },
            'payment_method': 'card',
            'store_id': 'woocommerce_store_001',
            'category': 'electronics'
        },
        
        'shopify': {
            'total_price': 29999,  # Shopify uses cents
            'currency': 'USD',
            'line_items': [
                {
                    'id': 'SH-001',
                    'title': 'Premium Headphones',
                    'quantity': 1,
                    'price': 19999
                },
                {
                    'id': 'SH-002',
                    'title': 'Wireless Charger', 
                    'quantity': 2,
                    'price': 5000
                }
            ],
            'customer': {
                'id': 'customer_456',
                'email': 'customer@shopify-store.com'
            },
            'shipping_address': {
                'country_code': 'US'
            },
            'shop_domain': 'demo-shopify-store.myshopify.com',
            'category': 'electronics'
        },
        
        'bigcommerce': {
            'base_total': 299.99,
            'currency': 'USD',
            'line_items': {
                'physical_items': [
                    {
                        'id': 'BC-001',
                        'name': 'Premium Headphones',
                        'quantity': 1,
                        'sale_price': 199.99
                    },
                    {
                        'id': 'BC-002',
                        'name': 'Wireless Charger',
                        'quantity': 2,
                        'sale_price': 50.00
                    }
                ]
            },
            'customer': {
                'id': 'customer_789',
                'email': 'customer@bigcommerce-store.com'
            },
            'shipping_addresses': [
                {
                    'country_iso2': 'US'
                }
            ],
            'store_hash': 'bigcommerce_store_001',
            'category': 'electronics'
        }
    }


def run_plugin_demo():
    """
    Run the plugin adapter demo.
    """
    logger.info("🚀 Starting OCN Plugin Adapters Demo")
    
    # Create webhook simulator
    webhook_simulator = WebhookSimulator(port=9000)
    
    try:
        # Start webhook simulator
        webhook_simulator.start_server()
        webhook_url = webhook_simulator.get_webhook_url()
        logger.info(f"📡 Webhook simulator running at {webhook_url}")
        
        # Create plugin adapters
        adapters = {
            'WooCommerce': WooCommerceAdapter(),
            'Shopify': ShopifyAdapter(),
            'BigCommerce': BigCommerceAdapter()
        }
        
        # Get sample cart data
        sample_carts = create_sample_carts()
        
        # Process each platform
        for platform_name, adapter in adapters.items():
            logger.info(f"\n🔄 Processing {platform_name} checkout...")
            
            # Get platform-specific cart data
            platform_key = platform_name.lower()
            cart_data = sample_carts[platform_key]
            
            # Process checkout through Orca negotiation
            result = adapter.process_checkout(cart_data, webhook_url)
            
            if result['success']:
                logger.info(f"✅ {platform_name} checkout processed successfully")
                logger.info(f"   Chosen rail: {result['platform_response']['chosen_rail']}")
                logger.info(f"   Explanation: {result['platform_response']['explanation']['summary']}")
            else:
                logger.error(f"❌ {platform_name} checkout failed: {result['error']}")
            
            # Small delay between platforms
            time.sleep(1)
        
        # Wait for webhooks to be processed
        logger.info("\n⏳ Waiting for webhooks to be processed...")
        time.sleep(2)
        
        # Display webhook results
        webhooks = webhook_simulator.get_webhooks()
        logger.info(f"\n📊 Webhook Results ({len(webhooks)} received):")
        
        for i, webhook in enumerate(webhooks, 1):
            platform = webhook.get('platform', 'Unknown')
            timestamp = webhook.get('timestamp', 'Unknown')
            logger.info(f"   {i}. {platform} - {timestamp}")
        
        # Display webhook history URL
        logger.info(f"\n🔗 View webhook history: http://localhost:9000/webhooks")
        
        # Keep server running for manual testing
        logger.info(f"\n🎯 Demo completed! Webhook simulator running at http://localhost:9000")
        logger.info("   Press Ctrl+C to stop the simulator")
        
        # Keep running until interrupted
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("\n👋 Stopping webhook simulator...")
            
    except Exception as e:
        logger.error(f"❌ Demo failed: {e}")
        raise
    finally:
        webhook_simulator.stop_server()


if __name__ == "__main__":
    run_plugin_demo()