import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgentInteractionDemo from '../components/AgentInteractionDemo';

// Mock the MockOrchestrator
jest.mock('../lib/mockOrchestrator', () => {
  return {
    MockOrchestrator: jest.fn().mockImplementation(() => ({
      setCreditOption: jest.fn(),
      generateOxfordsCart: jest.fn().mockReturnValue({
        items: [
          {
            sku: 'OXFORD-SLIM-CREW-M',
            name: 'Slim-Fit Crew Oxford (M)',
            quantity: 2,
            unit_price: 120
          },
          {
            sku: 'BLAZER-NAVY-40R',
            name: 'Navy Blazer',
            quantity: 1,
            unit_price: 140
          }
        ],
        subtotal: 380,
        tax: 30.40,
        total: 410.40,
        currency: 'USD'
      }),
      simulateAgentInteraction: jest.fn().mockResolvedValue([
        {
          agent: 'Onyx',
          summary: 'Trust verification completed.',
          decision: 'APPROVED - High trust profile',
          score: 4.8,
          score_type: 'risk',
          uncertainty: 0.12,
          policy_version: 'trust_v2.1.3',
          model_version: 'onyx_trust_ml_v1.4.2',
          trace_id: 'trace_1234567890_abcdef',
          evidence: {
            key_signals: ['Identity verified via SSN', 'Employment verified'],
            ap2_refs: ['AP2-TRUST-001'],
            redacted_fields: ['ssn_last4']
          },
          timestamp: new Date().toISOString()
        }
      ])
    }))
  };
});

describe('AgentInteractionDemo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the demo interface', () => {
    render(<AgentInteractionDemo />);
    
    expect(screen.getByText('Agent Interaction Demo')).toBeInTheDocument();
    expect(screen.getByText('Real-time explanation of agent decision-making process')).toBeInTheDocument();
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    expect(screen.getByText('Agent Explanations')).toBeInTheDocument();
  });

  test('displays cart items correctly', () => {
    render(<AgentInteractionDemo />);
    
    expect(screen.getByText('Slim-Fit Crew Oxford (M)')).toBeInTheDocument();
    expect(screen.getByText('Navy Blazer')).toBeInTheDocument();
    expect(screen.getByText('$410.40 USD')).toBeInTheDocument();
  });

  test('verbosity toggle works', () => {
    render(<AgentInteractionDemo />);
    
    const briefButton = screen.getByText('Brief');
    const standardButton = screen.getByText('Standard');
    const forensicsButton = screen.getByText('Forensics');
    
    expect(standardButton).toHaveClass('bg-white text-ocn-purple shadow-sm');
    
    fireEvent.click(briefButton);
    expect(briefButton).toHaveClass('bg-white text-ocn-purple shadow-sm');
    
    fireEvent.click(forensicsButton);
    expect(forensicsButton).toHaveClass('bg-white text-ocn-purple shadow-sm');
  });

  test('credit option toggle works', () => {
    render(<AgentInteractionDemo />);
    
    const bnplButton = screen.getByText('BNPL');
    const revolvingButton = screen.getByText('Revolving');
    
    expect(revolvingButton).toHaveClass('bg-white text-ocn-purple shadow-sm');
    
    fireEvent.click(bnplButton);
    expect(bnplButton).toHaveClass('bg-white text-ocn-purple shadow-sm');
  });

  test('start demo button triggers agent interaction', async () => {
    render(<AgentInteractionDemo />);
    
    const startButton = screen.getByText('Start Demo');
    fireEvent.click(startButton);
    
    expect(screen.getByText('Running...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Demo Complete:')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('reset button clears explanations', async () => {
    render(<AgentInteractionDemo />);
    
    // Start demo first
    const startButton = screen.getByText('Start Demo');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText('Demo Complete:')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Then reset
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    expect(screen.getByText('Ready to Start')).toBeInTheDocument();
  });
});








