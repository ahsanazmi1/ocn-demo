'use client';

interface SettlementPathProps {
    settlementData?: any;
    olivePolicyError?: string;
    onyxTrustError?: string;
}

export default function SettlementPath({ settlementData, olivePolicyError, onyxTrustError }: SettlementPathProps) {
    if (olivePolicyError || onyxTrustError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Settlement Errors</h3>
                {olivePolicyError && <p className="text-red-700">Olive Policy: {olivePolicyError}</p>}
                {onyxTrustError && <p className="text-red-700">Onyx Trust: {onyxTrustError}</p>}
            </div>
        );
    }

    if (!settlementData) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600">No settlement data available</p>
            </div>
        );
    }

    const olivePolicy = settlementData.olive_policy?.data;
    const onyxTrust = settlementData.onyx_trust?.data;
    const final = settlementData.final;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Final Settlement Path</h3>
            
            {/* Original vs Final Comparison */}
            {final && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold text-blue-800 mb-3">Settlement Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h5 className="font-semibold text-blue-700 mb-2">Original Path</h5>
                            <p className="text-sm text-blue-600">
                                <strong>Rail:</strong> {final.original_rail}
                            </p>
                            <p className="text-sm text-blue-600">
                                <strong>Cost:</strong> {final.original_cost_bps} bps
                            </p>
                        </div>
                        <div>
                            <h5 className="font-semibold text-green-700 mb-2">Final Path</h5>
                            <p className="text-sm text-green-600">
                                <strong>Rail:</strong> {final.final_rail}
                            </p>
                            <p className="text-sm text-green-600">
                                <strong>Cost:</strong> {final.final_cost_bps} bps
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-white border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">{final.adjustment_summary}</p>
                    </div>
                </div>
            )}

            {/* Policy Adjustments */}
            {olivePolicy && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                        🫒 Olive Policy Adjustments
                    </h4>
                    {olivePolicy.applied_policies && olivePolicy.applied_policies.length > 0 ? (
                        <div className="space-y-3">
                            {olivePolicy.applied_policies.map((policyId: string, index: number) => (
                                <div key={index} className="bg-white border border-green-200 rounded p-3">
                                    <p className="text-sm font-medium text-green-800">
                                        Policy Applied: {policyId}
                                    </p>
                                </div>
                            ))}
                            {olivePolicy.adjustments && (
                                <div className="bg-white border border-green-200 rounded p-3">
                                    <h5 className="font-semibold text-green-700 mb-2">Adjustments</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {Object.entries(olivePolicy.adjustments).map(([key, value]) => (
                                            <p key={key} className="text-sm text-green-600">
                                                <strong>{key}:</strong> {String(value)}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-green-700">No policies applied</p>
                    )}
                </div>
            )}

            {/* Trust Adjustments */}
            {onyxTrust && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                        🖤 Onyx Trust Signal Adjustments
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h5 className="font-semibold text-purple-700 mb-2">Trust Score</h5>
                            <p className="text-sm text-purple-600">
                                <strong>Score:</strong> {onyxTrust.trust_score?.toFixed(3)}
                            </p>
                            <p className="text-sm text-purple-600">
                                <strong>Risk Level:</strong> {onyxTrust.risk_level}
                            </p>
                        </div>
                        <div>
                            <h5 className="font-semibold text-purple-700 mb-2">Rail Adjustments</h5>
                            {onyxTrust.rail_adjustments && (
                                <div className="space-y-1">
                                    {Object.entries(onyxTrust.rail_adjustments).map(([rail, adjustment]: [string, any]) => (
                                        <p key={rail} className="text-sm text-purple-600">
                                            <strong>{rail}:</strong> {adjustment.weight_adjustment?.toFixed(3)}x
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    {onyxTrust.explanation && (
                        <div className="mt-4 p-3 bg-white border border-purple-200 rounded">
                            <h5 className="font-semibold text-purple-700 mb-2">Trust Explanation</h5>
                            <p className="text-sm text-purple-800">{onyxTrust.explanation}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Adjustment Flow Visualization */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Adjustment Flow</h4>
                <div className="flex items-center justify-between space-x-4">
                    <div className="flex-1 text-center">
                        <div className="bg-white border border-gray-300 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-800">Original</p>
                            <p className="text-xs text-gray-600">Credit • 150 bps</p>
                        </div>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div className="flex-1 text-center">
                        <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                            <p className="text-sm font-medium text-green-800">Policy Applied</p>
                            <p className="text-xs text-green-600">Olive adjustments</p>
                        </div>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div className="flex-1 text-center">
                        <div className="bg-purple-100 border border-purple-300 rounded-lg p-3">
                            <p className="text-sm font-medium text-purple-800">Trust Adjusted</p>
                            <p className="text-xs text-purple-600">Onyx risk factors</p>
                        </div>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div className="flex-1 text-center">
                        <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                            <p className="text-sm font-medium text-blue-800">Final Path</p>
                            <p className="text-xs text-blue-600">Optimized settlement</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

