'use client';

import { useState, useEffect } from 'react';
import AgentCard from '../components/AgentCard';
import OrderSummary from '../components/OrderSummary';
import Timeline from '../components/Timeline';
import JsonInspector from '../components/JsonInspector';
import NegotiationComparison from '../components/NegotiationComparison';
import AuctionResults from '../components/AuctionResults';
import SettlementPath from '../components/SettlementPath';
import Phase4Flow from '../components/Phase4Flow';
import ConsumerDashboard from '../components/ConsumerDashboard';
import MerchantDashboard from '../components/MerchantDashboard';
import ProcessorDashboard from '../components/ProcessorDashboard';
import ScorecardUI from '../components/ScorecardUI';
import AgentInteractionDemo from '../src/demos/agent/AgentInteractionDemo';
import { runDemo1, getAgentStatus, getReceipts, type DemoResult, type AgentStatus } from '../lib/api';

// Sample cart data (embedded)
const sampleCart = {
    currency: "USD",
    items: [
        { sku: "OXFORDS-BRN-10D", name: "Oxfords (Brown 10D)", qty: 1, unit_price: 280.0 },
        { sku: "BLAZER-NVY-40R", name: "Blazer (Navy 40R)", qty: 1, unit_price: 420.0 }
    ],
    total: 700.0
};

const agents = [
    { name: "Orca", emoji: "🦈", subtitle: "Checkout Decision Engine" },
    { name: "Opal", emoji: "💎", subtitle: "Wallet Selection" },
    { name: "Olive", emoji: "🫒", subtitle: "Loyalty Incentives" },
    { name: "Okra", emoji: "🦏", subtitle: "BNPL Credit Scoring" },
    { name: "Onyx", emoji: "🖤", subtitle: "Trust & KYB Verification" },
    { name: "Weave", emoji: "🌊", subtitle: "Audit & Receipts" }
];

