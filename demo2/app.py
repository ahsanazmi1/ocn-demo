"""
OCN Demo 2 - Clean Implementation
A fresh demo showcasing OCN agent interactions with proper error handling and direct REST endpoints.
"""

import asyncio
import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import httpx
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="OCN Demo 2",
    description="Clean OCN agent orchestration demo",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Agent URLs - Direct REST endpoints
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
class DemoRequest(BaseModel):
    """Request model for demo execution."""
    demo_id: str = Field(..., description="Demo identifier")
    transaction_amount: float = Field(410.40, description="Transaction amount")
    merchant_id: str = Field("demo_merchant_001", description="Merchant ID")

class DemoResponse(BaseModel):
    """Response model for demo execution."""
    demo_id: str = Field(..., description="Demo identifier")
    trace_id: str = Field(..., description="Transaction trace ID")
    timestamp: str = Field(..., description="Execution timestamp")
    status: str = Field(..., description="Overall status")
    phases: Dict[str, Any] = Field(..., description="Phase results")
    summary: Dict[str, Any] = Field(..., description="Execution summary")

def generate_trace_id() -> str:
    """Generate a unique trace ID."""
    return f"demo2_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{os.urandom(4).hex()}"

def with_trace(headers: dict, trace_id: str) -> dict:
    """Add trace ID to headers."""
    headers["X-Trace-ID"] = trace_id
    return headers

async def call_agent_endpoint(
    http_client: httpx.AsyncClient,
    agent: str,
    endpoint: str,
    method: str = "GET",
    data: Optional[Dict[str, Any]] = None,
    trace_id: str = "",
    timeout: float = 10.0
) -> Tuple[bool, Dict[str, Any]]:
    """
    Call an agent endpoint with proper error handling.
    
    Returns:
        Tuple of (success: bool, result: dict)
    """
    try:
        url = f"{AGENT_URLS[agent]}{endpoint}"
        headers = with_trace({}, trace_id)
        
        logger.info(f"Calling {agent} {method} {endpoint}")
        
        if method.upper() == "GET":
            response = await http_client.get(url, headers=headers, timeout=timeout)
        elif method.upper() == "POST":
            response = await http_client.post(url, json=data, headers=headers, timeout=timeout)
        else:
            return False, {"error": f"Unsupported method: {method}"}
        
        if response.status_code == 200:
            return True, response.json()
        else:
            logger.warning(f"{agent} {endpoint} returned {response.status_code}: {response.text}")
            return False, {"error": f"HTTP {response.status_code}", "details": response.text}
            
    except httpx.TimeoutException:
        logger.error(f"{agent} {endpoint} timed out")
        return False, {"error": "timeout", "details": f"Request to {agent} timed out"}
    except httpx.ConnectError:
        logger.error(f"{agent} {endpoint} connection failed")
        return False, {"error": "connection_failed", "details": f"Cannot connect to {agent}"}
    except Exception as e:
        logger.error(f"{agent} {endpoint} failed: {e}")
        return False, {"error": "exception", "details": str(e)}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "ocn-demo-2",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/status")
async def status_check():
    """Status check endpoint."""
    return {
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
        "agents": list(AGENT_URLS.keys())
    }

