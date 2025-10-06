/**
 * Processor Dashboard Component - Simplified Version
 * 
 * Displays processor/auditor-centric information including:
 * - Bid history and win/loss tracking
 * - Authorization results and system health
 * - Trace ID tracking
 */

import React, { useState, useEffect } from 'react';

interface ProcessorDashboardProps {
  traceId?: string;
}

const ProcessorDashboard: React.FC<ProcessorDashboardProps> = ({ traceId }) => {
  const [processorData, setProcessorData] = useState({
    winRate: 71.5,
    uptime: 99.8,
    errorRate: 0.02,
    avgResponseTime: 245,
    totalBids: 1247
  });

  const authResults = [
    { id: 'AUTH_123456', status: 'approved', processor: 'Carat', amount: 1000, responseTime: 245, score: 96 },
    { id: 'AUTH_123457', status: 'approved', processor: 'Stripe', amount: 750, responseTime: 189, score: 94 },
    { id: 'AUTH_123458', status: 'declined', processor: 'Adyen', amount: 1200, responseTime: 156, score: 78 }
  ];

  const bidHistory = [
    { processor: 'Carat', bid: 45, status: 'won', timestamp: '2024-01-15 14:30:22' },
    { processor: 'Stripe', bid: 280, status: 'lost', timestamp: '2024-01-15 14:30:21' },
    { processor: 'Adyen', bid: 305, status: 'lost', timestamp: '2024-01-15 14:30:20' }
  ];

  return (
    <div className="space-y-6">
      {/* System Health */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">System Health</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{processorData.winRate}%</div>
            <div className="text-sm text-gray-600">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{processorData.uptime}%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{processorData.errorRate}%</div>
            <div className="text-sm text-gray-600">Error Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{processorData.avgResponseTime}ms</div>
            <div className="text-sm text-gray-600">Avg Response</div>
          </div>
        </div>
      </div>

      {/* Bid History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Bid History</h3>
        <div className="space-y-3">
          {bidHistory.map((bid, index) => (
            <div key={index} className={`p-3 rounded-lg border ${
              bid.status === 'won' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    bid.status === 'won' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-900">{bid.processor}</div>
                    <div className="text-sm text-gray-600">{bid.timestamp}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{bid.bid} bps</div>
                  <div className={`text-sm font-medium ${
                    bid.status === 'won' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {bid.status.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Authorization Results */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Authorization Results</h3>
        <div className="space-y-3">
          {authResults.map((auth, index) => (
            <div key={index} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900">{auth.id}</div>
                  <div className="text-sm text-gray-600">{auth.processor} • ${auth.amount}</div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    auth.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {auth.status.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{auth.responseTime}ms • {auth.score}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trace ID Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Trace ID Search</h3>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter trace ID..."
              defaultValue={traceId || ''}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Search
            </button>
          </div>
          {traceId && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-gray-900">Trace ID: {traceId}</div>
              <div className="text-sm text-gray-600 mt-1">
                Status: Active • Created: 2024-01-15 14:30:22 • Processor: Carat
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">892</div>
            <div className="text-sm text-gray-600">Successful Transactions</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">$1.2M</div>
            <div className="text-sm text-gray-600">Total Volume Processed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessorDashboard;