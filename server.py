"""
Simple HTTP server for testing the Web App locally
Run this file to test the web app before deployment
"""

import http.server
import socketserver
import os
from pathlib import Path

# Configuration
PORT = 8080
DIRECTORY = Path(__file__).parent

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with CORS support"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def end_headers(self):
        """Add CORS headers to all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS"""
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        """Custom log format"""
        print(f"[{self.log_date_time_string()}] {format % args}")


def run_server():
    """Start the development server"""
    handler = CORSRequestHandler
    
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print("=" * 60)
        print(f"🌐 Web App Development Server")
        print("=" * 60)
        print(f"\n📡 Server running at: http://localhost:{PORT}")
        print(f"📁 Serving directory: {DIRECTORY}")
        print("\n⚠️  IMPORTANT:")
        print("   - This is for LOCAL TESTING ONLY")
        print("   - Telegram requires HTTPS for production")
        print("   - Use ngrok or deploy to GitHub Pages for testing with Telegram")
        print("\n🔧 Quick ngrok setup:")
        print(f"   1. Download ngrok from https://ngrok.com")
        print(f"   2. Run: ngrok http {PORT}")
        print("   3. Use the HTTPS URL provided by ngrok")
        print("\n⌨️  Press Ctrl+C to stop the server")
        print("=" * 60)
        print()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped. Goodbye!")


if __name__ == "__main__":
    run_server()
