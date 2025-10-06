'use client';

import { useState } from 'react';

const AGENT_URLS = {
  orca: 'http://localhost:8080',
  okra: 'http://localhost:8083',
  opal: 'http://localhost:8084',
  onyx: 'http://localhost:8086',
  olive: 'http://localhost:8087',
  weave: 'http://localhost:8082',
};

interface AgentStatus {
  name: string;
  url: string;
  status: 'testing' | 'success' | 'error';
  response?: any;
  error?: string;
}

export default function TestAgentsPage() {
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const testAgent = async (agentName: string, url: string): Promise<AgentStatus> => {
    try {
      console.log(`Testing ${agentName} at ${url}...`);
      
      // Use the API route to proxy the request
      const response = await fetch('/api/test-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName })
      });
      
      const result = await response.json();
      
      if (result.success) {
        return {
          name: agentName,
          url,
          status: 'success',
          response: result.data
        };
      } else {
        return {
          name: agentName,
          url,
          status: 'error',
          error: result.error
        };
      }
    } catch (error) {
      console.error(`Error testing ${agentName}:`, error);
      return {
        name: agentName,
        url,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testAllAgents = async () => {
    setIsTesting(true);
    setAgentStatuses([]);

    const agents = Object.entries(AGENT_URLS);
    
    for (const [agentName, url] of agents) {
      // Set status to testing
      setAgentStatuses(prev => [...prev, {
        name: agentName,
        url,
        status: 'testing'
      }]);

      // Test the agent
      const result = await testAgent(agentName, url);
      
      // Update the status
      setAgentStatuses(prev => 
        prev.map(status => 
          status.name === agentName ? result : status
        )
      );
    }

    setIsTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Real Agent Status Test</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Agent Connectivity Test</h2>
            <button
              onClick={testAllAgents}
              disabled={isTesting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTesting ? 'Testing...' : 'Test All Agents'}
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">
            This page tests connectivity to all real agent services. Each agent is tested with a specific endpoint.
          </p>

          <div className="space-y-4">
            {agentStatuses.map((agent, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    agent.status === 'success' ? 'bg-green-500' :
                    agent.status === 'error' ? 'bg-red-500' :
                    'bg-yellow-500 animate-pulse'
                  }`} />
                  <div>
                    <div className="font-medium text-gray-900">{agent.name.toUpperCase()}</div>
                    <div className="text-sm text-gray-500">{agent.url}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  {agent.status === 'testing' && (
                    <div className="text-sm text-yellow-600">Testing...</div>
                  )}
                  {agent.status === 'success' && (
                    <div className="text-sm text-green-600">✅ Connected</div>
                  )}
                  {agent.status === 'error' && (
                    <div className="text-sm text-red-600">❌ Failed: {agent.error}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {agentStatuses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Click "Test All Agents" to check connectivity
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Check Real Agent Status in Demo</h3>
          <div className="space-y-3 text-gray-700">
            <p>1. Go to the <a href="/demos/agent-interaction" className="text-blue-600 hover:underline">Agent Interaction Demo</a></p>
            <p>2. Click the 🚀 <strong>Real</strong> button to enable real agent mode</p>
            <p>3. Click <strong>"Start Demo"</strong> to begin</p>
            <p>4. Open your browser's Developer Tools (F12) and check the Console tab</p>
            <p>5. Look for messages starting with <code className="bg-gray-100 px-2 py-1 rounded">🚀 REAL AGENT:</code></p>
            <p>6. You'll see either <strong>SUCCESS</strong> or <strong>FAILED</strong> for each agent call</p>
          </div>
        </div>
      </div>
    </div>
  );
}
