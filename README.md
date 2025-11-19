TinyLink — FastAPI + MySQL URL Shortener

A clean, minimal URL shortener built with Python + FastAPI and MySQL — perfect for demos, interviews, and learning full-stack backend work.

🚀 Quick summary
Shorten long URLs, get simple click stats, and redirect visitors — all with a tiny, easy-to-run app.

✨ Highlights

✅ Create short links (auto-generate or custom code)

✅ Redirects to original URL (302) and counts clicks

✅ Stats per link (clicks, created at, last clicked)

✅ MySQL-backed persistence (real DB, not a JSON file)

✅ Lightweight HTML/CSS/JS frontend (single-page dashboard)

✅ Simple, autograder-friendly API routes (can match spec)

📋 Features

Shorten URLs (POST /api/links) — accepts target and optional code (6–8 alphanumeric).

List all links (GET /api/links) — dashboard data source.

Link details (GET /api/links/:code) — stats for a single code.

Delete a link (DELETE /api/links/:code) — removes mapping; redirect stops.

Redirect (GET /:code) — performs HTTP 302 to the original URL and increments clicks.

Health check (GET /healthz) — returns { "ok": true, "version": "1.0" }.

Frontend pages: / (dashboard) and /code/:code (single-link UI).

🧰 Tech stack

Backend: Python 3.10+, FastAPI, uvicorn

DB: MySQL (mysql-connector-python)

Frontend: Static HTML / CSS / JS in public/

Optional: Docker / docker-compose for local dev

🚀 Quick start (local)

Clone repo:

git clone <your-repo-url>
cd tinylink-fastapi


Install dependencies:

python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt


Create MySQL DB & user:

CREATE DATABASE tinylink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'dbuser'@'localhost' IDENTIFIED BY 'dbpass';
GRANT ALL PRIVILEGES ON tinylink.* TO 'dbuser'@'localhost';
FLUSH PRIVILEGES;


Set environment variables (.env or export):

DB_HOST=127.0.0.1
DB_USER=dbuser
DB_PASS=dbpass
DB_NAME=tinylink
BASE_URL=http://localhost:3000
PORT=3000


Run:

uvicorn main:app --reload --host 0.0.0.0 --port 3000


Open: http://localhost:3000

🔌 API (autograder-friendly)

All responses are JSON unless noted.

Create link

POST /api/links
Body:

{ "target": "https://example.com/long/path", "code": "abc12345" }  // code optional


Responses:

201 created: returns link object (code, target, clicks, created_at, last_clicked)

400 invalid input

409 conflict (code exists)

List links

GET /api/links
200 — returns array of link objects.

Get link stats

GET /api/links/:code
200 or 404 if missing.

Delete link

DELETE /api/links/:code
204 on success, 404 if missing.

Redirect

GET /:code

If exists: 302 redirect to target and increment clicks.

If not: 404 JSON { "detail": "Not Found" }.

Health

GET /healthz
200 — { "ok": true, "version": "1.0" }

🔎 Example curl

Create:

curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"target":"https://example.com/long/path"}'


Redirect (show headers):

curl -I http://localhost:3000/abc12345
# Expect `HTTP/1.1 302 Found` and `Location: https://example.com/long/path`


Delete:

curl -X DELETE http://localhost:3000/api/links/abc12345


Health:

curl http://localhost:3000/healthz

📁 Project layout
tinylink-fastapi/
├─ main.py             # FastAPI app + routes
├─ db.py               # DB connection & helpers
├─ crud.py             # create/read/update/delete helpers
├─ public/             # Static frontend (index.html, code.html, assets)
├─ requirements.txt
├─ migrations/         # optional SQL init
└─ .env.example

⚠️ Tips & FAQ

Port in use? Use a different PORT env var or kill the process using the port.

Custom codes: Must match [A-Za-z0-9]{6,8} for autograder compatibility.

Concurrency: Use atomic UPDATE ... SET clicks = clicks + 1 to avoid race conditions.

Production: Use managed MySQL, set secure secrets, and enable rate-limiting.
