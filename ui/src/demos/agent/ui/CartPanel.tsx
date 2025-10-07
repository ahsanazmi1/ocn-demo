'use client';

import React from 'react';
import { Cart } from '../types';
import { COLORS } from '../constants';

interface CartPanelProps {
  cart: Cart;
  onCheckout: () => void;
  isProcessing?: boolean;
}

const CartPanel: React.FC<CartPanelProps> = ({ cart, onCheckout, isProcessing = false }) => {
  return (
    <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold" style={{ color: COLORS.dark }}>
          Shopping Cart
        </h2>
        <div 
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{ 
            backgroundColor: COLORS.light, 
            color: COLORS.dark 
          }}
        >
          {cart.items.length} items
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {cart.items.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-4 rounded-lg border"
            style={{ 
              backgroundColor: COLORS.light,
              borderColor: '#E5E7EB'
            }}
          >
            <div className="flex-1">
              <h3 className="font-medium" style={{ color: COLORS.dark }}>
                {item.name}
              </h3>
              <p className="text-sm" style={{ color: COLORS.medium }}>
                SKU: {item.sku}
              </p>
            </div>
            <div className="text-right">
              <div className="font-semibold" style={{ color: COLORS.dark }}>
                ${item.price.toFixed(2)}
              </div>
              <div className="text-sm" style={{ color: COLORS.medium }}>
                Qty: {item.qty}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between text-sm" style={{ color: COLORS.medium }}>
          <span>Subtotal</span>
          <span>${cart.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-3" style={{ color: COLORS.dark }}>
          <span>Total</span>
          <span>${cart.total.toFixed(2)} {cart.currency}</span>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={onCheckout}
          disabled={isProcessing}
          className="w-full py-3 px-4 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: isProcessing ? COLORS.medium : COLORS.purple 
          }}
          onMouseEnter={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.backgroundColor = COLORS.dark;
            }
          }}
          onMouseLeave={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.backgroundColor = COLORS.purple;
            }
          }}
        >
          {isProcessing ? 'Processing...' : 'Checkout'}
        </button>
      </div>

      <div 
        className="mt-4 p-4 rounded-lg"
        style={{ 
          background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.aqua})`
        }}
      >
        <div className="text-white text-center">
          <div className="font-semibold mb-1">Agent Interaction Demo</div>
          <div className="text-sm opacity-90">
            Watch agents process this transaction in real-time
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPanel;
