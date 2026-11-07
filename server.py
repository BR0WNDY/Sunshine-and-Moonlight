import http.server
import socketserver

PORT = 8000

REWRITES = {
    "/work": "/work.html",
    "/packages": "/packages.html",
}

class SecureHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def do_GET(self):
        path, sep, query = self.path.partition("?")
        if path in REWRITES:
            self.path = REWRITES[path] + sep + query
        super().do_GET()

socketserver.TCPServer.allow_reuse_address = True

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), SecureHandler) as httpd:
        print(f"Magical server running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop it.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
