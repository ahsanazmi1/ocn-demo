import { 
  Agent, 
  Explanation, 
  Cart, 
  KeySignal,
  OXFORD_CART,
  generateTraceId,
  AGENT_SEQUENCE,
  TIMING_CONFIG,
  SCORE_THRESHOLDS,
  UNCERTAINTY_LEVELS
} from './index';

export class MockOrchestrator {
  private traceId: string;
  private baseTimestamp: number;

  constructor() {
    this.traceId = generateTraceId();
    this.baseTimestamp = Date.now();
  }

  getOxfordsCart(): Cart {
    return {
      ...OXFORD_CART,
      total: 380 // Using the constant but keeping the original total
    };
  }

  runAgentFlow(choice?: "credit" | "bnpl"): Explanation[] {
    // Default to credit card if no choice is specified
    const selectedChoice = choice || "credit";
    const explanations: Explanation[] = [];
    
    // Follow the 11-step event sequence from the image:
    // 1. Orca (Checkout decision)
    // 2. Opal (Wallet method selected)
    // 3. Olive (Loyalty incentives applied)
    // 4. Okra (BNPL quote generated)
    // 5. Onyx (KYB verification CE emitted)
    // 6. Orca vs Opal (Negotiation + LLM explanations)
    // 7. Weave (Processor auction)
    // 8. Final (Settlement path)
    // 9. Orca/Opal/Olive (Payment instruction compiled)
    // 10. Weave (Instruction signed & forwarded)
    // 11. Processor (Authorization result)
    
    // 1. Orca - Checkout decision
    explanations.push({
      trace_id: this.traceId,
      step_id: "orca_checkout_001",
      agent: "orca",
      model_version: "orca_checkout_ml_v4.1.8",
      policy_version: "checkout_v5.2.1",
      summary: "Checkout initiated for $380 transaction. Analyzing payment options and risk factors. Ready to proceed with payment processing.",
      decision: "allow",
      score: 0.12,
      score_type: "risk",
      uncertainty: 0.15,
      key_signals: [
        { path: "cart.total", value: 380, weight: 0.08 },
        { path: "merchant.category", value: "clothing", weight: 0.04 }
      ],
      ap2_refs: ["checkout_policy_v5.2.1"],
      redactions: ["user.id", "merchant.id"],
      timestamp: new Date(this.baseTimestamp + 1000).toISOString(),
      extra: {
        transaction_type: "ecommerce",
        processing_mode: "real_time"
      }
    });

    // 2. Opal - Wallet method selected
    explanations.push({
      trace_id: this.traceId,
      step_id: "opal_wallet_002",
      agent: "opal",
      model_version: "opal_wallet_ml_v3.0.1",
      policy_version: "wallet_v1.8.2",
      summary: selectedChoice === "credit" 
        ? "Credit card selected as payment method. Card ending in ****1234 has sufficient credit limit. MCC 5651 (Clothing) eligible for 5% cash back."
        : "BNPL payment method selected. No immediate card charge required. Payment will be split into 4 installments of $95 each.",
      decision: "allow",
      score: 0.09,
      score_type: "suitability",
      uncertainty: 0.15,
      key_signals: [
        { path: "payment_method", value: selectedChoice, weight: 0.4 },
        { path: "mcc", value: 5651, weight: 0.3 },
        { path: "amount", value: 380, weight: 0.3 }
      ],
      ap2_refs: ["wallet_policy_v1.8.2"],
      redactions: ["card_number", "account_balance"],
      timestamp: new Date(this.baseTimestamp + 2000).toISOString(),
      extra: {
        selected_method: selectedChoice === "credit" ? "credit_card" : "bnpl",
        cashback_rate: selectedChoice === "credit" ? 0.05 : 0,
        mcc_eligible: true
      }
    });

    // 3. Olive - Loyalty incentives applied
    explanations.push({
      trace_id: this.traceId,
      step_id: "olive_loyalty_003",
      agent: "olive",
      model_version: "olive_loyalty_ml_v1.9.3",
      policy_version: "loyalty_v2.4.1",
      summary: selectedChoice === "credit"
        ? "Excellent! Credit card selected. You'll earn 5% cash back = $19.00. Gold tier benefits apply. Maximum rewards for clothing purchase."
        : "Great choice! BNPL selected. 0% interest, $95 every two weeks, no fees. Perfect for cash flow management on this purchase.",
      decision: "allow",
      score: selectedChoice === "credit" ? 0.90 : 0.50,
      score_type: "suitability",
      uncertainty: 0.03,
      key_signals: [
        { path: "loyalty_tier", value: "gold", weight: 0.4 },
        { path: "cashback_rate", value: selectedChoice === "credit" ? 0.05 : 0, weight: 0.3 },
        { path: "merchant_category", value: "clothing", weight: 0.3 }
      ],
      ap2_refs: ["loyalty_policy_v2.4.1"],
      redactions: ["member_id", "points_balance"],
      timestamp: new Date(this.baseTimestamp + 3000).toISOString(),
      extra: {
        loyalty_tier: "gold",
        earned_rewards_usd: selectedChoice === "credit" ? 19.00 : 0,
        earned_rewards_percent: selectedChoice === "credit" ? 0.05 : 0
      }
    });

    // 4. Okra - BNPL quote generated
    explanations.push({
      trace_id: this.traceId,
      step_id: "okra_bnpl_004",
      agent: "okra",
      model_version: "okra_bnpl_ml_v2.1.7",
      policy_version: "bnpl_v3.2.1",
      summary: "BNPL quote generated: 4 payments of $95 each, 0% interest, no fees. First payment today, then every 2 weeks. Total cost remains $380.",
      decision: "allow",
      score: 0.15,
      score_type: "risk",
      uncertainty: 0.20,
      key_signals: [
        { path: "payment_count", value: 4, weight: 0.3 },
        { path: "payment_amount", value: 95, weight: 0.3 },
        { path: "interest_rate", value: 0, weight: 0.2 },
        { path: "fees", value: 0, weight: 0.2 }
      ],
      ap2_refs: ["bnpl_policy_v3.2.1"],
      redactions: ["credit_score", "income"],
      timestamp: new Date(this.baseTimestamp + 4000).toISOString(),
      extra: {
        installments: 4,
        amount_per_payment: 95,
        total_amount: 380,
        interest_rate: 0,
        fees: 0
      }
    });

    // 5. Onyx - KYB verification CE emitted
    explanations.push({
      trace_id: this.traceId,
      step_id: "onyx_kyb_005",
      agent: "onyx",
      model_version: "onyx_kyb_ml_v1.4.2",
      policy_version: "kyb_v2.1.3",
      summary: "KYB verification completed. Customer identity verified through multiple data sources. Risk assessment: Low. Compliance event emitted for audit trail.",
      decision: "allow",
      score: 0.08,
      score_type: "risk",
      uncertainty: 0.12,
      key_signals: [
        { path: "identity_verified", value: true, weight: 0.4 },
        { path: "risk_score", value: 0.08, weight: 0.3 },
        { path: "compliance_status", value: "passed", weight: 0.3 }
      ],
      ap2_refs: ["kyb_policy_v2.1.3"],
      redactions: ["ssn", "dob", "address"],
      timestamp: new Date(this.baseTimestamp + 5000).toISOString(),
      extra: {
        verification_method: "multi_source",
        compliance_event: "kyb_verification_complete",
        risk_tier: "low"
      }
    });

    // 6. Orca vs Opal - Negotiation + LLM explanations
    explanations.push({
      trace_id: this.traceId,
      step_id: "orca_opal_negotiation_006",
      agent: "orca",
      model_version: "orca_negotiation_ml_v4.1.8",
      policy_version: "negotiation_v5.2.1",
      summary: "Negotiation with Opal complete. Optimized payment terms agreed: Credit card with 5% cashback for immediate rewards, or BNPL with 0% interest for flexibility. LLM analysis confirms both options are optimal for customer.",
      decision: "allow",
      score: 0.11,
      score_type: "suitability",
      uncertainty: 0.10,
      key_signals: [
        { path: "negotiation_complete", value: true, weight: 0.4 },
        { path: "terms_optimized", value: true, weight: 0.3 },
        { path: "llm_approval", value: true, weight: 0.3 }
      ],
      ap2_refs: ["negotiation_policy_v5.2.1", "llm_analysis_v1.0"],
      redactions: ["internal_negotiation_data"],
      timestamp: new Date(this.baseTimestamp + 6000).toISOString(),
      extra: {
        negotiation_partner: "opal",
        optimized_terms: selectedChoice === "credit" ? "credit_card_5pct_cashback" : "bnpl_0pct_interest",
        llm_confidence: 0.95
      }
    });

    // 7. Weave - Processor auction
    explanations.push({
      trace_id: this.traceId,
      step_id: "weave_auction_007",
      agent: "weave",
      model_version: "weave_auction_ml_v2.3.4",
      policy_version: "auction_v4.1.2",
      summary: "Processor auction complete! 3 processors bid for transaction. Winning bid: 1.5% + $2.50 processing cost. Best rate secured through competitive bidding.",
      decision: "allow",
      score: 0.015, // 1.5% processing cost
      score_type: "cost",
      uncertainty: 0.09,
      key_signals: [
        { path: "winning_bid_rate", value: 0.015, weight: 0.4 },
        { path: "winning_bid_fixed", value: 2.50, weight: 0.3 },
        { path: "competitors", value: 3, weight: 0.3 }
      ],
      ap2_refs: ["auction_policy_v4.1.2"],
      redactions: ["processor_ids"],
      timestamp: new Date(this.baseTimestamp + 7000).toISOString(),
      extra: {
        winning_processor: "processor_alpha",
        total_processing_cost: 8.20, // (380 * 0.015) + 2.50
        auction_participants: 3
      }
    });

    // 8. Final - Settlement path
    explanations.push({
      trace_id: this.traceId,
      step_id: "final_settlement_008",
      agent: "orca", // Using orca as the "Final" agent
      model_version: "orca_settlement_ml_v4.1.8",
      policy_version: "settlement_v5.2.1",
      summary: "Settlement path determined: Standard 2-day settlement to merchant account. Funds will be available to merchant within 48 hours. Settlement method optimized for lowest cost and fastest processing.",
      decision: "allow",
      score: 0.05,
      score_type: "cost",
      uncertainty: 0.08,
      key_signals: [
        { path: "settlement_days", value: 2, weight: 0.4 },
        { path: "settlement_cost", value: 0.05, weight: 0.3 },
        { path: "path_optimized", value: true, weight: 0.3 }
      ],
      ap2_refs: ["settlement_policy_v5.2.1"],
      redactions: ["merchant_account"],
      timestamp: new Date(this.baseTimestamp + 8000).toISOString(),
      extra: {
        settlement_method: "standard_ach",
        settlement_days: 2,
        settlement_cost_percent: 0.05
      }
    });

    // 9. Orca/Opal/Olive - Payment instruction compiled
    explanations.push({
      trace_id: this.traceId,
      step_id: "payment_instruction_009",
      agent: "orca",
      model_version: "orca_instruction_ml_v4.1.8",
      policy_version: "instruction_v5.2.1",
      summary: "Payment instruction compiled successfully. All agent inputs integrated: Orca's decision, Opal's wallet method, Olive's rewards calculation. Instruction ready for execution with all compliance checks passed.",
      decision: "allow",
      score: 0.02,
      score_type: "suitability",
      uncertainty: 0.05,
      key_signals: [
        { path: "instruction_complete", value: true, weight: 0.4 },
        { path: "compliance_checks", value: "passed", weight: 0.3 },
        { path: "agent_integration", value: "complete", weight: 0.3 }
      ],
      ap2_refs: ["instruction_policy_v5.2.1"],
      redactions: ["instruction_details"],
      timestamp: new Date(this.baseTimestamp + 9000).toISOString(),
      extra: {
        compiled_by: ["orca", "opal", "olive"],
        instruction_size: "standard",
        compliance_status: "passed"
      }
    });

    // 10. Weave - Instruction signed & forwarded
    explanations.push({
      trace_id: this.traceId,
      step_id: "weave_signing_010",
      agent: "weave",
      model_version: "weave_signing_ml_v2.3.4",
      policy_version: "signing_v4.1.2",
      summary: "Payment instruction signed with cryptographic signature and forwarded to processor. Digital signature ensures integrity and authenticity. Transaction now in processor queue for authorization.",
      decision: "allow",
      score: 0.01,
      score_type: "security",
      uncertainty: 0.02,
      key_signals: [
        { path: "signature_valid", value: true, weight: 0.4 },
        { path: "integrity_check", value: true, weight: 0.3 },
        { path: "forwarded_successfully", value: true, weight: 0.3 }
      ],
      ap2_refs: ["signing_policy_v4.1.2"],
      redactions: ["signature_data"],
      timestamp: new Date(this.baseTimestamp + 10000).toISOString(),
      extra: {
        signature_method: "cryptographic",
        processor_queue_position: 1,
        estimated_processing_time: "30_seconds"
      }
    });

    // 11. Processor - Authorization result
    explanations.push({
      trace_id: this.traceId,
      step_id: "processor_auth_011",
      agent: "orca", // Using orca as the "Processor" agent
      model_version: "processor_auth_ml_v4.1.8",
      policy_version: "auth_v5.2.1",
      summary: "Authorization successful! Transaction approved by processor. $380 charged to " + (selectedChoice === "credit" ? "credit card ending in ****1234" : "BNPL account") + ". Receipt generated and sent to customer email.",
      decision: "allow",
      score: 0.00, // Perfect score for successful authorization
      score_type: "success",
      uncertainty: 0.00,
      key_signals: [
        { path: "authorization_code", value: "AUTH123456", weight: 0.4 },
        { path: "approval_status", value: "approved", weight: 0.3 },
        { path: "receipt_sent", value: true, weight: 0.3 }
      ],
      ap2_refs: ["auth_policy_v5.2.1"],
      redactions: ["card_number", "customer_email"],
      timestamp: new Date(this.baseTimestamp + 11000).toISOString(),
      extra: {
        authorization_code: "AUTH123456",
        transaction_id: "TXN_" + this.traceId.slice(-8),
        receipt_number: "RCP_" + this.traceId.slice(-8),
        payment_method_used: selectedChoice
      }
    });

    return explanations;
  }
}

// Global function for backward compatibility
export function simulateAgentFlow(choice?: "credit" | "bnpl"): Explanation[] {
  const orchestrator = new MockOrchestrator();
  return orchestrator.runAgentFlow(choice);
}