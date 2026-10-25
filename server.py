import http.server
import socketserver

PORT = 8000

class SecureHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        super().end_headers()

    def do_GET(self):
        # same rewrite as vercel.json: /work serves work.html
        path, sep, query = self.path.partition("?")
        if path == "/work":
            self.path = "/work.html" + sep + query
        super().do_GET()

with socketserver.TCPServer(("", PORT), SecureHandler) as httpd:
    print(f"Magical server running at http://localhost:{PORT}")
    print("Press Ctrl+C to stop it.")
    httpd.serve_forever()