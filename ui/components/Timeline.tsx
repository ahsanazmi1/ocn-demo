'use client';

interface TimelineEvent {
  step: number;
  agent: string;
  emoji: string;
  action: string;
  timestamp?: string;
  status: 'pending' | 'completed' | 'error';
}

interface TimelineProps {
  events: TimelineEvent[];
  traceId?: string;
}

export default function Timeline({ events, traceId }: TimelineProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Event Timeline</h2>
        {traceId && (
          <span className="text-sm text-gray-500 font-mono">Trace: {traceId}</span>
        )}
      </div>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              event.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : event.status === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {event.step}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{event.emoji}</span>
                <span className="font-medium text-gray-800">{event.agent}</span>
                <span className="text-gray-600">{event.action}</span>
              </div>
              {event.timestamp && (
                <p className="text-xs text-gray-500 mt-1">{event.timestamp}</p>
              )}
            </div>
            <div className={`w-3 h-3 rounded-full ${
              event.status === 'completed' 
                ? 'bg-green-500' 
                : event.status === 'error'
                ? 'bg-red-500'
                : 'bg-gray-300'
            }`} />
          </div>
        ))}
      </div>
    </div>
  );
}