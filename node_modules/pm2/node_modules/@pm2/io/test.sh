

NODE_ENV='test'
MOCHA='npx mocha'

trap "exit" INT
set -e
npm run build

#### Unit tests

$MOCHA ./test/autoExit.spec.ts
$MOCHA ./test/api.spec.ts
$MOCHA ./test/metrics/http.spec.ts
$MOCHA ./test/metrics/runtime.spec.ts
$MOCHA ./test/entrypoint.spec.ts
# $MOCHA ./test/standalone/tracing.spec.ts
# $MOCHA ./test/standalone/events.spec.ts
$MOCHA ./test/features/events.spec.ts
$MOCHA ./test/metrics/eventloop.spec.ts
$MOCHA ./test/metrics/network.spec.ts
$MOCHA ./test/metrics/v8.spec.ts
$MOCHA ./test/services/actions.spec.ts
$MOCHA ./test/services/metrics.spec.ts
