import streamlit as st

# --- Configurations ---
st.set_page_config(
    page_title="Vintage Library - Home",
    page_icon="📚",
    layout="wide",
)

# --- Security Check ---
if "user" not in st.session_state:
    st.switch_page("app.py")

# --- Custom CSS ---
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
.stApp { background-color: #f5e6c8; color: #2c1810; }
h1 { font-family: 'Playfair Display', serif; color: #1a2744; text-align: center; }
</style>
""", unsafe_allow_html=True)

# --- Content ---
username = st.session_state.get("username", "Reader")
st.markdown(f"<h1>Welcome back, {username}! 📚</h1>", unsafe_allow_html=True)

st.write("---")
st.info("Phase 2: Your personalized bookshelf and reading tracking will appear here soon.")

if st.button("Log Out"):
    for key in list(st.session_state.keys()):
        del st.session_state[key]
    st.rerun()
