import React, { useState } from 'react';
import { Explanation, Verbosity } from '../src/demos/agent/types';
import { getAgentColor, getScoreColor, formatTimestamp, getAgentDisplayName } from '../src/demos/agent/constants';

interface ExplanationChatProps {
  explanations: Explanation[];
  verbosity: Verbosity;
  isRunning: boolean;
}

const ExplanationChat: React.FC<ExplanationChatProps> = ({ 
  explanations, 
  verbosity, 
  isRunning 
}) => {
  const [expandedEvidence, setExpandedEvidence] = useState<Set<number>>(new Set());

  const toggleEvidence = (index: number) => {
    const newExpanded = new Set(expandedEvidence);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEvidence(newExpanded);
  };


  const shouldShowEvidence = (explanation: Explanation) => {
    if (verbosity === 'brief') return false;
    if (verbosity === 'standard') return explanation.key_signals && explanation.key_signals.length > 0;
    return true; // forensics
  };

  return (
    <div className="h-full bg-white rounded-lg shadow-ocn-8 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-ocn-dark">Agent Explanations</h2>
        <div className="flex items-center space-x-2">
          {isRunning && (
            <div className="flex items-center text-ocn-medium">
              <div className="w-2 h-2 bg-ocn-aqua rounded-full animate-pulse mr-2"></div>
              Processing...
            </div>
          )}
          <div className="px-3 py-1 bg-ocn-light text-ocn-dark rounded-full text-sm font-medium">
            {explanations.length} explanations
          </div>
        </div>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {explanations.map((explanation, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-ocn-8 transition-shadow">
            {/* Agent Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getAgentColor(explanation.agent)}`}>
                  {getAgentDisplayName(explanation.agent)}
                </div>
                <div className="text-sm text-ocn-medium">
                  {formatTimestamp(explanation.timestamp)}
                </div>
              </div>
              <div className="text-sm text-ocn-medium">
                Trace: {explanation.trace_id.split('_')[1]}
              </div>
            </div>

            {/* Summary */}
            <div className="mb-3">
              <p className="text-ocn-dark font-medium leading-relaxed">
                {explanation.summary}
              </p>
            </div>

            {/* Decision and Score */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <div className="text-sm text-ocn-medium mb-1">Decision</div>
                <div className="font-semibold text-ocn-dark">{explanation.decision}</div>
              </div>
              {explanation.score !== undefined && (
                <div className="text-right">
                  <div className="text-sm text-ocn-medium mb-1">
                    Score
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(explanation.score, 'suitability')}`}>
                    {explanation.score.toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            {/* Uncertainty and Versions */}
            {(verbosity === 'standard' || verbosity === 'forensics') && (
              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <span className="text-ocn-medium">Uncertainty:</span>
                  <span className="ml-2 font-medium text-ocn-dark">
                    {((explanation.uncertainty || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-ocn-medium">Model:</span>
                  <span className="ml-2 font-medium text-ocn-dark">
                    {explanation.model_version}
                  </span>
                </div>
                <div>
                  <span className="text-ocn-medium">Policy:</span>
                  <span className="ml-2 font-medium text-ocn-dark">
                    {explanation.policy_version}
                  </span>
                </div>
              </div>
            )}

            {/* Evidence */}
            {shouldShowEvidence(explanation) && explanation.key_signals && (
              <div className="border-t border-gray-200 pt-3">
                <button
                  onClick={() => toggleEvidence(index)}
                  className="flex items-center justify-between w-full text-left hover:bg-gray-50 rounded p-2 -m-2"
                >
                  <span className="font-medium text-ocn-dark">Evidence</span>
                  <div className="text-ocn-medium">
                    {expandedEvidence.has(index) ? '▼' : '▶'}
                  </div>
                </button>
                
                {expandedEvidence.has(index) && (
                  <div className="mt-3 space-y-3">
                    {/* Key Signals */}
                    <div>
                      <div className="text-sm font-medium text-ocn-dark mb-2">Key Signals</div>
                      <div className="space-y-1">
                        {explanation.key_signals.map((signal, signalIndex) => (
                          <div key={signalIndex} className="text-sm text-ocn-medium bg-ocn-light p-2 rounded">
                            • {signal.path}: {String(signal.value)} {signal.weight && `(weight: ${signal.weight})`}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AP2 References */}
                    {explanation.ap2_refs && (
                      <div>
                        <div className="text-sm font-medium text-ocn-dark mb-2">AP2 References</div>
                        <div className="flex flex-wrap gap-2">
                          {explanation.ap2_refs.map((ref, refIndex) => (
                            <span key={refIndex} className="px-2 py-1 bg-ocn-purple text-white text-xs rounded">
                              {ref}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Redacted Fields */}
                    {verbosity === 'forensics' && explanation.redactions && explanation.redactions.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-ocn-dark mb-2">Redacted Fields</div>
                        <div className="flex flex-wrap gap-2">
                          {explanation.redactions.map((field, fieldIndex) => (
                            <span key={fieldIndex} className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {explanations.length === 0 && !isRunning && (
          <div className="text-center py-12 text-ocn-medium">
            <div className="text-4xl mb-4">🤖</div>
            <div className="text-lg font-medium mb-2">Ready to Start</div>
            <div className="text-sm">Click "Start Demo" to see agent explanations</div>
          </div>
        )}

        {isRunning && explanations.length === 0 && (
          <div className="text-center py-12 text-ocn-medium">
            <div className="text-4xl mb-4 animate-pulse">⚡</div>
            <div className="text-lg font-medium mb-2">Initializing Agents...</div>
            <div className="text-sm">Preparing explanation sequence</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplanationChat;
