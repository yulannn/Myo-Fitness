# Improved Streamlit app for exercise recommendations
import streamlit as st
import pandas as pd
import numpy as np
from pathlib import Path
import matplotlib.pyplot as plt
import streamlit.components.v1 as components
import streamlit.components.v1 as components

BASE = Path(__file__).parents[1]
OUT = BASE / 'outputs' / 'exercise_recommendations'
FIGS = OUT / 'figures'
STATS = OUT / 'exercise_stats.csv'
OVERALL = OUT / 'top_exercises_overall.csv'

st.set_page_config(page_title='Exercise Recommendations', layout='wide')
st.title('Exercise recommendations — interactive explorer')

# --- custom CSS theme (musculation) ---
st.markdown(
    """
    <style>
    .reportview-container, .main, header, .stApp {
        background: #0b0f12;
        color: #f7f7f7;
    }
    .stButton>button {
        background: linear-gradient(90deg,#ff4b3e,#ff8a00);
        color: white;
        border: none;
    }
    .stSidebar {
        background: #0f1417;
        color: #f7f7f7;
    }
    .stTable td, .stTable th, table {
        color: #ffffff;
    }
    .table.table-striped tr:nth-child(odd) { background-color: #101419; }
    .table.table-striped tr:nth-child(even) { background-color: #0b0f12; }
    h1, h2, h3, h4 { color: #ff8a00 }
    </style>
    """,
    unsafe_allow_html=True,
)

# Sidebar: user profile inputs
st.sidebar.header('User profile')
age = st.sidebar.number_input('Age', min_value=12, max_value=100, value=30)
gender = st.sidebar.selectbox('Gender', options=['Male', 'Female'], index=0)
weight = st.sidebar.number_input('Weight (kg)', min_value=30.0, max_value=200.0, value=75.0)
height_cm = st.sidebar.number_input('Height (cm)', min_value=120.0, max_value=220.0, value=175.0)
objective = st.sidebar.selectbox('Goal', options=['General fitness','Fat loss','Hypertrophy','Strength'], index=0)
top_n = st.sidebar.slider('Top N exercises to show', 1, 30, 10)
score_pref_cal = st.sidebar.slider('Weight: calories vs intensity (0 = only intensity, 1 = only calories)', 0.0, 1.0, 0.6)

# Compute BMI
height_m = height_cm / 100.0 if height_cm > 0 else np.nan
bmi = weight / (height_m ** 2) if height_m and height_m > 0 else np.nan
st.sidebar.markdown(f'**Estimated BMI:** {bmi:.1f}' if not np.isnan(bmi) else '**BMI: N/A**')

# Helpers
@st.cache_data
def load_csv(path: Path):
    if not path.exists():
        return None
    try:
        return pd.read_csv(path)
    except Exception:
        return None

exercise_stats = load_csv(STATS)
overall = load_csv(OVERALL)

if exercise_stats is None or overall is None:
    st.error('Precomputed recommendation files not found. Run the data pipeline to generate `exercise_stats.csv` and `top_exercises_overall.csv`.')
    st.stop()

# Determine age bucket
def age_bucket_for(a: int):
    if a < 18:
        return '<18'
    if a <= 30:
        return '18-30'
    if a <= 45:
        return '31-45'
    if a <= 60:
        return '46-60'
    return '60+'

age_bucket = age_bucket_for(age)
profile_file = OUT / f'top_exercises_age_{age_bucket}_gender_{gender}.csv'

# Load profile-specific if exists, otherwise fall back to overall and apply simple re-ranking
if profile_file.exists():
    prof_df = load_csv(profile_file)
    recommended = prof_df.copy()
    st.success(f'Loaded profile-specific recommendations for age {age_bucket} / {gender}')
else:
    st.info('No profile-specific CSV found — using overall list and re-ranking by your objective')
    recommended = overall.merge(exercise_stats, left_on='exercise_key', right_on='exercise_key', how='left')
    # Simple objective adjustment
    # For fat loss prefer higher calories; for strength prefer higher intensity
    cal_w = score_pref_cal if objective in ['Fat loss','General fitness'] else (0.5 if objective=='Hypertrophy' else 0.3)
    int_w = 1 - cal_w
    # if columns missing, fall back to score column
    if 'avg_calories' in recommended.columns and 'median_intensity' in recommended.columns:
        # normalize
        recommended['cal_norm2'] = (recommended['avg_calories'] - recommended['avg_calories'].min()) / (recommended['avg_calories'].max() - recommended['avg_calories'].min() + 1e-9)
        recommended['int_norm2'] = (recommended['median_intensity'] - recommended['median_intensity'].min()) / (recommended['median_intensity'].max() - recommended['median_intensity'].min() + 1e-9)
        recommended['score_custom'] = cal_w * recommended['cal_norm2'] + int_w * recommended['int_norm2']
        recommended = recommended.sort_values('score_custom', ascending=False)
    else:
        recommended = recommended.sort_values('score', ascending=False)

