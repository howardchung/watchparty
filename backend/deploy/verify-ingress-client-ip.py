#!/usr/bin/env python3
"""Disposable local ingress verification. Never use against a deployed stack.

Uses pinned Caddy/HAProxy, an existing API image, and an isolated PostgreSQL17.
Fixture credentials and a generated TLS key are local-only; responses containing
real fixture guest credentials are discarded, never logged.
"""
import argparse
import hashlib
import http.client
import ipaddress
import json
import pathlib
import socket
import ssl
import subprocess
import tempfile
import time
import uuid

parser = argparse.ArgumentParser()
parser.add_argument('--api-image', default='watchparty-api:20261105-voice-v4-rc2')
parser.add_argument('--postgres-image', default='postgres:17-alpine')
parser.add_argument('--output', default='/tmp/watchparty-ingress-client-ip-result.json')
args = parser.parse_args()
repo = pathlib.Path(__file__).resolve().parents[2]
fixture = pathlib.Path(tempfile.mkdtemp(prefix='watchparty-ingress-client-ip-'))
started = time.monotonic()
run_id = uuid.uuid4().hex[:10]
network = 'watchparty-ingress-ip-' + run_id
names = {kind: 'watchparty-ingress-ip-' + kind + '-' + run_id for kind in ['postgres', 'api', 'caddy', 'haproxy']}
created = []
network_created = False
caddy_image = 'caddy@sha256:d8542f48d34a9cf4e4c11a478865229840e87e4c96ea3f439101f31a5d35f75f'
haproxy_image = 'haproxy@sha256:5893840576071e6217cd52ebdcc14f454c6f7a631056fa6f4e0f40d3cac4215b'

def command(argv, *, timeout=60):
    value = subprocess.run(argv, capture_output=True, text=True, timeout=timeout)
    if value.returncode:
        raise RuntimeError('Fixture command failed: ' + ' '.join(argv[:3]) + ': ' + value.stderr[-1200:])
    return value.stdout.strip()

def run_container(kind, argv):
    command(['docker', 'run', '-d', '--name', names[kind], '--label', 'watchparty.fixture=' + run_id, *argv])
    created.append(kind)

def request(source, path, *, method='GET', forged_xff=None):
    raw = socket.create_connection(('127.0.0.1', 19443), timeout=5, source_address=(source, 0))
    with tls.wrap_socket(raw, server_hostname='watchparty.top') as connection:
        body = json.dumps({'name': 'Ingress fixture', 'avatar': 'moon', 'language': 'en'}).encode() if method == 'POST' else b''
        headers = ['Host: watchparty.top', 'Connection: close', 'Origin: https://watchparty.top', 'X-Roomio-Client: browser']
        if forged_xff: headers.append('X-Forwarded-For: ' + forged_xff)
        if body: headers += ['Content-Type: application/json', 'Content-Length: ' + str(len(body))]
        connection.sendall((method + ' ' + path + ' HTTP/1.1\r\n' + '\r\n'.join(headers) + '\r\n\r\n').encode() + body)
        response = http.client.HTTPResponse(connection); response.begin()
        data = response.read()  # Guest tokens/cookies are deliberately not persisted.
        return response.status, dict(response.getheaders()), json.loads(data) if path == '/__echo' and response.status == 200 else None

