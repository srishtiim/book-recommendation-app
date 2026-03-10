import streamlit as st
import time
from datetime import datetime
from supabase_client import get_supabase

st.set_page_config(page_title="Vintage Library - Book Tracker", page_icon="✍️", layout="centered")

if "user" not in st.session_state:
    st.switch_page("app.py")

if "selected_book" not in st.session_state:
    st.switch_page("pages/1_Home.py")

book_title = st.session_state["selected_book"]
is_lights_on = st.session_state.get("lights_on", True)

# --- Custom CSS Vintage Library Theme ---
st.markdown(f"""
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Crimson+Text:ital,wght@0,400;0,700;1,400&display=swap');

.stApp {{
    transition: all 0.8s ease;
    font-family: 'Crimson Text', serif;
    background-color: { "#2d1a00" if is_lights_on else "#0a0500" };
    background-image: 
        repeating-linear-gradient(
            0deg,
            transparent,
            transparent 100px,
            rgba(0,0,0,0.1) 100px,
            rgba(0,0,0,0.1) 102px
        );
}}

h1 {{
    font-family: 'Playfair Display', serif;
    font-size: 3rem;
    color: #d4a017;
    text-align: center;
    text-shadow: 0 0 { "10px rgba(212,160,23,0.5)" if is_lights_on else "5px rgba(212,160,23,0.2)" };
    margin-bottom: 30px;
    font-weight: 700;
}}

/* Form Container simulating aged paper */
.tracker-form {{
    background-color: #f5e6c8;
    background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
    border: 2px solid #5a421b;
    border-radius: 6px;
    padding: 30px;
    box-shadow: 5px 5px 15px rgba(0,0,0,0.5);
    color: #2c1810;
}}

.stRadio [data-testid="stRadio"] {{
    background: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;
    border: none !important;
    display: flex;
    flex-direction: row;
    gap: 15px;
}}

[data-testid="stMarkdownContainer"] p {{
    font-size: 1.1rem;
    font-weight: bold;
    color: #2c1810;
}}

[data-testid="stTextInput"] input, 
[data-testid="stNumberInput"] input, 
[data-testid="stTextArea"] textarea {{
    background-color: rgba(255, 255, 255, 0.4) !important;
    border: 1px solid #8b6a32 !important;
    font-family: 'Crimson Text', serif !important;
    color: #2c1810 !important;
    font-size: 1.1rem !important;
}}

/* Stamp Button for Saving */
.stButton>button.save-btn {{
    background-color: transparent !important;
    color: #2e8b57 !important;
    font-family: 'Playfair Display', serif !important;
    font-weight: bold !important;
    font-size: 1.4rem !important;
    border: 3px solid #2e8b57 !important;
    border-radius: 8px !important;
    padding: 10px 30px !important;
    text-transform: uppercase;
    transform: rotate(-2deg);
    margin: 20px auto;
    display: block;
    transition: all 0.2s ease;
}}
.stButton>button.save-btn:hover {{
    background-color: rgba(46, 139, 87, 0.1) !important;
    transform: scale(1.05) rotate(0deg);
}}
.stButton>button.save-btn:active {{
    transform: scale(0.95);
}}

/* Back button */
.stButton>button.back-btn {{
    background-color: transparent;
    color: #f5e6c8;
    border: 1px solid #f5e6c8;
    width: auto;
    margin-bottom: 20px;
}}
.stButton>button.back-btn:hover {{
    color: #d4a017;
    border-color: #d4a017;
}}

/* The ambient glow container */
.glow-overlay {{
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 150vw; height: 150vh;
    pointer-events: none;
    background: radial-gradient(circle at center, { "rgba(255,140,0,0.06)" if is_lights_on else "rgba(255,140,0,0.01)" } 10%, transparent 60%);
    z-index: -1;
}}
</style>
<div class="glow-overlay"></div>
""", unsafe_allow_html=True)

if st.button("← Back to Bookshelf"):
    st.switch_page("pages/1_Home.py")

st.markdown(f"<h1>{book_title}</h1>", unsafe_allow_html=True)

supabase = get_supabase()
user = st.session_state["user"]

with st.container():
    st.markdown("<div class='tracker-form'>", unsafe_allow_html=True)
    
    status = st.radio("Reading Status", ["Want to Read", "Currently Reading", "Finished"], horizontal=True)
    
    col1, col2 = st.columns(2)
    with col1:
        date_started = st.date_input("📅 I opened this book on...", value=datetime.today())
    
    date_ended = None
    with col2:
        if status == "Finished":
            date_ended = st.date_input("📅 I turned the last page on...", value=datetime.today())
    
    pages_read = st.number_input("📖 I read up to page...", min_value=0, value=0, step=10)
    
    st.write("How would you rate this book?")
    # Streamlit 1.40.0 feedback widget
    rating = st.feedback("stars")
    
    notes = st.text_area("✍️ My thoughts on this book...", height=150)
    
    st.markdown("</div>", unsafe_allow_html=True)
    
    st.write("")
    if st.button("Save to My Library"):
        try:
            # We are inserting to book_tracking, assume table exists with these columns:
            # user_id, book_title, status, date_started, date_ended, pages_read, rating, notes
            # To handle both string dates and potential nulls:
            
            data = {{
                "user_id": user.id,
                "book_title": book_title,
                "status": status,
                "date_started": date_started.isoformat() if date_started else None,
                "date_ended": date_ended.isoformat() if date_ended else None,
                "pages_read": pages_read,
                "rating": rating if rating is not None else 0, # rating is 0-4 in feedback stars, we can insert 1-5 or just insert the val
                "notes": notes,
                "updated_at": datetime.now().isoformat()
            }}
            
            # Write to tracking table 
            response = supabase.table("book_tracking").upsert(data).execute()
            
            # Log pages read today if > 0
            if pages_read > 0:
                log_data = {{
                    "user_id": user.id,
                    "book_title": book_title,
                    "date_logged": datetime.today().isoformat(),
                    "pages": pages_read
                }}
                supabase.table("reading_log").insert(log_data).execute()
                
            st.success("✅ Added to your library!")
            time.sleep(2)
            st.switch_page("pages/1_Home.py")
            
        except Exception as e:
            st.error(f"Failed to save to library: {{e}}")

# Inject a script to modify the save button visually since Streamlit doesn't allow custom classes easily
# on st.button (except type primary/secondary).
st.markdown("""
<script>
    const buttons = window.parent.document.querySelectorAll('.stButton button');
    buttons.forEach(btn => {
        if (btn.innerText.includes('Save to My Library')) {
            btn.classList.add('save-btn');
        } else if (btn.innerText.includes('Back to')) {
            btn.classList.add('back-btn');
        }
    });
</script>
""", unsafe_allow_html=True)