# Display top N
st.subheader(f'Top {top_n} exercises for your profile')
show_df = recommended[['exercise_key','avg_calories','avg_duration','median_intensity','score']].copy() if 'avg_calories' in recommended.columns else recommended[['exercise_key','score']].copy()
show_df = show_df.head(top_n)
show_df = show_df.rename(columns={
    'exercise_key':'Exercise',
    'avg_calories':'Avg calories',
    'avg_duration':'Avg duration (min)',
    'median_intensity':'Median intensity',
    'score':'Pipeline score'
})
html = show_df.fillna('').reset_index(drop=True).to_html(index=False, classes='table table-striped')
show_styled = f"""
<style>
.table.table-striped td, .table.table-striped th {{ color: #ffffff !important; padding: 8px; border-color: #222; }}
.table.table-striped {{ border-collapse: collapse; width: 100%; }}
.table.table-striped tr:nth-child(odd) {{ background-color: #0f1417; }}
.table.table-striped tr:nth-child(even) {{ background-color: #0b0f12; }}
.table.table-striped th {{ background-color: #0b0f12; color: #ff8a00 !important; }}
</style>
<div style='overflow:auto'>{html}</div>
"""
components.html(show_styled, height=300)

# Download button
csv_bytes = show_df.to_csv(index=False).encode('utf-8')
st.download_button('Download recommendations (CSV)', data=csv_bytes, file_name='recommendations.csv', mime='text/csv')

# Plot top N bar chart
st.subheader('Scores visualization')
chart_df = show_df.copy()
if 'Pipeline score' in chart_df.columns and not chart_df.empty:
    import matplotlib.pyplot as plt
    fig, ax = plt.subplots(figsize=(8, 4))
    vals = chart_df.set_index('Exercise')['Pipeline score']
    vals.plot.barh(ax=ax, color='#ff8a00')
    ax.set_xlabel('Score')
    ax.invert_yaxis()
    ax.set_facecolor('#0b0f12')
    fig.patch.set_facecolor('#0b0f12')
    for spine in ax.spines.values():
        spine.set_color('#555')
    ax.tick_params(colors='#fff', labelcolor='#fff')
    st.pyplot(fig)

# Show exercise details on selection
st.subheader('Inspect an exercise')
exercise_list = recommended['exercise_key'].unique().tolist()
sel = st.selectbox('Select exercise', options=exercise_list, index=0)
if sel:
    details = exercise_stats[exercise_stats['exercise_key']==sel]
    if not details.empty:
        d = details.iloc[0].to_dict()
        st.markdown('**Exercise details**')
        info_html = f"""
        <div style='color:#ffffff'>
        <h4 style='color:#ff8a00'>{sel}</h4>
        <ul>
        <li><strong>Average calories:</strong> {d.get('avg_calories', 'N/A')}</li>
        <li><strong>Average duration (min):</strong> {d.get('avg_duration','N/A')}</li>
        <li><strong>Median intensity:</strong> {d.get('median_intensity','N/A')}</li>
        <li><strong>Sample count:</strong> {d.get('count','N/A')}</li>
        </ul>
        </div>
        """
        st.markdown(info_html, unsafe_allow_html=True)
    else:
        st.write('No detailed stats available for this exercise.')

# Show some global figures
st.markdown('---')
st.subheader('Global diagnostic figures')
col1, col2 = st.columns(2)
with col1:
    fig1 = FIGS / 'calories_distribution.png'
    if fig1.exists():
        st.image(str(fig1), caption='Calories distribution', use_column_width=True)
with col2:
    fig2 = FIGS / 'calories_vs_duration.png'
    if fig2.exists():
        st.image(str(fig2), caption='Calories vs Duration', use_column_width=True)

# Annotated Top 10 (overall) if available
ann_fig = FIGS / 'top10_exercises_annotated.png'
if ann_fig.exists():
    st.subheader('Annotated Top 10 (overall)')
    st.image(str(ann_fig), use_column_width=True)
    # show annotated table (merge overall top with stats)
    try:
        overall_top = pd.read_csv(OVERALL)
        ann_table = overall_top.merge(exercise_stats, left_on='exercise_key', right_on='exercise_key', how='left')
        ann_table_display = ann_table[['exercise_key','score'] + [c for c in ['avg_calories','avg_duration','median_intensity','count'] if c in ann_table.columns]]
        ann_table_display = ann_table_display.rename(columns={
            'exercise_key':'Exercise',
            'avg_calories':'Avg calories',
            'avg_duration':'Avg duration (min)',
            'median_intensity':'Median intensity',
            'count':'Sample count'
        })
        html_table = ann_table_display.head(10).fillna('').to_html(index=False, classes='table table-striped')
        styled = f"""
        <style>
        .table.table-striped td, .table.table-striped th {{ color: #ffffff !important; padding: 8px; border-color: #222; }}
        .table.table-striped {{ border-collapse: collapse; width: 100%; }}
        .table.table-striped tr:nth-child(odd) {{ background-color: #0f1417; }}
        .table.table-striped tr:nth-child(even) {{ background-color: #0b0f12; }}
        .table.table-striped th {{ background-color: #0b0f12; color: #ff8a00 !important; }}
        </style>
        <div style='overflow:auto'>{html_table}</div>
        """
        components.html(styled, height=320)
    except Exception:
        pass

st.markdown('---')
st.caption('Data and figures are generated by the offline pipeline; place new CSVs in `myo_datas/outputs/exercise_recommendations/` to refresh.')
