from dotenv import load_dotenv
load_dotenv()

import json
import os
from datetime import datetime, date, timedelta
from pathlib import Path
from typing import List, Optional

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

# ---------------------------------------------------------------------------
# Environment & Supabase client
# ---------------------------------------------------------------------------

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Warning: Failed to initialize Supabase client - {e}")
    supabase = None  # type: ignore

# ---------------------------------------------------------------------------
# Load book datasets once at startup (mirrors @st.cache_data in Streamlit)
# ---------------------------------------------------------------------------

# Resolve paths relative to this file so the server can be started from any CWD
BASE_DIR = Path(__file__).resolve().parent.parent  # project root

def _load_books_json() -> list:
    """Load books.json — the primary recommendation dataset."""
    path = BASE_DIR / "books.json"
    try:
        with open(path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

BOOKS: list = _load_books_json()

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(title="Vintage Library API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Pydantic request / response models
# ---------------------------------------------------------------------------

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    user_id: str
    username: str
    access_token: str
    refresh_token: str

class RecommendRequest(BaseModel):
    genres: List[str]
    user_id: str  # kept for future personalisation; not used in scoring yet

class Book(BaseModel):
    title: str
    author: str
    genres: List[str]
    description: str
    mood: str
    pages: int

class TrackerSessionLog(BaseModel):
    user_id: str
    book_title: str
    log_date: str          # ISO date string  e.g. "2024-03-01"
    page_number: int
    note: Optional[str] = ""

class TrackerSaveRequest(BaseModel):
    user_id: str
    book_title: str
    action: str            # "add" | "update" | "remove"
    status: Optional[str] = "WANT TO READ"
    date_started: Optional[str] = None
    date_ended: Optional[str] = None
    pages_read: Optional[int] = 0
    rating: Optional[int] = 0
    notes: Optional[str] = ""

# ---------------------------------------------------------------------------
# Helper: exact recommendation logic from 1_Home.py
# ---------------------------------------------------------------------------

def _match_score(book: dict, sel_genres: List[str]) -> int:
    """
    Exact copy of match_score() from pages/1_Home.py:
        return len(set(book["genres"]).intersection(set(sel_genres)))
    """
    return len(set(book["genres"]).intersection(set(sel_genres)))


def _get_recommendations(selected_genres: List[str]) -> List[dict]:
    """
    Exact copy of the recommendation logic block from pages/1_Home.py:

        scored_books = [(b, match_score(b, selected_genres)) for b in books]
        filtered_books = [b for b, s in scored_books if s > 0]
        filtered_books.sort(key=lambda x: match_score(x, selected_genres), reverse=True)
        top_10 = filtered_books[:10]
    """
    scored_books = [(b, _match_score(b, selected_genres)) for b in BOOKS]
    filtered_books = [b for b, s in scored_books if s > 0]
    filtered_books.sort(key=lambda x: _match_score(x, selected_genres), reverse=True)
    top_10 = filtered_books[:10]
    return top_10

# ---------------------------------------------------------------------------
# Helper: reading stats logic from 2_Book_Tracker.py
# ---------------------------------------------------------------------------

def _compute_stats(logs_data: list, start_date_iso: Optional[str], total_pages: int) -> dict:
    """
    Exact copy of the stats calculation block from pages/2_Book_Tracker.py.

    Returns a dict matching the stats panel fields.
    """
    if not logs_data:
        return {}

    sorted_logs = sorted(logs_data, key=lambda log: log["log_date"])

    # Re-create the table rows with page diffs (mirrors the table in 2_Book_Tracker.py)
    table_rows = []
    prev_pg = 0
    for log in sorted_logs:
        pg = log.get("page_number", 0)
        if "page_number" not in log and "pages" in log:
            pg = log["pages"]  # old format compat

        diff = pg - prev_pg
        if diff < 0:
            diff = pg  # user may have restarted / mistyped

        date_str = "Unknown"
        try:
            d = datetime.fromisoformat(log["log_date"])
            date_str = d.strftime("%b %d %Y")
        except Exception:
            pass

        table_rows.append({
            "DATE": date_str,
            "PAGE": f"pg.{pg}",
            "PAGES READ TODAY": f"{diff} pages",
            "NOTE": log.get("note", ""),
        })
        prev_pg = pg

    # Stats
    try:
        first_date = datetime.fromisoformat(sorted_logs[0]["log_date"]).date()
        last_date = datetime.fromisoformat(sorted_logs[-1]["log_date"]).date()
    except Exception:
        first_date = last_date = date.today()

    if start_date_iso:
        try:
            start_date = datetime.fromisoformat(start_date_iso).date()
        except Exception:
            start_date = first_date
    else:
        start_date = first_date

    days_reading = (last_date - start_date).days
    if days_reading < 1:
        days_reading = 1

    last_pg = prev_pg
    avg_per_day = last_pg // days_reading

    pace = "SLOW"
    if avg_per_day > 60:
        pace = "FAST 🔥"
    elif avg_per_day >= 25:
        pace = "STEADY"

    est_finish = "N/A"
    if avg_per_day > 0 and last_pg < total_pages:
        rem_pages = total_pages - last_pg
        rem_days = rem_pages // avg_per_day
        est_d = date.today() + timedelta(days=rem_days)
        est_finish = est_d.strftime("%d %b")
    elif last_pg >= total_pages:
        est_finish = "COMPLETED"

    return {
        "days_reading": days_reading,
        "pages_read": last_pg,
        "avg_pages_per_day": avg_per_day,
        "est_finish_date": est_finish,
        "reading_pace": pace,
        "log_rows": table_rows,
    }

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    """Health check — confirms the API is running."""
    return {"status": "ok", "message": "Vintage Library API is running 📚"}


# --- AUTH ---

@app.post("/auth/signup", status_code=201)
def signup(req: SignupRequest):
    """
    Exact replication of the signup logic from app.py:
        supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {"data": {"username": username}}
        })
    Password validation (min 6 chars) is enforced here just as in the Streamlit form.
    """
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="PASSWORD MUST BE AT LEAST 6 CHARACTERS.")

    try:
        response = supabase.auth.sign_up({
            "email": req.email,
            "password": req.password,
            "options": {"data": {"username": req.name}},
        })
        if response.user:
            return {
                "message": "REGISTRATION SUCCESSFUL! CHECK YOUR EMAIL TO CONFIRM.",
                "user_id": response.user.id,
            }
        raise HTTPException(status_code=400, detail="Sign up failed: no user returned.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Sign up failed: {str(e)}")


@app.post("/auth/login", response_model=LoginResponse)
def login(req: LoginRequest):
    """
    Exact replication of the login logic from app.py:
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        st.session_state["username"] = email.split('@')[0]
    """
    try:
        response = supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password,
        })
        if not response.user:
            raise HTTPException(status_code=401, detail="Login failed: invalid credentials.")

        # Replicate: username = email.split('@')[0]
        username = req.email.split("@")[0]

        return LoginResponse(
            user_id=response.user.id,
            username=username,
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Login failed: {str(e)}")


# --- RECOMMENDATIONS ---

@app.post("/recommend", response_model=List[Book])
def recommend(req: RecommendRequest):
    """
    Replicates the genre-selection + recommendation logic from pages/1_Home.py exactly.

    Validation:
        if len(selected_genres) > 3:   → error (mirrors "MAX 3 GENRES.")
        if len(selected_genres) == 0:  → empty list
    """
    if len(req.genres) > 3:
        raise HTTPException(status_code=400, detail="MAX 3 GENRES.")
    if len(req.genres) == 0:
        return []

    top_10 = _get_recommendations(req.genres)
    return top_10


# --- TRACKER ---

@app.get("/tracker/{user_id}")
def get_tracker(user_id: str):
    """
    Returns all books being tracked by this user.
    Fetches from both `book_tracking` (master records) and `reading_log` (session logs),
    matching the two Supabase tables used in 2_Book_Tracker.py.
    """
    try:
        tracking_resp = (
            supabase.table("book_tracking")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )
        return {"tracked_books": tracking_resp.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tracker: {str(e)}")


@app.post("/tracker/log-session", status_code=201)
def log_reading_session(req: TrackerSessionLog):
    """
    Inserts a daily reading session into the `reading_log` table.
    Exact replication of the form submit logic in 2_Book_Tracker.py:

        data = {
            "user_id": user.id,
            "book_title": book_title,
            "log_date": log_date.isoformat(),
            "page_number": log_page,
            "note": log_note
        }
        supabase.table("reading_log").insert(data).execute()
    """
    try:
        data = {
            "user_id": req.user_id,
            "book_title": req.book_title,
            "log_date": req.log_date,
            "page_number": req.page_number,
            "note": req.note,
        }
        supabase.table("reading_log").insert(data).execute()
        return {"message": "✓ SESSION LOGGED"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log session: {str(e)}")


@app.get("/tracker/{user_id}/logs/{book_title}")
def get_reading_logs(user_id: str, book_title: str):
    """
    Fetches reading_log entries for a user + book, ordered by date.
    Replicates get_user_logs() from 2_Book_Tracker.py:

        resp = supabase.table("reading_log").select("*")
                   .eq("user_id", uid).eq("book_title", btitle)
                   .order("log_date").execute()

    Also returns the computed stats panel values (days_reading, avg_pages_per_day, etc.)
    and the book's total pages (looked up from books.json) — everything 2_Book_Tracker.py
    derived on the server side in Streamlit.
    """
    try:
        logs_resp = (
            supabase.table("reading_log")
            .select("*")
            .eq("user_id", user_id)
            .eq("book_title", book_title)
            .order("log_date")
            .execute()
        )
        logs_data = logs_resp.data

        # Look up start_date from the earliest log (mirrors 2_Book_Tracker.py)
        start_date_iso = None
        if logs_data:
            try:
                start_date_iso = sorted(logs_data, key=lambda l: l["log_date"])[0]["log_date"]
            except Exception:
                pass

        # Get total pages from books.json (mirrors get_book_info() in 2_Book_Tracker.py)
        book_info = next((b for b in BOOKS if b["title"] == book_title), None)
        total_pages = book_info["pages"] if book_info else 300

        stats = _compute_stats(logs_data, start_date_iso, total_pages)

        return {
            "logs": logs_data,
            "stats": stats,
            "book_info": book_info,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch logs: {str(e)}")


@app.post("/tracker")
def save_tracker(req: TrackerSaveRequest):
    """
    Upserts a book_tracking record, replicating the SAVE TO MY LIBRARY logic from
    2_Book_Tracker.py exactly:

        data = {
            "user_id": user.id,
            "book_title": book_title,
            "status": st.session_state["tracker_status"],
            "date_started": start_date.isoformat() if start_date else None,
            "date_ended": end_date.isoformat() if end_date else None,
            "pages_read": logs_data[-1].get("page_number", 0) if len(logs_data) > 0 else 0,
            "rating": st.session_state["star_rating"],
            "notes": notes,
            "updated_at": datetime.now().isoformat()
        }
        supabase.table("book_tracking").upsert(data).execute()

    For `action == "remove"`, the record is deleted instead.
    """
    if req.action == "remove":
        try:
            supabase.table("book_tracking").delete().eq("user_id", req.user_id).eq("book_title", req.book_title).execute()
            return {"message": "Book removed from tracker."}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to remove book: {str(e)}")

    if req.action in ("add", "update"):
        try:
            data = {
                "user_id": req.user_id,
                "book_title": req.book_title,
                "status": req.status,
                "date_started": req.date_started,
                "date_ended": req.date_ended,
                "pages_read": req.pages_read,
                "rating": req.rating,
                "notes": req.notes,
                "updated_at": datetime.now().isoformat(),
            }
            supabase.table("book_tracking").upsert(data).execute()
            return {"message": "✓ SAVED TO YOUR LIBRARY"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save tracker: {str(e)}")

    raise HTTPException(status_code=400, detail="action must be 'add', 'update', or 'remove'.")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
