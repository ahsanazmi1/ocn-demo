#!/bin/bash

# UI Test Runner for Phase 4 Components
# Runs comprehensive tests for all new UI components

set -e

echo "🧪 Running Phase 4 UI Tests"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the ui directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install testing dependencies if needed
if [ ! -d "node_modules/@testing-library" ]; then
    echo "📦 Installing testing dependencies..."
    npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
fi

# Run tests with verbose output
echo "🚀 Running Phase 4 Component Tests..."

# Test Phase4Flow component
echo ""
echo "📋 Testing Phase4Flow Component..."
if npm test -- __tests__/Phase4Flow.test.tsx --verbose --no-coverage 2>/dev/null; then
    echo "✅ Phase4Flow tests passed"
else
    echo "❌ Phase4Flow tests failed"
    exit 1
fi

# Test ConsumerDashboard component
echo ""
echo "👤 Testing ConsumerDashboard Component..."
if npm test -- __tests__/ConsumerDashboard.test.tsx --verbose --no-coverage 2>/dev/null; then
    echo "✅ ConsumerDashboard tests passed"
else
    echo "❌ ConsumerDashboard tests failed"
    exit 1
fi

# Test MerchantDashboard component
echo ""
echo "🏪 Testing MerchantDashboard Component..."
if npm test -- __tests__/MerchantDashboard.test.tsx --verbose --no-coverage 2>/dev/null; then
    echo "✅ MerchantDashboard tests passed"
else
    echo "❌ MerchantDashboard tests failed"
    exit 1
fi

# Test ProcessorDashboard component
echo ""
echo "⚙️  Testing ProcessorDashboard Component..."
if npm test -- __tests__/ProcessorDashboard.test.tsx --verbose --no-coverage 2>/dev/null; then
    echo "✅ ProcessorDashboard tests passed"
else
    echo "❌ ProcessorDashboard tests failed"
    exit 1
fi

# Run all tests together
echo ""
echo "🔄 Running All Phase 4 Tests Together..."
if npm test -- __tests__/Phase4*.test.tsx --verbose --no-coverage 2>/dev/null; then
    echo "✅ All Phase 4 UI tests passed!"
else
    echo "❌ Some Phase 4 UI tests failed"
    exit 1
fi

echo ""
echo "🎉 Phase 4 UI Testing Complete!"
echo "=============================="
echo "✅ Phase4Flow Component - Payment instruction compilation and processing flow"
echo "✅ ConsumerDashboard - Rewards, savings, and payment insights"
echo "✅ MerchantDashboard - Processor bids, route analysis, and fee optimization"
echo "✅ ProcessorDashboard - Bid history, authorization results, and system monitoring"
echo ""
echo "All components are ready for Phase 4 demo!"








