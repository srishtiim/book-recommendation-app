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

class SearchRequest(BaseModel):
    query: str
    user_id: str

class Book(BaseModel):
    title: str
    author: str
    genres: List[str]
    description: str
    mood: str
    pages: int

class TrackerSaveRequest(BaseModel):
    user_id: str
    book_title: str
    action: str            # "add" | "update" | "remove"
    author: Optional[str] = None
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
    if len(req.genres) > 3:
        raise HTTPException(status_code=400, detail="MAX 3 GENRES.")
    if len(req.genres) == 0:
        return []

    scored_books = [(b, _match_score(b, req.genres)) for b in BOOKS]
    filtered_books = [b for b, s in scored_books if s > 0]
    
    # Sort results so books matching MORE of the selected genres appear first
    filtered_books.sort(key=lambda x: _match_score(x, req.genres), reverse=True)
    
    # Limit the final response to maximum 20 books
    return filtered_books[:20]


@app.post("/search", response_model=List[Book])
def search(req: SearchRequest):
    query = req.query.strip().lower()
    if not query or len(query) < 2:
        return []

    matches = []
    for book in BOOKS:
        title = book.get("title", "").lower()
        author = book.get("author", "").lower()
        if query in title or query in author:
            matches.append(book)
            
    return matches[:20]

# --- TRACKER ---

@app.get("/tracker/{user_id}")
def get_tracker(user_id: str):
    """
    Returns all books being tracked by this user.
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


@app.post("/tracker")
def save_tracker(req: TrackerSaveRequest):
    if req.action == "remove":
        try:
            supabase.table("book_tracking").delete().eq("user_id", req.user_id).eq("book_title", req.book_title).execute()
            return {"message": "Book removed from tracker."}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to remove book: {str(e)}")

    if req.action == "add":
        try:
            data = {
                "user_id": req.user_id,
                "book_title": req.book_title,
                "author": req.author,
            }
            supabase.table("book_tracking").insert(data).execute()
            return {"message": "✓ SAVED TO YOUR LIBRARY"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to add tracker: {str(e)}")

    if req.action == "update":
        try:
            data = {
                "rating": req.rating,
                "notes": req.notes,
            }
            supabase.table("book_tracking").update(data).eq("user_id", req.user_id).eq("book_title", req.book_title).execute()
            return {"message": "✓ TRACKER UPDATED"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to update tracker: {str(e)}")

    raise HTTPException(status_code=400, detail="action must be 'add', 'update', or 'remove'.")



# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
