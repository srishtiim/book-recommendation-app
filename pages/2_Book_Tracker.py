import streamlit as st
import time
from datetime import datetime, date, timedelta
import json
from supabase_client import get_supabase

st.set_page_config(page_title="Vintage Library - Book Tracker", page_icon="✍️", layout="centered")

if "user" not in st.session_state:
    st.switch_page("app.py")

if "selected_book" not in st.session_state:
    st.switch_page("pages/1_Home.py")

book_title = st.session_state["selected_book"]

# Need total pages to calculate finish date
@st.cache_data
def get_book_info(title):
    try:
        with open("books.json", "r") as f:
            books = json.load(f)
            for b in books:
                if b["title"] == title:
                    return b
    except:
        pass
    return None

book_info = get_book_info(book_title)
total_pages = book_info["pages"] if book_info else 300

# --- Custom Default CSS for retro funky theme ---
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Crimson+Text:ital,wght@0,400;0,700;1,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

.stApp {
    background-color: #0d0d0d;
    color: #f5f0e8;
    font-family: 'Crimson Text', serif;
    animation: fadeIn 0.4s ease;
}

#MainMenu, footer, header {visibility: hidden;}

/* Scrollbar */
::-webkit-scrollbar { width: 8px; background: #0d0d0d; }
::-webkit-scrollbar-thumb { background: #ff6b35; border-radius: 4px; }

/* Global Typography */
h1.tracker-title {
    font-family: 'Bebas Neue', display;
    font-size: 3.5rem;
    color: #ff6b35;
    text-align: center;
    line-height: 1;
    margin-bottom: 5px;
}
.tracker-subtitle {
    font-family: 'Space Mono', monospace;
    color: #a8a29e;
    text-align: center;
    margin-bottom: 30px;
    font-size: 0.9rem;
}

.mono-label {
    font-family: 'Space Mono', monospace;
    color: #ff6b35;
    font-size: 1rem;
    margin-bottom: 10px;
}

/* Base inputs */
[data-testid="stTextInput"] input, 
[data-testid="stNumberInput"] input, 
[data-testid="stDateInput"] input,
[data-testid="stTextArea"] textarea {
    background-color: #0d0d0d !important;
    border: none !important;
    border-bottom: 2px solid #ff6b35 !important;
    border-left: 2px solid #ff6b35 !important;
    border-radius: 0 !important;
    color: #f5f0e8 !important;
    font-family: 'Space Mono', monospace !important;
    padding-left: 10px !important;
}

/* Regular Buttons */
.stButton > button {
    background-color: #0d0d0d;
    color: #ff6b35;
    font-family: 'Bebas Neue', display;
    font-size: 1.2rem;
    letter-spacing: 2px;
    border: 2px solid #ff6b35;
    border-radius: 0;
    text-transform: uppercase;
    transition: all 0.3s ease;
}
.stButton > button:hover {
    background-color: #ff6b35;
    color: #0d0d0d;
}

/* Primary/Active Toggle Button styling helper through st.markdown container */
.toggle-active > button {
    background-color: #ff6b35 !important;
    color: #0d0d0d !important;
}

/* Stats panel */
.stats-panel {
    font-family: 'Space Mono', monospace;
    color: #f5f0e8;
    background-color: #0d0d0d;
    border: 2px solid #ff6b35;
    padding: 20px;
    margin: 20px 0;
    line-height: 1.6;
    white-space: pre-wrap;
}

/* ASCII art */
.ascii-art {
    font-family: 'Space Mono', monospace;
    color: #7c3aed;
    white-space: pre;
    text-align: center;
    line-height: 1.2;
    margin: 20px 0;
    font-size: 12px;
}

.ascii-stamp {
    font-family: 'Space Mono', monospace;
    color: #39ff14;
    white-space: pre;
    text-align: center;
    line-height: 1.2;
    margin: 20px 0;
    font-size: 14px;
}

/* Utility classes */
.char-count {
    font-family: 'Space Mono', monospace;
    color: #a8a29e;
    font-size: 0.8rem;
    text-align: right;
    margin-top: 5px;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* Table styling */
[data-testid="stTable"] {
    font-family: 'Space Mono', monospace;
    font-size: 0.9rem;
}
[data-testid="stTable"] th {
    color: #ff6b35 !important;
    border-bottom: 1px solid #ff6b35 !important;
}
[data-testid="stTable"] td {
    color: #f5f0e8 !important;
}
</style>
""", unsafe_allow_html=True)

if st.button("← BACK TO SHELF"):
    st.switch_page("pages/1_Home.py")

# ASCII Open book
st.markdown("""
<div class="ascii-art">
    ____________________
   /                    \\
  /   still reading...   \\
 /_______________________ \\
 \\                        /
  \\  page by page, friend/
   \\____________________/
</div>
""", unsafe_allow_html=True)

st.markdown(f"<h1 class='tracker-title'>{book_title.upper()}</h1>", unsafe_allow_html=True)
st.markdown("<div class='tracker-subtitle'>// your reading journal //</div>", unsafe_allow_html=True)

supabase = get_supabase()
user = st.session_state["user"]

# Initialize state
if "tracker_status" not in st.session_state:
    st.session_state["tracker_status"] = "WANT TO READ"
if "star_rating" not in st.session_state:
    st.session_state["star_rating"] = 0

st.write("---")

# --- Reading Status Selector ---
col1, col2, col3 = st.columns(3)
with col1:
    if st.session_state["tracker_status"] == "WANT TO READ":
        st.markdown("<div class='toggle-active'>", unsafe_allow_html=True)
        if st.button("📚 WANT TO READ", use_container_width=True): pass
        st.markdown("</div>", unsafe_allow_html=True)
    else:
        if st.button("📚 WANT TO READ", use_container_width=True):
            st.session_state["tracker_status"] = "WANT TO READ"
            st.rerun()
with col2:
    if st.session_state["tracker_status"] == "READING NOW":
        st.markdown("<div class='toggle-active'>", unsafe_allow_html=True)
        if st.button("📖 READING NOW", use_container_width=True): pass
        st.markdown("</div>", unsafe_allow_html=True)
    else:
        if st.button("📖 READING NOW", use_container_width=True):
            st.session_state["tracker_status"] = "READING NOW"
            st.rerun()
with col3:
    if st.session_state["tracker_status"] == "FINISHED":
        st.markdown("<div class='toggle-active'>", unsafe_allow_html=True)
        if st.button("✅ FINISHED", use_container_width=True): pass
        st.markdown("</div>", unsafe_allow_html=True)
    else:
        if st.button("✅ FINISHED", use_container_width=True):
            st.session_state["tracker_status"] = "FINISHED"
            st.rerun()

st.write("")
st.write("")

# --- Fetch existing data & logs ---
# We retrieve this on load to prefill where possible and calculate stats
@st.cache_data(ttl=5) # short ttl to ensure freshness but avoid redundant queries during interaction
def get_user_logs(uid, btitle):
    try:
        resp = supabase.table("reading_log").select("*").eq("user_id", uid).eq("book_title", btitle).order("log_date").execute()
        return resp.data
    except:
        return []

logs_data = get_user_logs(user.id, book_title)

# --- Date Started ---
st.markdown("<div class='mono-label'>// CHAPTER ONE — WHEN DID YOU BEGIN? //</div>", unsafe_allow_html=True)
col_l, col_r = st.columns([1, 4])
with col_l:
    st.markdown("""
    <div style="font-family:'Space Mono'; color:#ff6b35; white-space:pre; padding-top:10px;">
 ___ 
|   |
| S |
| T |
| A |
| R |
| T |
|___|
 \\ / 
  V  
    </div>
    """, unsafe_allow_html=True)
with col_r:
    # Try to find an initial date
    start_val = datetime.today()
    if logs_data and len(logs_data)>0:
        try:
            start_val = datetime.fromisoformat(logs_data[0]["log_date"]).date()
        except:
            pass
    start_date = st.date_input("📅 Date I started reading", key="start_date", value=start_val)

st.write("---")

# --- Daily Page Log ---
st.markdown("<div class='mono-label'>// LOG YOUR READING SESSIONS //</div>", unsafe_allow_html=True)

with st.form("log_session_form", clear_on_submit=True):
    log_date = st.date_input("📅 Date of reading session", value=datetime.today())
    log_page = st.number_input("📖 I read up to page...", min_value=1, max_value=2000, value=1)
    log_note = st.text_input("💬 Quick note about today's session (optional)")
    log_submit = st.form_submit_button("+ LOG THIS SESSION")

    if log_submit:
        try:
            latest_page = log_page
            # calculate prev page to log delta if needed? Actually we just save log_page.
            data = {
                "user_id": user.id,
                "book_title": book_title,
                "log_date": log_date.isoformat(),
                "page_number": log_page,
                "note": log_note
            }
            # Instead of single log, we insert to a new structure OR adapt the old reading_log
            supabase.table("reading_log").insert(data).execute()
            st.success("✓ SESSION LOGGED")
            # clear cache to refresh
            get_user_logs.clear()
            st.rerun()
        except Exception as e:
            st.error("Failed to log session: " + str(e))

# Show log table
if len(logs_data) > 0:
    table_rows = []
    prev_pg = 0
    # ensure sorted by date
    sorted_logs = sorted(logs_data, key=lambda log: log['log_date'])
    for log in sorted_logs:
        pg = log.get("page_number", 0) # Use page_number from new structure, fallback to 'pages' from old if needed?
        if "page_number" not in log and "pages" in log:
            pg = log["pages"] # old format compat
        
        diff = pg - prev_pg
        if diff < 0: diff = pg # User might have restarted or mistyped, just show pg
        
        date_str = "Unknown"
        try:
            d = datetime.fromisoformat(log["log_date"])
            date_str = d.strftime("%b %d %Y")
        except:
            pass
        
        table_rows.append({
            "DATE": date_str,
            "PAGE": f"pg.{pg}",
            "PAGES READ TODAY": f"{diff} pages",
            "NOTE": log.get("note", "")
        })
        prev_pg = pg
    
    st.table(table_rows)

    # --- Stats Panel
    # Calculate days reading
    first_date = datetime.fromisoformat(sorted_logs[0]["log_date"]).date()
    last_date = datetime.fromisoformat(sorted_logs[-1]["log_date"]).date()
    days_reading = (last_date - start_date).days
    if days_reading < 1: days_reading = 1
    
    last_pg = prev_pg
    avg_per_day = last_pg // days_reading
    
    pace = "SLOW"
    if avg_per_day > 60: pace = "FAST 🔥"
    elif avg_per_day >= 25: pace = "STEADY"
    
    est_finish = "N/A"
    if avg_per_day > 0 and last_pg < total_pages:
        rem_pages = total_pages - last_pg
        rem_days = rem_pages // avg_per_day
        # Add days to today or last_date? Let's add to today
        est_d = datetime.today().date() + timedelta(days=rem_days)
        est_finish = est_d.strftime("%d %b")
    elif last_pg >= total_pages:
        est_finish = "COMPLETED"

    stats_html = f"""
    <div class='stats-panel'>╔════════════════════════════════════════╗
║          YOUR READING STATS            ║
╠════════════════════════════════════════╣
║  📅 Days reading:      {days_reading:<16}║
║  📖 Pages read:        {str(last_pg) + ' pages':<16}║
║  ⚡ Avg pages/day:     {str(avg_per_day) + ' pages':<16}║
║  🏁 Est. finish date:  {est_finish:<16}║
║  🔥 Reading pace:      {pace:<16}║
╚════════════════════════════════════════╝</div>
    """
    st.markdown(stats_html, unsafe_allow_html=True)

st.write("---")

# --- Date Ended ---
end_date = None
if st.session_state["tracker_status"] == "FINISHED":
    st.markdown("<div class='mono-label'>// THE END — WHEN DID YOU FINISH? //</div>", unsafe_allow_html=True)
    end_date = st.date_input("📅 Date I finished reading", key="end_date", value=datetime.today())
    days_taken = (end_date - start_date).days
    if days_taken < 1: days_taken = 1
    st.markdown(f"<h2 style='font-family:Bebas Neue; color:#ff6b35;'>YOU READ THIS BOOK IN {days_taken} DAYS</h2>", unsafe_allow_html=True)
    st.write("---")

# --- Star Rating ---
st.markdown("<div class='mono-label'>// YOUR VERDICT //</div>", unsafe_allow_html=True)

rating_cols = st.columns(5)
for i, col in enumerate(rating_cols):
    star_idx = i + 1
    with col:
        # Check if active
        lbl = "★" if star_idx <= st.session_state["star_rating"] else "☆"
        
        # We need a wrapper to give the active ones a yellow highlight via CSS
        if star_idx <= st.session_state["star_rating"]:
            st.markdown("""<style>
                [data-testid="column"]:nth-child("""+str(star_idx)+""") .stButton > button {
                    color: #fbbf24 !important;
                    border-color: #fbbf24 !important;
                    text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
                }
            </style>""", unsafe_allow_html=True)

        if st.button(lbl, key=f"star_{star_idx}", use_container_width=True):
            st.session_state["star_rating"] = star_idx
            st.rerun()

rating_texts = {
    1: "DIDN'T ENJOY IT",
    2: "IT WAS OKAY",
    3: "PRETTY GOOD",
    4: "REALLY LOVED IT",
    5: "AN ALL-TIME FAVOURITE"
}
if st.session_state["star_rating"] > 0:
    st.markdown(f"<h3 style='font-family:Bebas Neue; color:#fbbf24; text-align:center; margin-top:10px;'>{rating_texts[st.session_state['star_rating']]}</h3>", unsafe_allow_html=True)

st.write("---")

# --- Notes ---
st.markdown("<div class='mono-label'>// YOUR THOUGHTS //</div>", unsafe_allow_html=True)
plh = "What did this book make you feel? Any favourite quotes? Would you recommend it?"
notes = st.text_area("Thoughts", placeholder=plh, label_visibility="collapsed", height=150, max_chars=500)
st.markdown(f"<div class='char-count'>{len(notes)} / 500 characters</div>", unsafe_allow_html=True)

st.write("---")

st.write("")

# --- Save Action ---
placeholder = st.empty()

# Custom full-width tracking class via container
st.markdown("""
<style>
.save-wrapper .stButton > button {
    font-size: 2rem !important;
    padding: 15px !important;
    background-color: #0d0d0d !important;
}
</style>
""", unsafe_allow_html=True)

st.markdown("<div class='save-wrapper'>", unsafe_allow_html=True)
if st.button("[ SAVE TO MY LIBRARY ]", use_container_width=True):
    try:
        data = {
            "user_id": user.id,
            "book_title": book_title,
            "status": st.session_state["tracker_status"],
            "date_started": start_date.isoformat() if start_date else None,
            "date_ended": end_date.isoformat() if end_date else None,
            "pages_read": logs_data[-1].get("page_number", 0) if len(logs_data)>0 else 0, # Assuming pages_read in book_tracking represents latest
            "rating": st.session_state["star_rating"],
            "notes": notes,
            "updated_at": datetime.now().isoformat()
        }
        supabase.table("book_tracking").upsert(data).execute()
        
        with placeholder.container():
            st.markdown("""
            <div class="ascii-stamp">
 ________________________
|                        |
|   ✓ SAVED TO YOUR      |
|       LIBRARY!         |
|________________________|
            </div>
            """, unsafe_allow_html=True)
        time.sleep(3)
        placeholder.empty()
    except Exception as e:
        placeholder.error("Failed to save: " + str(e))
st.markdown("</div>", unsafe_allow_html=True)

