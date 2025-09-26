'use client';

import { useState } from 'react';

interface JsonInspectorProps {
  title: string;
  data: any;
  defaultOpen?: boolean;
}

export default function JsonInspector({ title, data, defaultOpen = false }: JsonInspectorProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left font-medium text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-t-lg flex items-center justify-between"
      >
        <span>{title}</span>
        <span className="text-gray-500">
          {isOpen ? '▼' : '▶'}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 border-t">
          <pre className="text-xs text-gray-700 bg-gray-50 p-3 rounded overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}