export default function Home() {
    const [agentStatus, setAgentStatus] = useState<AgentStatus>({});
    const [demoResult, setDemoResult] = useState<DemoResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'demo' | 'consumer' | 'merchant' | 'processor' | 'scorecard' | 'agent-interaction'>('demo');

    // Load agent status on mount
    useEffect(() => {
        const loadStatus = async () => {
            try {
                const status = await getAgentStatus();
                setAgentStatus(status);
            } catch (err) {
                console.error('Failed to load agent status:', err);
            }
        };

        loadStatus();
        const interval = setInterval(loadStatus, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const handleRunDemo = async () => {
        setIsRunning(true);
        setError(null);
        setDemoResult(null);

        try {
            const result = await runDemo1();
            setDemoResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsRunning(false);
        }
    };

    // Generate timeline events
    const timelineEvents = demoResult ? [
        { step: 1, agent: "Orca", emoji: "🦈", action: "Checkout decision", status: (demoResult.orca.decision ? 'completed' : 'error') as 'completed' | 'error' },
        { step: 2, agent: "Opal", emoji: "💎", action: "Wallet method selected", status: (demoResult.opal.selection ? 'completed' : 'error') as 'completed' | 'error' },
        { step: 3, agent: "Olive", emoji: "🫒", action: "Loyalty incentives applied", status: (demoResult.olive.incentives ? 'completed' : 'error') as 'completed' | 'error' },
        { step: 4, agent: "Okra", emoji: "🦏", action: "BNPL quote generated", status: (demoResult.okra.bnpl_quote ? 'completed' : 'error') as 'completed' | 'error' },
        { step: 5, agent: "Onyx", emoji: "🖤", action: "KYB verification CE emitted", status: (demoResult.onyx.kyb_verification ? 'completed' : 'error') as 'completed' | 'error' },
        // Phase 3 steps
        { step: 6, agent: "Orca vs Opal", emoji: "🔄", action: "Negotiation + LLM explanations", status: (demoResult.phase3?.negotiation?.orca && demoResult.phase3?.negotiation?.opal ? 'completed' : 'error') as 'completed' | 'error' },
        { step: 7, agent: "Weave", emoji: "🌊", action: "Processor auction", status: (demoResult.phase3?.auction ? 'completed' : 'error') as 'completed' | 'error' },
        { step: 8, agent: "Final", emoji: "🎯", action: "Settlement path", status: (demoResult.phase3?.settlement?.final ? 'completed' : 'error') as 'completed' | 'error' },
        // Phase 4 steps
        { step: 9, agent: "Orca/Opal/Olive", emoji: "📋", action: "Payment instruction compiled", status: 'completed' as 'completed' | 'error' },
        { step: 10, agent: "Weave", emoji: "🔐", action: "Instruction signed & forwarded", status: 'completed' as 'completed' | 'error' },
        { step: 11, agent: "Processor", emoji: "✅", action: "Authorization result", status: 'completed' as 'completed' | 'error' }
    ] : [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        OCN Demo — Oxfords Checkout (Demo 1) + Phase 3 + Phase 4
                    </h1>
                    <p className="mt-2 text-gray-600">
                        End-to-end flow across 6 agents + Phase 3 negotiation + Phase 4 payment instruction & processing
                    </p>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('demo')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'demo'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Demo Flow
                        </button>
                        <button
                            onClick={() => setActiveTab('consumer')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'consumer'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Consumer Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('merchant')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'merchant'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Merchant Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('processor')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'processor'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Processor Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('scorecard')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'scorecard'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Scorecard
                        </button>
        <button
            onClick={() => setActiveTab('agent-interaction')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'agent-interaction'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
            Agent Interaction Demo
        </button>
                    </nav>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Content */}
                {activeTab === 'demo' && (
                    <>
                        {/* Run Demo Button */}
                        <div className="mb-8">
                            <button
                                onClick={handleRunDemo}
                                disabled={isRunning}
                                className={`px-6 py-3 rounded-lg font-medium text-white ${isRunning
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {isRunning ? 'Running Demo 1...' : 'Run Demo 1'}
                            </button>

                            {error && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-800">Error: {error}</p>
                                </div>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div className="mb-8">
                            <OrderSummary cart={sampleCart} />
                        </div>

                        {/* Agent Status Cards */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Agent Status</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {agents.map((agent) => (
                                    <AgentCard
                                        key={agent.name}
                                        name={agent.name}
                                        emoji={agent.emoji}
                                        status={agentStatus[agent.name.toLowerCase()] || false}
                                        subtitle={agent.subtitle}
                                        lastAction={demoResult ?
                                            (agent.name === 'Orca' && demoResult.orca.decision ? 'Decision made' :
                                                agent.name === 'Opal' && demoResult.opal.selection ? 'Method selected' :
                                                    agent.name === 'Olive' && demoResult.olive.incentives ? 'Incentives applied' :
                                                        agent.name === 'Okra' && demoResult.okra.bnpl_quote ? 'BNPL quoted' :
                                                            agent.name === 'Onyx' && demoResult.onyx.kyb_verification ? 'KYB verified' :
                                                                agent.name === 'Weave' ? 'Receipts logged' : undefined) : undefined
                                        }
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Timeline */}
                        {timelineEvents.length > 0 && (
                            <div className="mb-8">
                                <Timeline events={timelineEvents} traceId={demoResult?.trace_id} />
                            </div>
                        )}

                        {/* Phase 3 Components */}
                        {demoResult?.phase3 && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Phase 3 — Negotiation & Live Fee Bidding</h2>
                                
                                {/* Step 4: Negotiation Comparison */}
                                <div className="mb-8">
                                    <NegotiationComparison
                                        orcaData={demoResult.phase3.negotiation?.orca}
                                        opalData={demoResult.phase3.negotiation?.opal}
                                        orcaError={demoResult.phase3.negotiation?.orca_error}
                                        opalError={demoResult.phase3.negotiation?.opal_error}
                                    />
                                </div>

                                {/* Step 5: Auction Results */}
                                <div className="mb-8">
                                    <AuctionResults
                                        auctionData={demoResult.phase3.auction}
                                        error={demoResult.phase3.auction?.error}
                                    />
                                </div>

                                {/* Step 6: Settlement Path */}
                                <div className="mb-8">
                                    <SettlementPath
                                        settlementData={demoResult.phase3.settlement}
                                        olivePolicyError={demoResult.phase3.settlement?.olive_policy_error}
                                        onyxTrustError={demoResult.phase3.settlement?.onyx_trust_error}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Phase 4 Components */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Phase 4 — Payment Instruction & Processing</h2>
                            <Phase4Flow traceId={demoResult?.trace_id} />
                        </div>


                        {/* JSON Inspectors */}
                        {demoResult && (
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Raw Agent Responses</h2>
                                <div className="space-y-4">
                                    <JsonInspector title="Orca Decision" data={demoResult.orca.decision} />
                                    <JsonInspector title="Orca Explanation" data={demoResult.orca.explanation} />
                                    <JsonInspector title="Opal Methods" data={demoResult.opal.methods} />
                                    <JsonInspector title="Opal Selection" data={demoResult.opal.selection} />
                                    <JsonInspector title="Olive Incentives" data={demoResult.olive.incentives} />
                                    <JsonInspector title="Okra BNPL Quote" data={demoResult.okra.bnpl_quote} />
                                    <JsonInspector title="Onyx KYB Verification" data={demoResult.onyx.kyb_verification} />
                                    
                                    {/* Phase 3 JSON Inspectors */}
                                    {demoResult.phase3 && (
                                        <>
                                            <JsonInspector title="Orca Negotiation" data={demoResult.phase3.negotiation?.orca} />
                                            <JsonInspector title="Opal Negotiation" data={demoResult.phase3.negotiation?.opal} />
                                            <JsonInspector title="Weave Auction" data={demoResult.phase3.auction} />
                                            <JsonInspector title="Olive Policy" data={demoResult.phase3.settlement?.olive_policy} />
                                            <JsonInspector title="Onyx Trust" data={demoResult.phase3.settlement?.onyx_trust} />
                                            <JsonInspector title="Final Settlement" data={demoResult.phase3.settlement?.final} />
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Phase Status Banners */}
                        {demoResult?.phase3 ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-800 text-center">
                                    <strong>Phase 3 — Negotiation & Live Fee Bidding</strong> — ✅ Complete
                                </p>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-yellow-800 text-center">
                                    <strong>Phase 3 — Negotiation & Live Fee Bidding</strong> — Run demo to see results
                                </p>
                            </div>
                        )}
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                            <p className="text-blue-800 text-center">
                                <strong>Phase 4 — Payment Instruction & Processing</strong> — ✅ Complete
                            </p>
                        </div>
                    </>
                )}

                {activeTab === 'consumer' && (
                    <ConsumerDashboard traceId={demoResult?.trace_id} />
                )}

                {activeTab === 'merchant' && (
                    <MerchantDashboard traceId={demoResult?.trace_id} />
                )}

                {activeTab === 'processor' && (
                    <ProcessorDashboard traceId={demoResult?.trace_id} />
                )}

                {activeTab === 'scorecard' && (
                    <ScorecardUI traceId={demoResult?.trace_id} />
                )}

                {activeTab === 'agent-interaction' && (
                    <AgentInteractionDemo />
                )}
            </main>
        </div>
    );
}
