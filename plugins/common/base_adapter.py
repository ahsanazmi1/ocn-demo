"""
Base Plugin Adapter

Abstract base class for OCN plugin adapters that integrate with e-commerce platforms.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class BasePluginAdapter(ABC):
    """
    Abstract base class for OCN plugin adapters.
    
    Provides common functionality for integrating with e-commerce platforms
    and calling Orca MCP negotiateCheckout.
    """
    
    def __init__(self, platform_name: str, orca_endpoint: str = "http://localhost:8080"):
        """
        Initialize the plugin adapter.
        
        Args:
            platform_name: Name of the e-commerce platform
            orca_endpoint: Orca MCP endpoint URL
        """
        self.platform_name = platform_name
        self.orca_endpoint = orca_endpoint
        self.logger = logging.getLogger(f"ocn.plugin.{platform_name.lower()}")
    
    @abstractmethod
    def transform_cart_to_orca_request(self, platform_cart: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform platform-specific cart data to Orca MCP request format.
        
        Args:
            platform_cart: Platform-specific cart data
            
        Returns:
            Orca MCP request dictionary
        """
        pass
    
    @abstractmethod
    def transform_orca_response_to_platform(self, orca_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform Orca MCP response to platform-specific format.
        
        Args:
            orca_response: Orca MCP response dictionary
            
        Returns:
            Platform-specific response dictionary
        """
        pass
    
    def call_orca_negotiate_checkout(self, cart_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Call Orca MCP negotiateCheckout with the provided cart data.
        
        Args:
            cart_data: Cart data in Orca MCP format
            
        Returns:
            Orca MCP response dictionary
        """
        try:
            # Import here to avoid circular imports
            from .orca_client import OrcaMCPClient
            
            client = OrcaMCPClient(self.orca_endpoint)
            response = client.negotiate_checkout(cart_data)
            
            self.logger.info(f"Orca negotiation completed for {self.platform_name}")
            return response
            
        except Exception as e:
            self.logger.error(f"Orca negotiation failed: {e}")
            raise
    
    def publish_to_webhook(self, webhook_url: str, data: Dict[str, Any]) -> bool:
        """
        Publish data to a webhook endpoint.
        
        Args:
            webhook_url: Webhook endpoint URL
            data: Data to publish
            
        Returns:
            True if successful, False otherwise
        """
        try:
            import requests
            
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': f'OCN-{self.platform_name}-Plugin/1.0'
            }
            
            response = requests.post(
                webhook_url,
                json=data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                self.logger.info(f"Webhook published successfully to {webhook_url}")
                return True
            else:
                self.logger.error(f"Webhook failed with status {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Webhook publishing failed: {e}")
            return False
    
    def process_checkout(self, platform_cart: Dict[str, Any], webhook_url: Optional[str] = None) -> Dict[str, Any]:
        """
        Process a checkout request through Orca negotiation.
        
        Args:
            platform_cart: Platform-specific cart data
            webhook_url: Optional webhook URL to publish results
            
        Returns:
            Processing result dictionary
        """
        try:
            # Transform cart to Orca format
            orca_request = self.transform_cart_to_orca_request(platform_cart)
            
            # Call Orca negotiation
            orca_response = self.call_orca_negotiate_checkout(orca_request)
            
            # Transform response to platform format
            platform_response = self.transform_orca_response_to_platform(orca_response)
            
            # Publish to webhook if provided
            if webhook_url:
                webhook_data = {
                    'platform': self.platform_name,
                    'timestamp': datetime.now().isoformat(),
                    'orca_response': orca_response,
                    'platform_response': platform_response
                }
                self.publish_to_webhook(webhook_url, webhook_data)
            
            return {
                'success': True,
                'platform': self.platform_name,
                'orca_response': orca_response,
                'platform_response': platform_response,
                'webhook_published': webhook_url is not None
            }
            
        except Exception as e:
            self.logger.error(f"Checkout processing failed: {e}")
            return {
                'success': False,
                'platform': self.platform_name,
                'error': str(e),
                'webhook_published': False
            }
    
    def get_platform_info(self) -> Dict[str, Any]:
        """
        Get platform-specific information.
        
        Returns:
            Platform information dictionary
        """
        return {
            'platform': self.platform_name,
            'orca_endpoint': self.orca_endpoint,
            'version': '1.0.0',
            'capabilities': [
                'orca_negotiation',
                'webhook_publishing',
                'cart_transformation'
            ]
        }

