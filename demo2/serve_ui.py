#!/usr/bin/env python3
"""
Simple HTTP server to serve the OCN Demo 2 Web UI
"""

import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

PORT = 8088

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers to allow requests to the demo API
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def serve_ui():
    """Serve the web UI on localhost:8080"""
    
    # Change to the demo2 directory
    demo2_dir = Path(__file__).parent
    os.chdir(demo2_dir)
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"🌐 OCN Demo 2 Web UI Server")
        print(f"📡 Serving on http://localhost:{PORT}")
        print(f"🎯 Open http://localhost:{PORT}/ui.html in your browser")
        print(f"⏹️  Press Ctrl+C to stop the server")
        print("-" * 50)
        
        # Try to open browser automatically
        try:
            webbrowser.open(f'http://localhost:{PORT}/ui.html')
            print("🚀 Browser opened automatically")
        except:
            print("💡 Please manually open http://localhost:8080/ui.html in your browser")
        
        print("-" * 50)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
            httpd.shutdown()

if __name__ == "__main__":
    serve_ui()
