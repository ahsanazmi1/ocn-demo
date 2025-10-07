'use client';

import React, { useState, useEffect } from 'react';
import { Explanation, Verbosity } from '../types';
import { COLORS } from '../constants';

interface ChatBubbleProps {
  explanation: Explanation;
  verbosity: Verbosity;
  alignment?: 'left' | 'right';
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ explanation, verbosity, alignment = 'left' }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter effect for the summary text
  useEffect(() => {
    const text = explanation.summary;
    let index = 0;
    
    const typeWriter = () => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
        setTimeout(typeWriter, 45); // Slower: 45ms delay between characters
      } else {
        setIsTyping(false);
      }
    };

    // Start typing immediately
    typeWriter();
  }, [explanation.summary]);

  const getAgentDisplayName = (agent: string) => {
    switch (agent) {
      case 'onyx': return 'Onyx';
      case 'okra': return 'Okra';
      case 'opal': return 'Opal';
      case 'olive': return 'Olive';
      case 'weave': return 'Weave';
      case 'orca': return 'Orca';
      case 'system': return 'System';
      default: return 'Agent';
    }
  };

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'onyx': return '#6b7280'; // gray
      case 'okra': return '#f59e0b'; // yellow
      case 'opal': return '#3b82f6'; // blue
      case 'olive': return '#22c55e'; // green
      case 'weave': return '#8b5cf6'; // purple
      case 'orca': return '#ef4444'; // red
      case 'system': return '#6366f1'; // indigo
      default: return '#6b7280';
    }
  };

  return (
    <div className={`chat-message-wrapper ${alignment === 'right' ? 'chat-message-wrapper-right' : 'chat-message-wrapper-left'}`}>
      {alignment === 'left' ? (
        <>
          {/* Left-aligned message */}
          <div className="chat-message-header">
            <div 
              className="agent-avatar-simple"
              style={{ backgroundColor: getAgentColor(explanation.agent) }}
            >
              {explanation.agent === 'onyx' ? '🖤' :
               explanation.agent === 'okra' ? '🦏' :
               explanation.agent === 'opal' ? '💎' :
               explanation.agent === 'olive' ? '🫒' :
               explanation.agent === 'weave' ? '🌊' :
               explanation.agent === 'orca' ? '🦈' :
               explanation.agent === 'system' ? '⚙️' : '🤖'}
            </div>
            <div className="agent-name-simple">
              {getAgentDisplayName(explanation.agent)}
            </div>
          </div>
                <div className={`chat-bubble chat-bubble-left ${explanation.agent}`}>
                  <div className="chat-text">
                    {displayedText}
                    {isTyping && <span className="typing-cursor">|</span>}
                  </div>
                </div>
        </>
      ) : (
        <>
          {/* Right-aligned message */}
          <div className="chat-message-header-right">
            <div className="agent-name-simple">
              {getAgentDisplayName(explanation.agent)}
            </div>
            <div 
              className="agent-avatar-simple"
              style={{ backgroundColor: getAgentColor(explanation.agent) }}
            >
              {explanation.agent === 'onyx' ? '🖤' :
               explanation.agent === 'okra' ? '🦏' :
               explanation.agent === 'opal' ? '💎' :
               explanation.agent === 'olive' ? '🫒' :
               explanation.agent === 'weave' ? '🌊' :
               explanation.agent === 'orca' ? '🦈' :
               explanation.agent === 'system' ? '⚙️' : '🤖'}
            </div>
          </div>
                <div className={`chat-bubble chat-bubble-right ${explanation.agent}`}>
                  <div className="chat-text">
                    {displayedText}
                    {isTyping && <span className="typing-cursor">|</span>}
                  </div>
                </div>
        </>
      )}
    </div>
  );
};

export default ChatBubble;