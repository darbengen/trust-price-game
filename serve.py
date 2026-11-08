#!/usr/bin/env python3
"""A loopback-only static server for the built game; no network account required."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import json,sys,subprocess,urllib.request,functools
ROOT=Path(__file__).resolve().parent
IDENTITY='trust-price-3d:'+str(ROOT)
class Handler(SimpleHTTPRequestHandler):
 def do_GET(self):
  if self.path=='/__health':
   payload=json.dumps({'app':IDENTITY}).encode();self.send_response(200);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(payload)
  else:super().do_GET()
 def log_message(self,*args):pass

def open_browser(url):
 if '--no-open' not in sys.argv:subprocess.run(['open','-a','Google Chrome',url],check=False)
if not (ROOT/'dist'/'index.html').exists():raise SystemExit('请先在本目录运行 npm install 和 npm run build。')
for port in range(8768,8780):
 url=f'http://127.0.0.1:{port}/'
 try:
  with urllib.request.urlopen(url+'__health',timeout=.3) as r:existing=json.load(r)
  if existing.get('app')==IDENTITY:
   print(url,flush=True);open_browser(url);sys.exit(0)
 except Exception:pass
 try:server=ThreadingHTTPServer(('127.0.0.1',port),functools.partial(Handler,directory=str(ROOT/'dist')));break
 except OSError:continue
else:raise SystemExit('没有找到可用的本地端口。')
print('游戏已启动：'+url+'\n关闭本窗口或按 Control-C 停止。',flush=True);open_browser(url)
try:server.serve_forever()
except KeyboardInterrupt:server.server_close()
