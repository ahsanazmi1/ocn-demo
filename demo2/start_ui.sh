#!/bin/bash

echo "🌐 Starting OCN Demo 2 Web UI..."
echo "📡 Web UI will be available at: http://localhost:8088/ui.html"
echo "🔗 Demo 2 API is running at: http://localhost:8091"
echo ""

# Check if demo2 API is running
if curl -s http://localhost:8091/health > /dev/null; then
    echo "✅ Demo 2 API is running"
else
    echo "❌ Demo 2 API is not running. Please start it first:"
    echo "   docker-compose --profile demo2 up -d demo2"
    echo ""
fi

# Start the web UI server
python3 serve_ui.py
