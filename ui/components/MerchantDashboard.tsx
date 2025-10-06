/**
 * Merchant Dashboard Component - Simplified Version
 * 
 * Displays merchant-centric information including:
 * - Processor bids and routing analysis
 * - Fee savings and cost analysis
 * - Transaction analytics
 */

import React, { useState, useEffect } from 'react';

interface MerchantDashboardProps {
  traceId?: string;
}

const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ traceId }) => {
  const [merchantData, setMerchantData] = useState({
    totalFeesSaved: 625,
    costReduction: 33.3,
    approvalRate: 98,
    settlementSpeed: 95,
    transactionVolume: 1250
  });

  const processorBids = [
    { name: 'Carat', fee: 45, rebate: 15, settlement: '22h', status: 'selected' },
    { name: 'Stripe', fee: 280, rebate: 5, settlement: '2d', status: 'alternative' },
    { name: 'Adyen', fee: 305, rebate: 0, settlement: '1d', status: 'alternative' }
  ];

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">${merchantData.totalFeesSaved}</div>
            <div className="text-sm text-gray-600">Fees Saved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{merchantData.costReduction}%</div>
            <div className="text-sm text-gray-600">Cost Reduction</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{merchantData.approvalRate}%</div>
            <div className="text-sm text-gray-600">Approval Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{merchantData.settlementSpeed}%</div>
            <div className="text-sm text-gray-600">Settlement Speed</div>
          </div>
        </div>
      </div>

      {/* Processor Bids */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Processor Bids</h3>
        <div className="space-y-3">
          {processorBids.map((bid, index) => (
            <div key={index} className={`p-4 rounded-lg border-2 ${
              bid.status === 'selected' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    bid.status === 'selected' ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-900">{bid.name}</div>
                    <div className="text-sm text-gray-600">Settlement: {bid.settlement}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{bid.fee} bps</div>
                  <div className="text-sm text-green-600">+{bid.rebate} bps rebate</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Route Analysis */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Route Analysis</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Selected Route: ACH</div>
              <div className="text-sm text-gray-600">Carat Processor • 45 bps fee</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-green-600">$85 saved</div>
              <div className="text-sm text-gray-600">vs alternatives</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">22h</div>
              <div className="text-sm text-gray-600">Settlement Time</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">96%</div>
              <div className="text-sm text-gray-600">Approval Score</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">$15</div>
              <div className="text-sm text-gray-600">Rebate Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Analysis */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fee Analysis</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Transaction Volume:</span>
            <span className="font-medium text-gray-900">${merchantData.transactionVolume}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Fees Paid:</span>
            <span className="font-medium text-gray-900">$45.00 (45 bps)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Rebates Received:</span>
            <span className="font-medium text-green-600">+$15.00 (15 bps)</span>
          </div>
          <div className="flex justify-between items-center border-t pt-2">
            <span className="font-medium text-gray-900">Net Cost:</span>
            <span className="font-bold text-gray-900">$30.00 (30 bps)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;