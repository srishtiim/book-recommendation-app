import streamlit as st
from supabase_client import get_supabase
import time

# --- Configurations ---
st.set_page_config(
    page_title="The Vintage Library - Join Us",
    page_icon="📜",
    layout="centered",
    initial_sidebar_state="collapsed",
)

# --- Redirection Check ---
if "user" in st.session_state:
    st.switch_page("pages/1_Home.py")

# --- Custom CSS (Modern Vintage) ---
def local_css():
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Libre+Baskerville:wght@400;700&display=swap');

    .stApp {
        background-color: #f5e6c8;
        background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
        color: #2c1810;
        font-family: 'Libre Baskerville', serif;
    }

    /* Hide Streamlit Defaults */
    #MainMenu, footer, header {visibility: hidden;}

    .login-container {
        background: rgba(255, 255, 255, 0.5);
        padding: 40px;
        border-radius: 10px;
        border: 2px solid #1a2744;
        box-shadow: 10px 10px 20px rgba(0,0,0,0.1);
        margin-top: 50px;
    }

    h1 {
        font-family: 'Playfair Display', serif;
        font-size: 2.5rem;
        color: #1a2744;
        text-align: center;
        margin-bottom: 30px;
    }

    .stTabs [data-baseweb="tab-list"] {
        justify-content: center;
        background-color: transparent;
    }

    .stTabs [data-baseweb="tab"] {
        font-family: 'Playfair Display', serif;
        font-size: 1.2rem;
        color: #1a2744;
    }

    .stButton > button {
        background-color: #1a2744 !important;
        color: white !important;
        width: 100%;
        font-family: 'Playfair Display', serif !important;
        font-weight: bold !important;
        border: none !important;
        padding: 10px !important;
        box-shadow: 3px 3px 0px #c4622d !important;
    }
    </style>
    """, unsafe_allow_html=True)

local_css()

# --- Page Header ---
st.markdown("<div style='text-align: center; font-size: 4rem;'>📖</div>", unsafe_allow_html=True)
st.markdown("<h1>The Vintage Library</h1>", unsafe_allow_html=True)

# --- Auth Logic ---
supabase = get_supabase()

tab_login, tab_signup = st.tabs(["📜 Log In", "✍️ Sign Up"])

with tab_login:
    with st.form("login_form"):
        email = st.text_input("Email")
        password = st.text_input("Password", type="password")
        submit = st.form_submit_button("Enter the Library")

        if submit:
            try:
                response = supabase.auth.sign_in_with_password({"email": email, "password": password})
                if response.user:
                    st.session_state["user"] = response.user
                    # Typically Supabase metadata or a profile table holds the username
                    st.session_state["username"] = email.split('@')[0] 
                    st.success("Authentication successful! Opening the vault...")
                    time.sleep(1)
                    st.switch_page("pages/1_Home.py")
            except Exception as e:
                st.error(f"Login failed: {str(e)}")

with tab_signup:
    with st.form("signup_form"):
        username = st.text_input("Username")
        email = st.text_input("Email")
        password = st.text_input("Password", type="password")
        confirm_password = st.text_input("Confirm Password", type="password")
        submit = st.form_submit_button("Join the Archive")

        if submit:
            if password != confirm_password:
                st.error("Passwords do not match.")
            elif len(password) < 6:
                st.error("Password must be at least 6 characters.")
            else:
                try:
                    response = supabase.auth.sign_up({
                        "email": email, 
                        "password": password,
                        "options": {"data": {"username": username}}
                    })
                    if response.user:
                        st.info("Registration successful! Check your email to confirm your account before logging in.")
                except Exception as e:
                    st.error(f"Sign up failed: {str(e)}")
