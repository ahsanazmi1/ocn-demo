'use client';

import { Explanation, Cart } from './types';

// Connect via server-side API route to get real agent responses
const API_URL = '/api/real-agents';
// Version: 3 - Server-side proxy approach

interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class RealOrchestrator {
  private traceId: string;
  private baseTimestamp: number;

  constructor() {
    this.traceId = '';
    this.baseTimestamp = 0;
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<AgentResponse> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getOxfordsCart(): Cart {
    return {
       items: [
         {
           sku: 'OXFORD-SLIM-CREW-M',
           name: 'Slim-Fit Crew Oxford (M)',
           price: 120.0,
           qty: 2
         },
         {
           sku: 'BLAZER-NAVY-40R',
           name: 'Navy Blazer',
           price: 140.0,
           qty: 1
         }
       ],
       currency: 'USD',
       subtotal: 380.0,
       tax: 30.40,
       total: 410.40
    };
  }

  async runAgentFlow(choice?: 'credit' | 'bnpl'): Promise<Explanation[]> {
    const selectedChoice = choice || 'credit';
    const explanations: Explanation[] = [];
    const cart = this.getOxfordsCart();
    const cartTotal = cart.total;

    this.traceId = this.generateTraceId();
    this.baseTimestamp = Date.now();

    // Call the gateway's full demo endpoint to get real agent responses
    let gatewayResponse;
    try {
      console.log('🚀 REAL AGENT: Calling server-side API for real agent data...');
      gatewayResponse = await this.makeRequest(`${API_URL}`, {
        method: 'POST'
      });
      console.log('🚀 REAL AGENT: Gateway response:', gatewayResponse.success ? 'SUCCESS' : 'FAILED');
      
      if (gatewayResponse.success) {
        console.log('🚀 REAL AGENT: Parsing gateway response...');
        console.log('🚀 REAL AGENT: Gateway response structure:', Object.keys(gatewayResponse.data || {}));
        const parsedExplanations = this.parseGatewayResponse(gatewayResponse.data, selectedChoice);
        console.log('🚀 REAL AGENT: Parsed explanations count:', parsedExplanations.length);
        console.log('🚀 REAL AGENT: First explanation:', parsedExplanations[0]);
        return parsedExplanations;
      }
    } catch (error) {
      console.warn('🚀 REAL AGENT: Gateway call failed, using fallback:', error);
    }

    // Fallback to mock data if gateway fails
    console.log('🎭 FALLBACK: Using mock orchestrator due to gateway failure');
    const mockOrchestrator = new (await import('./mockOrchestrator')).MockOrchestrator();
    return mockOrchestrator.runAgentFlow(selectedChoice);
  }

  private parseGatewayResponse(gatewayData: any, choice: string): Explanation[] {
    console.log('🚀 REAL AGENT: parseGatewayResponse called with data:', JSON.stringify(gatewayData, null, 2));
    const explanations: Explanation[] = [];
    const timestamp = new Date(this.baseTimestamp + 1000).toISOString();

    // Extract the actual data from the API response
    const data = gatewayData.data || gatewayData;
    console.log('🚀 REAL AGENT: Extracted data keys:', Object.keys(data));

    // 1. Orca Decision with LLM Explanation
    console.log('🚀 REAL AGENT: Checking Orca decision:', !!data.orca?.decision);
    console.log('🚀 REAL AGENT: Checking Orca explanation:', !!data.orca?.explanation);
    if (data.orca?.decision) {
      // Use LLM explanation if available, otherwise fall back to decision reasons
      let summary: string;
      if (data.orca.explanation?.explanation) {
        // Use the LLM-generated explanation
        summary = data.orca.explanation.explanation;
        console.log('🚀 REAL AGENT: Using LLM explanation for Orca');
      } else {
        // Fall back to decision reasons
        summary = `Checkout decision: ${data.orca.decision.decision}. ${data.orca.decision.reasons?.join(', ') || 'Risk assessment completed.'}`;
        console.log('🚀 REAL AGENT: Using fallback summary for Orca');
      }
      
      explanations.push({
        trace_id: this.traceId,
        step_id: 'orca_checkout_001',
        agent: 'orca',
        model_version: 'orca_decision_ml_v4.1.8',
        policy_version: 'checkout_v1.0.0',
        summary: summary,
        decision: data.orca.decision.decision.toLowerCase(),
        score: data.orca.decision.meta?.risk_score || 0.5,
        score_type: 'risk',
        uncertainty: 0.1,
        key_signals: [{ path: 'cart.total', value: data.orca.decision.cart_total || data.orca.decision.meta?.cart_total || 410.40, weight: 0.5 }],
        ap2_refs: [],
        redactions: [],
        timestamp: timestamp,
        extra: { 
          status: 'completed', 
          real_data: true, 
          llm_explanation: !!data.orca.explanation?.explanation,
          explanation_source: data.orca.explanation?.explanation ? 'LLM' : 'fallback'
        }
      });
    }

    // 2. Opal Wallet Methods
    console.log('🚀 REAL AGENT: Checking Opal methods:', !!data.opal?.methods);
    if (data.opal?.methods) {
      explanations.push({
        trace_id: this.traceId,
        step_id: 'opal_wallet_002',
        agent: 'opal',
        model_version: 'opal_wallet_v2.1.0',
        policy_version: 'wallet_v1.0.0',
        summary: `Wallet methods retrieved: ${data.opal.methods.length} payment options available. Selected: ${data.opal.methods[0]?.type || 'card'}`,
        decision: 'allow',
        score: 0.9,
        score_type: 'security',
        uncertainty: 0.05,
        key_signals: [{ path: 'payment_methods.count', value: data.opal.methods.length, weight: 0.3 }],
        ap2_refs: [],
        redactions: [],
        timestamp: new Date(this.baseTimestamp + 2000).toISOString(),
        extra: { method: data.opal.methods[0]?.type || 'card', real_data: true }
      });
    }

    // 3. Olive Incentives
    if (data.olive?.incentives) {
      explanations.push({
        trace_id: this.traceId,
        step_id: 'olive_loyalty_003',
        agent: 'olive',
        model_version: 'olive_loyalty_v3.0.0',
        policy_version: 'loyalty_v1.0.0',
        summary: `Incentives applied: ${data.olive.incentives.data?.count || 0} programs available. ${data.olive.incentives.data?.incentives?.[0]?.name || 'Loyalty rewards calculated.'}`,
        decision: 'allow',
        score: 0.8,
        score_type: 'value',
        uncertainty: 0.1,
        key_signals: [{ path: 'incentives.count', value: data.olive.incentives.data?.count || 0, weight: 0.2 }],
        ap2_refs: [],
        redactions: [],
        timestamp: new Date(this.baseTimestamp + 3000).toISOString(),
        extra: { cashback: 5, real_data: true }
      });
    }

    // 4. Okra BNPL Quote
    if (data.okra?.bnpl_quote) {
      explanations.push({
        trace_id: this.traceId,
        step_id: 'okra_bnpl_004',
        agent: 'okra',
        model_version: 'okra_scoring_v2.5.0',
        policy_version: 'bnpl_v1.0.0',
        summary: `BNPL quote generated: ${data.okra.bnpl_quote.approved ? 'APPROVED' : 'DECLINED'}. APR: ${data.okra.bnpl_quote.apr}%, Limit: $${data.okra.bnpl_quote.limit}`,
        decision: data.okra.bnpl_quote.approved ? 'allow' : 'decline',
        score: data.okra.bnpl_quote.score || 0.8,
        score_type: 'affordability',
        uncertainty: 0.15,
        key_signals: [{ path: 'bnpl.apr', value: data.okra.bnpl_quote.apr, weight: 0.4 }],
        ap2_refs: [],
        redactions: [],
        timestamp: new Date(this.baseTimestamp + 4000).toISOString(),
        extra: { apr: data.okra.bnpl_quote.apr, limit: data.okra.bnpl_quote.limit, real_data: true }
      });
    }

    // 5. Onyx KYB Verification
    if (data.onyx?.kyb_verification) {
      explanations.push({
        trace_id: this.traceId,
        step_id: 'onyx_kyb_005',
        agent: 'onyx',
        model_version: 'onyx_kyb_v1.8.0',
        policy_version: 'kyb_v1.0.0',
        summary: `KYB verification: ${data.onyx.kyb_verification.status.toUpperCase()}. ${data.onyx.kyb_verification.reason || 'Verification completed.'}`,
        decision: data.onyx.kyb_verification.status === 'verified' ? 'allow' : 'review',
        score: 0.85,
        score_type: 'trust',
        uncertainty: 0.1,
        key_signals: [{ path: 'kyb.status', value: data.onyx.kyb_verification.status, weight: 0.3 }],
        ap2_refs: [],
        redactions: [],
        timestamp: new Date(this.baseTimestamp + 5000).toISOString(),
        extra: { entity_id: data.onyx.kyb_verification.entity_id, real_data: true }
      });
    }

    // 6. Weave Auction (if available)
    if (data.weave) {
      explanations.push({
        trace_id: this.traceId,
        step_id: 'weave_auction_007',
        agent: 'weave',
        model_version: 'weave_auction_v1.2.0',
        policy_version: 'auction_v1.0.0',
        summary: `Processor auction completed. Settlement path optimized for ${choice} transaction.`,
        decision: 'allow',
        score: 0.9,
        score_type: 'optimization',
        uncertainty: 0.05,
        key_signals: [{ path: 'auction.winner', value: 'selected_processor', weight: 0.2 }],
        ap2_refs: [],
        redactions: [],
        timestamp: new Date(this.baseTimestamp + 6000).toISOString(),
        extra: { auction_results: 'completed', real_data: true }
      });
    }

    // 7. Phase 3 - Individual Orca Negotiation
    if (data.phase3?.negotiation?.orca) {
      // Use LLM explanation if available, otherwise fall back to negotiation explanation
      let summary: string;
      
      // Check if explanation exists and is not empty
      const hasExplanation = data.phase3.negotiation.orca.explanation && 
                            data.phase3.negotiation.orca.explanation.trim().length > 0;
      
      if (hasExplanation) {
        // Use the negotiation's built-in explanation (which should be LLM-generated)
        // Extract just the main explanation part (before "Structured Analysis")
        const fullExplanation = data.phase3.negotiation.orca.explanation;
        const mainExplanation = fullExplanation.split('\n\nStructured Analysis:')[0];
        summary = mainExplanation;
        console.log('🚀 REAL AGENT: Using Orca negotiation LLM explanation');
      } else {
        // Fall back to template-based summary
        summary = `Orca negotiation completed. Optimal rail: ${data.phase3.negotiation.orca.optimal_rail || 'Card'}. Risk score: ${data.phase3.negotiation.orca.negotiation_metadata?.ml_risk_score || 'N/A'}.`;
        console.log('🚀 REAL AGENT: Using fallback summary for Orca negotiation');
      }
      
      explanations.push({
        trace_id: this.traceId,
        step_id: 'orca_negotiation_007',
        agent: 'orca',
        model_version: 'orca_negotiation_v1.0.0',
        policy_version: 'negotiation_v1.0.0',
        summary: summary,
        decision: 'allow',
        score: data.phase3.negotiation.orca.negotiation_metadata?.ml_risk_score || 0.7,
        score_type: 'risk',
        uncertainty: 0.1,
        key_signals: [{ path: 'negotiation.optimal_rail', value: data.phase3.negotiation.orca.optimal_rail || 'Card', weight: 0.5 }],
        ap2_refs: [],
        redactions: [],
        timestamp: new Date(this.baseTimestamp + 6500).toISOString(),
        extra: { 
          rail_evaluations: data.phase3.negotiation.orca.rail_evaluations, 
          real_data: true,
          llm_explanation: !!data.phase3.negotiation.orca.explanation,
          explanation_source: data.phase3.negotiation.orca.explanation ? 'LLM' : 'fallback'
        }
      });
    }

    // 8. Phase 3 - Individual Opal Counter-Negotiation
    if (data.phase3?.negotiation?.opal) {
      explanations.push({
        trace_id: this.traceId,
        step_id: 'opal_counter_negotiation_008',
        agent: 'opal',
        model_version: 'opal_counter_negotiation_v1.0.0',
        policy_version: 'counter_negotiation_v1.0.0',
        summary: `Opal counter-negotiation completed. Consumer proposal: ${data.phase3.negotiation.opal.consumer_proposal?.instrument_type || 'credit_card'}. Confidence: ${data.phase3.negotiation.opal.confidence || 'high'}.`,
        decision: 'allow',
        score: data.phase3.negotiation.opal.confidence === 'high' ? 0.9 : 0.7,
        score_type: 'value',
        uncertainty: 0.1,
        key_signals: [{ path: 'counter_negotiation.instrument_type', value: data.phase3.negotiation.opal.consumer_proposal?.instrument_type || 'credit_card', weight: 0.4 }],
        ap2_refs: [],
        redactions: [],
        timestamp: new Date(this.baseTimestamp + 6800).toISOString(),
        extra: { consumer_proposal: data.phase3.negotiation.opal.consumer_proposal, real_data: true }
      });
    }



    // 11. Phase 3 - Settlement (Olive Policy)
    if (data.phase3?.settlement?.olive_policy) {
      explanations.push({
        trace_id: this.traceId,
        step_id: 'phase3_olive_policy_011',
        agent: 'olive',
        model_version: 'olive_policy_v1.0.0',
        policy_version: 'policy_v1.0.0',
        summary: `Settlement policy applied: ${data.phase3.settlement.olive_policy.data?.policy_impact || 'Policy evaluation completed'}. Winner rail: ${data.phase3.settlement.olive_policy.data?.winner_rail || 'unknown'}.`,
        decision: 'allow',
        score: data.phase3.settlement.olive_policy.data?.updated_scores?.cost || 0.8,
        score_type: 'cost',
        uncertainty: 0.05,
        key_signals: [{ path: 'policy.winner_rail', value: data.phase3.settlement.olive_policy.data?.winner_rail || 'unknown', weight: 0.3 }],
        ap2_refs: [],
        redactions: [],
        timestamp: new Date(this.baseTimestamp + 9000).toISOString(),
        extra: { policy_impact: data.phase3.settlement.olive_policy.data?.policy_impact, real_data: true }
      });
    }

    // 12. Phase 3 - Settlement (Onyx Trust)
    if (data.phase3?.settlement?.onyx_trust) {
      explanations.push({
        trace_id: this.traceId,
        step_id: 'phase3_onyx_trust_012',
        agent: 'onyx',
        model_version: 'onyx_trust_v1.0.0',
        policy_version: 'trust_v1.0.0',
        summary: `Trust signal analysis: ${data.phase3.settlement.onyx_trust.data?.risk_level || 'unknown'} risk detected (score: ${data.phase3.settlement.onyx_trust.data?.trust_score?.toFixed(2) || '0.00'}). ${data.phase3.settlement.onyx_trust.data?.explanation || 'Trust evaluation completed'}.`,
        decision: data.phase3.settlement.onyx_trust.data?.risk_level === 'low' ? 'allow' : 'review',
        score: data.phase3.settlement.onyx_trust.data?.trust_score || 0.7,
        score_type: 'trust',
        uncertainty: 0.1,
        key_signals: [{ path: 'trust.risk_level', value: data.phase3.settlement.onyx_trust.data?.risk_level || 'unknown', weight: 0.4 }],
        ap2_refs: [],
        redactions: [],
        timestamp: new Date(this.baseTimestamp + 10000).toISOString(),
        extra: { risk_level: data.phase3.settlement.onyx_trust.data?.risk_level, real_data: true }
      });
    }

    // 13. Phase 3 - Final Settlement (Weave)
    if (data.phase3?.settlement?.final) {
      explanations.push({
        trace_id: this.traceId,
        step_id: 'weave_final_settlement_013',
        agent: 'weave',
        model_version: 'weave_settlement_v1.0.0',
        policy_version: 'settlement_v1.0.0',
        summary: `Final settlement path determined: ${data.phase3.settlement.final.final_rail} rail selected at ${data.phase3.settlement.final.final_cost_bps} bps. ${data.phase3.settlement.final.adjustment_summary || 'Settlement optimization completed'}.`,
        decision: 'allow',
        score: 0.95,
        score_type: 'final',
        uncertainty: 0.02,
        key_signals: [{ path: 'final.rail', value: data.phase3.settlement.final.final_rail, weight: 0.5 }],
        ap2_refs: [],
        redactions: [],
        timestamp: new Date(this.baseTimestamp + 11000).toISOString(),
        extra: { final_rail: data.phase3.settlement.final.final_rail, final_cost_bps: data.phase3.settlement.final.final_cost_bps, real_data: true }
      });
    }


    // 15. Phase 4 - Instruction Signing & Forwarding (Weave)
    if (data.phase4?.instruction_signing) {
      explanations.push({
        trace_id: this.traceId,
        step_id: 'instruction_signing_015',
        agent: 'weave',
        model_version: 'weave_signing_v1.0.0',
        policy_version: 'signing_v1.0.0',
        summary: `Instruction signed and forwarded by Weave. Digital signature: ${data.phase4.instruction_signing.signature_id || 'SIG-' + this.traceId.slice(-8)}. Status: ${data.phase4.instruction_signing.status || 'forwarded'}.`,
        decision: 'allow',
        score: 0.98,
        score_type: 'security',
        uncertainty: 0.02,
        key_signals: [{ path: 'signing.status', value: data.phase4.instruction_signing.status || 'forwarded', weight: 0.5 }],
        ap2_refs: [],
        redactions: [],
        timestamp: new Date(this.baseTimestamp + 13000).toISOString(),
        extra: { signing: data.phase4.instruction_signing, real_data: true }
      });
    }


    console.log('🚀 REAL AGENT: Total explanations generated:', explanations.length);
    return explanations;
  }
}