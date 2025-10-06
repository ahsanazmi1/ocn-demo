#!/usr/bin/env python3
"""
Webhook Simulator Script

Simple script to simulate webhook endpoints for testing OCN plugin adapters.
"""

import json
import logging
import time
from common.webhook_simulator import WebhookSimulator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """
    Run the webhook simulator.
    """
    logger.info("🚀 Starting OCN Webhook Simulator")
    
    # Create and start webhook simulator
    simulator = WebhookSimulator(port=9000)
    
    try:
        simulator.start_server()
        webhook_url = simulator.get_webhook_url()
        
        logger.info(f"📡 Webhook simulator running at {webhook_url}")
        logger.info(f"🔗 Webhook endpoint: {webhook_url}")
        logger.info(f"📊 Webhook history: http://localhost:9000/webhooks")
        logger.info(f"📋 Status endpoint: http://localhost:9000/")
        logger.info("\n💡 Send POST requests to the webhook endpoint to test")
        logger.info("   Press Ctrl+C to stop the simulator")
        
        # Keep running until interrupted
        try:
            while True:
                time.sleep(1)
                
                # Show webhook count every 10 seconds
                if int(time.time()) % 10 == 0:
                    count = simulator.get_webhook_count()
                    if count > 0:
                        logger.info(f"📊 Total webhooks received: {count}")
                        
        except KeyboardInterrupt:
            logger.info("\n👋 Stopping webhook simulator...")
            
    except Exception as e:
        logger.error(f"❌ Webhook simulator failed: {e}")
        raise
    finally:
        simulator.stop_server()


if __name__ == "__main__":
    main()

