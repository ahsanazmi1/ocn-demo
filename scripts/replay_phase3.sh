#!/bin/bash

# OCN Demo 1 Phase 3 Replay Script
# Runs Steps 4-6 (Negotiation, Auction, Settlement) deterministically

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
GATEWAY_URL=${GATEWAY_URL:-"http://localhost:8090"}
TRACE_ID=${TRACE_ID:-"replay-phase3-$(date +%s)"}
DETERMINISTIC_SEED=${DETERMINISTIC_SEED:-42}

echo -e "${BLUE}🎯 OCN Demo 1 Phase 3 Replay Script${NC}"
echo -e "${BLUE}====================================${NC}"
echo -e "Gateway URL: ${GATEWAY_URL}"
echo -e "Trace ID: ${TRACE_ID}"
echo -e "Deterministic Seed: ${DETERMINISTIC_SEED}"
echo ""

# Check if gateway is running
echo -e "${YELLOW}🔍 Checking gateway status...${NC}"
if ! curl -s "${GATEWAY_URL}/health" > /dev/null; then
    echo -e "${RED}❌ Gateway is not running at ${GATEWAY_URL}${NC}"
    echo -e "${YELLOW}💡 Start the gateway with: docker-compose up gateway${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Gateway is running${NC}"
echo ""

# Step 4: Orca vs Opal Negotiation
echo -e "${BLUE}🔄 Step 4: Orca vs Opal Negotiation${NC}"
echo -e "${YELLOW}Calling Orca negotiation...${NC}"

ORCA_NEGOTIATION_RESPONSE=$(curl -s -X POST "${GATEWAY_URL}/run/demo1" \
    -H "Content-Type: application/json" \
    -d '{
        "trace_id": "'${TRACE_ID}'",
        "cart_summary": {
            "total_amount": 700.0,
            "currency": "USD",
            "item_count": 2,
            "merchant_id": "demo_merchant_001",
            "merchant_category": "clothing",
            "channel": "online"
        },
        "rail_candidates": [
            {
                "rail_type": "credit",
                "base_cost_bps": 150.0,
                "settlement_days": 1,
                "risk_score": 0.3
            },
            {
                "rail_type": "debit",
                "base_cost_bps": 100.0,
                "settlement_days": 2,
                "risk_score": 0.2
            },
            {
                "rail_type": "ACH",
                "base_cost_bps": 50.0,
                "settlement_days": 1,
                "risk_score": 0.1
            }
        ],
        "deterministic_seed": '${DETERMINISTIC_SEED}'
    }')

if echo "$ORCA_NEGOTIATION_RESPONSE" | jq -e '.phase3.negotiation.orca' > /dev/null; then
    ORCA_CHOSEN_RAIL=$(echo "$ORCA_NEGOTIATION_RESPONSE" | jq -r '.phase3.negotiation.orca.chosen_rail')
    ORCA_FINAL_SCORE=$(echo "$ORCA_NEGOTIATION_RESPONSE" | jq -r '.phase3.negotiation.orca.rail_evaluations[0].final_score')
    echo -e "${GREEN}✅ Orca negotiation completed${NC}"
    echo -e "   Chosen rail: ${ORCA_CHOSEN_RAIL}"
    echo -e "   Final score: ${ORCA_FINAL_SCORE}"
else
    echo -e "${RED}❌ Orca negotiation failed${NC}"
    echo "$ORCA_NEGOTIATION_RESPONSE" | jq '.phase3.negotiation.orca_error // .error'
    exit 1
fi

if echo "$ORCA_NEGOTIATION_RESPONSE" | jq -e '.phase3.negotiation.opal' > /dev/null; then
    OPAL_SELECTED_INSTRUMENT=$(echo "$ORCA_NEGOTIATION_RESPONSE" | jq -r '.phase3.negotiation.opal.selected_instrument.instrument_id')
    OPAL_CONSUMER_VALUE=$(echo "$ORCA_NEGOTIATION_RESPONSE" | jq -r '.phase3.negotiation.opal.consumer_value')
    echo -e "${GREEN}✅ Opal negotiation completed${NC}"
    echo -e "   Selected instrument: ${OPAL_SELECTED_INSTRUMENT}"
    echo -e "   Consumer value: \$${OPAL_CONSUMER_VALUE}"
else
    echo -e "${RED}❌ Opal negotiation failed${NC}"
    echo "$ORCA_NEGOTIATION_RESPONSE" | jq '.phase3.negotiation.opal_error // .error'
    exit 1
fi
echo ""

# Step 5: Weave Auction
echo -e "${BLUE}🌊 Step 5: Weave Processor Auction${NC}"

