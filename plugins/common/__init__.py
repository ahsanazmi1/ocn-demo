"""
OCN Plugin Adapters - Common Utilities

This module provides common utilities and base classes for OCN plugin adapters
that integrate with e-commerce platforms like WooCommerce, Shopify, and BigCommerce.
"""

from .base_adapter import BasePluginAdapter
from .orca_client import OrcaMCPClient
from .webhook_simulator import WebhookSimulator

__all__ = [
    'BasePluginAdapter',
    'OrcaMCPClient', 
    'WebhookSimulator'
]

