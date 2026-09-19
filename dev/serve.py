"""A small test server for Animal World (development only).

    python dev/serve.py            then open http://127.0.0.1:8765/

Serves the project folder, plus test pages that run inside the real pages:
    /__walkthrough     dev/walkthrough.html: every theme through every activity (compare runs with diff)
    /__app             index.html with dev/test.js injected
    /__scenes          scenes.html with dev/test.js injected
Write whatever check you need into dev/test.js (it is not committed).
"""
import functools, http.server, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


class Handler(http.server.SimpleHTTPRequestHandler):
    def send(self, body, ctype):
        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.end_headers()
        self.wfile.write(body)

    def inject(self, page):
        html = open(os.path.join(ROOT, page), 'rb').read()
        self.send(html.replace(b'</body>', b'<script src="/__test.js"></script></body>'), 'text/html')

    def do_GET(self):
        if self.path.startswith('/__walkthrough'):
            self.send(open(os.path.join(HERE, 'walkthrough.html'), 'rb').read(), 'text/html')
        elif self.path.startswith('/__test.js'):
            path = os.path.join(HERE, 'test.js')
            self.send(open(path, 'rb').read() if os.path.exists(path) else b'', 'text/javascript')
        elif self.path.startswith('/__app'):
            self.inject('index.html')
        elif self.path.startswith('/__scenes'):
            self.inject('scenes.html')
        else:
            super().do_GET()

    def log_message(self, *args):
        pass


http.server.ThreadingHTTPServer(('127.0.0.1', 8765), functools.partial(Handler, directory=ROOT)).serve_forever()
