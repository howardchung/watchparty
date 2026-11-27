#!/usr/bin/python3
"""Forced SSH command. Install root-owned; pass the service and production root locally."""
import fcntl
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile

def unpack(stage, service):
    # Never extract links, devices, permissions or owners from a CI archive.
    total = 0
    with tarfile.open(fileobj=sys.stdin.buffer, mode="r|gz") as archive:
        for count, member in enumerate(archive):
            path = Path(member.name)
            if count > 20000 or path.is_absolute() or ".." in path.parts:
                raise ValueError("Invalid archive path or entry count")
            if not path.parts and member.isdir():
                continue
            if service == "web":
                allowed = path.parts[0] in {"assets", "fonts", "vendor"} or str(path) in {
                    "index.html", ".well-known", ".well-known/assetlinks.json"}
            else:
                allowed = path.parts[0] in {"server", "sql"} or str(path) in {
                    "package.json", "package-lock.json", "Dockerfile.api"}
            if not allowed or not (member.isfile() or member.isdir()):
                raise ValueError("Unexpected archive entry")
            target = stage / path
            if member.isdir():
                target.mkdir(parents=True, exist_ok=True)
                continue
            total += member.size
            if total > 256 * 1024 * 1024:
                raise ValueError("Release exceeds size limit")
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open("xb") as output:
                shutil.copyfileobj(archive.extractfile(member), output)
            target.chmod(0o644)

def website(stage, current, activate):
    web = (current / "web").resolve(strict=True)
    entry = stage / "index.html"
    if not entry.is_file() or not (stage / "assets").is_dir():
        raise ValueError("Incomplete website")
    # Caddy bind-mounts this directory. Publish dependencies first, entry point last.
    files = sorted(p for p in stage.rglob("*") if p.is_file() and p != entry) + [entry]
    for source in files:
        target = web / source.relative_to(stage)
        if target.resolve() != target:
            raise ValueError("Symlink in website destination")
        if activate:
            target.parent.mkdir(parents=True, exist_ok=True, mode=0o755)
            os.replace(source, target)

def backend(stage, root, current, sha, activate):
    def compose(*args):
        subprocess.run(["docker", "compose", *args], cwd=current, check=True)

    dockerfile = stage / "Dockerfile.api"
    if dockerfile.read_bytes() != (current / "api/Dockerfile").read_bytes():
        raise ValueError("Review and install the new API Dockerfile on the host first")
    for required in ["server/server.ts", "package-lock.json", "package.json"]:
        if not (stage / required).is_file():
            raise ValueError("Incomplete API")
    override = current / "compose.override.yml"
    previous = override.read_bytes() if override.exists() else None
    marker = b"# managed by watchparty-ci\n"
    if previous is not None and not previous.startswith(marker):
        raise ValueError("Existing unmanaged Compose override")
    compose("config", "--quiet")
    if not activate:
        return
    image = "watchparty-ci-api:" + sha
    # Keep Compose rebuilds tied to the same immutable source as the running image.
    sources = root / "ci-api"
    sources.mkdir(exist_ok=True)
    source = sources / sha
    if not source.exists():
        with tempfile.TemporaryDirectory(dir=sources) as tmp:
            candidate = Path(tmp) / "api"
            shutil.copytree(stage, candidate)
            candidate.rename(source)
    subprocess.run(["docker", "build", "-t", image, "-f", str(source / "Dockerfile.api"), str(source)], check=True)
    environment = {"SENTRY_RELEASE": sha}
    ledger = root / "ci-migration-ledger"
    if ledger.is_file():
        environment["WATCHPARTY_MIGRATION_LEDGER"] = ledger.read_text().strip()
    config = {"services": {"api": {"image": image, "build": {"context": str(source), "dockerfile": "Dockerfile.api"},
                                   "environment": environment}}}
    temp = stage / "override.yml"
    temp.write_bytes(marker + json.dumps(config).encode())
    os.replace(temp, override)
    start = ("up", "-d", "--no-deps", "--no-build", "--wait", "--wait-timeout", "120", "api")
    try:
        compose(*start)
        compose("exec", "-T", "api", "node", "-e",
                "fetch('http://127.0.0.1:8080/readyz').then(async r=>{const b=await r.json();"
                "process.exit(r.ok&&['ready','database','dispatcher','voice'].every(k=>b[k]===true)?0:1)})")
    except BaseException:
        if previous is None:
            override.unlink()
        else:
            temp.write_bytes(previous)
            os.replace(temp, override)
        compose(*start)
        raise

def main():
    service, root_arg = sys.argv[1:]
    root = Path(root_arg).resolve(strict=True)
    mode, sha = os.environ["SSH_ORIGINAL_COMMAND"].split()
    if service not in {"web", "backend"} or mode not in {"check", "deploy"} or not re.fullmatch("[0-9a-f]{40}", sha):
        raise ValueError("Invalid release request")
    os.umask(0o022)
    with (root / "deploy.lock").open("a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        current = (root / "current").resolve(strict=True)
        with tempfile.TemporaryDirectory(prefix=".ci-", dir=root) as temp:
            stage = Path(temp)
            unpack(stage, service)
            if service == "web":
                website(stage, current, mode == "deploy")
            else:
                backend(stage, root, current, sha, mode == "deploy")
    print(f"{service} {mode} succeeded for {sha}")

if __name__ == "__main__":
    main()
