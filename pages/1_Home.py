import streamlit as st
import json
import time

st.set_page_config(page_title="Vintage Library - Home", page_icon="📚", layout="wide")

if "user" not in st.session_state:
    st.switch_page("app.py")

@st.cache_data
def load_books():
    try:
        with open("books.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

books = load_books()

# --- Custom Global Style ---
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

/* Buttons */
.stButton > button {
    background-color: #0d0d0d !important;
    color: #ff6b35 !important;
    font-family: 'Bebas Neue', display !important;
    font-size: 1.5rem !important;
    letter-spacing: 2px !important;
    border: 2px solid #ff6b35 !important;
    border-radius: 0 !important;
    text-transform: uppercase !important;
    padding: 5px 20px !important;
    transition: all 0.3s ease !important;
}
.stButton > button:hover {
    background-color: #ff6b35 !important;
    color: #0d0d0d !important;
}

.username-display {
    font-family: 'Space Mono', monospace;
    color: #a8a29e;
    text-align: right;
    margin-top: 10px;
    font-size: 0.9rem;
}

/* ASCII Art */
.ascii-art {
    font-family: 'Space Mono', monospace;
    color: #fbbf24;
    white-space: pre;
    text-align: center;
    line-height: 1.2;
    margin: 20px 0;
    font-size: 14px;
}

/* Neon Bookshelf */
.bookshelf-container {
    background-color: #0d0d0d;
    background-image: linear-gradient(rgba(124, 58, 237, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124, 58, 237, 0.05) 1px, transparent 1px);
    background-size: 20px 20px;
    padding: 40px 20px;
    border-radius: 8px;
    margin-bottom: 30px;
}

.neon-sign {
    font-family: 'Space Mono', monospace;
    color: #ff6b35;
    text-align: center;
    margin-bottom: 20px;
    animation: flicker 2.5s infinite alternate;
    font-size: 1.2rem;
}

/* Override Pills */
[data-testid="stRadio"], [data-testid="stPillBlock"] {
    background: transparent !important;
    border: none !important;
    border-bottom: 8px solid #1c1917 !important;
    /* top highlight line using box shadow */
    box-shadow: inset 0 -2px 0 rgba(255,255,255,0.1) !important;
    padding: 20px 20px 0px 20px !important;
    display: flex !important;
    justify-content: center !important;
    flex-wrap: wrap;
    gap: 15px !important;
    margin: 0 auto !important;
    max-width: 900px !important;
}

[data-testid="stPill"] {
    width: 50px !important;
    height: 160px !important;
    writing-mode: vertical-rl !important;
    transform: rotate(180deg) !important;
    background: #0d0d0d !important;
    color: #ffffff !important;
    font-family: 'Bebas Neue', display !important;
    font-size: 1.2rem !important;
    letter-spacing: 2px !important;
    text-align: center !important;
    padding: 15px 0 !important;
    margin: 0 !important;
    border-radius: 0 !important;
    transition: all 0.3s ease !important;
    cursor: pointer !important;
    white-space: nowrap !important;
    border: 2px solid transparent !important;
}

/* Neon borders for spines */
[data-testid="stPill"]:nth-child(6n+1) { border-color: #ff6b35 !important; box-shadow: 0 0 8px #ff6b35, inset 0 0 8px #ff6b35 !important; }
[data-testid="stPill"]:nth-child(6n+2) { border-color: #7c3aed !important; box-shadow: 0 0 8px #7c3aed, inset 0 0 8px #7c3aed !important; }
[data-testid="stPill"]:nth-child(6n+3) { border-color: #fbbf24 !important; box-shadow: 0 0 8px #fbbf24, inset 0 0 8px #fbbf24 !important; }
[data-testid="stPill"]:nth-child(6n+4) { border-color: #e81cff !important; box-shadow: 0 0 8px #e81cff, inset 0 0 8px #e81cff !important; }
[data-testid="stPill"]:nth-child(6n+5) { border-color: #00f0ff !important; box-shadow: 0 0 8px #00f0ff, inset 0 0 8px #00f0ff !important; }
[data-testid="stPill"]:nth-child(6n+0) { border-color: #39ff14 !important; box-shadow: 0 0 8px #39ff14, inset 0 0 8px #39ff14 !important; }

/* Selected state */
[data-testid="stPill"][aria-checked="true"] {
    transform: rotate(180deg) translateX(12px) !important;
    animation: pulse-glow 1.5s infinite alternate !important;
}

[data-testid="stPill"] > span > svg { display: none !important; }

@keyframes pulse-glow {
    0% { filter: brightness(1) drop-shadow(0 0 2px rgba(255,255,255,0.8)); }
    100% { filter: brightness(1.3) drop-shadow(0 0 10px rgba(255,255,255,1)); }
}

@keyframes flicker {
    0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; }
    20%, 24%, 55% { opacity: 0.4; text-shadow: none; }
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* Zine Recommendation Cards */
.zine-card {
    background-color: #1c1917;
    border: 1px solid #ff6b35;
    border-radius: 0;
    padding: 0;
    margin-bottom: 25px;
    display: flex;
    transition: all 0.3s ease;
    min-height: 200px;
    animation: fadeIn 0.5s ease-out both;
}
.zine-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 15px rgba(255, 107, 53, 0.2);
}

.zine-colorbar {
    width: 8px;
    height: auto;
    flex-shrink: 0;
    transition: all 0.3s ease;
}
.zine-card:hover .zine-colorbar {
    box-shadow: 0 0 15px currentcolor;
}

.zine-content {
    padding: 20px;
    flex-grow: 1;
}

.zine-title {
    font-family: 'Bebas Neue', display;
    font-size: 2.5rem;
    color: #f5f0e8;
    line-height: 1;
    margin-bottom: 5px;
}

.zine-author {
    font-family: 'Space Mono', monospace;
    font-size: 0.9rem;
    color: #ff6b35;
    margin-bottom: 15px;
}

.zine-badges {
    margin-bottom: 15px;
}

.zine-tag {
    display: inline-block;
    font-family: 'Space Mono', monospace;
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #f5f0e8;
    border: 1px solid;
    padding: 2px 8px;
    margin-right: 8px;
    margin-bottom: 8px;
}

.zine-mood {
    font-family: 'Crimson Text', serif;
    font-style: italic;
    color: #a8a29e;
    font-size: 0.9rem;
    margin-right: 10px;
}
.zine-pages {
    font-family: 'Space Mono', monospace;
    color: #a8a29e;
    font-size: 0.85rem;
}

.zine-desc {
    font-family: 'Crimson Text', serif;
    color: #f5f0e8;
    line-height: 1.5;
    margin-bottom: 20px;
}

.btn-wrapper .stButton > button {
    width: 100% !important;
    background-color: #ff6b35 !important;
    color: #0d0d0d !important;
}
.btn-wrapper .stButton > button:hover {
    background-color: #fbbf24 !important;
    border-color: #fbbf24 !important;
}

</style>
""", unsafe_allow_html=True)

# Top row: Username and Logout Button
col1, col2, col3 = st.columns([1, 8, 2])
with col3:
    st.markdown(f"<div class='username-display'>USER: {st.session_state.get('username', 'READER')}</div>", unsafe_allow_html=True)
    if st.button("🚪 LOGOUT", use_container_width=True):
        st.session_state.clear()
        st.switch_page("app.py")

# ASCII Bookshelf Decoration
st.markdown("""
<div class="ascii-art">
 ___________________________________________
|  ____  ____  ____  ____  ____  ____  ____ |
| |    ||    ||    ||    ||    ||    ||    ||
| |MYST||ROMC||HROR||THRL||FANT||SCFI||CMDY||
| |____||____||____||____||____||____||____||
|___________________________________________|
     |||    |||    |||    |||    |||    |||
</div>
""", unsafe_allow_html=True)

genres_list = [
    "Adventure", "Drama", "Mystery", "Romance", 
    "Fantasy", "Science Fiction", "Horror", "Historical Fiction", 
    "Thriller", "Classic Literature", "Comedy", "Biography"
]

st.markdown("""
<div class='bookshelf-container'>
    <div class='neon-sign'>[ PICK YOUR GENRE ]</div>
""", unsafe_allow_html=True)

selected_genres = st.pills(" ", options=genres_list, selection_mode="multi", key="genre_pills")

st.markdown("</div>", unsafe_allow_html=True)

if len(selected_genres) > 3:
    st.error("MAX 3 GENRES.")

if "show_books" not in st.session_state:
    st.session_state["show_books"] = False

# Reset show_books if no genres selected
if len(selected_genres) == 0:
    st.session_state["show_books"] = False

if 0 < len(selected_genres) <= 3:
    if st.button("FIND BOOKS", use_container_width=True):
        st.session_state["show_books"] = True

    if st.session_state.get("show_books", False):
        st.markdown("<hr style='border-top: 1px dashed #ff6b35; margin: 40px 0;'>", unsafe_allow_html=True)
        st.markdown("<h2 style='font-family: Bebas Neue; color: #fbbf24; font-size: 3rem; text-align: center;'>[ RECOMMENDED MATCHES ]</h2>", unsafe_allow_html=True)
        
        def match_score(book, sel_genres):
            return len(set(book["genres"]).intersection(set(sel_genres)))
        
        scored_books = [(b, match_score(b, selected_genres)) for b in books]
        filtered_books = [b for b, s in scored_books if s > 0]
        filtered_books.sort(key=lambda x: match_score(x, selected_genres), reverse=True)
        top_10 = filtered_books[:10]
        
        # Color mapping for genres (matching the CSS nth-child logic)
        colors = ["#ff6b35", "#7c3aed", "#fbbf24", "#e81cff", "#00f0ff", "#39ff14"]
        
        for idx, book in enumerate(top_10):
            # pick a color from the palette based on index
            card_color = colors[idx % len(colors)]
            
            # HTML for the card
            col_card, col_btn = st.columns([4, 1])
            with col_card:
                genre_tags = "".join([f"<span class='zine-tag' style='border-color: {card_color}; color: {card_color};'>{g}</span>" for g in book['genres']])
                
                html = f"""
                <div class='zine-card' style='animation-delay: {idx * 0.1}s'>
                    <div class='zine-colorbar' style='background-color: {card_color}; color: {card_color};'></div>
                    <div class='zine-content'>
                        <div class='zine-title'>{book['title']}</div>
                        <div class='zine-author'>BY {book['author']}</div>
                        <div class='zine-badges'>
                            {genre_tags}
                            <span class='zine-mood'>Mood: {book['mood']}</span>
                            <span class='zine-pages'>[ {book['pages']} pages ]</span>
                        </div>
                        <div class='zine-desc'>{book['description']}</div>
                    </div>
                </div>
                """
                st.markdown(html, unsafe_allow_html=True)
            with col_btn:
                st.write("")
                st.write("")
                st.write("")
                # Need a wrapper to style this specific button
                st.markdown("<div class='btn-wrapper'>", unsafe_allow_html=True)
                if st.button("TRACK THIS BOOK →", key=f"track_{idx}_{book['title']}", use_container_width=True):
                    st.session_state["selected_book"] = book['title']
                    st.switch_page("pages/2_Book_Tracker.py")
                st.markdown("</div>", unsafe_allow_html=True)

