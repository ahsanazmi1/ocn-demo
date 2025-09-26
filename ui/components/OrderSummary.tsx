'use client'

import { ShoppingCart, Package, DollarSign, CreditCard } from 'lucide-react'

interface DemoResult {
    trace_id: string
    timestamp: string
    orca: any
    okra: any
    opal: any
    orion: any
    oasis: any
    onyx: any
    olive: any
    weave: any
}

interface OrderSummaryProps {
    demoResult: DemoResult
}

export function OrderSummary({ demoResult }: OrderSummaryProps) {
    // Extract order details from Orca result (cart data)
    const cartData = demoResult.orca?.decision?.meta?.cart || {
        items: [
            { sku: "SHIRT-OXF-BLUE-M", description: "Oxford Button-Down Shirt - Blue - Medium", quantity: 15, unit_price: 89.99 },
            { sku: "SHIRT-TEE-BLK-L", description: "Premium Cotton T-Shirt - Black - Large", quantity: 25, unit_price: 79.99 },
            { sku: "SHIRT-POLO-NVY-M", description: "Classic Polo Shirt - Navy - Medium", quantity: 20, unit_price: 85.00 }
        ],
        subtotal: 5049.60,
        tax: 404.40,
        total_amount: 5454.00
    }

    const customerInfo = {
        organization: "Acme Dev LLC",
        loyalty_tier: "Gold",
        customer_type: "B2B"
    }

    const paymentInfo = demoResult.opal?.selection || {}
    const loyaltyDiscount = demoResult.olive?.incentives?.total_discount || 0
    const finalTotal = cartData.total_amount - loyaltyDiscount

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6 text-shirtco-primary" />
                    <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Trace ID: <code className="bg-gray-100 px-2 py-1 rounded">{demoResult.trace_id}</code></span>
                    <span>Completed: {new Date(demoResult.timestamp).toLocaleString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Items */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Order Items
                    </h3>
                    <div className="space-y-3">
                        {cartData.items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.description}</p>
                                    <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                                    <p className="text-sm text-gray-600">Qty: {item.quantity} × ${item.unit_price}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">
                                        ${(item.quantity * item.unit_price).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Totals */}
                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal:</span>
                            <span>${cartData.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Tax:</span>
                            <span>${cartData.tax.toFixed(2)}</span>
                        </div>
                        {loyaltyDiscount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Loyalty Discount (Gold 5%):</span>
                                <span>-${loyaltyDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                            <span>Total:</span>
                            <span>${finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Customer & Payment Info */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Customer & Payment
                    </h3>

                    <div className="space-y-4">
                        {/* Customer Info */}
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Customer</h4>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Organization:</span> {customerInfo.organization}</p>
                                <p><span className="font-medium">Type:</span> {customerInfo.customer_type}</p>
                                <p><span className="font-medium">Loyalty Tier:</span>
                                    <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                        {customerInfo.loyalty_tier}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-semibold text-green-900 mb-2">Payment Method</h4>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Selected:</span> {paymentInfo.selected_method || 'Corporate Visa'}</p>
                                <p><span className="font-medium">Reason:</span> {paymentInfo.reason || 'MCC compliance & rewards optimization'}</p>
                                {paymentInfo.rewards && (
                                    <p><span className="font-medium">Rewards:</span> {paymentInfo.rewards}</p>
                                )}
                            </div>
                        </div>

                        {/* BNPL Quote */}
                        {demoResult.okra?.quote && (
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <h4 className="font-semibold text-purple-900 mb-2">BNPL Quote</h4>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Status:</span> {demoResult.okra.quote.status}</p>
                                    <p><span className="font-medium">Term:</span> {demoResult.okra.quote.term_days || 30} days</p>
                                    <p><span className="font-medium">Rate:</span> {(demoResult.okra.quote.apr || 12.5).toFixed(1)}% APR</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
