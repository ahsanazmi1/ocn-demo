"""
Orca MCP Client

Client for communicating with Orca MCP negotiateCheckout endpoint.
"""

import requests
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class OrcaMCPClient:
    """
    Client for Orca MCP negotiateCheckout functionality.
    """
    
    def __init__(self, orca_endpoint: str = "http://localhost:8080"):
        """
        Initialize the Orca MCP client.
        
        Args:
            orca_endpoint: Orca MCP endpoint URL
        """
        self.orca_endpoint = orca_endpoint.rstrip('/')
        self.logger = logging.getLogger("ocn.orca.client")
    
    def negotiate_checkout(self, cart_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Call Orca MCP negotiateCheckout with cart data.
        
        Args:
            cart_data: Cart data in Orca MCP format
            
        Returns:
            Orca MCP response dictionary
        """
        try:
            # Prepare MCP request
            mcp_request = {
                "verb": "negotiateCheckout",
                "args": cart_data
            }
            
            # Call Orca MCP endpoint
            response = requests.post(
                f"{self.orca_endpoint}/mcp/invoke",
                json=mcp_request,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                self.logger.info("Orca MCP negotiation successful")
                return result
            else:
                error_msg = f"Orca MCP failed with status {response.status_code}: {response.text}"
                self.logger.error(error_msg)
                raise Exception(error_msg)
                
        except requests.exceptions.RequestException as e:
            error_msg = f"Orca MCP request failed: {e}"
            self.logger.error(error_msg)
            raise Exception(error_msg)
        except Exception as e:
            error_msg = f"Orca MCP negotiation failed: {e}"
            self.logger.error(error_msg)
            raise
    
    def health_check(self) -> bool:
        """
        Check if Orca MCP endpoint is healthy.
        
        Returns:
            True if healthy, False otherwise
        """
        try:
            response = requests.get(
                f"{self.orca_endpoint}/health",
                timeout=5
            )
            return response.status_code == 200
        except:
            return False
    
    def get_capabilities(self) -> Dict[str, Any]:
        """
        Get Orca MCP capabilities.
        
        Returns:
            Capabilities dictionary
        """
        try:
            response = requests.get(
                f"{self.orca_endpoint}/mcp/capabilities",
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Failed to get capabilities: {response.status_code}"}
                
        except Exception as e:
            return {"error": f"Capabilities request failed: {e}"}

