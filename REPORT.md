# Route Validation Performance Report

Date: 2026-05-05

## Scope

Benchmarked the API request-body route middleware on a message-create-shaped payload. The target path is `BodyParser` plus `route({ requestBody: "MessageCreateSchema" })`, which is shared by many API routes that validate JSON request bodies.

The full bundled server was executed locally with Postgres before profiling:

```bash
DATABASE='postgres://user@localhost:5432/spacebar_perf' THREADS=1 PORT=3011 WRTC_WS_PORT=3014 npm test
```

## Bottleneck

The baseline CPU profile showed `bigNumberToString` as a hot function:

```text
json-bigint next                                  1499 samples
bigNumberToString dist/api/util/handlers/route.js 1339 samples
json-bigint string                                1039 samples
```

Root cause: `body-parser` is patched to parse JSON through `json-bigint`, so large JSON integers can arrive in `req.body` as `BigNumber` objects. The shared route middleware recursively walks every request body to convert those values to strings before AJV validation. On ordinary payloads without unsafe numeric literals, the walk still happens and the old implementation used `Object.entries` at every object level, allocating an intermediate array for each visited object.

## Change

Kept the existing conversion behavior but rewrote `bigNumberToString` to iterate object keys directly with `for...in`. This removes the repeated `Object.entries` allocations in the hot traversal without changing the public behavior.

The benchmark also performs a route-level compatibility check before profiling:

```text
POST {"content":"x","nonce":900719925474099312345}
=> {"nonceType":"string","nonce":"900719925474099312345"}
```

## Benchmark

Command:

```bash
DATABASE='postgres://user@localhost:5432/spacebar_perf' \
BENCH_REQUESTS=10000 \
BENCH_WARMUP_REQUESTS=1000 \
BENCH_CONCURRENCY=40 \
BENCH_LABEL=<before-or-after> \
node scripts/benchmarks/route-validation.js
```

Payload: 53,328 byte message-create JSON body with 10 embeds, 25 fields per embed, 10 attachments, and `allowed_mentions`. The payload intentionally uses normal string snowflakes, because the measured bottleneck was the conversion walk paid by normal request bodies.

| Metric | Before | After | Change |
| --- | ---: | ---: | ---: |
| Requests/sec | 1082.62 | 1335.87 | +23.4% |
| p50 latency | 35.05 ms | 29.30 ms | -16.4% |
| p90 latency | 43.83 ms | 32.64 ms | -25.5% |
| p99 latency | 58.94 ms | 37.84 ms | -35.8% |
| Failed requests | 0 | 0 | no change |
| `bigNumberToString` CPU samples | 1339 | 475 | -64.5% |

Profile and summary artifacts:

- `benchmarks/results/route-validation/before-route-validation-forin.summary.json`
- `benchmarks/results/route-validation/before-route-validation-forin.cpuprofile`
- `benchmarks/results/route-validation/before-route-validation-forin.heapprofile`
- `benchmarks/results/route-validation/after-route-validation-forin.summary.json`
- `benchmarks/results/route-validation/after-route-validation-forin.cpuprofile`
- `benchmarks/results/route-validation/after-route-validation-forin.heapprofile`

## Memory Notes

Heap sampling profiles were captured for both runs. The sampled top allocation sites are dominated by the inspector, JSON parsing, and HTTP machinery. The benchmark did not show a reliable retained-heap reduction, so the justified improvement here is CPU time and request latency from removing avoidable allocation work in the route traversal.
