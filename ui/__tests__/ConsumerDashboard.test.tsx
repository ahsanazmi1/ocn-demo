/**
 * Tests for ConsumerDashboard Component
 * 
 * Tests the consumer dashboard including:
 * - Rewards and bonuses summary
 * - Payment method benefits
 * - Transaction analytics
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConsumerDashboard from '../components/ConsumerDashboard';

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

describe('ConsumerDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<ConsumerDashboard />);
    
    expect(screen.getByText('Loading consumer data...')).toBeInTheDocument();
  });

  it('renders consumer dashboard with demo data', async () => {
    render(<ConsumerDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Consumer Dashboard')).toBeInTheDocument();
    });
    
    // Check header
    expect(screen.getByText('Your rewards, savings, and payment insights')).toBeInTheDocument();
    expect(screen.getByText('Active Member')).toBeInTheDocument();
  });

  it('displays summary cards', async () => {
    render(<ConsumerDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Spent')).toBeInTheDocument();
      expect(screen.getByText('Total Saved')).toBeInTheDocument();
      expect(screen.getByText('Total Rewards')).toBeInTheDocument();
      expect(screen.getByText('Transactions')).toBeInTheDocument();
    });
    
    // Check summary values
    expect(screen.getByText('$1,250.00')).toBeInTheDocument();
    expect(screen.getByText('$86.45')).toBeInTheDocument();
    expect(screen.getByText('$234.50')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
  });

  it('shows recent rewards section', async () => {
    render(<ConsumerDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Rewards')).toBeInTheDocument();
    });
    
    // Check for reward types
    expect(screen.getByText('2.5% cashback on retail purchase')).toBeInTheDocument();
    expect(screen.getByText('Loyalty points bonus for ACH payment')).toBeInTheDocument();
    expect(screen.getByText('First-time ACH payment bonus')).toBeInTheDocument();
    
    // Check reward amounts
    expect(screen.getByText('+$2.50')).toBeInTheDocument();
    expect(screen.getByText('+150')).toBeInTheDocument();
    expect(screen.getByText('+$5.00')).toBeInTheDocument();
  });

  it('displays payment methods section', async () => {
    render(<ConsumerDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Payment Methods')).toBeInTheDocument();
    });
    
    // Check payment method names
    expect(screen.getByText('Premium Rewards Card')).toBeInTheDocument();
    expect(screen.getByText('ACH Direct Transfer')).toBeInTheDocument();
    expect(screen.getByText('Mobile Wallet')).toBeInTheDocument();
    
    // Check last four digits
    expect(screen.getByText('**** 4242')).toBeInTheDocument();
    expect(screen.getByText('**** 1234')).toBeInTheDocument();
    expect(screen.getByText('**** 5678')).toBeInTheDocument();
  });

  it('shows payment method benefits', async () => {
    render(<ConsumerDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Cashback Rate:')).toBeInTheDocument();
      expect(screen.getByText('Loyalty Multiplier:')).toBeInTheDocument();
    });
    
    // Check benefit values
    expect(screen.getByText('2.5%')).toBeInTheDocument();
    expect(screen.getByText('1.5x')).toBeInTheDocument();
    expect(screen.getByText('1.2x')).toBeInTheDocument();
    expect(screen.getByText('1.3x')).toBeInTheDocument();
  });

  it('displays special offers', async () => {
    render(<ConsumerDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Special Offers:')).toBeInTheDocument();
    });
    
    // Check special offers
    expect(screen.getByText('Double points on dining')).toBeInTheDocument();
    expect(screen.getByText('Free foreign transactions')).toBeInTheDocument();
    expect(screen.getByText('Lower fees')).toBeInTheDocument();
    expect(screen.getByText('Faster settlement')).toBeInTheDocument();
  });

  it('shows savings breakdown', async () => {
    render(<ConsumerDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Savings Breakdown')).toBeInTheDocument();
    });
    
    // Check savings metrics
    expect(screen.getByText('6.9%')).toBeInTheDocument(); // Overall savings rate
    expect(screen.getByText('+12.5%')).toBeInTheDocument(); // Monthly trend
    expect(screen.getByText('Premium Rewards Card')).toBeInTheDocument(); // Preferred method
  });

  it('displays quick actions', async () => {
    render(<ConsumerDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });
    
    // Check quick action buttons
    expect(screen.getByText('Redeem Rewards')).toBeInTheDocument();
    expect(screen.getByText('Manage Payment Methods')).toBeInTheDocument();
    expect(screen.getByText('View Transaction History')).toBeInTheDocument();
  });

  it('handles consumerId prop correctly', async () => {
    const mockConsumerId = 'consumer-123';
    render(<ConsumerDashboard consumerId={mockConsumerId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Consumer Dashboard')).toBeInTheDocument();
    });
  });

  it('handles traceId prop correctly', async () => {
    const mockTraceId = 'trace-123';
    render(<ConsumerDashboard traceId={mockTraceId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Consumer Dashboard')).toBeInTheDocument();
    });
  });

  it('shows total savings for payment methods', async () => {
    render(<ConsumerDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('$45.20 saved')).toBeInTheDocument();
      expect(screen.getByText('$22.50 saved')).toBeInTheDocument();
      expect(screen.getByText('$18.75 saved')).toBeInTheDocument();
    });
  });

  it('displays transaction counts for payment methods', async () => {
    render(<ConsumerDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('15 transactions')).toBeInTheDocument();
      expect(screen.getByText('8 transactions')).toBeInTheDocument();
      expect(screen.getByText('12 transactions')).toBeInTheDocument();
    });
  });
});








