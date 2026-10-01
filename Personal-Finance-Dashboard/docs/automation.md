# Local automation and analytics

## Python

```sh
python -m venv .venv
# Windows PowerShell
.venv\Scripts\python -m pip install -r analytics/requirements.txt
.venv\Scripts\python analytics/analyze.py analytics/sample.csv --output analytics/sample-output.json
# macOS/Linux: .venv/bin/python instead
```

Export all desired transactions from the app, then use that CSV instead of `analytics/sample.csv`. Output contains monthly income/expense/surplus, category totals, 1.8× historical flags and forecast net additions with assumptions. Transfers are excluded. Nothing is sent to a cloud service. The supplied output is generated from the fictional sample, not a connected account.

## n8n Community

Install Docker or your local n8n Community runtime. `automation/docker-compose.yml` binds to localhost only and persists local data. The `latest` image is a setup convenience: after testing, pin a version/digest before relying on schedules. No paid n8n cloud trial is required.

```sh
docker compose -f automation/docker-compose.yml up -d
```

Visit `http://localhost:5678`, create the local owner account, and import `automation/weekly-report.json`. It is inactive by default. Set the HTTP Request URL to your local Netlify API (Docker Desktop uses `host.docker.internal:8888`) or your optional hosted API. Create a **Header Auth** credential with name `Authorization`, value `Bearer <your signed-in user access token>` and attach it to the HTTP Request node. It must be a real authenticated user's JWT; never use a service-role key. Sessions expire: refresh/re-enter the token, otherwise the workflow will fail with 401. This sample does not implement durable refresh-token handling.

Run manually first. The workflow fetches the real authenticated snapshot, computes the current UTC calendar month's summary (the Code node uses `toISOString().slice(0,7)`), and stores it only in local n8n execution history. The schedule is Asia/Kolkata but the summary month is UTC; adjust the Code node if you require local month boundaries. HTTP retries three times at 3-second intervals. Then optionally activate the Monday 09:00 Asia/Kolkata schedule. No email, Slack or external messaging occurs.

n8n schedules do not catch up automatically for every missed interval while the machine is off. Keep the exported local app queue as a backlog; manually run missed work after restarting. The demo queue is not wired to n8n, and no runner-health connection or automatic job acknowledgment is implemented. Frontend simulation remains clearly labeled. Real execution output belongs to n8n; it does not overwrite demo history. Retry failures in the local n8n execution UI after resolving credentials/network issues. Back up the Docker volume. Keep n8n localhost-only and avoid exposing it to the internet.

`FINANCEFLOW_API_URL`/`FINANCEFLOW_ACCESS_TOKEN` in `.env.example` are setup placeholders, not automatic workflow inputs. Set the URL and Header Auth credential inside n8n; the Docker Compose configuration does not pass those variables. Store private input CSVs and generated personal reports under ignored `private-data/` rather than beside the tracked fictional sample. Do not commit session tokens or n8n volume contents.
