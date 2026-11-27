#!/usr/bin/env python3
"""Materialize ignored build/runtime config from the account setup stored on this machine."""
import json
import os
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
local = Path.home() / '.config/watchparty'
sentry = json.loads((local / 'sentry-projects.json').read_text())
posthog = json.loads((local / 'posthog-project.json').read_text())
keys = sentry['clientKeys']['data']
dsns = {item['project']: item['dsn'] for item in keys if item['isActive']}

def merge(path, values, separator='='):
    lines = path.read_text().splitlines() if path.exists() else []
    lines = [line for line in lines if line.partition(separator)[0] not in values]
    lines += [key + separator + value for key, value in values.items()]
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    os.fchmod(descriptor, 0o600)
    with os.fdopen(descriptor, 'w') as output:
        output.write('\n'.join(lines) + '\n')

merge(root / 'clients/web/.env.local', {
    'VITE_SENTRY_DSN': dsns['watchparty-web'],
    'VITE_POSTHOG_TOKEN': posthog['projectToken'],
    'VITE_POSTHOG_HOST': posthog['apiHost'],
})
merge(root / 'backend/watchparty/.env.observability', {
    'SENTRY_DSN': dsns['watchparty-backend'],
    'SENTRY_ENVIRONMENT': 'development',
})
android_build = (root / 'clients/native/androidApp/build.gradle.kts').read_text()
version_name = re.search(r'versionName\s*=\s*"([^"]+)"', android_build).group(1)
version_code = re.search(r'versionCode\s*=\s*(\d+)', android_build).group(1)
merge(root / 'clients/native/observability.properties', {
    'sentry.dsn': dsns['watchparty-native'],
    'posthog.token': posthog['projectToken'],
    'posthog.host': posthog['apiHost'],
    'release': f'watchparty-native@{version_name}+{version_code}',
})
print('Configured ignored web, backend and native observability files; no credentials printed.')
