#!/usr/bin/env python3
"""
Webhook Simulator Script

Simple script to simulate webhook endpoints for testing OCN plugin adapters.
"""

import json
import logging
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class WebhookHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.webhooks = []
        super().__init__(*args, **kwargs)
    
    def do_POST(self):
        """Handle POST requests (webhook calls)."""
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data
            webhook_data = json.loads(post_data.decode('utf-8'))
            
            # Add metadata
            webhook_data['_metadata'] = {
                'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ'),
                'headers': dict(self.headers),
                'path': self.path,
                'method': 'POST'
            }
            
            # Store webhook data
            self.webhooks.append(webhook_data)
            
            # Log the webhook
            platform = webhook_data.get('platform', 'Unknown')
            logger.info(f"Received webhook: {platform}")
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response = {
                'status': 'success',
                'message': 'Webhook received',
                'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ')
            }
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            logger.error(f"Webhook processing failed: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            error_response = {
                'status': 'error',
                'message': str(e),
                'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ')
            }
            
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def do_GET(self):
        """Handle GET requests (webhook history)."""
        if self.path == '/webhooks':
            # Return webhook history
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response = {
                'webhooks': self.webhooks,
                'count': len(self.webhooks),
                'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ')
            }
            
            self.wfile.write(json.dumps(response, indent=2).encode('utf-8'))
        else:
            # Return status
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            status = {
                'status': 'running',
                'port': 9000,
                'webhook_count': len(self.webhooks),
                'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ')
            }
            
            self.wfile.write(json.dumps(status, indent=2).encode('utf-8'))
    
    def log_message(self, format, *args):
        """Override to use our logger."""
        logger.info(f"{self.address_string()} - {format % args}")

def main():
    """Run the webhook simulator."""
    logger.info("🚀 Starting OCN Webhook Simulator")
    
    try:
        # Create server
        server = HTTPServer(('localhost', 9000), WebhookHandler)
        
        logger.info("📡 Webhook simulator running at http://localhost:9000")
        logger.info("🔗 Webhook endpoint: http://localhost:9000/webhook")
        logger.info("📊 Webhook history: http://localhost:9000/webhooks")
        logger.info("📋 Status endpoint: http://localhost:9000/")
        logger.info("\n💡 Send POST requests to the webhook endpoint to test")
        logger.info("   Press Ctrl+C to stop the simulator")
        
        # Start server
        server.serve_forever()
        
    except KeyboardInterrupt:
        logger.info("\n👋 Stopping webhook simulator...")
        server.shutdown()
    except Exception as e:
        logger.error(f"❌ Webhook simulator failed: {e}")
        raise

if __name__ == "__main__":
    main()
