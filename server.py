import http.server
import socketserver

PORT = 8000

class SecureHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        super().end_headers()

with socketserver.TCPServer(("", PORT), SecureHandler) as httpd:
    print(f"Magical server running at http://localhost:{PORT}")
    print("Press Ctrl+C to stop it.")
    httpd.serve_forever()