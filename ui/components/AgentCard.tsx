'use client';

interface AgentCardProps {
  name: string;
  emoji: string;
  status: boolean;
  lastAction?: string;
  subtitle: string;
}

export default function AgentCard({ name, emoji, status, lastAction, subtitle }: AgentCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{emoji}</span>
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          status 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {status ? 'Healthy' : 'Unhealthy'}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{subtitle}</p>
      {lastAction && (
        <p className="text-xs text-gray-500">Last: {lastAction}</p>
      )}
    </div>
  );
}