@app.post("/run", response_model=DemoResponse)
async def run_demo(request: DemoRequest) -> DemoResponse:
    """
    Run OCN Demo 2: Clean agent orchestration.
    
    This demo showcases:
    1. Agent health checks
    2. Orca decision making with LLM explanations
    3. Opal wallet selection with rail evaluation
    4. Olive incentives integration
    5. Negotiation between Orca and Opal
    6. Final settlement determination
    """
    
    trace_id = generate_trace_id()
    logger.info(f"Starting Demo 2 '{request.demo_id}' with trace {trace_id}")
    
    start_time = datetime.now()
    phases = {}
    
    async with httpx.AsyncClient(timeout=30.0) as http_client:
        
        # Phase 1: Agent Health Checks
        logger.info("🔍 Phase 1: Agent Health Checks")
        health_results = {}
        
        for agent in AGENT_URLS.keys():
            success, result = await call_agent_endpoint(
                http_client, agent, "/health", trace_id=trace_id
            )
            health_results[agent] = {
                "healthy": success,
                "response": result
            }
        
        phases["health_checks"] = health_results
        
        # Phase 2: Orca Decision & Explanation
        logger.info("🐋 Phase 2: Orca Decision & Explanation")
        orca_results = {}
        
        # Orca decision
        decision_data = {
            "cart_total": request.transaction_amount,
            "merchant_id": request.merchant_id,
            "channel": "online"
        }
        
        success, result = await call_agent_endpoint(
            http_client, "orca", "/decision", "POST", decision_data, trace_id
        )
        orca_results["decision"] = {"success": success, "data": result}
        
        # Orca explanation
        if success:
            explain_data = {
                "decision": result,
                "cart_total": request.transaction_amount,
                "merchant_id": request.merchant_id,
                "channel": "online",
                "trace_id": trace_id
            }
            
            success, explain_result = await call_agent_endpoint(
                http_client, "orca", "/explain", "POST", explain_data, trace_id
            )
            orca_results["explanation"] = {"success": success, "data": explain_result}
        
        phases["orca"] = orca_results
        
        # Phase 3: Opal Wallet & Olive Incentives
        logger.info("💎 Phase 3: Opal Wallet & Olive Incentives")
        opal_results = {}
        
        # Opal wallet methods
        success, result = await call_agent_endpoint(
            http_client, "opal", "/wallet/methods?actor_id=demo_actor", trace_id=trace_id
        )
        opal_results["methods"] = {"success": success, "data": result}
        
        # Olive incentives
        success, olive_result = await call_agent_endpoint(
            http_client, "olive", 
            f"/incentives?merchant_id={request.merchant_id}&transaction_amount={request.transaction_amount}&channel=online",
            trace_id=trace_id
        )
        opal_results["olive_incentives"] = {"success": success, "data": olive_result}
        
        phases["opal"] = opal_results
        
        # Phase 4: Negotiation
        logger.info("🤝 Phase 4: Orca vs Opal Negotiation")
        negotiation_results = {}
        
        # Orca negotiation
        orca_negotiation_data = {
            "amount": request.transaction_amount,
            "merchant_id": request.merchant_id,
            "trace_id": trace_id,
            "available_rails": ["Card", "ACH", "Wire", "Crypto"],
            "preferences": {
                "cost_weight": 0.4,
                "speed_weight": 0.3,
                "risk_weight": 0.3
            },
            "customer_context": {
                "deterministic_seed": 42
            }
        }
        
        success, orca_negotiation = await call_agent_endpoint(
            http_client, "orca", "/negotiate", "POST", orca_negotiation_data, trace_id
        )
        negotiation_results["orca"] = {"success": success, "data": orca_negotiation}
        
        # Opal counter-negotiation
        print(f"DEBUG: Orca negotiation success: {success}, data exists: {bool(orca_negotiation)}, data type: {type(orca_negotiation)}")
        logger.info(f"Orca negotiation success: {success}, data exists: {bool(orca_negotiation)}, data type: {type(orca_negotiation)}")
        if success and orca_negotiation:
            logger.info("Starting Opal counter-negotiation")
            # Get Olive incentives for enhanced consumer benefits
            olive_incentives = opal_results.get("olive_incentives", {}).get("data", {})
            total_incentive_value = olive_incentives.get("summary", {}).get("total_cashback_value", 0.0)
            early_adopter_bonus = olive_incentives.get("summary", {}).get("bonus_value", 0.0)
            
            orca_optimal_rail = orca_negotiation.get("optimal_rail", "Card")
            orca_rail_evaluation = next(
                (eval for eval in orca_negotiation.get("rail_evaluations", []) 
                 if eval.get("rail_type") == orca_optimal_rail), 
                None
            )
            
            opal_negotiation_data = {
                "actor_id": "demo_actor",
                "transaction_amount": request.transaction_amount,
                "currency": "USD",
                "merchant_id": request.merchant_id,
                "channel": "online",
                "merchant_proposal": {
                    "rail_type": orca_optimal_rail,
                    "merchant_cost": orca_rail_evaluation.get("base_cost", 150.0) if orca_rail_evaluation else 150.0,
                    "settlement_days": orca_rail_evaluation.get("settlement_days", 1) if orca_rail_evaluation else 1,
                    "risk_score": orca_rail_evaluation.get("ml_risk_score", 0.35) if orca_rail_evaluation else 0.35,
                    "explanation": orca_rail_evaluation.get("explanation", f"{orca_optimal_rail} chosen") if orca_rail_evaluation else f"{orca_optimal_rail} chosen",
                    "trace_id": trace_id
                },
                "available_instruments": [
                    # Premium Credit Cards
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
                            {"reward_type": "points", "rate": 1.0, "value": 410.0, "description": "1x Membership Rewards points"}
                        ],
                        "preference_score": 0.95,
                        "eligible": True
                    },
                    {
                        "instrument_id": "citi_double_003",
                        "instrument_type": "credit_card",
                        "provider": "Citi",
                        "last_four": "9876",
                        "base_fee": 0.0,
                        "out_of_pocket_cost": 0.0,
                        "available_balance": 8000.0,
                        "credit_limit": 15000.0,
                        "total_reward_value": 8.21 + total_incentive_value + early_adopter_bonus,
                        "net_value": 8.21 + total_incentive_value + early_adopter_bonus,
                        "value_score": 0.88,
                        "loyalty_tier": "premium",
                        "loyalty_multiplier": 1.2,
                        "rewards": [
                            {"reward_type": "cashback", "rate": 0.02, "value": 8.21, "description": "2% cashback on all purchases"},
                            {"reward_type": "bonus", "rate": 0.005, "value": 2.05, "description": "0.5% bonus on clothing"}
                        ],
                        "preference_score": 0.85,
                        "eligible": True
                    },
                    {
                        "instrument_id": "capital_one_004",
                        "instrument_type": "credit_card",
                        "provider": "Capital One",
                        "last_four": "4321",
                        "base_fee": 0.0,
                        "out_of_pocket_cost": 0.0,
                        "available_balance": 5000.0,
                        "credit_limit": 10000.0,
                        "total_reward_value": 4.10 + total_incentive_value + early_adopter_bonus,
                        "net_value": 4.10 + total_incentive_value + early_adopter_bonus,
                        "value_score": 0.75,
                        "loyalty_tier": "standard",
                        "loyalty_multiplier": 1.0,
                        "rewards": [
                            {"reward_type": "cashback", "rate": 0.01, "value": 4.10, "description": "1% cashback on all purchases"}
                        ],
                        "preference_score": 0.7,
                        "eligible": True
                    },
                    
                    # Debit Cards
                    {
                        "instrument_id": "chase_debit_005",
                        "instrument_type": "debit_card",
                        "provider": "Chase",
                        "last_four": "2468",
                        "base_fee": 0.0,
                        "out_of_pocket_cost": 0.0,
                        "available_balance": 2500.0,
                        "credit_limit": 2500.0,
                        "total_reward_value": 0.0 + total_incentive_value + early_adopter_bonus,
                        "net_value": 0.0 + total_incentive_value + early_adopter_bonus,
                        "value_score": 0.6,
                        "loyalty_tier": "standard",
                        "loyalty_multiplier": 1.0,
                        "rewards": [],
                        "preference_score": 0.8,
                        "eligible": True
                    },
                    {
                        "instrument_id": "wells_debit_006",
                        "instrument_type": "debit_card",
                        "provider": "Wells Fargo",
                        "last_four": "1357",
                        "base_fee": 0.0,
                        "out_of_pocket_cost": 0.0,
                        "available_balance": 1800.0,
                        "credit_limit": 1800.0,
                        "total_reward_value": 0.0 + total_incentive_value + early_adopter_bonus,
                        "net_value": 0.0 + total_incentive_value + early_adopter_bonus,
                        "value_score": 0.55,
                        "loyalty_tier": "standard",
                        "loyalty_multiplier": 1.0,
                        "rewards": [],
                        "preference_score": 0.75,
                        "eligible": True
                    },
                    
                    # Bank Accounts (ACH)
                    {
                        "instrument_id": "chase_checking_007",
                        "instrument_type": "bank_account",
                        "provider": "Chase",
                        "last_four": "9876",
                        "base_fee": 0.0,
                        "out_of_pocket_cost": 0.0,
                        "available_balance": 5000.0,
                        "credit_limit": 5000.0,
                        "total_reward_value": 0.0 + total_incentive_value + early_adopter_bonus,
                        "net_value": 0.0 + total_incentive_value + early_adopter_bonus,
                        "value_score": 0.65,
                        "loyalty_tier": "premium",
                        "loyalty_multiplier": 1.1,
                        "rewards": [],
                        "preference_score": 0.85,
                        "eligible": True
                    },
                    {
                        "instrument_id": "bofa_savings_008",
                        "instrument_type": "bank_account",
                        "provider": "Bank of America",
                        "last_four": "5432",
                        "base_fee": 0.0,
                        "out_of_pocket_cost": 0.0,
                        "available_balance": 12000.0,
                        "credit_limit": 12000.0,
                        "total_reward_value": 0.0 + total_incentive_value + early_adopter_bonus,
                        "net_value": 0.0 + total_incentive_value + early_adopter_bonus,
                        "value_score": 0.7,
                        "loyalty_tier": "premium",
                        "loyalty_multiplier": 1.1,
                        "rewards": [],
                        "preference_score": 0.8,
                        "eligible": True
                    },
                    
                    # Digital Wallets
                    {
                        "instrument_id": "apple_pay_009",
                        "instrument_type": "digital_wallet",
                        "provider": "Apple",
                        "last_four": "APP1",
                        "base_fee": 0.0,
                        "out_of_pocket_cost": 0.0,
                        "available_balance": 15000.0,
                        "credit_limit": 15000.0,
                        "total_reward_value": 2.05 + total_incentive_value + early_adopter_bonus,
                        "net_value": 2.05 + total_incentive_value + early_adopter_bonus,
                        "value_score": 0.8,
                        "loyalty_tier": "premium",
                        "loyalty_multiplier": 1.3,
                        "rewards": [
                            {"reward_type": "cashback", "rate": 0.005, "value": 2.05, "description": "0.5% Apple Pay cashback"}
                        ],
                        "preference_score": 0.9,
                        "eligible": True
                    },
                    {
                        "instrument_id": "google_pay_010",
                        "instrument_type": "digital_wallet",
                        "provider": "Google",
                        "last_four": "GPAY",
                        "base_fee": 0.0,
                        "out_of_pocket_cost": 0.0,
                        "available_balance": 15000.0,
                        "credit_limit": 15000.0,
                        "total_reward_value": 1.23 + total_incentive_value + early_adopter_bonus,
                        "net_value": 1.23 + total_incentive_value + early_adopter_bonus,
                        "value_score": 0.75,
                        "loyalty_tier": "standard",
                        "loyalty_multiplier": 1.1,
                        "rewards": [
                            {"reward_type": "cashback", "rate": 0.003, "value": 1.23, "description": "0.3% Google Pay rewards"}
                        ],
                        "preference_score": 0.85,
                        "eligible": True
                    },
                    {
                        "instrument_id": "paypal_011",
                        "instrument_type": "digital_wallet",
                        "provider": "PayPal",
                        "last_four": "PP01",
                        "base_fee": 0.0,
                        "out_of_pocket_cost": 0.0,
                        "available_balance": 8000.0,
                        "credit_limit": 8000.0,
                        "total_reward_value": 0.41 + total_incentive_value + early_adopter_bonus,
                        "net_value": 0.41 + total_incentive_value + early_adopter_bonus,
                        "value_score": 0.6,
                        "loyalty_tier": "standard",
                        "loyalty_multiplier": 1.0,
                        "rewards": [
                            {"reward_type": "cashback", "rate": 0.001, "value": 0.41, "description": "0.1% PayPal rewards"}
                        ],
                        "preference_score": 0.7,
                        "eligible": True
                    },
                    
                    # BNPL Options
                    {
                        "instrument_id": "klarna_012",
                        "instrument_type": "bnpl",
                        "provider": "Klarna",
                        "last_four": "KLR1",
                        "base_fee": 0.0,
                        "out_of_pocket_cost": 102.60,
                        "available_balance": 410.40,
                        "credit_limit": 2000.0,
                        "total_reward_value": 0.0 + total_incentive_value + early_adopter_bonus,
                        "net_value": 0.0 + total_incentive_value + early_adopter_bonus,
                        "value_score": 0.7,
                        "loyalty_tier": "standard",
                        "loyalty_multiplier": 1.0,
                        "rewards": [],
                        "preference_score": 0.8,
                        "eligible": True
                    },
                    {
                        "instrument_id": "afterpay_013",
                        "instrument_type": "bnpl",
                        "provider": "Afterpay",
                        "last_four": "AFT1",
                        "base_fee": 0.0,
                        "out_of_pocket_cost": 102.60,
                        "available_balance": 410.40,
                        "credit_limit": 1500.0,
                        "total_reward_value": 0.0 + total_incentive_value + early_adopter_bonus,
                        "net_value": 0.0 + total_incentive_value + early_adopter_bonus,
                        "value_score": 0.65,
                        "loyalty_tier": "standard",
                        "loyalty_multiplier": 1.0,
                        "rewards": [],
                        "preference_score": 0.75,
                        "eligible": True
                    },
                    
                    # Crypto/Cash
                    {
                        "instrument_id": "cash_014",
                        "instrument_type": "cash",
                        "provider": "Cash",
                        "last_four": "CASH",
                        "base_fee": 0.0,
                        "out_of_pocket_cost": 0.0,
                        "available_balance": 200.0,
                        "credit_limit": 200.0,
                        "total_reward_value": 0.0 + total_incentive_value + early_adopter_bonus,
                        "net_value": 0.0 + total_incentive_value + early_adopter_bonus,
                        "value_score": 0.5,
                        "loyalty_tier": "standard",
                        "loyalty_multiplier": 1.0,
                        "rewards": [],
                        "preference_score": 0.6,
                        "eligible": True
                    },
                    
                    # Store Cards
                    {
                        "instrument_id": "target_redcard_015",
                        "instrument_type": "store_card",
                        "provider": "Target",
                        "last_four": "TRG1",
                        "base_fee": 0.0,
                        "out_of_pocket_cost": 0.0,
                        "available_balance": 3000.0,
                        "credit_limit": 5000.0,
                        "total_reward_value": 4.10 + total_incentive_value + early_adopter_bonus,
                        "net_value": 4.10 + total_incentive_value + early_adopter_bonus,
                        "value_score": 0.6,
                        "loyalty_tier": "standard",
                        "loyalty_multiplier": 1.0,
                        "rewards": [
                            {"reward_type": "cashback", "rate": 0.01, "value": 4.10, "description": "1% Target RedCard rewards"}
                        ],
                        "preference_score": 0.65,
                        "eligible": True
                    },
                    
                    # Travel Cards
                    {
                        "instrument_id": "delta_amex_016",
                        "instrument_type": "credit_card",
                        "provider": "Delta/Amex",
                        "last_four": "DLT1",
                        "base_fee": 0.0,
                        "out_of_pocket_cost": 0.0,
                        "available_balance": 10000.0,
                        "credit_limit": 18000.0,
                        "total_reward_value": 8.21 + total_incentive_value + early_adopter_bonus,
                        "net_value": 8.21 + total_incentive_value + early_adopter_bonus,
                        "value_score": 0.85,
                        "loyalty_tier": "premium",
                        "loyalty_multiplier": 1.4,
                        "rewards": [
                            {"reward_type": "miles", "rate": 1.0, "value": 410.0, "description": "1 Delta mile per $1 spent"},
                            {"reward_type": "bonus", "rate": 0.01, "value": 4.10, "description": "1% bonus on clothing purchases"}
                        ],
                        "preference_score": 0.88,
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
            
            # Debug: Log the number of instruments being sent
            logger.info(f"🔍 Sending {len(opal_negotiation_data['available_instruments'])} instruments to Opal")
            logger.info(f"🔍 First few instruments: {[inst['instrument_id'] for inst in opal_negotiation_data['available_instruments'][:5]]}")
            
            success, opal_negotiation = await call_agent_endpoint(
                http_client, "opal", "/counter-negotiate", "POST", opal_negotiation_data, trace_id
            )
            negotiation_results["opal"] = {"success": success, "data": opal_negotiation}
        
        phases["negotiation"] = negotiation_results
        
        # Phase 5: Final Settlement
        logger.info("🎯 Phase 5: Final Settlement")
        settlement_results = {}
        
        if (negotiation_results.get("orca", {}).get("success") and 
            negotiation_results.get("opal", {}).get("success")):
            
            orca_data = negotiation_results["orca"]["data"]
            opal_data = negotiation_results["opal"]["data"]
            
            # Simple consensus logic: Opal's preference takes precedence
            orca_rail = orca_data.get("optimal_rail", "Card")
            opal_rail = opal_data.get("consumer_proposal", {}).get("rail_type", "Card")
            
            final_rail = opal_rail  # Consumer-centric approach
            
            consensus_reason = "Opal's rail preference accepted as consumer choice"
            if orca_rail == opal_rail:
                consensus_reason = f"Both agents agree on {opal_rail}"
            
            settlement_results = {
                "final_rail": final_rail,
                "orca_recommended": orca_rail,
                "opal_preferred": opal_rail,
                "consensus_reason": consensus_reason,
                "consumer_benefit": opal_data.get("consumer_proposal", {}).get("consumer_benefit", 0.0),
                "confidence": opal_data.get("confidence", 0.5)
            }
        
        phases["settlement"] = settlement_results
    
    # Calculate execution summary
    end_time = datetime.now()
    execution_time = (end_time - start_time).total_seconds()
    
    # Determine overall status
    overall_status = "success"
    if not phases.get("health_checks", {}).get("orca", {}).get("healthy"):
        overall_status = "partial_failure"
    if not phases.get("orca", {}).get("decision", {}).get("success"):
        overall_status = "failure"
    
    summary = {
        "execution_time_seconds": execution_time,
        "agents_healthy": sum(1 for agent, result in phases.get("health_checks", {}).items() 
                            if result.get("healthy", False)),
        "total_agents": len(AGENT_URLS),
        "phases_completed": len([p for p in phases.values() if p]),
        "final_rail": settlement_results.get("final_rail", "unknown"),
        "consumer_benefit": settlement_results.get("consumer_benefit", 0.0)
    }
    
    logger.info(f"Demo 2 '{request.demo_id}' completed in {execution_time:.2f}s with status {overall_status}")
    
    return DemoResponse(
        demo_id=request.demo_id,
        trace_id=trace_id,
        timestamp=end_time.isoformat(),
        status=overall_status,
        phases=phases,
        summary=summary
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8091)
