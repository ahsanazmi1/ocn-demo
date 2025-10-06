'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Explanation, Verbosity } from '../types';
import { COLORS } from '../constants';
import ChatBubble from './ChatBubble';

interface AgentChatProps {
  explanations: Explanation[];
  verbosity: Verbosity;
  isProcessing: boolean;
  onChoiceSelect: (choice: 'credit' | 'bnpl') => void;
}

const AgentChat: React.FC<AgentChatProps> = ({ 
  explanations, 
  verbosity, 
  isProcessing,
  onChoiceSelect 
}) => {
  const [showChoiceButtons, setShowChoiceButtons] = useState(false);
  const [visibleExplanations, setVisibleExplanations] = useState<Explanation[]>([]);
  const [currentExplanationIndex, setCurrentExplanationIndex] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [visibleExplanations]);

  // Simulate typing effect - show explanations one by one
  useEffect(() => {
    if (explanations.length > 0 && currentExplanationIndex < explanations.length) {
      // First message starts immediately, subsequent messages have delay
      const isFirstMessage = currentExplanationIndex === 0;
      
      if (isFirstMessage) {
        // Start first message immediately
        setVisibleExplanations(prev => [...prev, explanations[currentExplanationIndex]]);
        setCurrentExplanationIndex(prev => prev + 1);
      } else {
        // Adjusted timing: 20ms per character + minimal base delay
        const currentText = explanations[currentExplanationIndex]?.summary || '';
        const textLength = currentText.length;
        const typingTime = textLength * 20; // 20ms per character (for agent delay calculation)
        const totalDelay = Math.max(300, typingTime + 100); // Minimum 300ms, plus typing time - start sooner

        const timer = setTimeout(() => {
          setVisibleExplanations(prev => [...prev, explanations[currentExplanationIndex]]);
          setCurrentExplanationIndex(prev => prev + 1);
        }, totalDelay);

        return () => clearTimeout(timer);
      }
    } else if (explanations.length === 0) {
      // Reset when explanations are cleared
      setVisibleExplanations([]);
      setCurrentExplanationIndex(0);
    }
  }, [explanations, currentExplanationIndex]);

  // No choice buttons needed - removed for simplicity

  // Choice handling removed for simplicity

  return (
    <div className="agent-demo-card chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <h2 className="text-xl font-semibold" style={{ color: COLORS.dark }}>
            Agent Chat
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          {isProcessing && (
            <div className="status-indicator">
              <div className="status-dot"></div>
              <span className="text-sm">Agents typing...</span>
            </div>
          )}
          <div 
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{ 
              backgroundColor: COLORS.light, 
              color: COLORS.dark 
            }}
          >
            {visibleExplanations.length}/{explanations.length} messages
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div 
        ref={chatContainerRef}
        className="chat-messages-container"
      >
        {/* Empty State */}
        {visibleExplanations.length === 0 && !isProcessing && (
          <div className="chat-empty-state">
            <div className="text-6xl mb-4">💬</div>
            <div className="text-lg font-medium mb-2" style={{ color: COLORS.dark }}>
              Agent Chat Ready
            </div>
            <div className="text-sm" style={{ color: COLORS.medium }}>
              Click "Start Demo" to begin the conversation
            </div>
          </div>
        )}

        {/* Loading State */}
        {isProcessing && visibleExplanations.length === 0 && (
          <div className="chat-loading-state">
            <div className="text-4xl mb-4 animate-pulse">⚡</div>
            <div className="text-lg font-medium mb-2" style={{ color: COLORS.dark }}>
              Agents Connecting...
            </div>
            <div className="text-sm" style={{ color: COLORS.medium }}>
              Establishing communication channels
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="chat-messages">
          {visibleExplanations.map((explanation, index) => {
            // Alternate alignment: left for even indices, right for odd
            const alignment = index % 2 === 0 ? 'left' : 'right';
            return (
              <ChatBubble key={index} explanation={explanation} verbosity={verbosity} alignment={alignment} />
            );
          })}

          {/* Typing indicator */}
          {isProcessing && currentExplanationIndex < explanations.length && (
            <div className={`chat-typing-indicator ${currentExplanationIndex % 2 === 0 ? 'typing-left' : 'typing-right'}`}>
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="typing-text">
                {explanations[currentExplanationIndex]?.agent === 'okra' ? 'Okra' : 
                 explanations[currentExplanationIndex]?.agent === 'onyx' ? 'Onyx' :
                 explanations[currentExplanationIndex]?.agent === 'opal' ? 'Opal' :
                 explanations[currentExplanationIndex]?.agent === 'olive' ? 'Olive' :
                 explanations[currentExplanationIndex]?.agent === 'weave' ? 'Weave' :
                 explanations[currentExplanationIndex]?.agent === 'orca' ? 'Orca' :
                 explanations[currentExplanationIndex]?.agent === 'system' ? 'System' :
                 'Agent'} is typing...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Footer */}
      {!isProcessing && explanations.length > 0 && (
        <div className="chat-footer">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div className="text-sm" style={{ color: COLORS.medium }}>
              <strong>Chat Complete:</strong> {explanations.length} messages from 6 agents (Weave appears twice)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentChat;
