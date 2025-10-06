"""
BigCommerce Plugin Adapter

OCN plugin adapter for BigCommerce e-commerce platform.
Integrates with Orca MCP negotiateCheckout functionality.
"""

import logging
from typing import Dict, Any, List, Optional
from ..common.base_adapter import BasePluginAdapter

logger = logging.getLogger(__name__)


class BigCommerceAdapter(BasePluginAdapter):
    """
    BigCommerce plugin adapter for OCN integration.
    
    Transforms BigCommerce cart data to Orca MCP format and handles
    the negotiation response back to BigCommerce format.
    """
    
    def __init__(self, orca_endpoint: str = "http://localhost:8080"):
        """
        Initialize the BigCommerce adapter.
        
        Args:
            orca_endpoint: Orca MCP endpoint URL
        """
        super().__init__("BigCommerce", orca_endpoint)
        self.logger = logging.getLogger("ocn.plugin.bigcommerce")
    
    def transform_cart_to_orca_request(self, bigcommerce_cart: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform BigCommerce cart data to Orca MCP request format.
        
        Args:
            bigcommerce_cart: BigCommerce cart data
            
        Returns:
            Orca MCP request dictionary
        """
        try:
            # Extract cart information
            cart_total = float(bigcommerce_cart.get('base_total', 0))
            currency = bigcommerce_cart.get('currency', 'USD')
            line_items = bigcommerce_cart.get('line_items', {}).get('physical_items', [])
            
            # Calculate item count
            item_count = sum(item.get('quantity', 1) for item in line_items)
            
            # Extract customer information
            customer = bigcommerce_cart.get('customer', {})
            customer_id = customer.get('id', 'guest')
            customer_email = customer.get('email', '')
            
            # Extract shipping information
            shipping_address = bigcommerce_cart.get('shipping_addresses', [{}])[0]
            shipping_country = shipping_address.get('country_iso2', 'US')
            
            # Extract store information
            store_hash = bigcommerce_cart.get('store_hash', 'bigcommerce-store')
            
            # Build Orca MCP request
            orca_request = {
                "cart_summary": {
                    "total_amount": cart_total,
                    "currency": currency,
                    "item_count": item_count,
                    "merchant_id": store_hash,
                    "merchant_category": bigcommerce_cart.get('category', 'general'),
                    "channel": "online"
                },
                "rail_candidates": [
                    {
                        "rail_type": "credit",
                        "base_cost_bps": 150.0,
                        "settlement_days": 1,
                        "risk_score": 0.3
                    },
                    {
                        "rail_type": "debit",
                        "base_cost_bps": 100.0,
                        "settlement_days": 2,
                        "risk_score": 0.2
                    },
                    {
                        "rail_type": "ACH",
                        "base_cost_bps": 50.0,
                        "settlement_days": 1,
                        "risk_score": 0.1
                    }
                ],
                "customer_context": {
                    "customer_id": customer_id,
                    "email": customer_email,
                    "shipping_country": shipping_country,
                    "platform": "bigcommerce",
                    "store_hash": store_hash
                },
                "deterministic_seed": 42
            }
            
            self.logger.info(f"Transformed BigCommerce cart to Orca request: ${cart_total} {currency}")
            return orca_request
            
        except Exception as e:
            self.logger.error(f"Failed to transform BigCommerce cart: {e}")
            raise
    
    def transform_orca_response_to_platform(self, orca_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform Orca MCP response to BigCommerce format.
        
        Args:
            orca_response: Orca MCP response dictionary
            
        Returns:
            BigCommerce response dictionary
        """
        try:
            # Extract Orca response data
            chosen_rail = orca_response.get('chosen_rail', 'credit')
            explanation = orca_response.get('explanation', {})
            rail_evaluations = orca_response.get('rail_evaluations', [])
            
            # Find the chosen rail evaluation
            chosen_rail_data = None
            for rail in rail_evaluations:
                if rail.get('rail_type') == chosen_rail:
                    chosen_rail_data = rail
                    break
            
            # Build BigCommerce response
            bigcommerce_response = {
                'success': True,
                'payment_provider': self._map_rail_to_bigcommerce_provider(chosen_rail),
                'chosen_rail': chosen_rail,
                'explanation': {
                    'summary': explanation.get('summary', ''),
                    'reasoning': explanation.get('reasoning', ''),
                    'confidence': explanation.get('confidence', 0.0),
                    'key_signals': explanation.get('key_signals', [])
                },
                'rail_details': {
                    'cost_score': chosen_rail_data.get('cost_score', 0.0) if chosen_rail_data else 0.0,
                    'speed_score': chosen_rail_data.get('speed_score', 0.0) if chosen_rail_data else 0.0,
                    'risk_score': chosen_rail_data.get('risk_score', 0.0) if chosen_rail_data else 0.0,
                    'final_score': chosen_rail_data.get('final_score', 0.0) if chosen_rail_data else 0.0
                },
                'all_rails': [
                    {
                        'rail_type': rail.get('rail_type'),
                        'final_score': rail.get('final_score', 0.0),
                        'cost_score': rail.get('cost_score', 0.0),
                        'speed_score': rail.get('speed_score', 0.0),
                        'risk_score': rail.get('risk_score', 0.0)
                    }
                    for rail in rail_evaluations
                ],
                'timestamp': orca_response.get('timestamp', ''),
                'trace_id': orca_response.get('trace_id', '')
            }
            
            self.logger.info(f"Transformed Orca response to BigCommerce format: {chosen_rail}")
            return bigcommerce_response
            
        except Exception as e:
            self.logger.error(f"Failed to transform Orca response: {e}")
            raise
    
    def _map_rail_to_bigcommerce_provider(self, rail_type: str) -> str:
        """
        Map Orca rail type to BigCommerce payment provider.
        
        Args:
            rail_type: Orca rail type
            
        Returns:
            BigCommerce payment provider
        """
        mapping = {
            'credit': 'stripe',
            'debit': 'stripe',
            'ACH': 'square',
            'wire': 'manual'
        }
        return mapping.get(rail_type, 'stripe')
    
    def get_platform_info(self) -> Dict[str, Any]:
        """
        Get BigCommerce-specific information.
        
        Returns:
            Platform information dictionary
        """
        base_info = super().get_platform_info()
        base_info.update({
            'platform': 'BigCommerce',
            'supported_providers': [
                'stripe',
                'square',
                'paypal',
                'manual'
            ],
            'supported_currencies': ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
            'webhook_events': [
                'checkout_created',
                'checkout_updated',
                'payment_method_selected',
                'orca_negotiation_completed'
            ]
        })
        return base_info

