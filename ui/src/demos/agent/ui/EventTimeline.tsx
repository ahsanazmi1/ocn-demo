'use client';

import React from 'react';
import { Explanation } from '../types';
import { getAgentDisplayName, getAgentColor } from '../constants';

interface EventTimelineProps {
  explanations: Explanation[];
  currentStep: number;
}

const EventTimeline: React.FC<EventTimelineProps> = ({ explanations, currentStep }) => {
  const getAgentEmoji = (agent: string): string => {
    const emojiMap: Record<string, string> = {
      'orca': '🦈',
      'opal': '💎', 
      'olive': '🫒',
      'okra': '🦏',
      'onyx': '🖤',
      'weave': '🌊'
    };
    return emojiMap[agent] || '🤖';
  };

  const getStepStatus = (index: number): 'completed' | 'current' | 'pending' => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  const getStatusColor = (status: 'completed' | 'current' | 'pending'): string => {
    switch (status) {
      case 'completed': return '#10B981'; // green-500
      case 'current': return '#3B82F6'; // blue-500
      case 'pending': return '#6B7280'; // gray-500
    }
  };

  const getStatusDot = (status: 'completed' | 'current' | 'pending'): string => {
    switch (status) {
      case 'completed': return '●';
      case 'current': return '●';
      case 'pending': return '○';
    }
  };

  const getStepDescription = (explanation: Explanation): string => {
    const agent = explanation.agent;
    switch (agent) {
      case 'orca':
        if (explanation.step_id.includes('finalize')) {
          return 'Payment mandate finalized';
        }
        return 'Checkout decision';
      case 'opal':
        return 'Wallet method selected';
      case 'olive':
        return 'Loyalty incentives applied';
      case 'okra':
        return 'BNPL quote generated';
      case 'onyx':
        return 'KYB verification';
      case 'weave':
        if (explanation.step_id.includes('auction')) {
          return 'Processor auction';
        }
        return 'Instruction signed & forwarded';
      default:
        return 'Processing';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Event Timeline</h3>
        <div className="text-sm text-gray-500">
          Trace ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">
            {explanations[0]?.trace_id?.slice(0, 8)}...
          </code>
        </div>
      </div>
      
      <div className="space-y-3">
        {explanations.map((explanation, index) => {
          const status = getStepStatus(index);
          const statusColor = getStatusColor(status);
          const agentEmoji = getAgentEmoji(explanation.agent);
          const agentName = getAgentDisplayName(explanation.agent);
          const description = getStepDescription(explanation);
          
          return (
            <div key={explanation.step_id} className="flex items-center space-x-3">
              {/* Step Number Badge */}
              <div 
                className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white"
                style={{ 
                  backgroundColor: status === 'pending' ? '#9CA3AF' : statusColor 
                }}
              >
                {index + 1}
              </div>
              
              {/* Agent Emoji */}
              <div className="text-lg">{agentEmoji}</div>
              
              {/* Agent Name */}
              <div className="font-semibold text-gray-900 min-w-[60px]">
                {agentName}
              </div>
              
              {/* Description */}
              <div className="flex-1 text-gray-700">
                {description}
              </div>
              
              {/* Status Dot */}
              <div 
                className="text-lg"
                style={{ color: statusColor }}
                title={status === 'completed' ? 'Completed' : status === 'current' ? 'In Progress' : 'Pending'}
              >
                {getStatusDot(status)}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Progress Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {explanations.length} total steps
          </span>
          <span className="text-gray-600">
            {currentStep} completed • {explanations.length - currentStep} remaining
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / explanations.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default EventTimeline;








