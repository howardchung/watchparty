"""Exercise packaging and command routing without network or deployment access."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

repo = Path(__file__).resolve().parents[3]
with tempfile.TemporaryDirectory(prefix='watchparty-deploy-test-') as directory:
    root = Path(directory)
    (root / 'scripts').mkdir()
    shutil.copy(repo / 'scripts/deploy.sh', root / 'scripts')
    for name in ('backend/watchparty/server', 'backend/watchparty/sql', 'clients/web/dist/assets', 'bin'):
        (root / name).mkdir(parents=True)
    shutil.copytree(repo / 'backend/deploy', root / 'backend/deploy')
    for name in ('package.json', 'package-lock.json'):
        (root / 'backend/watchparty' / name).write_text('{}')
    (root / 'backend/watchparty/server/server.ts').write_text('// fixture')
    (root / 'backend/watchparty/.env').write_text('DO_NOT_PACKAGE=secret')
    (root / 'clients/web/.env.local').write_text('DO_NOT_PACKAGE=secret')
    (root / 'clients/web/dist/index.html').write_text('<html>fixture</html>')
    (root / 'clients/web/dist/assets/fixture.js').write_text('// fixture')
    def stub(name, body):
        p = root / 'bin' / name
        p.write_text('#!/bin/sh\n' + body + '\n')
        p.chmod(0o755)
    stub('npm', 'exit "${MOCK_NPM_EXIT:-0}"')
    stub('git', 'case "$*" in *rev-parse*) echo abcdef123456;; *status*) echo " M fixture";; esac')
    stub('ssh', 'printf "%s\\n" "$*" >> "$COMMAND_LOG"')
    stub('scp', 'printf "%s\\n" "$*" >> "$COMMAND_LOG"')
    stub('curl', 'echo \'{"ready":true,"database":true,"dispatcher":true,"voice":true}\'')
    env = dict(os.environ, PATH=str(root / 'bin') + ':' + os.environ['PATH'],
               DEPLOY_RELEASE_ID='fixture-release', DEPLOY_SSH_HOST='fixture.invalid',
               COMMAND_LOG=str(root / 'commands.log'))
    def run(command, **overrides):
        return subprocess.run(['bash', str(root / 'scripts/deploy.sh'), command], env=dict(env, **overrides), capture_output=True, text=True)
    assert run('build', MOCK_NPM_EXIT='7').returncode == 7, 'Build failure must stop packaging'
    assert not (root / '.tools/deployment/fixture-release').exists()
    result = run('build')
    assert result.returncode == 0, result.stderr
    output = root / '.tools/deployment/fixture-release'
    manifest = json.loads((output / 'release.json').read_text())
    assert manifest['sourceStatus'] == ' M fixture\n'
    assert 'api/Dockerfile' in manifest['files'] and 'web/index.html' in manifest['files']
    assert not any('.env' in name or 'backup.sh' == Path(name).name for name in manifest['files'])
    for name, digest in manifest['files'].items():
        assert hashlib.sha256((output / name).read_bytes()).hexdigest() == digest
    assert run('build').returncode != 0, 'Existing release must not be overwritten'
    assert run('deploy', DEPLOY_RELEASE_ID='../escape').returncode != 0
    assert run('deploy').returncode == 0
    commands = (root / 'commands.log').read_text()
    assert 'activate-release.sh fixture-release' in commands and 'sha256sum -c' in commands
    assert 'git push' not in commands and 'docker-compose.yml' not in commands
    print('PASS: failed-build fencing, artifact manifest/checksums, secret exclusion, unique release, input validation, deployment routing')
