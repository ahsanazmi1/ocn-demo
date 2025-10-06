import React from 'react';

interface ScorecardUIProps {
  traceId?: string;
}

const ScorecardUI: React.FC<ScorecardUIProps> = ({ traceId }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Response Time</div>
            <div className="text-2xl font-bold text-gray-900">245ms</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Success Rate</div>
            <div className="text-2xl font-bold text-green-600">99.8%</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Throughput</div>
            <div className="text-2xl font-bold text-gray-900">1,247/min</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScorecardUI;
