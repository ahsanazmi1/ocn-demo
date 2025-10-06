"""
Webhook Simulator

Simulates webhook endpoints for testing plugin adapters.
"""

import json
import logging
from typing import Dict, Any, List
from datetime import datetime
import threading
import time

logger = logging.getLogger(__name__)


class WebhookSimulator:
    """
    Simulates webhook endpoints for testing OCN plugin adapters.
    """
    
    def __init__(self, port: int = 9000):
        """
        Initialize the webhook simulator.
        
        Args:
            port: Port to run the simulator on
        """
        self.port = port
        self.received_webhooks: List[Dict[str, Any]] = []
        self.logger = logging.getLogger("ocn.webhook.simulator")
        self.server = None
        self.server_thread = None
    
    def start_server(self):
        """Start the webhook simulator server."""
        try:
            from http.server import HTTPServer, BaseHTTPRequestHandler
            import urllib.parse
            
            class WebhookHandler(BaseHTTPRequestHandler):
                def __init__(self, simulator, *args, **kwargs):
                    self.simulator = simulator
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
                            'timestamp': datetime.now().isoformat(),
                            'headers': dict(self.headers),
                            'path': self.path,
                            'method': 'POST'
                        }
                        
                        # Store webhook data
                        self.simulator.received_webhooks.append(webhook_data)
                        
                        # Log the webhook
                        self.simulator.logger.info(f"Received webhook: {webhook_data.get('platform', 'unknown')}")
                        
                        # Send response
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        
                        response = {
                            'status': 'success',
                            'message': 'Webhook received',
                            'timestamp': datetime.now().isoformat()
                        }
                        
                        self.wfile.write(json.dumps(response).encode('utf-8'))
                        
                    except Exception as e:
                        self.simulator.logger.error(f"Webhook processing failed: {e}")
                        self.send_response(500)
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        
                        error_response = {
                            'status': 'error',
                            'message': str(e),
                            'timestamp': datetime.now().isoformat()
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
                            'webhooks': self.simulator.received_webhooks,
                            'count': len(self.simulator.received_webhooks),
                            'timestamp': datetime.now().isoformat()
                        }
                        
                        self.wfile.write(json.dumps(response, indent=2).encode('utf-8'))
                    else:
                        # Return status
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        
                        status = {
                            'status': 'running',
                            'port': self.simulator.port,
                            'webhook_count': len(self.simulator.received_webhooks),
                            'timestamp': datetime.now().isoformat()
                        }
                        
                        self.wfile.write(json.dumps(status, indent=2).encode('utf-8'))
                
                def log_message(self, format, *args):
                    """Override to use our logger."""
                    self.simulator.logger.info(f"{self.address_string()} - {format % args}")
            
            # Create server
            def handler(*args, **kwargs):
                return WebhookHandler(self, *args, **kwargs)
            
            self.server = HTTPServer(('localhost', self.port), handler)
            
            # Start server in a separate thread
            def run_server():
                self.logger.info(f"Webhook simulator starting on port {self.port}")
                self.server.serve_forever()
            
            self.server_thread = threading.Thread(target=run_server, daemon=True)
            self.server_thread.start()
            
            # Wait a moment for server to start
            time.sleep(0.1)
            
            self.logger.info(f"Webhook simulator running at http://localhost:{self.port}")
            
        except Exception as e:
            self.logger.error(f"Failed to start webhook simulator: {e}")
            raise
    
    def stop_server(self):
        """Stop the webhook simulator server."""
        if self.server:
            self.server.shutdown()
            self.server.server_close()
            self.logger.info("Webhook simulator stopped")
    
    def get_webhook_url(self) -> str:
        """
        Get the webhook URL for this simulator.
        
        Returns:
            Webhook URL
        """
        return f"http://localhost:{self.port}/webhook"
    
    def get_webhooks(self) -> List[Dict[str, Any]]:
        """
        Get all received webhooks.
        
        Returns:
            List of webhook data
        """
        return self.received_webhooks.copy()
    
    def clear_webhooks(self):
        """Clear all received webhooks."""
        self.received_webhooks.clear()
        self.logger.info("Webhook history cleared")
    
    def get_webhook_count(self) -> int:
        """
        Get the number of received webhooks.
        
        Returns:
            Number of webhooks
        """
        return len(self.received_webhooks)
    
    def get_latest_webhook(self) -> Optional[Dict[str, Any]]:
        """
        Get the latest received webhook.
        
        Returns:
            Latest webhook data or None
        """
        if self.received_webhooks:
            return self.received_webhooks[-1]
        return None

