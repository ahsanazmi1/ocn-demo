/**
 * Tests for Phase4Flow Component
 * 
 * Tests the Phase 4 flow display including:
 * - Payment instruction compilation
 * - Weave signing/logging
 * - Processor forwarding
 * - Authorization results
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Phase4Flow from '../components/Phase4Flow';

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

describe('Phase4Flow Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<Phase4Flow />);
    
    expect(screen.getByText('Loading Phase 4 flow...')).toBeInTheDocument();
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  it('renders demo data when no traceId provided', async () => {
    render(<Phase4Flow />);
    
    await waitFor(() => {
      expect(screen.getByText('Phase 4: Payment Instruction & Processing')).toBeInTheDocument();
    });
    
    // Check for demo payment instruction
    expect(screen.getByText('Final Payment Instruction')).toBeInTheDocument();
    expect(screen.getByText('$1,000.00 USD')).toBeInTheDocument();
    expect(screen.getByText('ACH')).toBeInTheDocument();
    expect(screen.getByText('carat')).toBeInTheDocument();
    
    // Check for authorization result
    expect(screen.getByText('Authorization Result')).toBeInTheDocument();
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
    expect(screen.getByText('AUTH_123456')).toBeInTheDocument();
  });

  it('renders event timeline', async () => {
    render(<Phase4Flow />);
    
    await waitFor(() => {
      expect(screen.getByText('Event Timeline')).toBeInTheDocument();
    });
    
    // Check for timeline events
    expect(screen.getByText('Final payment instruction compiled with optimal path selection')).toBeInTheDocument();
    expect(screen.getByText('Payment instruction digitally signed and logged for audit trail')).toBeInTheDocument();
    expect(screen.getByText('Instruction forwarded to Carat processor for authorization')).toBeInTheDocument();
    expect(screen.getByText('Authorization approved with fast settlement')).toBeInTheDocument();
  });

  it('displays consumer benefits when available', async () => {
    render(<Phase4Flow />);
    
    await waitFor(() => {
      expect(screen.getByText('Consumer Benefits')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Cashback: 2.0%')).toBeInTheDocument();
    expect(screen.getByText('Loyalty Points: 50')).toBeInTheDocument();
  });

  it('shows processing metrics', async () => {
    render(<Phase4Flow />);
    
    await waitFor(() => {
      expect(screen.getByText('Processing Metrics')).toBeInTheDocument();
    });
    
    expect(screen.getByText('245ms')).toBeInTheDocument();
    expect(screen.getByText('passed')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('96%')).toBeInTheDocument();
  });

  it('handles traceId prop correctly', async () => {
    const mockTraceId = 'test-trace-123';
    render(<Phase4Flow traceId={mockTraceId} />);
    
    await waitFor(() => {
      expect(screen.getByText(`Trace ID: ${mockTraceId}`)).toBeInTheDocument();
    });
  });

  it('calls onEventUpdate callback when provided', async () => {
    const mockOnEventUpdate = jest.fn();
    render(<Phase4Flow onEventUpdate={mockOnEventUpdate} />);
    
    await waitFor(() => {
      expect(mockOnEventUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'instruction_compiled',
            actor: 'Orca/Opal/Olive'
          }),
          expect.objectContaining({
            type: 'instruction_signed',
            actor: 'Weave'
          }),
          expect.objectContaining({
            type: 'processor_forwarded',
            actor: 'Weave'
          }),
          expect.objectContaining({
            type: 'auth_result',
            actor: 'Carat'
          })
        ])
      );
    });
  });

  it('displays progress steps correctly', async () => {
    render(<Phase4Flow />);
    
    await waitFor(() => {
      expect(screen.getByText('Processing Flow')).toBeInTheDocument();
    });
    
    // Check for step titles
    expect(screen.getByText('Instruction Compilation')).toBeInTheDocument();
    expect(screen.getByText('Digital Signing')).toBeInTheDocument();
    expect(screen.getByText('Processor Forwarding')).toBeInTheDocument();
    expect(screen.getByText('Authorization Result')).toBeInTheDocument();
  });

  it('shows confidence score progress bar', async () => {
    render(<Phase4Flow />);
    
    await waitFor(() => {
      const progressElement = screen.getByTestId('progress');
      expect(progressElement).toHaveAttribute('data-value', '95');
    });
    
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('displays settlement time and cost information', async () => {
    render(<Phase4Flow />);
    
    await waitFor(() => {
      expect(screen.getByText('$15.00')).toBeInTheDocument(); // effective cost
      expect(screen.getByText('24 hours')).toBeInTheDocument(); // settlement time
      expect(screen.getByText('22h')).toBeInTheDocument(); // actual settlement time
    });
  });

  it('shows explanation text', async () => {
    render(<Phase4Flow />);
    
    await waitFor(() => {
      expect(screen.getByText('Selected ACH rail for optimal cost efficiency. Consumer benefits from lower fees while merchant enjoys reliable settlement.')).toBeInTheDocument();
    });
  });
});