if echo "$ORCA_NEGOTIATION_RESPONSE" | jq -e '.phase3.auction' > /dev/null; then
    WINNING_PROCESSOR=$(echo "$ORCA_NEGOTIATION_RESPONSE" | jq -r '.phase3.auction.winning_processor')
    EFFECTIVE_COST=$(echo "$ORCA_NEGOTIATION_RESPONSE" | jq -r '.phase3.auction.effective_cost_bps')
    AUCTION_ID=$(echo "$ORCA_NEGOTIATION_RESPONSE" | jq -r '.phase3.auction.auction_id')
    echo -e "${GREEN}✅ Weave auction completed${NC}"
    echo -e "   Winning processor: ${WINNING_PROCESSOR}"
    echo -e "   Effective cost: ${EFFECTIVE_COST} bps"
    echo -e "   Auction ID: ${AUCTION_ID}"
    
    # Show all bids
    echo -e "${YELLOW}📊 All processor bids:${NC}"
    echo "$ORCA_NEGOTIATION_RESPONSE" | jq -r '.phase3.auction.all_bids[] | "   \(.processor_id | ascii_upcase): \(.bps) bps - \(.rebate_bps) rebate = \(.effective_cost_bps) bps (\(.expected_settlement_days)d, \(.confidence*100|floor)%)"'
else
    echo -e "${RED}❌ Weave auction failed${NC}"
    echo "$ORCA_NEGOTIATION_RESPONSE" | jq '.phase3.auction.error // .error'
    exit 1
fi
echo ""

# Step 6: Final Settlement
echo -e "${BLUE}🎯 Step 6: Final Settlement with Policy and Trust Adjustments${NC}"

if echo "$ORCA_NEGOTIATION_RESPONSE" | jq -e '.phase3.settlement.olive_policy' > /dev/null; then
    APPLIED_POLICIES=$(echo "$ORCA_NEGOTIATION_RESPONSE" | jq -r '.phase3.settlement.olive_policy.data.applied_policies // [] | length')
    echo -e "${GREEN}✅ Olive policy evaluation completed${NC}"
    echo -e "   Applied policies: ${APPLIED_POLICIES}"
else
    echo -e "${YELLOW}⚠️  Olive policy evaluation failed or no policies applied${NC}"
fi

if echo "$ORCA_NEGOTIATION_RESPONSE" | jq -e '.phase3.settlement.onyx_trust' > /dev/null; then
    TRUST_SCORE=$(echo "$ORCA_NEGOTIATION_RESPONSE" | jq -r '.phase3.settlement.onyx_trust.data.trust_score')
    RISK_LEVEL=$(echo "$ORCA_NEGOTIATION_RESPONSE" | jq -r '.phase3.settlement.onyx_trust.data.risk_level')
    echo -e "${GREEN}✅ Onyx trust signal completed${NC}"
    echo -e "   Trust score: ${TRUST_SCORE}"
    echo -e "   Risk level: ${RISK_LEVEL}"
else
    echo -e "${YELLOW}⚠️  Onyx trust signal failed${NC}"
fi

if echo "$ORCA_NEGOTIATION_RESPONSE" | jq -e '.phase3.settlement.final' > /dev/null; then
    FINAL_RAIL=$(echo "$ORCA_NEGOTIATION_RESPONSE" | jq -r '.phase3.settlement.final.final_rail')
    FINAL_COST=$(echo "$ORCA_NEGOTIATION_RESPONSE" | jq -r '.phase3.settlement.final.final_cost_bps')
    echo -e "${GREEN}✅ Final settlement path calculated${NC}"
    echo -e "   Final rail: ${FINAL_RAIL}"
    echo -e "   Final cost: ${FINAL_COST} bps"
else
    echo -e "${YELLOW}⚠️  Final settlement calculation failed${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}📋 Phase 3 Replay Summary${NC}"
echo -e "${BLUE}========================${NC}"
echo -e "Trace ID: ${TRACE_ID}"
echo -e "Deterministic Seed: ${DETERMINISTIC_SEED}"
echo -e "Orca chosen rail: ${ORCA_CHOSEN_RAIL}"
echo -e "Opal selected instrument: ${OPAL_SELECTED_INSTRUMENT}"
echo -e "Weave winning processor: ${WINNING_PROCESSOR}"
echo -e "Final settlement rail: ${FINAL_RAIL:-"N/A"}"
echo ""

# Save results to file
RESULTS_FILE="phase3_replay_results_${TRACE_ID}.json"
echo "$ORCA_NEGOTIATION_RESPONSE" | jq '.' > "$RESULTS_FILE"
echo -e "${GREEN}✅ Results saved to: ${RESULTS_FILE}${NC}"

# Show CloudEvents emitted
echo -e "${BLUE}📡 CloudEvents Emitted:${NC}"
echo -e "   • ocn.weave.bid_request.v1"
echo -e "   • ocn.weave.bid_response.v1"
echo -e "   • ocn.opal.explanation.v1"
echo -e "   • ocn.olive.policy_applied.v1"
echo -e "   • ocn.onyx.trust_signal.v1"
echo -e "   • ocn.orca.explanation.v1"
echo ""

echo -e "${GREEN}🎉 Phase 3 replay completed successfully!${NC}"
echo -e "${YELLOW}💡 View the full results in the UI at: http://localhost:3000${NC}"

