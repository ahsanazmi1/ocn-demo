"""
OCN Demo Gateway - Direct REST API Implementation
Orchestrates calls to individual agents using direct REST endpoints instead of MCP.
"""

import asyncio
import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import httpx
from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Configure logging
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="OCN Demo Gateway",
    description="Gateway orchestrating OCN agent interactions using direct REST APIs",
    version="1.0.0"
)

# Agent URLs - using direct REST endpoints
AGENT_URLS = {
    "orca": "http://orca:8080",      # Decision Engine
    "opal": "http://opal:8084",      # Consumer Wallet
    "olive": "http://olive:8087",    # Incentives & Policies
    "okra": "http://okra:8083",      # BNPL & Credit
    "onyx": "http://onyx:8086",      # KYB & Trust
    "weave": "http://weave:8082",    # Processor Auction
    "orion": "http://orion:8081",    # Event Bus & Optimization
}

# Request/Response Models
class CartRequest(BaseModel):
    """Request model for cart processing."""
    cart_id: str = Field(..., description="Cart identifier")

class CartResponse(BaseModel):
    """Response model for cart processing."""
    trace_id: str = Field(..., description="Transaction trace ID")
    orca: Dict[str, Any] = Field(..., description="Orca decision results")
    opal: Dict[str, Any] = Field(..., description="Opal wallet results")
    olive: Dict[str, Any] = Field(..., description="Olive incentives results")
    okra: Dict[str, Any] = Field(..., description="Okra BNPL results")
    onyx: Dict[str, Any] = Field(..., description="Onyx KYB results")
    weave: Dict[str, Any] = Field(..., description="Weave auction results")
    phase3: Dict[str, Any] = Field(..., description="Phase 3 negotiation and settlement")
    phase4: Dict[str, Any] = Field(..., description="Phase 4 payment processing")

def generate_trace_id() -> str:
    """Generate a unique trace ID."""
    return f"trace_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{os.urandom(4).hex()}"

def with_trace(headers: dict, trace_id: str) -> dict:
    """Add trace ID to headers."""
    headers["X-Trace-ID"] = trace_id
    return headers

async def determine_negotiation_consensus(
    orca_negotiation: Dict[str, Any], 
    opal_negotiation: Dict[str, Any], 
    transaction_amount: float
) -> Tuple[str, str]:
    """
    Determine final rail consensus between Orca and Opal negotiation results.
    
    Consumer-centric approach: Opal's rail preference takes precedence as it represents
    consumer interests, with Orca's input considered for risk and cost validation.
    
    Args:
        orca_negotiation: Orca's negotiation response
        opal_negotiation: Opal's negotiation response  
        transaction_amount: Transaction amount for cost calculations
        
    Returns:
        Tuple of (final_rail, consensus_reason)
    """
    orca_rail = orca_negotiation.get("optimal_rail", "credit")
    opal_rail = opal_negotiation.get("consumer_proposal", {}).get("rail_type", "credit")
    
    # If both agree, use that rail
    if orca_rail == opal_rail:
        return opal_rail, f"Both agents agree on {opal_rail}"
    
    # Consumer-centric decision: Opal's preference takes precedence
    # Check if Opal has rail evaluation data to validate the choice
    rail_evaluation = opal_negotiation.get("metadata", {}).get("rail_evaluation", {})
    opal_rail_evaluations = rail_evaluation.get("rail_evaluations", [])
    
    # Find Opal's evaluation for their preferred rail
    opal_rail_data = next(
        (eval for eval in opal_rail_evaluations if eval.get("rail_type") == opal_rail), 
        None
    )
    
    # Find Orca's evaluation for their recommended rail
    orca_evaluations = orca_negotiation.get("rail_evaluations", [])
    orca_rail_data = next(
        (eval for eval in orca_evaluations if eval.get("rail_type") == orca_rail), 
        None
    )
    
    # Get consumer benefits and confidence from Opal
    opal_benefit = opal_negotiation.get("consumer_proposal", {}).get("consumer_benefit", 0.0)
    opal_confidence = opal_negotiation.get("confidence", 0.5)
    negotiation_strategy = rail_evaluation.get("negotiation_strategy", "unknown")
    
    # Consumer-centric decision logic
    if opal_rail_data:
        opal_composite_score = opal_rail_data.get("composite_score", 0.5)
        
        # Accept Opal's preference if it has strong consumer value
        if opal_composite_score > 0.7:
            reason = f"Opal's {opal_rail} preference accepted due to strong consumer value (score: {opal_composite_score:.2f})"
            
            # Add additional context if available
            if negotiation_strategy == "counter_propose_with_justification":
                reason += f". Consumer benefits justify the rail choice over Orca's {orca_rail} recommendation."
            elif negotiation_strategy == "counter_propose_moderately":
                reason += f". Moderate preference over Orca's {orca_rail} recommendation."
            
            return opal_rail, reason
        
        # If Opal's preference has moderate value, still accept it but with caution
        elif opal_composite_score > 0.5:
            return opal_rail, f"Opal's {opal_rail} preference accepted with moderate consumer value (score: {opal_composite_score:.2f}). Consumer choice respected over Orca's {orca_rail} recommendation."
        
        # If Opal's preference has low value, still accept it but note the concern
        else:
            return opal_rail, f"Opal's {opal_rail} preference accepted despite lower consumer value (score: {opal_composite_score:.2f}). Consumer choice respected over Orca's {orca_rail} recommendation."
    
    # Fallback: Accept Opal's preference even without detailed evaluation
    # This ensures consumer choice is always respected
    return opal_rail, f"Opal's {opal_rail} preference accepted as consumer choice. Orca recommended {orca_rail} but consumer preference takes precedence."

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "ocn-demo-gateway", "version": "1.0.0"}

