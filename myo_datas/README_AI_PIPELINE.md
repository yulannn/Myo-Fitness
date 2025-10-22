# AI pipeline quickstart (myo_datas)

This README explains how to use the cleaned datasets, the recommendation endpoints, ingestion, and the Streamlit preview app.

Paths
- Processed data: `myo_datas/data/processed/` (CSV + Parquet)
- Outputs (recommendations): `myo_datas/outputs/exercise_recommendations/`
- Raw events ingest folder: `myo_datas/data/raw/events/`
- ETL script: `myo_datas/scripts/ingest_events.py`
- Streamlit app: `myo_datas/apps/recommend_app.py`

Virtualenv
```
python3 -m venv myo_datas/.venv
source myo_datas/.venv/bin/activate
python -m pip install -r myo_datas/requirements.txt
```

Endpoints (backend)
- `POST /ia/events` — log an event (session/exercise). Example curl:
```
curl -X POST 'http://localhost:3000/ia/events' \
  -H 'Content-Type: application/json' \
  -d '{"user_id":123, "session_id":"sess-1","timestamp":"2025-10-22T10:00:00Z","exercise_key":"squat","sets":4,"reps":[8,8,6,6],"weight_kg":[80,80,85,90],"rpe":8,"duration_min":45,"completed":true}'
```

- `POST /ia/feedback` — log feedback. Example:
```
curl -X POST 'http://localhost:3000/ia/feedback' \
  -H 'Content-Type: application/json' \
  -d '{"user_id":123, "session_id":"sess-1","rating":4,"pain_level":1,"notes":"good workout"}'
```

ETL ingestion
- Place event JSON files into `myo_datas/data/raw/events/` (files will be moved to `processed/` after ingestion).
- Run:
```
myo_datas/.venv/bin/python myo_datas/scripts/ingest_events.py
```
- This will append events to `myo_datas/data/processed/events.parquet` and update `myo_datas/outputs/exercise_recommendations/exercise_stats.csv` and `top_exercises_overall.csv`.

Streamlit app (preview)
- Run the app:
```
myo_datas/.venv/bin/streamlit run myo_datas/apps/recommend_app.py
```
- Use sidebar to enter profile (age, gender, weight, height, objective) and view recommended exercises. You can download the CSV for the top N recommendations.

Notes & next steps
- The ingestion writes minimal normalized JSON into `myo_datas/data/raw/events/` — adapt the schema in `Myo-Fitness/api/src/ia/ia.controller.ts` and `ia.service.ts` if needed.
- For production, replace file persistence with a proper DB/queue and add authentication to endpoints.

Contact
- If you want me to wire ETL to a scheduler or to persist events in the DB via Prisma, tell me and I'll implement it.
