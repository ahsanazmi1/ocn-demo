'use client';

import React from 'react';
import { Verbosity } from '../types';
import { COLORS, VERBOSITY_LEVELS } from '../constants';

interface VerbosityToggleProps {
  value: Verbosity;
  onChange: (verbosity: Verbosity) => void;
}

const VerbosityToggle: React.FC<VerbosityToggleProps> = ({ value, onChange }) => {
  const verbosityOptions: Verbosity[] = ['brief', 'standard', 'forensics'];

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium" style={{ color: COLORS.dark }}>
        Verbosity:
      </span>
      <div 
        className="flex rounded-lg p-1"
        style={{ backgroundColor: COLORS.light }}
      >
        {verbosityOptions.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              value === option
                ? 'text-white shadow-sm'
                : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: value === option ? COLORS.purple : 'transparent',
              color: value === option ? 'white' : COLORS.medium
            }}
          >
            {VERBOSITY_LEVELS[option]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VerbosityToggle;
