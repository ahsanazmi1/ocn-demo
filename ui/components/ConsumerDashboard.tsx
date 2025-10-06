/**
 * Consumer Dashboard Component - Simplified Version
 * 
 * Displays consumer-centric information including:
 * - Rewards and bonuses summary
 * - Payment method analysis
 * - Transaction history
 * - Loyalty program status
 */

import React, { useState, useEffect } from 'react';

interface ConsumerDashboardProps {
  traceId?: string;
}

const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({ traceId }) => {
  const [dashboardData, setDashboardData] = useState({
    totalRewards: 234.50,
    cashbackRate: 2.0,
    loyaltyPoints: 1250,
    monthlySavings: 12.5,
    transactionCount: 35,
    totalSpent: 1250
  });

  return (
    <div className="space-y-6">
      {/* Rewards Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Rewards Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">${dashboardData.totalRewards}</div>
            <div className="text-sm text-gray-600">Total Rewards</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{dashboardData.cashbackRate}%</div>
            <div className="text-sm text-gray-600">Cashback Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{dashboardData.loyaltyPoints}</div>
            <div className="text-sm text-gray-600">Loyalty Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">+{dashboardData.monthlySavings}%</div>
            <div className="text-sm text-gray-600">Monthly Trend</div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Premium Rewards Card</div>
              <div className="text-sm text-gray-600">2% cashback, 50 points</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">$850.00</div>
              <div className="text-sm text-green-600">+$17.00 rewards</div>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">ACH Direct Transfer</div>
              <div className="text-sm text-gray-600">No fees, instant processing</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">$400.00</div>
              <div className="text-sm text-green-600">+$5.00 bonus</div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-900">Oxfords Purchase</div>
              <div className="text-sm text-gray-600">Today • Premium Card</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">-$280.00</div>
              <div className="text-sm text-green-600">+$5.60 rewards</div>
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-900">Blazer Purchase</div>
              <div className="text-sm text-gray-600">Today • ACH Transfer</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">-$420.00</div>
              <div className="text-sm text-green-600">+$5.00 bonus</div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Transactions ({dashboardData.transactionCount})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsumerDashboard;