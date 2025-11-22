# Load testing (k6 + InfluxDB + Grafana)

This folder contains the load-testing setup for the project using k6, InfluxDB and Grafana via Docker Compose.

## Purpose

Run repeatable load tests against local or deployed services and collect metrics in InfluxDB so Grafana dashboards can display them.

## What the compose brings up

- influxdb (port 8086) — database `k6` is created automatically
- grafana (port 4000 -> container 3000) — pre-provisioning is mounted from `./provisioning` and credentials are `admin`/`admin`
- k6-node (one or more containers) — runs k6 scripts from `./scripts` and writes results to InfluxDB

## Files of interest

- `docker-compose.yaml` — services and default environment variables (BASE_URL, VUS, DURATION, K6_OUT)
- `Makefile` — convenience targets (may require GNU Make)
- `scripts/` — k6 scripts (e.g. `k6-load-test.js`)
- `provisioning/` — Grafana provisioning for dashboards/datasources

## How to run

You can run load tests in two main ways: via Docker Compose (recommended for automated collection) or directly with the k6 CLI.

Important: the examples below assume you are in the `testing` folder.

### Option A — Docker Compose (recommended)

This will start InfluxDB, Grafana, and the k6 containers which run the scripts and push metrics to InfluxDB.

PowerShell (set env vars for the current session then start compose):

```powershell
# optional: configure overrides (examples)
$env:VUS = "200"        # override the default VUS
$env:DURATION = "3m"    # override the default duration
$env:BASE_URL = "http://localhost:3000"  # target to load-test

# start services and scale k6 nodes
docker-compose up --scale k6-node=5 -d
```

Notes:
- `--scale k6-node=5` creates 5 parallel k6 containers; adjust to your needs and machine capacity.
- The compose file mounts `./scripts` into the k6 container and runs the `k6-load-test.js` script by default.
- To stop and remove containers and volumes:

```powershell
docker-compose down -v
```

If you prefer a one-liner (POSIX-style shell) you can use environment vars inline, but on Windows PowerShell the `$env:` approach above is recommended.

You can also set environment values in a `.env` file or edit `docker-compose.yaml` to change defaults permanently.

### Option B — Run k6 locally (k6 CLI)

If you have `k6` installed locally, you can run a script directly:

```powershell
# run with 1000 virtual users for 1 minute
k6 run --vus 1000 --duration 1m ./scripts/k6-load-test.js
```

This runs k6 locally and prints metrics to the console. To push results to InfluxDB you can pass the --out flag:

```powershell
k6 run --vus 1000 --duration 1m --out influxdb=http://localhost:8086/k6 ./scripts/k6-load-test.js
```

## How to view data (Grafana & InfluxDB)

- Grafana UI: http://localhost:4000
  - Default credentials: username `admin`, password `admin`
  - To view dashboards:
    1. Open http://localhost:4000 in your browser and log in with `admin`/`admin`.
    2. In the left-hand menu click "Dashboards" (the four-square/dashboards icon) and choose "Browse" or "Manage" to list available dashboards.
    3. Select the desired dashboard (the k6 dashboards are usually provisioned from `./provisioning`).
    4. If a dashboard shows no data, go to Configuration -> Data sources and ensure the InfluxDB datasource is configured and points to `http://influxdb:8086` (or `http://localhost:8086` when accessing from host). Use "Test" to verify the connection, then save.
  - Dashboards should be auto-provisioned from `./provisioning` if present.

- InfluxDB API: http://localhost:8086
  - Database: `k6`
  - No HTTP auth is enabled by default in the compose config (INFLUXDB_HTTP_AUTH_ENABLED=false), so you can query the DB via curl or the Influx HTTP API.

Example: query the last 10 entries for a metric (HTTP API via curl/powershell):

```powershell
# example using the influx query API (InfluxDB 1.8 HTTP query)
curl "http://localhost:8086/query?db=k6&q=SELECT+*+FROM+http_req_duration+LIMIT+10"
```

(Replace `http_req_duration` with another metric name if needed.)

## Viewing container logs

To follow logs from the k6 containers (all instances):

```powershell
# combined logs for the k6 service
docker-compose logs -f --tail=200 k6-node
```

If you scaled to multiple instances you'll see logs from each instance; the output may be interleaved.

For an individual container (example):

```powershell
docker ps  # find the k6 container name/ID
docker logs -f <container-id-or-name>
```

## Makefile targets

The `Makefile` in this folder contains convenience targets but requires GNU Make. On Windows you may not have `make` installed; using `docker-compose` directly is preferred.

Example targets (from `Makefile`):

- `make docker-compose` — runs `docker-compose up --scale k6-node=5 -d`
- `make run` — local k6 run (k6 must be installed locally): `k6 run --vus 1000 --duration 1m ./scripts/k6-load-test.js`

## Tuning recommendations and safety

- Start with small VUS and durations and increase gradually; large numbers can overwhelm your host or the target service.
- Monitor host CPU, memory and network while running tests.
- Use `--scale` conservatively on a single machine — multiple k6 containers create more load than a single process.

## Troubleshooting

- Grafana shows no data: verify InfluxDB is reachable and that k6 containers are configured to push to `http://influxdb:8086/k6`. Check `docker-compose logs grafana` and `docker-compose logs influxdb` for errors.
- Ports already in use: if `4000` or `8086` are occupied on your host, edit `docker-compose.yaml` to map to free ports (left side of the port mapping `HOST:CONTAINER`).
- `make` target fails on Windows: run the equivalent `docker-compose` commands directly in PowerShell as shown above.

## Example quick-run (PowerShell)

```powershell
# configure overrides for this session
$env:VUS = "100"
$env:DURATION = "1m"
$env:BASE_URL = "http://localhost:3000"

# start services and 2 k6 nodes
docker-compose up --scale k6-node=2 -d

# open Grafana in your browser: http://localhost:4000  (admin/admin)

# follow logs
docker-compose logs -f --tail=100 k6-node
```
