#!/bin/bash

# Phase 4 UI Demo Script
# Demonstrates the complete Phase 4 UI functionality

set -e

echo "🚀 Phase 4 UI Demo"
echo "=================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the ui directory"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🌐 Starting Phase 4 UI Demo Server..."
echo ""
echo "📍 The demo will be available at: http://localhost:3000"
echo ""
echo "🎯 Phase 4 Features to Explore:"
echo "   • Demo Flow Tab - Complete Phase 4 payment instruction flow"
echo "   • Consumer Dashboard - Rewards, savings, and payment insights"
echo "   • Merchant Dashboard - Processor bids, route analysis, fee optimization"
echo "   • Processor Dashboard - Bid history, authorization results, system monitoring"
echo "   • Scorecard Tab - Learning loop performance and drift detection"
echo ""
echo "🔍 Key Demo Scenarios:"
echo "   1. Run Demo 1 to see the complete flow from checkout to authorization"
echo "   2. Switch to Consumer Dashboard to see rewards and savings"
echo "   3. Switch to Merchant Dashboard to see processor optimization"
echo "   4. Switch to Processor Dashboard to see bid history and auth results"
echo "   5. Switch to Scorecard to see learning loop performance"
echo ""
echo "💡 Demo Data:"
echo "   • Payment Instruction: ACH rail, Carat processor, $1,000 transaction"
echo "   • Authorization: Approved with 22h settlement, 96% approval score"
echo "   • Consumer Benefits: 2% cashback, 50 loyalty points, $5 bonus"
echo "   • Merchant Savings: $85 saved vs alternatives, 33.3% cost reduction"
echo "   • Processor Metrics: 71.5% win rate, 99.8% uptime, 96% approval rate"
echo ""
echo "🛑 Press Ctrl+C to stop the demo server"
echo ""

# Start the development server
npm run dev








