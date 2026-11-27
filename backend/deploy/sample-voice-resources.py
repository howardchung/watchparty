#!/usr/bin/env python3
"""Read-only local load sampler. Logs counts/resources only, never signaling."""
import argparse
import collections
import hashlib
import json
import pathlib
import re
import subprocess
import time

parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True)
parser.add_argument('--api-pid', type=int)
parser.add_argument('--api-log')
parser.add_argument('--relay-container')
parser.add_argument('--seconds', type=int, default=900)
parser.add_argument('--interval', type=float, default=2)
args = parser.parse_args()
allocation_count = None
previous_cpu = None
seen_log_rows = set()
seen_log_order = collections.deque()
relay_exhaustion = 0
relay_log_baseline = True
api_log_offset = 0
api_metrics = None
api_close_counts = {}

def command(argv):
    try:
        result = subprocess.run(argv, capture_output=True, text=True, timeout=5)
        return result.stdout if result.returncode == 0 else None
    except (OSError, subprocess.TimeoutExpired):
        return None

with open(args.output, 'a', buffering=1) as output:
    deadline = time.monotonic() + args.seconds
    while time.monotonic() < deadline:
        now = time.time()
        memory = {}
        for line in pathlib.Path('/proc/meminfo').read_text().splitlines():
            name, value = line.split(':', 1)
            if name in ('MemTotal', 'MemAvailable', 'SwapTotal', 'SwapFree'):
                memory[name + 'KiB'] = int(value.split()[0])
        cpu = list(map(int, pathlib.Path('/proc/stat').read_text().splitlines()[0].split()[1:9]))
        idle, total = cpu[3] + cpu[4], sum(cpu)
        cpu_percent = None
        if previous_cpu and total > previous_cpu[1]:
            cpu_percent = 100 * (1 - (idle - previous_cpu[0]) / (total - previous_cpu[1]))
        previous_cpu = (idle, total)
        interfaces = {}
        for line in pathlib.Path('/proc/net/dev').read_text().splitlines()[2:]:
            name, values = line.split(':', 1)
            fields = values.split()
            interfaces[name.strip()] = {'receivedBytes': int(fields[0]), 'sentBytes': int(fields[8])}
        chrome_rss = 0
        chrome_count = 0
        for process in pathlib.Path('/proc').glob('[0-9]*'):
            try:
                if process.joinpath('comm').read_text().strip() == 'chrome':
                    values = process.joinpath('status').read_text().splitlines()
                    chrome_rss += int(next(line for line in values if line.startswith('VmRSS:')).split()[1])
                    chrome_count += 1
            except (OSError, StopIteration):
                pass
        api = None
        if args.api_pid:
            try:
                values = pathlib.Path(f'/proc/{args.api_pid}/status').read_text().splitlines()
                api = {line.split(':')[0]: line.split(':', 1)[1].strip() for line in values if line.startswith(('VmRSS:', 'Threads:', 'FDSize:'))}
                api['openFdCount'] = len(list(pathlib.Path(f'/proc/{args.api_pid}/fd').iterdir()))
            except OSError:
                api = {'alive': False}
        if args.api_log:
            try:
                with open(args.api_log) as api_log:
                    api_log.seek(api_log_offset)
                    for row in api_log:
                        try:
                            entry = json.loads(row)
                            if entry.get('event') == 'socket_close':
                                parts = [str(entry.get(key, 'unknown')) for key in ('layer', 'role', 'reason')]
                                if parts[0] in {'transport', 'namespace'} and parts[1] in {'shared', 'room', 'voice'} and parts[2] in {'ping_timeout', 'transport_close', 'transport_error', 'forced_close', 'server_close', 'server_shutting_down', 'server_namespace_disconnect', 'client_namespace_disconnect', 'client_disconnect', 'parse_error', 'client_error', 'other'} and isinstance(entry.get('count'), int):
                                    api_close_counts['.'.join(parts)] = entry['count']
                            if entry.get('event') == 'voice_metrics':
                                allowed = {'elapsedMs', 'joinDurationMs', 'joins', 'resumes', 'credentialRefreshes', 'signalAccepted', 'signalReplayed', 'acknowledgementsRejected', 'negotiationFailures', 'disconnects', 'cleanedSessions', 'activeSockets', 'retainedSessions', 'pendingTickets', 'pendingDetaches', 'peerPairs'}
                                api_metrics = {'event': 'voice_metrics', 'scope': 'process_cumulative', **{key: value for key, value in entry.items() if key in allowed and isinstance(value, (int, float))}}
                        except ValueError:
                            pass
                    api_log_offset = api_log.tell()
            except OSError:
                pass
        relay = None
        if args.relay_container:
            raw = command(['docker', 'stats', '--no-stream', '--format', '{{json .}}', args.relay_container])
            if raw:
                try:
                    data = json.loads(raw)
                    relay = {key: data.get(key) for key in ('CPUPerc', 'MemUsage', 'NetIO', 'BlockIO', 'PIDs')}
                except ValueError:
                    pass
            # Parse only the allocation count; never persist raw TURN logs/usernames.
            logs = command(['docker', 'logs', *([] if allocation_count is None else ['--since', '5s']), '--tail', '1000', args.relay_container])
            counts = re.findall(r'Global turn allocation count (?:incremented|decremented), now (\d+)', logs or '')
            if counts:
                allocation_count = int(counts[-1])
            for row in (logs or '').splitlines():
                key = hashlib.sha256(row.encode()).digest()
                if key in seen_log_rows:
                    continue
                seen_log_rows.add(key); seen_log_order.append(key)
                if len(seen_log_order) > 4096:
                    seen_log_rows.discard(seen_log_order.popleft())
                if not relay_log_baseline and re.search(r'(?i)(allocation quota|quota reached|insufficient capacity|cannot create relay endpoint|no available (relay )?ports|allocation.*(?:exhaust|failed|failure))', row):
                    relay_exhaustion += 1
            relay_log_baseline = False
        output.write(json.dumps({'atUnixSeconds': now, 'hostCpuPercent': cpu_percent, 'hostMemory': memory, 'networkCounters': interfaces, 'allChromeRssSumKiB': chrome_rss, 'allChromeProcessCount': chrome_count, 'apiProcess': api, 'relayContainer': relay, 'backendVoiceMetrics': api_metrics, 'backendSocketCloseCounts': api_close_counts, 'relayExhaustionLogCount': relay_exhaustion, 'relayAllocationCountFromLogs': allocation_count}) + '\n')
        time.sleep(args.interval)
