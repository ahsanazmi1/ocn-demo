/**
 * Phase 4 Flow Component - Simplified Version
 * 
 * Displays the complete Phase 4 payment instruction flow including:
 * - Payment instruction compilation by Orca/Opal/Olive
 * - Weave signing/logging and processor forwarding
 * - Processor auth results
 * - Comprehensive timeline of events
 */

import React, { useState, useEffect } from 'react';

interface PaymentInstruction {
  instruction_id: string;
  trace_id: string;
  selected_rail: string;
  selected_instrument: string;
  processor: string;
  amount: number;
  currency: string;
  fees: number;
  settlement_time: string;
  created_at: string;
}

interface ProcessorAuthResult {
  auth_id: string;
  status: 'approved' | 'declined' | 'pending';
  processor: string;
  response_time_ms: number;
  approval_score?: number;
  settlement_time?: string;
  created_at: string;
}

interface Phase4FlowProps {
  traceId?: string;
}

const Phase4Flow: React.FC<Phase4FlowProps> = ({ traceId }) => {
  const [paymentInstruction, setPaymentInstruction] = useState<PaymentInstruction | null>(null);
  const [authResult, setAuthResult] = useState<ProcessorAuthResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // Simulate loading Phase 4 data
    const timer = setTimeout(() => {
      setPaymentInstruction({
        instruction_id: 'PI_123456789',
        trace_id: traceId || 'trace_001',
        selected_rail: 'ACH',
        selected_instrument: 'Bank Transfer',
        processor: 'Carat',
        amount: 1000,
        currency: 'USD',
        fees: 45, // 45 bps
        settlement_time: '22h',
        created_at: new Date().toISOString()
      });

      setTimeout(() => {
        setAuthResult({
          auth_id: 'AUTH_123456',
          status: 'approved',
          processor: 'Carat',
          response_time_ms: 245,
          approval_score: 96,
          settlement_time: '22h',
          created_at: new Date().toISOString()
        });
        setLoading(false);
      }, 1000);
    }, 500);

    return () => clearTimeout(timer);
  }, [traceId]);

  const steps = [
    { id: 0, title: 'Payment Instruction Compiled', description: 'Orca/Opal/Olive finalize optimal path' },
    { id: 1, title: 'Instruction Signed & Logged', description: 'Weave applies digital signature and audit log' },
    { id: 2, title: 'Forwarded to Processor', description: 'Instruction sent to selected payment processor' },
    { id: 3, title: 'Authorization Complete', description: 'Processor returns auth result with approval score' }
  ];

  useEffect(() => {
    if (paymentInstruction && !loading) {
      setActiveStep(1);
      setTimeout(() => setActiveStep(2), 500);
      setTimeout(() => setActiveStep(3), 1000);
    }
  }, [paymentInstruction, loading]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading Phase 4 flow...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Instruction Flow</h3>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= activeStep 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {index < activeStep ? '✓' : index + 1}
              </div>
              <div className="flex-1">
                <h4 className={`font-medium ${
                  index <= activeStep ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </h4>
                <p className={`text-sm ${
                  index <= activeStep ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Instruction */}
      {paymentInstruction && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Instruction</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Instruction ID:</span>
              <span className="ml-2 text-gray-900">{paymentInstruction.instruction_id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Trace ID:</span>
              <span className="ml-2 text-gray-900">{paymentInstruction.trace_id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Selected Rail:</span>
              <span className="ml-2 text-gray-900">{paymentInstruction.selected_rail}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Instrument:</span>
              <span className="ml-2 text-gray-900">{paymentInstruction.selected_instrument}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Processor:</span>
              <span className="ml-2 text-gray-900">{paymentInstruction.processor}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Amount:</span>
              <span className="ml-2 text-gray-900">${paymentInstruction.amount}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Fees:</span>
              <span className="ml-2 text-gray-900">{paymentInstruction.fees} bps</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Settlement:</span>
              <span className="ml-2 text-gray-900">{paymentInstruction.settlement_time}</span>
            </div>
          </div>
        </div>
      )}

      {/* Authorization Result */}
      {authResult && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Authorization Result</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Auth ID:</span>
              <span className="ml-2 text-gray-900">{authResult.auth_id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                authResult.status === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {authResult.status.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Processor:</span>
              <span className="ml-2 text-gray-900">{authResult.processor}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Response Time:</span>
              <span className="ml-2 text-gray-900">{authResult.response_time_ms}ms</span>
            </div>
            {authResult.approval_score && (
              <div>
                <span className="font-medium text-gray-600">Approval Score:</span>
                <span className="ml-2 text-gray-900">{authResult.approval_score}%</span>
              </div>
            )}
            {authResult.settlement_time && (
              <div>
                <span className="font-medium text-gray-600">Settlement Time:</span>
                <span className="ml-2 text-gray-900">{authResult.settlement_time}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Phase4Flow;