@app.get("/status")
async def status_check():
    """Status check endpoint."""
    return {"status": "operational", "timestamp": datetime.now().isoformat()}

@app.post("/run/demo1", response_model=CartResponse)
async def run_demo1(request: CartRequest) -> CartResponse:
    """
    Run Demo 1: Complete OCN payment flow orchestration.
    
    This endpoint orchestrates the complete payment flow:
    1. Orca decision and explanation
    2. Opal wallet methods and selection
    3. Olive incentives
    4. Okra BNPL quote
    5. Onyx KYB verification
    6. Orca vs Opal negotiation
    7. Weave processor auction
    8. Final settlement with policy adjustments
    9. Payment instruction and processing
    """
    
    # Generate trace ID for this transaction
    trace_id = generate_trace_id()
    logger.info(f"Starting Demo 1 for cart {request.cart_id} with trace {trace_id}")
    
    # Load cart data
    samples_dir = "/app/samples/demo1_oxfords"
    with open(f"{samples_dir}/cart.json", "r") as f:
        cart_data = json.load(f)
    
    results = {
        "trace_id": trace_id,
        "orca": {},
        "opal": {},
        "olive": {},
        "okra": {},
        "onyx": {},
        "weave": {},
        "phase3": {"negotiation": {}, "auction": {}, "settlement": {}},
        "phase4": {}
    }
    
    async with httpx.AsyncClient(timeout=30.0) as http_client:
        
        # Phase 1: Agent Health Checks and Initial Processing
        
        # Step 1: Orca Decision
        logger.info(f"🐋 Step 1: Orca decision for trace {trace_id}")
        orca_decision_request = {
            "cart_total": cart_data["cart"]["total"],
            "merchant_id": "demo_merchant_001",
            "channel": "online"
        }
        
        orca_decision_response = await http_client.post(
            f"{AGENT_URLS['orca']}/decision",
            json=orca_decision_request,
            headers=with_trace({}, trace_id)
        )
        
        if orca_decision_response.status_code == 200:
            results["orca"]["decision"] = orca_decision_response.json()
        else:
            results["orca"]["error"] = f"Decision failed: {orca_decision_response.status_code}"
        
        # Step 2: Orca Explanation
        logger.info(f"🐋 Step 2: Orca explanation for trace {trace_id}")
        orca_explain_request = {
            "decision": results["orca"].get("decision", {}),
            "cart_total": cart_data["cart"]["total"],
            "merchant_id": "demo_merchant_001",
            "channel": "online",
            "trace_id": trace_id
        }
        
        orca_explain_response = await http_client.post(
            f"{AGENT_URLS['orca']}/explain",
            json=orca_explain_request,
            headers=with_trace({}, trace_id)
        )
        
        if orca_explain_response.status_code == 200:
            results["orca"]["explanation"] = orca_explain_response.json()
        else:
            results["orca"]["explanation_error"] = f"Explanation failed: {orca_explain_response.status_code}"
        
        # Step 3: Opal Wallet Methods
        logger.info(f"💎 Step 3: Opal wallet methods for trace {trace_id}")
        opal_methods_response = await http_client.get(
            f"{AGENT_URLS['opal']}/wallet/methods?actor_id=demo_actor",
            headers=with_trace({}, trace_id)
        )
        
        if opal_methods_response.status_code == 200:
            results["opal"]["methods"] = opal_methods_response.json()
        else:
            results["opal"]["error"] = f"Methods failed: {opal_methods_response.status_code}"
        
        # Step 4: Opal Wallet Selection
        if "methods" in results["opal"]:
            logger.info(f"💎 Step 4: Opal wallet selection for trace {trace_id}")
            opal_select_request = {
                "actor_id": "demo_actor",
                "payment_method_id": "pm_demo_actor_visa_001",
                "transaction_amount": cart_data["cart"]["total"],
                "currency": cart_data["cart"]["currency"],
                "merchant_id": "demo_merchant_001",
                "trace_id": trace_id
            }
            
            opal_select_response = await http_client.post(
                f"{AGENT_URLS['opal']}/wallet/select",
                json=opal_select_request,
                headers=with_trace({}, trace_id)
            )
            
            if opal_select_response.status_code == 200:
                results["opal"]["selection"] = opal_select_response.json()
            else:
                results["opal"]["selection_error"] = f"Selection failed: {opal_select_response.status_code}"
        
        # Step 5: Olive Incentives
        logger.info(f"🫒 Step 5: Olive incentives for trace {trace_id}")
        olive_incentives_response = await http_client.get(
            f"{AGENT_URLS['olive']}/incentives?merchant_id=demo_merchant_001&transaction_amount={cart_data['cart']['total']}&channel=online",
            headers=with_trace({}, trace_id)
        )
        
        if olive_incentives_response.status_code == 200:
            results["olive"]["incentives"] = olive_incentives_response.json()
        else:
            results["olive"]["error"] = f"Incentives failed: {olive_incentives_response.status_code}"
        
        # Step 6: Okra BNPL Quote
        logger.info(f"🦏 Step 6: Okra BNPL quote for trace {trace_id}")
        with open(f"{samples_dir}/bnpl_request.json", "r") as f:
            bnpl_data = json.load(f)
        
        okra_bnpl_response = await http_client.post(
            f"{AGENT_URLS['okra']}/bnpl/quote",
            json=bnpl_data,
            headers=with_trace({}, trace_id)
        )
        
        if okra_bnpl_response.status_code == 200:
            results["okra"]["bnpl_quote"] = okra_bnpl_response.json()
        else:
            results["okra"]["error"] = f"BNPL quote failed: {okra_bnpl_response.status_code}"
        
        # Step 7: Onyx KYB Verification
        logger.info(f"🖤 Step 7: Onyx KYB verification for trace {trace_id}")
        with open(f"{samples_dir}/kyb_vendor.json", "r") as f:
            kyb_data = json.load(f)
        
        onyx_kyb_response = await http_client.post(
            f"{AGENT_URLS['onyx']}/kyb/verify",
            json=kyb_data,
            headers=with_trace({}, trace_id)
        )
        
        if onyx_kyb_response.status_code == 200:
            results["onyx"]["kyb_verification"] = onyx_kyb_response.json()
        else:
            results["onyx"]["error"] = f"KYB verification failed: {onyx_kyb_response.status_code}"
        
        # Phase 3: Negotiation and Auction
        
        # Step 8: Orca Negotiation
        logger.info(f"🐋 Step 8: Orca negotiation for trace {trace_id}")
        orca_negotiation_request = {
            "amount": cart_data["cart"]["total"],
            "merchant_id": "demo_merchant_001",
            "trace_id": trace_id,
            "available_rails": ["Card", "ACH", "Wire", "Crypto"],  # Valid rails only
            "preferences": {
                "cost_weight": 0.4,
                "speed_weight": 0.3,
                "risk_weight": 0.3
            },
            "customer_context": {
                "deterministic_seed": 42
            }
        }
        
        orca_negotiation_response = await http_client.post(
            f"{AGENT_URLS['orca']}/negotiate",
            json=orca_negotiation_request,
            headers=with_trace({}, trace_id)
        )
        
        if orca_negotiation_response.status_code == 200:
            results["phase3"]["negotiation"]["orca"] = orca_negotiation_response.json()
        else:
            results["phase3"]["negotiation"]["orca_error"] = f"Orca negotiation failed: {orca_negotiation_response.status_code}"
        
        # Step 9: Opal Counter-Negotiation
        if "orca" in results["phase3"]["negotiation"]:
            logger.info(f"💎 Step 9: Opal counter-negotiation for trace {trace_id}")
            
            # Get Olive incentive data to enhance consumer benefits
            olive_incentives = results.get("olive", {}).get("incentives", {}).get("data", {})
            total_incentive_value = olive_incentives.get("summary", {}).get("total_cashback_value", 0.0)
            early_adopter_bonus = olive_incentives.get("summary", {}).get("bonus_value", 0.0)
            
            orca_optimal_rail = results["phase3"]["negotiation"]["orca"].get("optimal_rail", "Card")
            orca_rail_evaluation = next(
                (eval for eval in results["phase3"]["negotiation"]["orca"].get("rail_evaluations", []) 
                 if eval.get("rail_type") == orca_optimal_rail), 
                None
            )
            
            opal_negotiation_request = {
                "actor_id": "demo_actor",
                "transaction_amount": cart_data["cart"]["total"],
                "currency": cart_data["cart"]["currency"],
                "merchant_id": "demo_merchant_001",
                "channel": "online",
                "merchant_proposal": {
                    "rail_type": orca_optimal_rail,
                    "merchant_cost": orca_rail_evaluation.get("base_cost", 150.0) if orca_rail_evaluation else 150.0,
                    "settlement_days": orca_rail_evaluation.get("settlement_days", 1) if orca_rail_evaluation else 1,
                    "risk_score": orca_rail_evaluation.get("ml_risk_score", 0.35) if orca_rail_evaluation else 0.35,
                    "explanation": orca_rail_evaluation.get("explanation", f"{orca_optimal_rail} chosen for cost efficiency") if orca_rail_evaluation else f"{orca_optimal_rail} chosen",
                    "trace_id": trace_id
                },
                "available_instruments": [
                    {
                        "instrument_id": "chase_sapphire_001",
                        "instrument_type": "credit_card",
                        "provider": "Chase",
                        "last_four": "1234",
                        "base_fee": 0.0,
                        "out_of_pocket_cost": 0.0,
                        "available_balance": 15000.0,
                        "credit_limit": 25000.0,
                        "total_reward_value": 8.21 + total_incentive_value + early_adopter_bonus,
                        "net_value": 8.21 + total_incentive_value + early_adopter_bonus,
                        "value_score": 0.85,
                        "loyalty_tier": "premium",
                        "loyalty_multiplier": 1.5,
                        "rewards": [
                            {"reward_type": "cashback", "rate": 0.02, "value": 8.21, "description": "2% cashback on all purchases"},
                            {"reward_type": "points", "rate": 1.0, "value": 410.0, "description": "1 point per $1 spent"}
                        ],
                        "preference_score": 0.9,
                        "eligible": True
                    },
                    {
                        "instrument_id": "amex_gold_002",
                        "instrument_type": "credit_card", 
                        "provider": "American Express",
                        "last_four": "5678",
                        "base_fee": 0.0,
                        "out_of_pocket_cost": 0.0,
                        "available_balance": 12000.0,
                        "credit_limit": 20000.0,
                        "total_reward_value": 12.31 + total_incentive_value + early_adopter_bonus,
                        "net_value": 12.31 + total_incentive_value + early_adopter_bonus,
                        "value_score": 0.92,
                        "loyalty_tier": "elite",
                        "loyalty_multiplier": 2.0,
                        "rewards": [
                            {"reward_type": "cashback", "rate": 0.03, "value": 12.31, "description": "3% cashback on clothing purchases"},
                            {"reward_type": "points", "rate": 3.0, "value": 1231.0, "description": "3x Membership Rewards points"}
                        ],
                        "preference_score": 0.95,
                        "eligible": True
                    },
                    {
                        "instrument_id": "chase_checking_003",
                        "instrument_type": "bank_transfer",
                        "provider": "Chase",
                        "last_four": "9876",
                        "base_fee": 0.0,
                        "out_of_pocket_cost": 410.40,
                        "available_balance": 8500.0,
                        "credit_limit": 0.0,
                        "total_reward_value": 0.0,
                        "net_value": -410.40,
                        "value_score": 0.3,
                        "loyalty_tier": "standard",
                        "loyalty_multiplier": 1.0,
                        "rewards": [],
                        "preference_score": 0.4,
                        "eligible": True
                    },
                    {
                        "instrument_id": "apple_pay_004",
                        "instrument_type": "digital_wallet",
                        "provider": "Apple",
                        "last_four": "4321",
                        "base_fee": 0.0,
                        "out_of_pocket_cost": 0.0,
                        "available_balance": 5000.0,
                        "credit_limit": 5000.0,
                        "total_reward_value": 4.10 + total_incentive_value + early_adopter_bonus,
                        "net_value": 4.10 + total_incentive_value + early_adopter_bonus,
                        "value_score": 0.7,
                        "loyalty_tier": "standard",
                        "loyalty_multiplier": 1.0,
                        "rewards": [
                            {"reward_type": "cashback", "rate": 0.01, "value": 4.10, "description": "1% Apple Cash back"}
                        ],
                        "preference_score": 0.8,
                        "eligible": True
                    }
                ],
                "consumer_preferences": {
                    "prefer_instant_settlement": True,
                    "cost_sensitivity": 0.7,
                    "risk_tolerance": 0.5
                },
                "reward_weight": 0.5,
                "cost_weight": 0.3,
                "preference_weight": 0.2,
                "mcc": "clothing",
                "channel": "online"
            }
            
            opal_negotiation_response = await http_client.post(
                f"{AGENT_URLS['opal']}/counter-negotiate",
                json=opal_negotiation_request,
                headers=with_trace({}, trace_id)
            )
            
            if opal_negotiation_response.status_code == 200:
                results["phase3"]["negotiation"]["opal"] = opal_negotiation_response.json()
            else:
                results["phase3"]["negotiation"]["opal_error"] = f"Opal negotiation failed: {opal_negotiation_response.status_code}"
        
        # Step 10: Weave Processor Auction
        if "orca" in results["phase3"]["negotiation"] and "opal" in results["phase3"]["negotiation"]:
            logger.info(f"🌊 Step 10: Weave processor auction for trace {trace_id}")
            
            # Determine final rail consensus
            final_rail, consensus_reason = await determine_negotiation_consensus(
                results["phase3"]["negotiation"]["orca"],
                results["phase3"]["negotiation"]["opal"],
                cart_data["cart"]["total"]
            )
            
            # Get rail evaluations for auction
            orca_evaluations = results["phase3"]["negotiation"]["orca"].get("rail_evaluations", [])
            
            weave_auction_request = {
                "trace_id": trace_id,
                "cart_summary": {
                    "total": cart_data["cart"]["total"],
                    "currency": cart_data["cart"]["currency"],
                    "items": cart_data["cart"]["items"],
                    "merchant_id": "demo_merchant_001"
                },
                "rail_candidates": [
                    {
                        "rail_type": eval.get("rail_type", "Card"),
                        "base_cost": eval.get("base_cost", 150.0),
                        "settlement_days": eval.get("settlement_days", 1),
                        "risk_score": eval.get("ml_risk_score", 0.35)
                    }
                    for eval in orca_evaluations
                ] if orca_evaluations else [
                    {"rail_type": "Card", "base_cost": 150.0, "settlement_days": 1, "risk_score": 0.35},
                    {"rail_type": "ACH", "base_cost": 5.0, "settlement_days": 2, "risk_score": 0.2}
                ]
            }
            
            weave_auction_response = await http_client.post(
                f"{AGENT_URLS['weave']}/auction/run",
                json=weave_auction_request,
                headers=with_trace({}, trace_id)
            )
            
            if weave_auction_response.status_code == 200:
                results["phase3"]["auction"] = weave_auction_response.json()
            else:
                results["phase3"]["auction"]["error"] = f"Auction failed: {weave_auction_response.status_code}"
        
        # Step 11: Final Settlement
        if "orca" in results["phase3"]["negotiation"] and "opal" in results["phase3"]["negotiation"]:
            logger.info(f"🎯 Step 11: Final settlement for trace {trace_id}")
            
            # Determine final rail consensus
            final_rail, consensus_reason = await determine_negotiation_consensus(
                results["phase3"]["negotiation"]["orca"],
                results["phase3"]["negotiation"]["opal"],
                cart_data["cart"]["total"]
            )
            
            # Get winning auction result
            winning_processor = results["phase3"]["auction"].get("winning_processor", "stripe")
            winning_bid = results["phase3"]["auction"].get("winning_bid", {})
            effective_cost_bps = winning_bid.get("effective_cost_bps", 150.0)
            
            results["phase3"]["settlement"] = {
                "final": {
                    "trace_id": trace_id,
                    "original_rail": "credit",
                    "original_cost_bps": 150.0,
                    "final_rail": final_rail,
                    "final_cost_bps": effective_cost_bps,
                    "adjustment_summary": f"Rail selected: {final_rail} ({consensus_reason}). Policy and trust adjustments applied."
                }
            }
        
        # Phase 4: Payment Processing
        
        # Step 12: Payment Instruction
        logger.info(f"📋 Step 12: Payment instruction for trace {trace_id}")
        final_rail = results["phase3"]["settlement"].get("final", {}).get("final_rail", "Card")
        final_cost_bps = results["phase3"]["settlement"].get("final", {}).get("final_cost_bps", 150.0)
        
        results["phase4"]["payment_instruction"] = {
            "instruction_id": f"PI-{trace_id[:8]}",
            "trace_id": trace_id,
            "amount": cart_data["cart"]["total"],
            "currency": cart_data["cart"]["currency"],
            "merchant_id": "demo_merchant_001",
            "final_rail": final_rail,
            "final_cost_bps": final_cost_bps,
            "compiled_by": ["orca", "opal", "olive"],
            "timestamp": datetime.now().isoformat()
        }
        
        # Step 13: Instruction Signing
        logger.info(f"🔒 Step 13: Instruction signing for trace {trace_id}")
        results["phase4"]["instruction_signing"] = {
            "signature_id": f"SIG-{trace_id[:8]}",
            "instruction_id": f"PI-{trace_id[:8]}",
            "signed_by": "weave",
            "signature_hash": f"sha256:{trace_id[:8]}...",
            "status": "forwarded",
            "forwarded_to": "processor",
            "timestamp": datetime.now().isoformat()
        }
        
        # Step 14: Processor Authorization
        logger.info(f"✅ Step 14: Processor authorization for trace {trace_id}")
        results["phase4"]["processor_authorization"] = {
            "auth_code": f"AUTH-{trace_id[:8]}",
            "instruction_id": f"PI-{trace_id[:8]}",
            "status": "APPROVED",
            "processor_response": "Transaction approved",
            "authorization_timestamp": datetime.now().isoformat(),
            "settlement_date": "T+1"
        }
    
    logger.info(f"Demo 1 completed for trace {trace_id}")
    return CartResponse(**results)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8090)