try:
    networks = command(['docker', 'network', 'ls', '--quiet']).splitlines()
    for item in json.loads(command(['docker', 'network', 'inspect', *networks])):
        for cfg in item.get('IPAM', {}).get('Config') or []:
            if cfg.get('Subnet') and ipaddress.ip_network(cfg['Subnet']).version == 4:
                if ipaddress.ip_network('172.30.55.0/24').overlaps(ipaddress.ip_network(cfg['Subnet'])):
                    raise RuntimeError('Refusing to overlap an existing Docker network; do not run on a production host')
    for image in [args.api_image, args.postgres_image, caddy_image, haproxy_image]:
        command(['docker', 'image', 'inspect', '--format', '{{.Id}}', image])
    command(['openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1', '-subj', '/CN=watchparty.top', '-addext', 'subjectAltName=DNS:watchparty.top,DNS:relay.watchparty.top,DNS:www.watchparty.top', '-keyout', str(fixture / 'key.pem'), '-out', str(fixture / 'cert.pem')])
    caddy = (repo / 'backend/deploy/Caddyfile').read_text()
    caddy = caddy.replace('{\n', '{\n    auto_https disable_certs\n', 1)
    caddy = caddy.replace('{$SITE_DOMAIN} {', '{$SITE_DOMAIN} {\n    tls /tls/cert.pem /tls/key.pem\n    @echo path /__echo\n    handle @echo {\n        reverse_proxy api:8082\n    }', 1)
    acme = '    tls {\n        issuer acme {\n            disable_tlsalpn_challenge\n        }\n    }'
    assert acme in caddy
    caddy = caddy.replace(acme, '    tls /tls/cert.pem /tls/key.pem', 1)
    (fixture / 'Caddyfile').write_text(caddy)
    haproxy = (repo / 'backend/deploy/haproxy.cfg').read_text().replace('bind :443', 'bind 127.0.0.1:19443').replace('127.0.0.1:8443', '127.0.0.1:18443')
    (fixture / 'haproxy.cfg').write_text(haproxy)
    command(['docker', 'network', 'create', '--subnet', '172.30.55.0/24', '--label', 'watchparty.fixture=' + run_id, network]); network_created = True
    run_container('postgres', ['--network', network, '--network-alias', 'postgres', '--env', 'POSTGRES_USER=watchparty', '--env', 'POSTGRES_DB=watchparty_ingress', '--env', 'POSTGRES_PASSWORD=local-ingress-fixture-only', args.postgres_image])
    deadline = time.monotonic() + 30
    while subprocess.run(['docker', 'exec', names['postgres'], 'pg_isready', '-U', 'watchparty', '-d', 'watchparty_ingress'], capture_output=True).returncode:
        if time.monotonic() > deadline: raise RuntimeError('Fixture PostgreSQL did not become ready')
        time.sleep(0.2)
    run_container('api', ['--network', network, '--network-alias', 'api', '--ip', '172.30.55.3', '--env', 'DATABASE_URL=postgres://watchparty:local-ingress-fixture-only@postgres:5432/watchparty_ingress', '--env', 'AUTH_ALLOWED_ORIGINS=https://watchparty.top', '--env', 'TRUSTED_PROXIES=172.30.55.254/32', '--env', 'TURN_URLS=turn:relay.watchparty.top:3478?transport=udp', '--env', 'TURN_SHARED_SECRET=local-ingress-fixture-secret-at-least-32-bytes', args.api_image])
    echo = "require('node:http').createServer((req,res)=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify({forwardedFor:req.headers['x-forwarded-for'],remoteAddress:req.socket.remoteAddress}))}).listen(8082,'0.0.0.0')"
    command(['docker', 'exec', '-d', names['api'], 'node', '-e', echo])
    deadline = time.monotonic() + 30
    while subprocess.run(['docker', 'exec', names['api'], 'node', '-e', "fetch('http://127.0.0.1:8080/readyz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"], capture_output=True).returncode:
        if time.monotonic() > deadline: raise RuntimeError('Fixture API did not become ready')
        time.sleep(0.2)
    run_container('caddy', ['--network', network, '--ip', '172.30.55.254', '--publish', '127.0.0.1:18443:443', '--publish', '127.0.0.1:18080:80', '--env', 'SITE_DOMAIN=watchparty.top', '--env', 'TURN_DOMAIN=relay.watchparty.top', '--volume', str(fixture / 'Caddyfile') + ':/etc/caddy/Caddyfile:ro', '--volume', str(fixture) + ':/tls:ro', '--volume', str(repo / 'clients/web/dist') + ':/srv:ro', caddy_image])
    run_container('haproxy', ['--network', 'host', '--user', '0:0', '--env', 'TURN_DOMAIN=relay.watchparty.top', '--volume', str(fixture / 'haproxy.cfg') + ':/usr/local/etc/haproxy/haproxy.cfg:ro', haproxy_image])
    tls = ssl.create_default_context(cafile=str(fixture / 'cert.pem'))
    deadline = time.monotonic() + 20
    while True:
        try:
            echo_a = request('127.0.0.2', '/__echo', forged_xff='198.51.100.88')
            if echo_a[0] == 200: break
        except (OSError, http.client.HTTPException): pass
        if time.monotonic() > deadline: raise RuntimeError('Fixture TLS ingress did not become ready')
        time.sleep(0.2)
    echo_b = request('127.0.0.3', '/__echo')
    assert echo_a[2]['forwardedFor'] == '127.0.0.2', echo_a[2]
    assert echo_b[2]['forwardedFor'] == '127.0.0.3', echo_b[2]
    assert echo_a[2]['remoteAddress'].endswith('172.30.55.254'), echo_a[2]
    statuses = [request('127.0.0.2', '/v1/guest-sessions', method='POST')[0] for _ in range(20)]
    assert statuses == [201] * 20, statuses
    exhausted = request('127.0.0.2', '/v1/guest-sessions', method='POST')[0]
    independent = request('127.0.0.3', '/v1/guest-sessions', method='POST')[0]
    spoofed = request('127.0.0.2', '/v1/guest-sessions', method='POST', forged_xff='127.0.0.3')[0]
    assert (exhausted, independent, spoofed) == (429, 201, 429), (exhausted, independent, spoofed)
    # An untrusted bridge peer must not forge a PROXY header to the Caddy listener.
    probe = "const net=require('node:net'),tls=require('node:tls');const raw=net.connect(443,'172.30.55.254',()=>{raw.write('PROXY TCP4 198.51.100.99 172.30.55.254 12345 443\\r\\n');const secure=tls.connect({socket:raw,servername:'watchparty.top',rejectUnauthorized:false},()=>process.exit(1));secure.on('error',()=>process.exit(0));secure.on('close',()=>process.exit(0));});raw.on('error',()=>process.exit(0));setTimeout(()=>process.exit(1),3000)"
    command(['docker', 'exec', names['api'], 'node', '-e', probe], timeout=5)
    alt_svc = next((value for key, value in echo_a[1].items() if key.lower() == 'alt-svc'), '')
    assert ':18443' not in alt_svc and ':19443' not in alt_svc, alt_svc
    plain = http.client.HTTPConnection('127.0.0.1', 18080, timeout=5)
    plain.request('GET', '/rate-fixture', headers={'Host': 'watchparty.top'}); response = plain.getresponse(); location = response.getheader('Location'); response.read(); plain.close()
    assert location == 'https://watchparty.top/rate-fixture', location
    result = {'passed': True, 'elapsedMs': round((time.monotonic() - started) * 1000), 'apiImage': command(['docker', 'image', 'inspect', '--format', '{{.Id}}', args.api_image]), 'postgresImage': command(['docker', 'image', 'inspect', '--format', '{{.Id}}', args.postgres_image]), 'clientAddresses': [echo_a[2], echo_b[2]], 'guestRateStatuses': {'firstClientAccepted': len(statuses), 'firstClientExhausted': exhausted, 'secondClientFirst': independent, 'spoofedHeaderAfterExhaustion': spoofed}, 'untrustedProxyHeaderRejected': True, 'altSvc': alt_svc, 'httpRedirect': location, 'configsSha256': {name: hashlib.sha256((repo / 'backend/deploy' / name).read_bytes()).hexdigest() for name in ['Caddyfile', 'haproxy.cfg']}}
    pathlib.Path(args.output).write_text(json.dumps(result, indent=2) + '\n'); print(json.dumps(result))
finally:
    for kind in reversed(created):
        label = subprocess.run(['docker', 'inspect', '--format', '{{index .Config.Labels "watchparty.fixture"}}', names[kind]], capture_output=True, text=True)
        if label.returncode == 0 and label.stdout.strip() == run_id:
            subprocess.run(['docker', 'rm', '-f', '-v', names[kind]], capture_output=True)
    if network_created: subprocess.run(['docker', 'network', 'rm', network], capture_output=True)
