# Product Management UI (Issue #1)

React + Vite + Tailwind implementation of the provided Figma design, consuming the existing FastAPI backend in `../03_python_fastapi_project`.

## Development

1. Start backend (from repo root):
   `python -m uvicorn 03_python_fastapi_project.main:app --reload`
2. Install deps & start frontend (in this folder):
   `npm install`
   `npm run dev`

Frontend served on http://localhost:5174 (CORS allowed origin must match backend; adjust FastAPI if needed).

