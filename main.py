from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uuid
import mysql.connector
from mysql.connector import Error
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

BASE_DIR = Path(__file__).parent
app = FastAPI(title="TinyLink - MySQL Version")

# =======================
# MySQL Connection Helper
# =======================
def get_connection():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="tinylink"
        )
        return conn
    except Error as e:
        print("MySQL Error:", e)
        raise HTTPException(status_code=500, detail=str(e))


# =======================
# Static Files
# =======================
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "public")), name="static")


@app.get("/", response_class=HTMLResponse)
async def root():
    index_file = BASE_DIR / "public" / "index.html"
    return HTMLResponse(content=index_file.read_text(), status_code=200)


# =======================
# Request Model
# =======================
class ShortenRequest(BaseModel):
    originalUrl: str


# =======================
# Helpers
# =======================
def generate_code():
    return uuid.uuid4().hex[:8]


def is_valid_url(url: str) -> bool:
    try:
        p = urlparse(url)
        return p.scheme in ("http", "https") and p.netloc
    except:
        return False


# =======================
# Create Short URL
# =======================
@app.post("/api/shorten")
async def shorten(request: Request, payload: ShortenRequest):

    url = payload.originalUrl.strip()

    if not is_valid_url(url):
        raise HTTPException(status_code=400, detail="Invalid URL")

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    short = generate_code()

    # ensure unique code
    cursor.execute("SELECT id FROM urls WHERE short_code=%s", (short,))
    while cursor.fetchone():
        short = generate_code()
        cursor.execute("SELECT id FROM urls WHERE short_code=%s", (short,))

    cursor.execute(
        "INSERT INTO urls(short_code, original_url) VALUES (%s, %s)",
        (short, url)
    )
    conn.commit()

    cursor.close()
    conn.close()

    base = str(request.base_url).rstrip("/")
    return {
        "shortCode": short,
        "shortUrl": f"{base}/{short}",
        "originalUrl": url,
        "message": "URL shortened successfully!"
    }


# =======================
# Redirect Short URL
# =======================
@app.get("/{short}")
async def redirect_short(short: str):

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM urls WHERE short_code=%s", (short,))
    row = cursor.fetchone()

    if not row:
        return HTMLResponse("<h1>404 - Link Not Found</h1>", status_code=404)

    # update clicks
    cursor.execute(
        "UPDATE urls SET clicks = clicks + 1, last_accessed_at = NOW() WHERE short_code=%s",
        (short,)
    )
    conn.commit()

    cursor.close()
    conn.close()

    return RedirectResponse(url=row["original_url"], status_code=301)


# =======================
# Stats
# =======================
@app.get("/api/stats/{short}")
async def stats(short: str):

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM urls WHERE short_code=%s", (short,))
    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Short code not found")

    return {
        "shortCode": row["short_code"],
        "originalUrl": row["original_url"],
        "clicks": row["clicks"],
        "createdAt": row["created_at"].isoformat(),
        "lastAccessedAt": row["last_accessed_at"].isoformat() if row["last_accessed_at"] else "Never"
    }


# =======================
# Get All URLs
# =======================
@app.get("/api/all")
async def all_urls():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM urls")
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return rows
