'use client';

import React, { useState } from 'react';

interface AgentStatus {
  [key: string]: boolean;
}

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
}

export default function TestRealAgentsPage() {
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkAgentStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gateway/status');
      const status = await response.json();
      setAgentStatus(status);
    } catch (error) {
      console.error('Failed to check agent status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testRealAgents = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Test a simple Orca decision
      const response = await fetch('/api/gateway/proxy/orca/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ocn-trace-id': `txn_${Math.random().toString(16).substr(2, 16).padStart(16, '0')}`,
        },
        body: JSON.stringify({
          cart_total: 700.0,
          currency: 'USD',
          rail: 'Card',
          channel: 'online',
          context: {
            mcc: 5651,
            modality: 'web',
            actor_profile: { org_name: 'Example LLC' }
          }
        })
      });

      const data = await response.json();
      setTestResult({
        success: response.ok,
        data: data,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Real Agents Test Page
          </h1>

          <div className="space-y-6">
            {/* Agent Status Check */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Agent Status</h2>
              <button
                onClick={checkAgentStatus}
                disabled={isLoading}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Checking...' : 'Check Agent Status'}
              </button>
              
              {Object.keys(agentStatus).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(agentStatus).map(([agent, status]) => (
                    <div
                      key={agent}
                      className={`p-3 rounded-md text-center ${
                        status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <div className="font-medium capitalize">{agent}</div>
                      <div className="text-sm">{status ? '✅ Online' : '❌ Offline'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Test Real Agent Call */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Test Real Agent Call</h2>
              <button
                onClick={testRealAgents}
                disabled={isLoading}
                className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Testing...' : 'Test Orca Decision'}
              </button>
              
              {testResult && (
                <div className={`p-4 rounded-md ${
                  testResult.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
                }`}>
                  <h3 className="font-medium mb-2">
                    {testResult.success ? '✅ Success' : '❌ Error'}
                  </h3>
                  {testResult.error && (
                    <p className="text-red-800 mb-2">{testResult.error}</p>
                  )}
                  {testResult.data && (
                    <pre className="text-sm bg-white p-3 rounded border overflow-auto max-h-64">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h2 className="text-lg font-semibold mb-3">Instructions</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Make sure the agent services are running: <code>make up</code></li>
                <li>Check agent status to verify all agents are online</li>
                <li>Test a real agent call to verify API connectivity</li>
                <li>Go to the Agent Interaction Demo and try the "🚀 Real" mode</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
