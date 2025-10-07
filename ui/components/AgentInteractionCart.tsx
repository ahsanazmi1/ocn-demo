import React from 'react';
import { Cart } from '../src/demos/agent/types';

interface AgentInteractionCartProps {
  cart: Cart;
}

const AgentInteractionCart: React.FC<AgentInteractionCartProps> = ({ cart }) => {
  return (
    <div className="h-full bg-white rounded-lg shadow-ocn-8 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-ocn-dark">Shopping Cart</h2>
        <div className="px-3 py-1 bg-ocn-aqua text-ocn-dark rounded-full text-sm font-medium">
          {cart.items.length} items
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {cart.items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-ocn-light rounded-lg border border-gray-100">
            <div className="flex-1">
              <h3 className="font-medium text-ocn-dark">{item.name}</h3>
              <p className="text-sm text-ocn-medium">SKU: {item.sku}</p>
            </div>
            <div className="text-right">
              <div className="font-semibold text-ocn-dark">
                ${item.price.toFixed(2)}
              </div>
              <div className="text-sm text-ocn-medium">
                Qty: {item.qty}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between text-ocn-medium">
          <span>Subtotal</span>
          <span>${cart.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-ocn-medium">
          <span>Tax</span>
          <span>${cart.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold text-ocn-dark border-t border-gray-200 pt-3">
          <span>Total</span>
          <span>${cart.total.toFixed(2)} {cart.currency}</span>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-ocn-purple to-ocn-aqua rounded-lg">
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

export default AgentInteractionCart;
