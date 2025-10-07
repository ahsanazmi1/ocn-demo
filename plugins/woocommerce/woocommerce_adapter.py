"""
WooCommerce Plugin Adapter

OCN plugin adapter for WooCommerce e-commerce platform.
Integrates with Orca MCP negotiateCheckout functionality.
"""

import logging
from typing import Dict, Any, List, Optional
from ..common.base_adapter import BasePluginAdapter

logger = logging.getLogger(__name__)


class WooCommerceAdapter(BasePluginAdapter):
    """
    WooCommerce plugin adapter for OCN integration.
    
    Transforms WooCommerce cart data to Orca MCP format and handles
    the negotiation response back to WooCommerce format.
    """
    
    def __init__(self, orca_endpoint: str = "http://localhost:8080"):
        """
        Initialize the WooCommerce adapter.
        
        Args:
            orca_endpoint: Orca MCP endpoint URL
        """
        super().__init__("WooCommerce", orca_endpoint)
        self.logger = logging.getLogger("ocn.plugin.woocommerce")
    
    def transform_cart_to_orca_request(self, woocommerce_cart: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform WooCommerce cart data to Orca MCP request format.
        
        Args:
            woocommerce_cart: WooCommerce cart data
            
        Returns:
            Orca MCP request dictionary
        """
        try:
            # Extract cart information
            cart_total = float(woocommerce_cart.get('total', 0))
            currency = woocommerce_cart.get('currency', 'USD')
            items = woocommerce_cart.get('items', [])
            
            # Calculate item count
            item_count = sum(item.get('quantity', 1) for item in items)
            
            # Extract customer information
            customer = woocommerce_cart.get('customer', {})
            customer_id = customer.get('id', 'guest')
            customer_email = customer.get('email', '')
            
            # Extract shipping information
            shipping = woocommerce_cart.get('shipping', {})
            shipping_country = shipping.get('country', 'US')
            shipping_method = shipping.get('method', 'standard')
            
            # Extract payment information
            payment_method = woocommerce_cart.get('payment_method', 'card')
            
            # Build Orca MCP request
            orca_request = {
                "cart_summary": {
                    "total_amount": cart_total,
                    "currency": currency,
                    "item_count": item_count,
                    "merchant_id": woocommerce_cart.get('store_id', 'woocommerce_store'),
                    "merchant_category": woocommerce_cart.get('category', 'general'),
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
                    "shipping_method": shipping_method,
                    "payment_method": payment_method,
                    "platform": "woocommerce"
                },
                "deterministic_seed": 42
            }
            
            self.logger.info(f"Transformed WooCommerce cart to Orca request: ${cart_total} {currency}")
            return orca_request
            
        except Exception as e:
            self.logger.error(f"Failed to transform WooCommerce cart: {e}")
            raise
    
    def transform_orca_response_to_platform(self, orca_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform Orca MCP response to WooCommerce format.
        
        Args:
            orca_response: Orca MCP response dictionary
            
        Returns:
            WooCommerce response dictionary
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
            
            # Build WooCommerce response
            woocommerce_response = {
                'success': True,
                'payment_method': self._map_rail_to_woocommerce_payment_method(chosen_rail),
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
            
            self.logger.info(f"Transformed Orca response to WooCommerce format: {chosen_rail}")
            return woocommerce_response
            
        except Exception as e:
            self.logger.error(f"Failed to transform Orca response: {e}")
            raise
    
    def _map_rail_to_woocommerce_payment_method(self, rail_type: str) -> str:
        """
        Map Orca rail type to WooCommerce payment method.
        
        Args:
            rail_type: Orca rail type
            
        Returns:
            WooCommerce payment method
        """
        mapping = {
            'credit': 'credit_card',
            'debit': 'debit_card',
            'ACH': 'bank_transfer',
            'wire': 'wire_transfer'
        }
        return mapping.get(rail_type, 'credit_card')
    
    def get_platform_info(self) -> Dict[str, Any]:
        """
        Get WooCommerce-specific information.
        
        Returns:
            Platform information dictionary
        """
        base_info = super().get_platform_info()
        base_info.update({
            'platform': 'WooCommerce',
            'supported_payment_methods': [
                'credit_card',
                'debit_card', 
                'bank_transfer',
                'wire_transfer'
            ],
            'supported_currencies': ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
            'webhook_events': [
                'checkout_processed',
                'payment_method_selected',
                'orca_negotiation_completed'
            ]
        })
        return base_info

