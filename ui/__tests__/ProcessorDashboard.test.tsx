/**
 * Tests for ProcessorDashboard Component
 * 
 * Tests the processor dashboard including:
 * - Bid history and performance
 * - Authorization results
 * - Trace ID tracking
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProcessorDashboard from '../components/ProcessorDashboard';

// Mock the UI components
jest.mock('../components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div data-testid="card-title" {...props}>{children}</div>,
}));

jest.mock('../components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>,
}));

jest.mock('../components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button data-testid="button" {...props}>{children}</button>,
}));

jest.mock('../components/ui/progress', () => ({
  Progress: ({ value, ...props }: any) => (
    <div data-testid="progress" data-value={value} {...props} />
  ),
}));

describe('ProcessorDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<ProcessorDashboard />);
    
    expect(screen.getByText('Loading processor data...')).toBeInTheDocument();
  });

  it('renders processor dashboard with demo data', async () => {
    render(<ProcessorDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Processor Dashboard')).toBeInTheDocument();
    });
    
    // Check header
    expect(screen.getByText('Bid history, authorization results, and system monitoring')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('displays trace ID search section', async () => {
    render(<ProcessorDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Search by Trace ID')).toBeInTheDocument();
    });
    
    // Check search input
    const searchInput = screen.getByPlaceholderText('Enter trace ID...');
    expect(searchInput).toBeInTheDocument();
    
    // Check search button
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  it('displays metrics cards', async () => {
    render(<ProcessorDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Win Rate')).toBeInTheDocument();
      expect(screen.getByText('Total Volume')).toBeInTheDocument();
      expect(screen.getByText('Avg Processing')).toBeInTheDocument();
      expect(screen.getByText('Approval Rate')).toBeInTheDocument();
    });
    
    // Check metric values
    expect(screen.getByText('71.5%')).toBeInTheDocument(); // Win rate
    expect(screen.getByText('$1,250K')).toBeInTheDocument(); // Total volume
    expect(screen.getByText('268ms')).toBeInTheDocument(); // Avg processing
    expect(screen.getByText('96.0%')).toBeInTheDocument(); // Approval rate
  });

  it('shows bid history section', async () => {
    render(<ProcessorDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Bid History')).toBeInTheDocument();
    });
    
    // Check bid statuses
    expect(screen.getByText('WON')).toBeInTheDocument();
    expect(screen.getByText('LOST')).toBeInTheDocument();
    
    // Check bid details
    expect(screen.getByText('45.0 bps')).toBeInTheDocument(); // Carat effective cost
    expect(screen.getByText('280.0 bps')).toBeInTheDocument(); // Stripe effective cost
    expect(screen.getByText('67.0 bps')).toBeInTheDocument(); // RTP effective cost
  });

  it('displays authorization results section', async () => {
    render(<ProcessorDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Authorization Results')).toBeInTheDocument();
    });
    
    // Check auth statuses
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
    expect(screen.getByText('DECLINED')).toBeInTheDocument();
    
    // Check auth codes
    expect(screen.getByText('AUTH_123456')).toBeInTheDocument();
    expect(screen.getByText('AUTH_789012')).toBeInTheDocument();
  });

  it('shows processing times', async () => {
    render(<ProcessorDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('245ms')).toBeInTheDocument();
      expect(screen.getByText('189ms')).toBeInTheDocument();
      expect(screen.getByText('156ms')).toBeInTheDocument();
    });
  });

  it('displays fraud check results', async () => {
    render(<ProcessorDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('passed')).toBeInTheDocument();
      expect(screen.getByText('failed')).toBeInTheDocument();
    });
  });

  it('shows risk and approval scores', async () => {
    render(<ProcessorDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('25%')).toBeInTheDocument(); // Risk score
      expect(screen.getByText('96%')).toBeInTheDocument(); // Approval score
      expect(screen.getByText('20%')).toBeInTheDocument(); // Risk score
      expect(screen.getByText('98%')).toBeInTheDocument(); // Approval score
      expect(screen.getByText('85%')).toBeInTheDocument(); // Risk score
      expect(screen.getByText('15%')).toBeInTheDocument(); // Approval score
    });
  });

  it('displays decline reasons when available', async () => {
    render(<ProcessorDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Decline Reason')).toBeInTheDocument();
      expect(screen.getByText('Insufficient funds')).toBeInTheDocument();
    });
  });

  it('shows system health section', async () => {
    render(<ProcessorDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument();
    });
    
    // Check health metrics
    expect(screen.getByText('System Uptime')).toBeInTheDocument();
    expect(screen.getByText('Error Rate')).toBeInTheDocument();
    expect(screen.getByText('Fraud Detection')).toBeInTheDocument();
    
    // Check values
    expect(screen.getByText('99.8%')).toBeInTheDocument(); // System uptime
    expect(screen.getByText('0.02%')).toBeInTheDocument(); // Error rate
    expect(screen.getByText('4.0%')).toBeInTheDocument(); // Fraud detection
  });

  it('displays performance metrics', async () => {
    render(<ProcessorDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    });
    
    // Check performance labels
    expect(screen.getByText('Total Bids')).toBeInTheDocument();
    expect(screen.getByText('Fees Earned')).toBeInTheDocument();
    
    // Check values
    expect(screen.getByText('1,247')).toBeInTheDocument(); // Total bids
    expect(screen.getByText('$18,750.00')).toBeInTheDocument(); // Fees earned
  });

  it('shows quick actions', async () => {
    render(<ProcessorDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });
    
    // Check quick action buttons
    expect(screen.getByText('Export Data')).toBeInTheDocument();
    expect(screen.getByText('View Analytics')).toBeInTheDocument();
    expect(screen.getByText('System Status')).toBeInTheDocument();
  });

  it('handles processorId prop correctly', async () => {
    const mockProcessorId = 'processor-123';
    render(<ProcessorDashboard processorId={mockProcessorId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Processor Dashboard')).toBeInTheDocument();
    });
  });

  it('handles traceId prop correctly', async () => {
    const mockTraceId = 'trace-123';
    render(<ProcessorDashboard traceId={mockTraceId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Processor Dashboard')).toBeInTheDocument();
    });
  });

  it('shows trace IDs in bid history', async () => {
    render(<ProcessorDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Trace: demo_trace_001')).toBeInTheDocument();
      expect(screen.getByText('Trace: demo_trace_002')).toBeInTheDocument();
      expect(screen.getByText('Trace: demo_trace_003')).toBeInTheDocument();
    });
  });

  it('displays processor fees in auth results', async () => {
    render(<ProcessorDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('$15.00')).toBeInTheDocument(); // Processor fee
      expect(screen.getByText('$37.50')).toBeInTheDocument(); // Processor fee
      expect(screen.getByText('$0.00')).toBeInTheDocument(); // Processor fee (declined)
    });
  });

  it('shows view details buttons', async () => {
    render(<ProcessorDashboard />);
    
    await waitFor(() => {
      const viewDetailsButtons = screen.getAllByText('View Details');
      expect(viewDetailsButtons).toHaveLength(6); // 3 in bid history + 3 in auth results
    });
  });

  it('displays bid amounts and rail types', async () => {
    render(<ProcessorDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('$1,000.00')).toBeInTheDocument(); // Bid amount
      expect(screen.getByText('$500.00')).toBeInTheDocument(); // Bid amount
      expect(screen.getByText('$2,500.00')).toBeInTheDocument(); // Bid amount
      
      expect(screen.getByText('ACH')).toBeInTheDocument(); // Rail type
      expect(screen.getByText('Card')).toBeInTheDocument(); // Rail type
      expect(screen.getByText('RTP')).toBeInTheDocument(); // Rail type
    });
  });
});








