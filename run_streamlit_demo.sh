#!/bin/bash

# OCN Streamlit Demo Runner
# This script starts the Streamlit demo application

echo "🚀 Starting OCN ML-Powered Payment Demo..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python3 first."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "streamlit_demo_env" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv streamlit_demo_env
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source streamlit_demo_env/bin/activate

# Install requirements if needed
echo "📦 Installing requirements..."
pip install -r requirements_streamlit.txt

# Start Streamlit
echo "🌐 Starting Streamlit demo..."
echo "📱 The demo will be available at: http://localhost:8501"
echo "🔄 Press Ctrl+C to stop the demo"

streamlit run streamlit_demo.py --server.port 8501 --server.address 0.0.0.0
