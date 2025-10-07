/**
 * Tests for MerchantDashboard Component
 * 
 * Tests the merchant dashboard including:
 * - Processor bids comparison
 * - Final route selection
 * - Fee savings analysis
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MerchantDashboard from '../components/MerchantDashboard';

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

describe('MerchantDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<MerchantDashboard />);
    
    expect(screen.getByText('Loading merchant data...')).toBeInTheDocument();
  });

  it('renders merchant dashboard with demo data', async () => {
    render(<MerchantDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Merchant Dashboard')).toBeInTheDocument();
    });
    
    // Check header
    expect(screen.getByText('Payment processing insights and cost optimization')).toBeInTheDocument();
    expect(screen.getByText('Optimized')).toBeInTheDocument();
  });

  it('displays summary cards', async () => {
    render(<MerchantDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Volume')).toBeInTheDocument();
      expect(screen.getByText('Fees Paid')).toBeInTheDocument();
      expect(screen.getByText('Fees Saved')).toBeInTheDocument();
      expect(screen.getByText('Avg Fee Rate')).toBeInTheDocument();
    });
    
    // Check summary values
    expect(screen.getByText('$125K')).toBeInTheDocument();
    expect(screen.getByText('$1,875.00')).toBeInTheDocument();
    expect(screen.getByText('$625.00')).toBeInTheDocument();
    expect(screen.getByText('1.50%')).toBeInTheDocument();
  });

  it('shows processor bids section', async () => {
    render(<MerchantDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Processor Bids')).toBeInTheDocument();
    });
    
    // Check processor names
    expect(screen.getByText('Carat')).toBeInTheDocument();
    expect(screen.getByText('Stripe')).toBeInTheDocument();
    expect(screen.getByText('Adyen')).toBeInTheDocument();
    
    // Check selected processor
    expect(screen.getByText('Selected')).toBeInTheDocument();
  });

  it('displays bid details', async () => {
    render(<MerchantDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('45.0 bps')).toBeInTheDocument(); // Carat effective cost
      expect(screen.getByText('280.0 bps')).toBeInTheDocument(); // Stripe effective cost
      expect(screen.getByText('305.0 bps')).toBeInTheDocument(); // Adyen effective cost
    });
    
    // Check scores
    expect(screen.getByText('92%')).toBeInTheDocument(); // Carat score
    expect(screen.getByText('78%')).toBeInTheDocument(); // Stripe score
    expect(screen.getByText('75%')).toBeInTheDocument(); // Adyen score
  });

  it('shows route analysis section', async () => {
    render(<MerchantDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Route Analysis')).toBeInTheDocument();
    });
    
    // Check selected route
    expect(screen.getByText('Selected Route')).toBeInTheDocument();
    expect(screen.getByText('CARAT')).toBeInTheDocument();
    expect(screen.getByText('ACH')).toBeInTheDocument();
    
    // Check savings
    expect(screen.getByText('$85.00')).toBeInTheDocument(); // Savings vs alternatives
  });

  it('displays performance metrics', async () => {
    render(<MerchantDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    });
    
    // Check metric labels
    expect(screen.getByText('Approval Rate')).toBeInTheDocument();
    expect(screen.getByText('Settlement Speed')).toBeInTheDocument();
    expect(screen.getByText('Cost Efficiency')).toBeInTheDocument();
    expect(screen.getByText('Reliability Score')).toBeInTheDocument();
  });

  it('shows fee analysis section', async () => {
    render(<MerchantDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Fee Analysis')).toBeInTheDocument();
    });
    
    // Check cost reduction
    expect(screen.getByText('33.3%')).toBeInTheDocument(); // Cost reduction percentage
    expect(screen.getByText('-8.5%')).toBeInTheDocument(); // Monthly trend
    expect(screen.getByText('1,250')).toBeInTheDocument(); // Total transactions
  });

  it('displays cost breakdown', async () => {
    render(<MerchantDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Cost Breakdown')).toBeInTheDocument();
    });
    
    // Check cost breakdown items
    expect(screen.getByText('Processor Fees')).toBeInTheDocument();
    expect(screen.getByText('Network Fees')).toBeInTheDocument();
    expect(screen.getByText('Additional Fees')).toBeInTheDocument();
    
    // Check amounts
    expect(screen.getByText('$1,500.00')).toBeInTheDocument();
    expect(screen.getByText('$300.00')).toBeInTheDocument();
    expect(screen.getByText('$75.00')).toBeInTheDocument();
  });

  it('shows quick actions', async () => {
    render(<MerchantDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });
    
    // Check quick action buttons
    expect(screen.getByText('View Analytics')).toBeInTheDocument();
    expect(screen.getByText('Optimize Routes')).toBeInTheDocument();
    expect(screen.getByText('Security Settings')).toBeInTheDocument();
  });

  it('handles merchantId prop correctly', async () => {
    const mockMerchantId = 'merchant-123';
    render(<MerchantDashboard merchantId={mockMerchantId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Merchant Dashboard')).toBeInTheDocument();
    });
  });

  it('handles traceId prop correctly', async () => {
    const mockTraceId = 'trace-123';
    render(<MerchantDashboard traceId={mockTraceId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Merchant Dashboard')).toBeInTheDocument();
    });
  });

  it('shows processor details including rail types', async () => {
    render(<MerchantDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('ACH')).toBeInTheDocument(); // Carat rail
      expect(screen.getByText('Card')).toBeInTheDocument(); // Stripe/Adyen rail
    });
    
    // Check settlement times
    expect(screen.getByText('24h')).toBeInTheDocument();
    expect(screen.getByText('48h')).toBeInTheDocument();
  });

  it('displays approval rates and risk scores', async () => {
    render(<MerchantDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('98.0%')).toBeInTheDocument(); // Carat approval rate
      expect(screen.getByText('95.0%')).toBeInTheDocument(); // Stripe approval rate
      expect(screen.getByText('96.0%')).toBeInTheDocument(); // Adyen approval rate
    });
    
    // Check risk scores
    expect(screen.getByText('25%')).toBeInTheDocument(); // Carat risk score
    expect(screen.getByText('35%')).toBeInTheDocument(); // Stripe risk score
    expect(screen.getByText('30%')).toBeInTheDocument(); // Adyen risk score
  });

  it('shows rebate information when available', async () => {
    render(<MerchantDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Rebate: 5.0 bps')).toBeInTheDocument(); // Carat rebate
      expect(screen.getByText('Rebate: 10.0 bps')).toBeInTheDocument(); // Stripe rebate
      expect(screen.getByText('Rebate: 15.0 bps')).toBeInTheDocument(); // Adyen rebate
    });
  });
});








