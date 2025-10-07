'use client';

import { useState } from 'react';

interface NegotiationComparisonProps {
    orcaData?: any;
    opalData?: any;
    orcaError?: string;
    opalError?: string;
}

export default function NegotiationComparison({ orcaData, opalData, orcaError, opalError }: NegotiationComparisonProps) {
    const [activeTab, setActiveTab] = useState<'scores' | 'explanations'>('scores');

    if (orcaError || opalError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Negotiation Errors</h3>
                {orcaError && <p className="text-red-700">Orca: {orcaError}</p>}
                {opalError && <p className="text-red-700">Opal: {opalError}</p>}
            </div>
        );
    }

    if (!orcaData && !opalData) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600">No negotiation data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">🔄 Orca vs Opal Negotiation</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setActiveTab('scores')}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                            activeTab === 'scores'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Scores Table
                    </button>
                    <button
                        onClick={() => setActiveTab('explanations')}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                            activeTab === 'explanations'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        LLM Explanations
                    </button>
                </div>
            </div>

            {activeTab === 'scores' && (
                <div className="space-y-6">
                    {/* Orca Scores */}
                    {orcaData && (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                🦈 Orca Rail Evaluation
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Rail
                                            </th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cost Score
                                            </th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Speed Score
                                            </th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Risk Score
                                            </th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Final Score
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orcaData.rail_evaluations?.map((rail: any, index: number) => (
                                            <tr key={index} className={index === 0 ? 'bg-green-50' : ''}>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {rail.rail_type}
                                                    {index === 0 && <span className="ml-2 text-green-600">🏆</span>}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {rail.cost_score?.toFixed(3) || 'N/A'}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {rail.speed_score?.toFixed(3) || 'N/A'}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {rail.risk_score?.toFixed(3) || 'N/A'}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                    {rail.composite_score?.toFixed(3) || 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3 text-sm text-gray-600">
                                <p><strong>Weights:</strong> Cost: 40%, Speed: 30%, Risk: 30%</p>
                                <p><strong>Chosen Rail:</strong> {orcaData.optimal_rail}</p>
                            </div>
                        </div>
                    )}

                    {/* Opal Scores */}
                    {opalData && (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                💎 Opal Consumer Value Scoring
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Instrument
                                            </th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Rewards Value
                                            </th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Fee Cost
                                            </th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Loyalty Bonus
                                            </th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Final Score
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {opalData.selected_instrument && (
                                            <tr className="bg-green-50">
                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {opalData.selected_instrument.instrument_id}
                                                    <span className="ml-2 text-green-600">🏆</span>
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    ${opalData.selected_instrument.total_reward_value?.toFixed(2) || '0.00'}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    ${opalData.selected_instrument.out_of_pocket_cost?.toFixed(2) || '0.00'}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {opalData.selected_instrument.loyalty_multiplier?.toFixed(3) || '1.000'}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                    {opalData.selected_instrument.value_score?.toFixed(3) || 'N/A'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3 text-sm text-gray-600">
                                <p><strong>Selected Instrument:</strong> {opalData.selected_instrument?.instrument_id}</p>
                                <p><strong>Consumer Value:</strong> ${opalData.consumer_value?.toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'explanations' && (
                <div className="space-y-4">
                    {/* Orca Explanation */}
                    {orcaData && (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                🦈 Orca LLM Explanation
                            </h4>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="text-blue-800">
                                    {orcaData.explanation ? (
                                        <div>
                                            <p className="font-semibold mb-2">Rail Selection Analysis:</p>
                                            <p className="mb-3 leading-relaxed">
                                                {orcaData.explanation.includes('Rail Selection Analysis:') 
                                                    ? orcaData.explanation.split('\n\n')[0].replace('Rail Selection Analysis: ', '')
                                                    : orcaData.explanation
                                                }
                                            </p>
                                            {orcaData.explanation.includes('Structured Analysis:') && (
                                                <details className="mt-2">
                                                    <summary className="cursor-pointer font-medium text-blue-700 hover:text-blue-900">
                                                        View Technical Details
                                                    </summary>
                                                    <pre className="mt-2 p-3 bg-blue-100 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                                                        {orcaData.explanation.split('Structured Analysis: ')[1]}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    ) : (
                                        <p>No explanation available</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Opal Explanation */}
                    {opalData && (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                💎 Opal LLM Explanation
                            </h4>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="text-purple-800 whitespace-pre-wrap">
                                    {opalData.explanation ? (
                                        <div>
                                            <p className="font-semibold mb-2">Consumer Instrument Selection:</p>
                                            <p className="mb-3">{opalData.explanation}</p>
                                            {opalData.selected_instrument && (
                                                <div className="mt-3 p-3 bg-purple-100 rounded text-sm">
                                                    <p className="font-medium">Selected: {opalData.selected_instrument.instrument_type} {opalData.selected_instrument.provider}</p>
                                                    <p>Value Score: {opalData.selected_instrument.value_score?.toFixed(3)}</p>
                                                    <p>Rewards: ${opalData.selected_instrument.total_reward_value?.toFixed(2)}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p>No explanation available</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

