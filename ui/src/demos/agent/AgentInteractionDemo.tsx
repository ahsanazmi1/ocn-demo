'use client';

import React, { useState } from 'react';
import { MockOrchestrator } from './mockOrchestrator';
import { RealOrchestrator } from './realOrchestrator';
import { Explanation, Verbosity, Cart } from './types';
import { COLORS } from './constants';
import { CartPanel, VerbosityToggle, AgentChat } from './ui';
import './ui/agent-demo.css';

const AgentInteractionDemo: React.FC = () => {
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verbosity, setVerbosity] = useState<Verbosity>('standard');
  const [useRealAgents, setUseRealAgents] = useState(false);
  const [cart] = useState<Cart>(() => new MockOrchestrator().getOxfordsCart());

  const startDemo = async (choice?: 'credit' | 'bnpl') => {
    setIsProcessing(true);
    setExplanations([]);

    try {
      let newExplanations: Explanation[];
      
      if (useRealAgents) {
        console.log('🚀 Using REAL agents via API calls...');
        const realOrchestrator = new RealOrchestrator();
        newExplanations = await realOrchestrator.runAgentFlow(choice);
      } else {
        console.log('🎭 Using MOCK agents...');
        const mockOrchestrator = new MockOrchestrator();
        newExplanations = mockOrchestrator.runAgentFlow(choice);
      }
      
      setExplanations(newExplanations);
    } catch (error) {
      console.error('Demo failed:', error);
      // Add error explanation
      setExplanations([{
        trace_id: 'error-trace',
        step_id: 'error_001',
        agent: 'system',
        model_version: 'error_handler_v1.0.0',
        policy_version: 'error_v1.0.0',
        summary: `Demo failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        decision: 'error',
        score: 0.0,
        score_type: 'error',
        uncertainty: 1.0,
        key_signals: [],
        ap2_refs: [],
        redactions: [],
        timestamp: new Date().toISOString(),
        extra: { error: true }
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetDemo = () => {
    setExplanations([]);
    setIsProcessing(false);
  };

  // Choice handling removed for simplicity

  return (
    <div className="agent-demo-container">
      <header className="agent-demo-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="agent-demo-title">
            Agent Interaction Demo
          </h1>
          <p className="agent-demo-subtitle">
            LLM explanations rendered as a chat.
          </p>
        </div>
      </header>

      {/* Controls */}
      <div className="agent-demo-controls">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <VerbosityToggle value={verbosity} onChange={setVerbosity} />
              
              {/* Real vs Mock Toggle */}
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium" style={{ color: COLORS.dark }}>
                  Agent Mode:
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setUseRealAgents(true)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      useRealAgents 
                        ? 'text-white' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    style={{ 
                      backgroundColor: useRealAgents ? COLORS.green : 'transparent',
                      border: `1px solid ${useRealAgents ? COLORS.green : '#D1D5DB'}`
                    }}
                  >
                    🚀 Real
                  </button>
                  <button
                    onClick={() => setUseRealAgents(false)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      !useRealAgents 
                        ? 'text-white' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    style={{ 
                      backgroundColor: !useRealAgents ? COLORS.medium : 'transparent',
                      border: `1px solid ${!useRealAgents ? COLORS.medium : '#D1D5DB'}`
                    }}
                  >
                    🎭 Mock
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={resetDemo}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: COLORS.medium }}
              >
                Reset
              </button>
              <button
                onClick={() => startDemo()}
                disabled={isProcessing}
                className="checkout-button"
              >
                {isProcessing ? 'Processing...' : 'Start Demo'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="agent-demo-main">
        <div className="agent-demo-grid">
          {/* Left Panel - Cart */}
          <div>
            <CartPanel 
              cart={cart}
              onCheckout={() => startDemo()}
              isProcessing={isProcessing}
            />
          </div>

          {/* Right Panel - Agent Chat */}
          <div>
                   <AgentChat 
                     explanations={explanations}
                     verbosity={verbosity}
                     isProcessing={isProcessing}
                     onChoiceSelect={() => {}} // No-op since we removed choices
                   />
          </div>
        </div>

        {/* Status Banner */}
        {isProcessing && (
          <div className="mt-8 p-4 rounded-lg border" style={{ 
            backgroundColor: '#EFF6FF',
            borderColor: '#BFDBFE'
          }}>
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full animate-pulse mr-3"
                style={{ backgroundColor: COLORS.purple }}
              ></div>
              <div className="text-blue-800">
                <strong>Demo Running:</strong> {useRealAgents ? 'Real agents' : 'Mock agents'} are processing the transaction. 
                Watch the explanation chat for real-time updates.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AgentInteractionDemo;
