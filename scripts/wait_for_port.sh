#!/bin/bash

# wait_for_port.sh - Wait for a port to be available
# Usage: wait_for_port <host> <port> [timeout_seconds]

set -euo pipefail

HOST=${1:-localhost}
PORT=${2:-8080}
TIMEOUT=${3:-30}

echo "⏳ Waiting for $HOST:$PORT to be available (timeout: ${TIMEOUT}s)..."

for i in $(seq 1 "$TIMEOUT"); do
    if nc -z "$HOST" "$PORT" 2>/dev/null; then
        echo "✅ $HOST:$PORT is available!"
        exit 0
    fi
    echo "   Attempt $i/$TIMEOUT - waiting..."
    sleep 1
done

echo "❌ Timeout waiting for $HOST:$PORT"
exit 1
