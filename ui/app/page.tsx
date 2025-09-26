'use client';

import { useState, useEffect } from 'react';
import AgentCard from '../components/AgentCard';
import OrderSummary from '../components/OrderSummary';
import Timeline from '../components/Timeline';
import JsonInspector from '../components/JsonInspector';
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
    { step: 1, agent: "Orca", emoji: "🦈", action: "Checkout decision", status: demoResult.orca.decision ? 'completed' : 'error' as const },
    { step: 2, agent: "Orca", emoji: "🦈", action: "Explanation CE emitted", status: demoResult.orca.explanation ? 'completed' : 'error' as const },
    { step: 3, agent: "Opal", emoji: "💎", action: "Wallet method selected", status: demoResult.opal.selection ? 'completed' : 'error' as const },
    { step: 4, agent: "Olive", emoji: "🫒", action: "Loyalty incentives applied", status: demoResult.olive.incentives ? 'completed' : 'error' as const },
    { step: 5, agent: "Okra", emoji: "🦏", action: "BNPL quote generated", status: demoResult.okra.bnpl_quote ? 'completed' : 'error' as const },
    { step: 6, agent: "Onyx", emoji: "🖤", action: "KYB verification CE emitted", status: demoResult.onyx.kyb_verification ? 'completed' : 'error' as const }
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            OCN Demo — Oxfords Checkout (Demo 1)
          </h1>
          <p className="mt-2 text-gray-600">
            End-to-end flow across 6 agents: Orca → Opal → Olive → Okra → Onyx → Weave
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Run Demo Button */}
        <div className="mb-8">
          <button
            onClick={handleRunDemo}
            disabled={isRunning}
            className={`px-6 py-3 rounded-lg font-medium text-white ${
              isRunning
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

        {/* JSON Inspectors */}
        {demoResult && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Agent Responses</h2>
            <div className="space-y-4">
              <JsonInspector title="Orca Decision" data={demoResult.orca.decision} />
              <JsonInspector title="Orca Explanation" data={demoResult.orca.explanation} />
              <JsonInspector title="Opal Methods" data={demoResult.opal.methods} />
              <JsonInspector title="Opal Selection" data={demoResult.opal.selection} />
              <JsonInspector title="Olive Incentives" data={demoResult.olive.incentives} />
              <JsonInspector title="Okra BNPL Quote" data={demoResult.okra.bnpl_quote} />
              <JsonInspector title="Onyx KYB Verification" data={demoResult.onyx.kyb_verification} />
            </div>
          </div>
        )}

        {/* Coming Soon Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-center">
            <strong>Negotiation & Bidding</strong> — coming soon
          </p>
        </div>
      </main>
    </div>
  );
}