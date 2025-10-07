import React, { useState, useEffect } from 'react';
import { MockOrchestrator, simulateAgentFlow } from '../src/demos/agent/mockOrchestrator';
import { Explanation, Verbosity, Cart } from '../src/demos/agent/types';
import { VERBOSITY_LEVELS } from '../src/demos/agent/constants';
import AgentInteractionCart from './AgentInteractionCart';
import ExplanationChat from './ExplanationChat';

const AgentInteractionDemo: React.FC = () => {
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [verbosity, setVerbosity] = useState<Verbosity>('standard');
  const [creditOption, setCreditOption] = useState<'credit' | 'bnpl'>('credit');
  const [cart] = useState<Cart>(() => new MockOrchestrator().getOxfordsCart());

  const startDemo = async () => {
    setIsRunning(true);
    setExplanations([]);

    try {
      const newExplanations = await simulateAgentFlow(creditOption);
      setExplanations(newExplanations);
    } catch (error) {
      console.error('Demo failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const resetDemo = () => {
    setExplanations([]);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-ocn-dark">
            Agent Interaction Demo
          </h1>
          <p className="mt-2 text-ocn-medium">
            Real-time explanation of agent decision-making process
          </p>
        </div>
      </header>

      {/* Controls */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              {/* Verbosity Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-ocn-dark">Verbosity:</span>
                <div className="flex bg-ocn-light rounded-lg p-1">
                  {(Object.keys(VERBOSITY_LEVELS) as Verbosity[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setVerbosity(level)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        verbosity === level
                          ? 'bg-white text-ocn-purple shadow-sm'
                          : 'text-ocn-medium hover:text-ocn-dark'
                      }`}
                    >
                      {VERBOSITY_LEVELS[level]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Credit Option Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-ocn-dark">Payment:</span>
                <div className="flex bg-ocn-light rounded-lg p-1">
                  {(['credit', 'bnpl'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setCreditOption(option)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        creditOption === option
                          ? 'bg-white text-ocn-purple shadow-sm'
                          : 'text-ocn-medium hover:text-ocn-dark'
                      }`}
                    >
                      {option === 'bnpl' ? 'BNPL' : 'Credit'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={resetDemo}
                disabled={isRunning}
                className="px-4 py-2 text-sm font-medium text-ocn-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
              <button
                onClick={startDemo}
                disabled={isRunning}
                className="px-6 py-2 text-sm font-medium text-white bg-ocn-purple rounded-md hover:bg-ocn-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRunning ? 'Running...' : 'Start Demo'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
          {/* Left Panel - Cart */}
          <div className="h-full">
            <AgentInteractionCart cart={cart} />
          </div>

          {/* Right Panel - Explanation Chat */}
          <div className="h-full">
            <ExplanationChat 
              explanations={explanations}
              verbosity={verbosity}
              isRunning={isRunning}
            />
          </div>
        </div>

        {/* Status Banner */}
        <div className="mt-8">
          {isRunning && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-3"></div>
                <div className="text-blue-800">
                  <strong>Demo Running:</strong> Agents are processing the transaction. 
                  Watch the explanation chat for real-time updates.
                </div>
              </div>
            </div>
          )}
          
          {!isRunning && explanations.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div className="text-green-800">
                  <strong>Demo Complete:</strong> All agents have finished processing. 
                  {explanations.length} explanations generated.
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AgentInteractionDemo;
