import http.server
import socketserver

HOST = "127.0.0.1"
PORT = 8000

REWRITES = {
    "/work": "/work.html",
    "/packages": "/packages.html",
    "/books": "/books.html",
}

class SecureHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        path = self.path.partition("?")[0]
        is_books = path in ("/books", "/books.html")
        coep = "unsafe-none" if is_books else "require-corp"
        perm = "geolocation=(), microphone=(), camera=(self)" if is_books else "geolocation=(), microphone=(), camera=()"
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", coep)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Permissions-Policy", perm)
        super().end_headers()

    def list_directory(self, path):
        self.send_error(403, "Directory listing disabled")
        return None

    def do_GET(self):
        path, sep, query = self.path.partition("?")
        if any(part.startswith(".") for part in path.split("/") if part):
            self.send_error(403, "Forbidden")
            return
        if path in REWRITES:
            self.path = REWRITES[path] + sep + query
        super().do_GET()

socketserver.TCPServer.allow_reuse_address = True

if __name__ == "__main__":
    with socketserver.TCPServer((HOST, PORT), SecureHandler) as httpd:
        print(f"Magical server running at http://{HOST}:{PORT}")
        print("Press Ctrl+C to stop it.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
