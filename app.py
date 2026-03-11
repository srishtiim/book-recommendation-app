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

# --- Custom CSS (Retro-Modern Funky) ---
def local_css():
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

    /* Inputs */
    [data-testid="stTextInput"] input, [data-testid="stPasswordInput"] input {
        background-color: #0d0d0d !important;
        border: none !important;
        border-bottom: 2px solid #ff6b35 !important;
        border-radius: 0 !important;
        color: #f5f0e8 !important;
        font-family: 'Space Mono', monospace !important;
    }
    [data-testid="stTextInput"] input:focus, [data-testid="stPasswordInput"] input:focus {
        box-shadow: none !important;
        border-bottom: 2px solid #fbbf24 !important;
    }

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

    h1 {
        font-family: 'Bebas Neue', display;
        font-size: 4rem;
        color: #ff6b35;
        text-align: center;
        letter-spacing: 2px;
        margin-bottom: 0px;
    }
    
    .stTabs [data-baseweb="tab-list"] {
        justify-content: center;
        background-color: transparent;
        border-bottom: 1px solid #7c3aed;
    }
    .stTabs [data-baseweb="tab"] {
        font-family: 'Space Mono', monospace;
        font-size: 1rem;
        color: #a8a29e;
    }
    
    /* ASCII Art wrapper */
    .ascii-art {
        font-family: 'Space Mono', monospace;
        color: #7c3aed;
        white-space: pre;
        text-align: center;
        line-height: 1.2;
        margin-bottom: 20px;
        font-size: 12px;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    </style>
    """, unsafe_allow_html=True)

local_css()

# --- Page Header ---
# ASCII Mascot
st.markdown("""
<div class="ascii-art">
   /\\_____/\\
  (  o   o  )
  (  =^=   )
   (        )
  THE VINTAGE
    LIBRARY
</div>
""", unsafe_allow_html=True)

st.markdown("<h1>ENTER THE ARCHIVE</h1>", unsafe_allow_html=True)
st.write("")

# --- Auth Logic ---
supabase = get_supabase()

tab_login, tab_signup = st.tabs(["[ LOG IN ]", "[ SIGN UP ]"])

with tab_login:
    with st.form("login_form"):
        email = st.text_input("EMAIL", label_visibility="collapsed", placeholder="EMAIL")
        password = st.text_input("PASSWORD", type="password", label_visibility="collapsed", placeholder="PASSWORD")
        st.write("")
        submit = st.form_submit_button("ENTER THE LIBRARY")

        if submit:
            try:
                response = supabase.auth.sign_in_with_password({"email": email, "password": password})
                if response.user:
                    st.session_state["user"] = response.user
                    st.session_state["username"] = email.split('@')[0] 
                    st.success("AUTHENTICATION SUCCESSFUL! OPENING DOORS...")
                    time.sleep(1)
                    st.switch_page("pages/1_Home.py")
            except Exception as e:
                st.error(f"Login failed: {str(e)}")

with tab_signup:
    with st.form("signup_form"):
        username = st.text_input("USERNAME", label_visibility="collapsed", placeholder="USERNAME")
        email = st.text_input("EMAIL", label_visibility="collapsed", placeholder="EMAIL")
        password = st.text_input("PASSWORD", type="password", label_visibility="collapsed", placeholder="PASSWORD")
        confirm_password = st.text_input("CONFIRM PASSWORD", type="password", label_visibility="collapsed", placeholder="CONFIRM PASSWORD")
        st.write("")
        submit = st.form_submit_button("JOIN THE ARCHIVE")

        if submit:
            if password != confirm_password:
                st.error("PASSWORDS DO NOT MATCH.")
            elif len(password) < 6:
                st.error("PASSWORD MUST BE AT LEAST 6 CHARACTERS.")
            else:
                try:
                    response = supabase.auth.sign_up({
                        "email": email, 
                        "password": password,
                        "options": {"data": {"username": username}}
                    })
                    if response.user:
                        st.info("REGISTRATION SUCCESSFUL! CHECK YOUR EMAIL TO CONFIRM.")
                except Exception as e:
                    st.error(f"Sign up failed: {str(e)}")
