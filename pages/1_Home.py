import streamlit as st
import json
import time

st.set_page_config(page_title="Vintage Library - Home", page_icon="📚", layout="wide")

if "user" not in st.session_state:
    st.switch_page("app.py")

# Step 3: Toggle switch
if "lights_on" not in st.session_state:
    st.session_state["lights_on"] = True

@st.cache_data
def load_books():
    try:
        with open("books.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

books = load_books()

# Top row: Username and Logout Button
col1, col2, col3 = st.columns([1, 8, 2])
with col1:
    lights_toggle = st.button("🕯️ Lights On" if not st.session_state["lights_on"] else "💡 Lights Off")
    if lights_toggle:
        st.session_state["lights_on"] = not st.session_state["lights_on"]
        st.rerun()

with col3:
    st.markdown(f"<p class='username-display'>User: {st.session_state.get('username', 'Reader')}</p>", unsafe_allow_html=True)
    if st.button("🚪 Leave the Library", use_container_width=True):
        st.session_state.clear()
        st.switch_page("app.py")

is_lights_on = st.session_state["lights_on"]

# Step 2: Custom Vintage Library CSS
st.markdown(f"""
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Crimson+Text:ital,wght@0,400;0,700;1,400&display=swap');

/* Base structure */
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

/* Ambient glow */
.glow-overlay {{
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 150vw; height: 150vh;
    pointer-events: none;
    background: radial-gradient(circle at center, { "rgba(255,140,0,0.08)" if is_lights_on else "rgba(255,140,0,0.02)" } 10%, transparent 60%);
    z-index: 999;
}}

/* Typography */
h1.vintage-title {{
    font-family: 'Playfair Display', serif;
    font-size: 4rem;
    color: #d4a017;
    text-align: center;
    text-shadow: 0 0 { "20px rgba(212,160,23,0.6)" if is_lights_on else "5px rgba(212,160,23,0.2)" };
    margin-bottom: 20px;
    font-weight: 700;
}}

.username-display {{
    font-family: 'Crimson Text', serif;
    font-style: italic;
    color: #f5e6c8;
    text-align: right;
    margin-top: 10px;
    opacity: { "0.8" if is_lights_on else "0.4" };
}}

/* Hide streamit elements */
#MainMenu, header, footer {{ visibility: hidden; }}

/* Bookshelf Area */
[data-testid="stRadio"], [data-testid="stPillBlock"] {{
    background: linear-gradient(#3d1f00, #2a1500) !important;
    border-bottom: 8px solid #150a00 !important;
    box-shadow: 0 15px 20px -5px rgba(0,0,0,0.8) !important;
    padding: 20px 20px 5px 20px !important;
    border-radius: 4px !important;
    display: flex !important;
    justify-content: center !important;
    flex-wrap: wrap;
    gap: 15px !important;
    margin: 40px auto !important;
    max-width: 900px !important;
}}

/* Book Spines representing the checkbox/pills */
[data-testid="stPill"] {{
    width: 45px !important;
    height: 140px !important;
    writing-mode: vertical-rl !important;
    transform: rotate(180deg) !important;
    border: 1px solid rgba(0,0,0,0.3) !important;
    border-radius: 3px !important;
    color: #f5e6c8 !important;
    font-family: 'Playfair Display', serif !important;
    font-weight: bold !important;
    font-size: 14px !important;
    text-align: center !important;
    padding: 15px 0 !important;
    margin: 0 !important;
    box-shadow: 3px 0 6px rgba(0,0,0,0.7), inset -2px 0 4px rgba(0,0,0,0.3) !important;
    transition: all 0.3s ease !important;
    cursor: pointer !important;
    white-space: nowrap !important;
}}

/* Hover & Selected states */
[data-testid="stPill"]:hover, [data-testid="stPill"][aria-checked="true"] {{
    box-shadow: 0 0 10px rgba(255, 140, 0, 0.4), 3px 0 6px rgba(0,0,0,0.6) !important;
    transform: rotate(180deg) translateX(8px) !important;
}}

/* Custom colours and tilt per genre spine */
[data-testid="stPill"]:nth-child(1) {{ background: #c04000 !important; transform: rotate(178deg) !important; }}
[data-testid="stPill"]:nth-child(2) {{ background: #8b6a32 !important; transform: rotate(181deg) !important; }}
[data-testid="stPill"]:nth-child(3) {{ background: #4a2511 !important; transform: rotate(179deg) !important; }}
[data-testid="stPill"]:nth-child(4) {{ background: #800020 !important; transform: rotate(182deg) !important; }}
[data-testid="stPill"]:nth-child(5) {{ background: #2f4f4f !important; transform: rotate(180deg) !important; }}
[data-testid="stPill"]:nth-child(6) {{ background: #4682b4 !important; transform: rotate(178deg) !important; }}
[data-testid="stPill"]:nth-child(7) {{ background: #2e8b57 !important; transform: rotate(181deg) !important; }}
[data-testid="stPill"]:nth-child(8) {{ background: #d2b48c !important; color: #2c1810 !important; transform: rotate(179deg) !important; }}
[data-testid="stPill"]:nth-child(9) {{ background: #b8860b !important; transform: rotate(182deg) !important; }}
[data-testid="stPill"]:nth-child(10) {{ background: #556b2f !important; transform: rotate(180deg) !important; }}
[data-testid="stPill"]:nth-child(11) {{ background: #cd5c5c !important; transform: rotate(179deg) !important; }}
[data-testid="stPill"]:nth-child(12) {{ background: #483d8b !important; transform: rotate(181deg) !important; }}

[data-testid="stPill"]:nth-child(1):hover, [data-testid="stPill"]:nth-child(1)[aria-checked="true"] {{ transform: rotate(178deg) translateX(8px) !important; }}
[data-testid="stPill"]:nth-child(2):hover, [data-testid="stPill"]:nth-child(2)[aria-checked="true"] {{ transform: rotate(181deg) translateX(8px) !important; }}
[data-testid="stPill"]:nth-child(3):hover, [data-testid="stPill"]:nth-child(3)[aria-checked="true"] {{ transform: rotate(179deg) translateX(8px) !important; }}
[data-testid="stPill"]:nth-child(4):hover, [data-testid="stPill"]:nth-child(4)[aria-checked="true"] {{ transform: rotate(182deg) translateX(8px) !important; }}
[data-testid="stPill"]:nth-child(5):hover, [data-testid="stPill"]:nth-child(5)[aria-checked="true"] {{ transform: rotate(180deg) translateX(8px) !important; }}
[data-testid="stPill"]:nth-child(6):hover, [data-testid="stPill"]:nth-child(6)[aria-checked="true"] {{ transform: rotate(178deg) translateX(8px) !important; }}
[data-testid="stPill"]:nth-child(7):hover, [data-testid="stPill"]:nth-child(7)[aria-checked="true"] {{ transform: rotate(181deg) translateX(8px) !important; }}
[data-testid="stPill"]:nth-child(8):hover, [data-testid="stPill"]:nth-child(8)[aria-checked="true"] {{ transform: rotate(179deg) translateX(8px) !important; }}
[data-testid="stPill"]:nth-child(9):hover, [data-testid="stPill"]:nth-child(9)[aria-checked="true"] {{ transform: rotate(182deg) translateX(8px) !important; }}
[data-testid="stPill"]:nth-child(10):hover, [data-testid="stPill"]:nth-child(10)[aria-checked="true"] {{ transform: rotate(180deg) translateX(8px) !important; }}
[data-testid="stPill"]:nth-child(11):hover, [data-testid="stPill"]:nth-child(11)[aria-checked="true"] {{ transform: rotate(179deg) translateX(8px) !important; }}
[data-testid="stPill"]:nth-child(12):hover, [data-testid="stPill"]:nth-child(12)[aria-checked="true"] {{ transform: rotate(181deg) translateX(8px) !important; }}

.shelf-instruction {{
    text-align: center;
    font-family: 'Crimson Text', serif;
    font-style: italic;
    color: #f5e6c8;
    margin-top: -15px;
    font-size: 1.2rem;
    margin-bottom: 30px;
}}

/* Hide checkmark in pills */
[data-testid="stPill"] > span > svg {{
    display: none !important;
}}

/* Find Books button */
.stButton>button.find-books-btn {{
    background: linear-gradient(to bottom, #d4af37, #aa8222) !important;
    color: #2c1810 !important;
    font-family: 'Playfair Display', serif !important;
    font-weight: bold !important;
    font-size: 1.2rem !important;
    border: 2px solid #5a421b !important;
    border-radius: 5px !important;
    padding: 10px 30px !important;
    box-shadow: inset 0 0 5px rgba(255,255,255,0.4), 2px 2px 5px rgba(0,0,0,0.5) !important;
    text-shadow: 1px 1px 1px rgba(255,255,255,0.5) !important;
    display: block !important;
    margin: 0 auto !important;
    transition: all 0.3s ease !important;
}}
.stButton>button.find-books-btn:hover {{
    transform: translateY(-2px);
    box-shadow: inset 0 0 5px rgba(255,255,255,0.6), 2px 4px 8px rgba(0,0,0,0.6) !important;
}}

/* Vintage Library Card */
.library-card {{
    background-color: #f5e6c8;
    background-image: repeating-linear-gradient(transparent, transparent 24px, #d2c5af 25px);
    border: 1px solid #c8b99e;
    border-radius: 4px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 3px 3px 6px rgba(0,0,0,0.2);
    color: #2c1810;
    font-family: 'Crimson Text', serif;
    animation: fadeInUp 0.6s ease-out both;
}}

.library-card h3 {{
    font-family: 'Playfair Display', serif;
    font-weight: bold;
    color: #5d1722;
    margin-top: 0;
    margin-bottom: 5px;
    line-height: 1.2;
}}

.library-card .author {{
    font-style: italic;
    font-size: 1.1rem;
    margin-bottom: 10px;
    color: #1a0b00;
}}

.badge-tag {{
    display: inline-block;
    background-color: #5d1722;
    color: #f5e6c8;
    font-size: 0.8rem;
    padding: 3px 10px;
    border-radius: 12px;
    margin-right: 6px;
    margin-bottom: 6px;
    font-family: 'Helvetica', sans-serif;
}}

.mood-tag {{ background-color: #aa8222; }}
.page-tag {{ background-color: #2f4f4f; }}

@keyframes fadeInUp {{
    from {{ opacity: 0; transform: translateY(20px); }}
    to {{ opacity: 1; transform: translateY(0); }}
}}
</style>
<div class="glow-overlay"></div>
""", unsafe_allow_html=True)

st.markdown("<h1 class='vintage-title'>The Vintage Library</h1>", unsafe_allow_html=True)

# Step 4: Bookshelf selector
genres = [
    "Adventure", "Drama", "Mystery", "Romance", 
    "Fantasy", "Science Fiction", "Horror", "Historical Fiction", 
    "Thriller", "Classic Literature", "Comedy", "Biography"
]

selected_genres = st.pills(" ", options=genres, selection_mode="multi", key="genre_pills")

st.markdown("<div class='shelf-instruction'>Run your finger along the spines and choose up to 3...</div>", unsafe_allow_html=True)

if len(selected_genres) > 3:
    st.error("You can only pick 3 genres!")

if 0 < len(selected_genres) <= 3:
    st.markdown('<style>div.stButton > button.find-books-btn { display: block !important; }</style>', unsafe_allow_html=True)
    if st.button("Find My Books"):
        # We need a custom class for this button to target it, Streamlit doesn't natively allow custom classes easily without HTML
        # However, button styling usually targets all buttons, so we styled .find-books-btn above. The standard button will inherit the default. 
        # But let's use Streamlit's type="primary" to target it if needed, or just let standard styles apply (they are themed).
        # Actually in Streamlit we can't add standard class. We will use a unique button to style it.
        st.markdown("<hr style='border-top: 2px solid #5d1722;'>", unsafe_allow_html=True)
        st.markdown("<h2 style='text-align: center; font-family: Playfair Display; color: #d4a017; font-size: 2.5rem; text-shadow: 0 0 10px rgba(0,0,0,0.5);'>Recommended For You</h2>", unsafe_allow_html=True)
        
        def match_score(book, sel_genres):
            return len(set(book["genres"]).intersection(set(sel_genres)))
        
        scored_books = [(b, match_score(b, selected_genres)) for b in books]
        filtered_books = [b for b, s in scored_books if s > 0]
        filtered_books.sort(key=lambda x: match_score(x, selected_genres), reverse=True)
        top_10 = filtered_books[:10]
        
        for idx, book in enumerate(top_10):
            col_card, col_btn = st.columns([4, 1])
            with col_card:
                genre_badges = "".join([f"<span class='badge-tag'>{g}</span>" for g in book['genres']])
                st.markdown(f"""
                <div class='library-card' style='animation-delay: {idx * 0.1}s'>
                    <h3>{book['title']}</h3>
                    <div class='author'>by {book['author']}</div>
                    <div style='margin-bottom: 12px;'>
                        {genre_badges}
                        <span class='badge-tag mood-tag'>Mood: {book['mood']}</span>
                        <span class='badge-tag page-tag'>{book['pages']} pages</span>
                    </div>
                    <p style='line-height:26px; font-size: 1.1rem; margin-bottom: 0;'>{book['description']}</p>
                </div>
                """, unsafe_allow_html=True)
            with col_btn:
                st.write("")
                st.write("")
                st.write("")
                if st.button("📖 Track This Book", key=f"track_{idx}_{book['title']}", use_container_width=True):
                    st.session_state["selected_book"] = book['title']
                    st.switch_page("pages/2_Book_Tracker.py")
