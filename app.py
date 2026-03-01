import streamlit as st
import pandas as pd
import random
import datetime

# --- Configurations ---
st.set_page_config(
    page_title="The Vintage Library Recommender",
    page_icon="📜",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# --- Custom CSS for Redesign ---
def local_css():
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Libre+Baskerville:wght@400;700&display=swap');

    /* Global Styles */
    .stApp {
        background-color: #f5e6c8;
        background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
        color: #2c1810;
        font-family: 'Libre Baskerville', serif;
    }

    /* Hide Streamlit Defaults */
    #MainMenu, footer, header {visibility: hidden;}

    /* Vignette Effect */
    .vignette {
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        box-shadow: inset 0 0 150px rgba(0,0,0,0.5);
        pointer-events: none;
        z-index: 100;
    }

    /* Typography */
    h1 {
        font-family: 'Playfair Display', serif;
        font-size: 3.5rem;
        color: #1a2744;
        text-align: center;
        border-top: 4px double #1a2744;
        border-bottom: 4px double #1a2744;
        padding: 20px 0;
        margin-bottom: 30px;
    }

    .subtitle {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        text-align: center;
        color: #c4622d;
        font-size: 1.5rem;
        margin-bottom: 40px;
    }

    /* Bookshelf Styling */
    .bookshelf-container {
        display: flex;
        justify-content: center;
        padding: 40px 0;
        background: #3d2008;
        border-bottom: 15px solid #2d1806;
        box-shadow: 0 10px 20px rgba(0,0,0,0.4);
        margin-bottom: 50px;
        perspective: 1000px;
    }

    .book-spine {
        width: 45px;
        height: 220px;
        margin: 0 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border-radius: 3px;
        box-shadow: 2px 0 5px rgba(0,0,0,0.3);
        position: relative;
        overflow: hidden;
        animation: slideIn 0.8s ease-out forwards;
        opacity: 0;
        transform: translateY(50px);
    }

    @keyframes slideIn {
        to { opacity: 1; transform: translateY(0); }
    }

    .book-spine:hover {
        transform: translateY(-10px) rotateY(-5deg);
        box-shadow: 5px 10px 15px rgba(0,0,0,0.5);
    }

    .book-spine.selected {
        border: 2px solid #fff;
        transform: translateY(-5px);
    }

    .book-spine span {
        writing-mode: vertical-rl;
        text-orientation: mixed;
        font-family: 'Playfair Display', serif;
        font-weight: bold;
        color: #fff;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    /* Calendar Widget */
    .calendar-container {
        position: fixed;
        top: 20px;
        right: 40px;
        background: #fff;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 5px 5px 15px rgba(0,0,0,0.2);
        text-align: center;
        font-family: 'Libre Baskerville', serif;
        border: 2px solid #ddd;
        z-index: 1000;
        transform: rotate(2deg);
    }

    .calendar-month {
        font-family: 'Playfair Display', serif;
        font-weight: bold;
        color: #c4622d;
        font-size: 1.2rem;
        text-transform: uppercase;
    }

    .calendar-day {
        font-size: 3rem;
        font-weight: bold;
        color: #1a2744;
        margin: 5px 0;
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }

    /* Recommendation Cards */
    .library-card {
        background-color: #fffaf0;
        border: 1px solid #d3c4a9;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 3px 3px 10px rgba(0,0,0,0.1);
        position: relative;
        background-image: linear-gradient(#e5d8c1 1px, transparent 1px);
        background-size: 100% 25px;
        opacity: 0;
        animation: fadeInUp 0.8s ease-out forwards;
    }

    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .library-card:hover {
        transform: translateY(-5px);
        box-shadow: 10px 10px 20px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
    }

    .card-title {
        font-family: 'Playfair Display', serif;
        font-size: 1.8rem;
        font-weight: bold;
        color: #1a2744;
        margin-bottom: 5px;
    }

    .card-author {
        font-style: italic;
        color: #5d4037;
        margin-bottom: 15px;
    }

    .badge {
        display: inline-block;
        padding: 5px 12px;
        background: #c4622d;
        color: white;
        border-radius: 20px;
        font-size: 0.8rem;
        margin-right: 10px;
        box-shadow: 2px 2px 5px rgba(196,98,45,0.4);
    }

    /* Stamp Button */
    .stButton > button {
        background-color: #1a2744 !important;
        color: white !important;
        font-family: 'Playfair Display', serif !important;
        font-weight: bold !important;
        font-size: 1.5rem !important;
        border: 4px double white !important;
        padding: 15px 40px !important;
        box-shadow: 5px 5px 0px #c4622d !important;
        transition: 0.2s !important;
        display: block;
        margin: 0 auto;
    }

    .stButton > button:active {
        transform: translate(3px, 3px) !important;
        box-shadow: 2px 2px 0px #c4622d !important;
    }
    </style>
    <div class="vignette"></div>
    """, unsafe_allow_html=True)

local_css()

# --- Data Loading ---
@st.cache_data
def load_data():
    try:
        df = pd.read_csv("goodreads.csv")
        df['Genres'] = df['Genres'].astype(str)
        df['genre_list'] = df['Genres'].apply(lambda x: [g.strip() for g in x.split(',')])
        return df
    except FileNotFoundError:
        return pd.DataFrame()

df = load_data()

# --- Calendar Widget ---
today = datetime.date.today()
st.markdown(f"""
<div class="calendar-container">
    <div class="calendar-month">{today.strftime('%B')}</div>
    <div class="calendar-day">{today.day}</div>
    <div class="calendar-year">{today.year}</div>
    <div style="font-size: 0.8rem; margin-top: 5px;">{today.strftime('%A')}</div>
</div>
""", unsafe_allow_html=True)

# --- Header ---
st.markdown("<h1>The Vintage Library Recommender</h1>", unsafe_allow_html=True)
st.markdown('<p class="subtitle">Whispers from the past, curated for your soul.</p>', unsafe_allow_html=True)

# --- Genre Recommendation Logic ---
if not df.empty:
    genres_available = sorted(list(set([g for sublist in df['genre_list'] for g in sublist])))
    
    # Custom Bookshelf Selector Logic using st.session_state
    if 'selected_genres' not in st.session_state:
        st.session_state.selected_genres = []

    # Display Bookshelf
    colors = ['#1a2744', '#c4622d', '#4a5d23', '#5d4037', '#8b0000', '#2f4f4f', '#b8860b', '#483d8b', '#556b2f', '#8b4513', '#2c3e50', '#d35400']
    
    st.markdown('<div class="bookshelf-container">', unsafe_allow_html=True)
    
    cols = st.columns(len(genres_available))
    for i, (col, genre) in enumerate(zip(cols, genres_available)):
        with col:
            color = colors[i % len(colors)]
            is_selected = genre in st.session_state.selected_genres
            
            # Use buttons disguised as books
            if st.button(genre, key=f"book_{genre}", help=f"Choose {genre}"):
                if genre in st.session_state.selected_genres:
                    st.session_state.selected_genres.remove(genre)
                else:
                    if len(st.session_state.selected_genres) < 3:
                        st.session_state.selected_genres.append(genre)
                st.rerun()

            btn_class = "book-spine selected" if is_selected else "book-spine"
            selected_mark = "✓" if is_selected else ""
            
            # CSS for labels to look like spines (overlaid on Streamlit buttons)
            st.markdown(f"""
            <style>
                div[data-testid="stColumn"]:nth-child({i+1}) button {{
                    height: 220px !important;
                    width: 45px !important;
                    background-color: {color} !important;
                    border: {('3px solid #fff' if is_selected else 'none')} !important;
                    color: white !important;
                    writing-mode: vertical-rl !important;
                    text-orientation: mixed !important;
                    font-family: 'Playfair Display', serif !important;
                    font-size: 0.8rem !important;
                    text-transform: uppercase !important;
                    padding: 0 !important;
                    border-radius: 3px !important;
                    animation: slideIn 0.8s ease-out forwards;
                    animation-delay: {i * 0.1}s;
                    opacity: 0;
                    transform: translateY(50px);
                }}
                div[data-testid="stColumn"]:nth-child({i+1}) button:hover {{
                    transform: translateY(-10px) rotateY(-5deg) !important;
                    box-shadow: 5px 10px 15px rgba(0,0,0,0.5) !important;
                }}
            </style>
            """, unsafe_allow_html=True)

    st.markdown('</div>', unsafe_allow_html=True)

    # Show selection status
    if st.session_state.selected_genres:
        st.markdown(f"<div style='text-align: center; margin-bottom: 20px;'><b>Current Selection:</b> {', '.join(st.session_state.selected_genres)}</div>", unsafe_allow_html=True)
    else:
        st.markdown("<div style='text-align: center; margin-bottom: 20px; font-style: italic;'>Touch a spine to select your genre (up to 3).</div>", unsafe_allow_html=True)

    # Recommendations
    if st.button("Find My Book"):
        if not st.session_state.selected_genres:
            st.warning("Please select a genre from the shelf first.")
        else:
            with st.spinner("The librarian is dusting off the archives..."):
                # Filtering logic
                mask = df['genre_list'].apply(lambda x: any(g in x for g in st.session_state.selected_genres))
                results = df[mask]
                
                if results.empty:
                    st.info("No books found matching this criteria.")
                else:
                    num_results = min(6, len(results))
                    recommended_books = results.sample(n=num_results)
                    
                    st.markdown("<div style='text-align: center;'>❧</div>", unsafe_allow_html=True)
                    
                    for _, row in recommended_books.iterrows():
                        st.markdown(f"""
                        <div class="library-card">
                            <div style="font-size: 1.5rem; color: #c4622d; margin-bottom: 10px;">⚜</div>
                            <div class="card-title">{row['Title']}</div>
                            <div class="card-author">by {row['Author']}</div>
                            <div style="margin-bottom: 15px;">
                                <span class="badge">{row['Mood']}</span>
                                {' '.join([f'<span class="badge" style="background:#1a2744;">{g}</span>' for g in row['genre_list']])}
                            </div>
                            <div style="font-family: serif; font-size: 1rem; line-height: 1.6;">
                                {row['Description']}
                            </div>
                        </div>
                        """, unsafe_allow_html=True)
                    
                    st.markdown("<div style='text-align: center; font-size: 2rem; margin-top: 30px;'>✒</div>", unsafe_allow_html=True)

else:
    st.error("Error: 'goodreads.csv' not found.")

