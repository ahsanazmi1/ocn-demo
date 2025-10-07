'use client';

interface AuctionResultsProps {
    auctionData?: any;
    error?: string;
}

export default function AuctionResults({ auctionData, error }: AuctionResultsProps) {
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Auction Error</h3>
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    if (!auctionData) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600">No auction data available</p>
            </div>
        );
    }

    const sortedBids = auctionData.all_bids?.sort((a: any, b: any) => 
        a.effective_cost_bps - b.effective_cost_bps
    ) || [];

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🌊 Weave Processor Auction Results</h3>
            
            {/* Auction Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-semibold text-blue-800">Auction Winner</h4>
                        <p className="text-blue-700">
                            <strong>{auctionData.winning_processor?.toUpperCase()}</strong> won with{' '}
                            <strong>{auctionData.effective_cost_bps?.toFixed(1)} bps</strong> effective cost
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-blue-600">Auction ID</p>
                        <p className="text-xs text-blue-500 font-mono">{auctionData.auction_id}</p>
                    </div>
                </div>
            </div>

            {/* Processor Comparison Table */}
            <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Processor Bids Comparison</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rank
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Processor
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Base Cost (bps)
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rebate (bps)
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Effective Cost (bps)
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Settlement (days)
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Confidence
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedBids.map((bid: any, index: number) => (
                                <tr 
                                    key={bid.processor_id} 
                                    className={index === 0 ? 'bg-green-50 border-l-4 border-green-400' : ''}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {index + 1}
                                        {index === 0 && <span className="ml-2 text-green-600">🏆</span>}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {bid.processor_id?.toUpperCase()}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {bid.bps?.toFixed(1)}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {bid.rebate_bps?.toFixed(1)}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        {bid.effective_cost_bps?.toFixed(1)}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {bid.expected_settlement_days}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {(bid.confidence * 100)?.toFixed(0)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Winning Bid Details */}
            {auctionData.winning_bid && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold text-green-800 mb-3">Winning Bid Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-green-700">
                                <strong>Processor:</strong> {auctionData.winning_bid.processor_id?.toUpperCase()}
                            </p>
                            <p className="text-sm text-green-700">
                                <strong>Base Cost:</strong> {auctionData.winning_bid.bps?.toFixed(1)} bps
                            </p>
                            <p className="text-sm text-green-700">
                                <strong>Rebate:</strong> {auctionData.winning_bid.rebate_bps?.toFixed(1)} bps
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-green-700">
                                <strong>Effective Cost:</strong> {auctionData.winning_bid.effective_cost_bps?.toFixed(1)} bps
                            </p>
                            <p className="text-sm text-green-700">
                                <strong>Settlement:</strong> {auctionData.winning_bid.expected_settlement_days} day(s)
                            </p>
                            <p className="text-sm text-green-700">
                                <strong>Confidence:</strong> {(auctionData.winning_bid.confidence * 100)?.toFixed(0)}%
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* LLM Summary */}
            {auctionData.summary && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Auction Summary</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{auctionData.summary}</p>
                </div>
            )}

            {/* Processor Constraints */}
            {auctionData.winning_bid?.constraints && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-yellow-800 mb-3">Processor Constraints</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-yellow-700">
                                <strong>Min Amount:</strong> ${auctionData.winning_bid.constraints.min_amount}
                            </p>
                            <p className="text-sm text-yellow-700">
                                <strong>Max Amount:</strong> ${auctionData.winning_bid.constraints.max_amount}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-yellow-700">
                                <strong>Risk Tolerance:</strong> {auctionData.winning_bid.constraints.risk_tolerance}
                            </p>
                            <p className="text-sm text-yellow-700">
                                <strong>Supported Currencies:</strong> {auctionData.winning_bid.constraints.supported_currencies?.join(', ')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

