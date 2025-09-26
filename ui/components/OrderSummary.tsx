'use client';

interface OrderSummaryProps {
  cart: {
    currency: string;
    items: Array<{
      sku: string;
      name: string;
      qty: number;
      unit_price: number;
    }>;
    total: number;
  };
}

export default function OrderSummary({ cart }: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
      <div className="space-y-3">
        {cart.items.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-800">{item.name}</p>
              <p className="text-sm text-gray-500">SKU: {item.sku}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-800">
                {cart.currency} {item.unit_price.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Qty: {item.qty}</p>
            </div>
          </div>
        ))}
        <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
          <p className="text-lg font-bold text-gray-800">Total</p>
          <p className="text-lg font-bold text-gray-800">
            {cart.currency} {cart.total.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}