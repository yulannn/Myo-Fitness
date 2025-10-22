# ETL: ingest raw event JSONs into parquet and update aggregates
import pandas as pd
from pathlib import Path
import json

BASE = Path(__file__).parents[1]
RAW_EVENTS = BASE / 'data' / 'raw' / 'events'
PROCESSED = BASE / 'data' / 'processed'
OUT = BASE / 'outputs' / 'exercise_recommendations'
PROCESSED.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)

PARQUET_EVENTS = PROCESSED / 'events.parquet'

# Read all json files
files = sorted(RAW_EVENTS.glob('*.json')) if RAW_EVENTS.exists() else []
new_rows = []
for f in files:
    try:
        obj = json.loads(f.read_text())
        payload = obj.get('payload', obj)
        # normalize
        row = {
            'user_id': payload.get('user_id'),
            'session_id': payload.get('session_id'),
            'timestamp': payload.get('timestamp', obj.get('receivedAt')),
            'exercise_id': payload.get('exercise_id'),
            'exercise_key': payload.get('exercise_key'),
            'sets': payload.get('sets'),
            'reps': payload.get('reps'),
            'weight_kg': payload.get('weight_kg'),
            'rpe': payload.get('rpe'),
            'duration_min': payload.get('duration_min'),
            'completed': payload.get('completed')
        }
        new_rows.append(row)
        # move file to processed folder
        processed_dir = RAW_EVENTS / 'processed'
        processed_dir.mkdir(exist_ok=True)
        f.rename(processed_dir / f.name)
    except Exception as e:
        print('failed reading', f, e)

if new_rows:
    df_new = pd.DataFrame(new_rows)
    # append to parquet
    if PARQUET_EVENTS.exists():
        df_old = pd.read_parquet(PARQUET_EVENTS)
        df = pd.concat([df_old, df_new], ignore_index=True)
    else:
        df = df_new
    df.to_parquet(PARQUET_EVENTS, index=False)
    print('Appended', len(df_new), 'events to', PARQUET_EVENTS)

    # update per-exercise aggregates
    # merge with existing exercise dataset to get exercise canonical if needed
    ex_stats_path = OUT / 'exercise_stats.csv'
    ex_df = None
    if ex_stats_path.exists():
        ex_df = pd.read_csv(ex_stats_path)

    # compute aggregates from events where exercise_key present
    agg = df.dropna(subset=['exercise_key']).groupby('exercise_key').agg(
        count=('exercise_key','size'),
        avg_calories=('duration_min', 'mean')  # placeholder: use duration as proxy (if no calories in events)
    ).reset_index()

    # merge or replace
    if ex_df is not None and 'exercise_key' in ex_df.columns:
        merged = ex_df.set_index('exercise_key').combine_first(agg.set_index('exercise_key')).reset_index()
        # simple overwrite for avg_calories
        merged = merged.drop(columns=[c for c in ['avg_calories','count'] if c in merged.columns], errors='ignore')
        merged = merged.merge(agg, on='exercise_key', how='left')
        merged.to_csv(ex_stats_path, index=False)
    else:
        agg.to_csv(ex_stats_path, index=False)

    # regenerate top_exercises_overall.csv
    ex_stats = pd.read_csv(ex_stats_path)
    # If avg_calories exists, use it; else fallback to previously computed score column
    if 'avg_calories' in ex_stats.columns and 'median_intensity' in ex_stats.columns:
        from sklearn.preprocessing import MinMaxScaler
        scaler = MinMaxScaler()
        ss = ex_stats[['avg_calories','median_intensity']].fillna(0)
        ex_stats[['cal_norm','int_norm']] = scaler.fit_transform(ss)
        ex_stats['score'] = 0.6 * ex_stats['cal_norm'] + 0.4 * ex_stats['int_norm']
    elif 'score' not in ex_stats.columns:
        ex_stats['score'] = 0

    top = ex_stats.sort_values('score', ascending=False)[['exercise_key','score']]
    top.to_csv(OUT / 'top_exercises_overall.csv', index=False)
    print('Updated top_exercises_overall.csv')
else:
    print('No new events to ingest.')
