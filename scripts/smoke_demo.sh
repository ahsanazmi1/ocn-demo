#!/bin/bash

# smoke_demo.sh - OCN AI Explainability Demo
# Demonstrates Orca (checkout + explanation) → Weave (receipts)
# and Orion (payout optimization + explanation) → Weave

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting OCN AI Explainability Demo${NC}"
echo "=================================="

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
bash scripts/wait_for_port.sh localhost 8082 30  # Weave
bash scripts/wait_for_port.sh localhost 8080 30  # Orca
bash scripts/wait_for_port.sh localhost 8081 30  # Orion

echo -e "${GREEN}✅ All services are ready!${NC}"
echo

# Function to extract trace_id from JSON (if jq is available)
extract_trace_id() {
    local file=$1
    if command -v jq >/dev/null 2>&1; then
        jq -r '.trace_id // .metadata.trace_id // "N/A"' "$file" 2>/dev/null || echo "N/A"
    else
        echo "N/A (jq not available)"
    fi
}

# Function to extract outcome from JSON (if jq is available)
extract_outcome() {
    local file=$1
    if command -v jq >/dev/null 2>&1; then
        jq -r '.outcome // "N/A"' "$file" 2>/dev/null || echo "N/A"
    else
        echo "N/A (jq not available)"
    fi
}

# Function to make API call and show results
api_call() {
    local name=$1
    local url=$2
    local data_file=$3
    local output_file=$4
    
    echo -e "${BLUE}📡 $name${NC}"
    echo "   URL: $url"
    echo "   Data: $data_file"
    
    if curl -s "$url" \
        -H 'Content-Type: application/json' \
        --data @"$data_file" \
        -o "$output_file" \
        -w "HTTP Status: %{http_code}\n"; then
        
        local trace_id=$(extract_trace_id "$output_file")
        local outcome=$(extract_outcome "$output_file")
        
        echo -e "   ${GREEN}✅ Success${NC}"
        echo "   Output: $output_file"
        echo "   Trace ID: $trace_id"
        echo "   Outcome: $outcome"
    else
        echo -e "   ${RED}❌ Failed${NC}"
        echo "   Output: $output_file"
    fi
    echo
}

# 1. Orca Decision
api_call "Orca Decision" \
    "http://localhost:8080/decide" \
    "samples/ap2/checkout_small.json" \
    ".out_orca_decision.json"

# 2. Orca Explanation (with CloudEvent emission)
api_call "Orca Explanation (CE)" \
    "http://localhost:8080/explain?emit_ce=true" \
    "samples/ap2/checkout_small.json" \
    ".out_orca_explanation.json"

# 3. Orion Optimization (with CloudEvent emission)
api_call "Orion Optimization (CE)" \
    "http://localhost:8081/optimize?emit_ce=true" \
    "samples/vendor/payout_basic.json" \
    ".out_orion_opt.json"

# 4. Weave Health Check
api_call "Weave Health" \
    "http://localhost:8082/health" \
    "/dev/null" \
    ".out_weave_health.json"

# Summary
echo -e "${GREEN}🎉 Demo Complete!${NC}"
echo "=================================="
echo "📊 Summary:"
echo

# Check if we have outputs
if [ -f ".out_orca_decision.json" ]; then
    echo -e "✅ ${GREEN}Orca Decision${NC}: $(extract_outcome .out_orca_decision.json)"
fi

if [ -f ".out_orca_explanation.json" ]; then
    echo -e "✅ ${GREEN}Orca Explanation${NC}: $(extract_trace_id .out_orca_explanation.json)"
fi

if [ -f ".out_orion_opt.json" ]; then
    echo -e "✅ ${GREEN}Orion Optimization${NC}: $(extract_trace_id .out_orion_opt.json)"
fi

if [ -f ".out_weave_health.json" ]; then
    echo -e "✅ ${GREEN}Weave Health${NC}: Ready"
fi

echo
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "• Check Weave logs: docker compose logs weave"
echo "• View CloudEvents: Look for 'ocn.orca.explanation.v1' and 'ocn.orion.explanation.v1'"
echo "• All events should have trace_id as CloudEvent subject"
echo "• Raw outputs saved as .out_*.json files"
echo
echo -e "${BLUE}🔍 To see CloudEvents in Weave logs:${NC}"
echo "docker compose logs weave | grep -E '(explanation|trace_id)'"
