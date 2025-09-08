# llm_training

Monorepo containing training exercises:

* `03_python_fastapi_project` – FastAPI backend (products + cart)
* `05_design` – React + Vite + Tailwind frontend UI

## Shopping Cart Feature

Implements product inventory and a cart with add/increment/decrement/remove and stock synchronization.

Backend endpoints (FastAPI):
* `GET /products/`, `POST /products/`, `PUT /products/{id}`, `DELETE /products/{id}`
* `GET /cart/` – list items (with embedded product)
* `POST /cart/{product_id}` – add/increment
* `PUT /cart/{product_id}` – set quantity (returns `{status:"removed"}` if quantity set to 0)
* `DELETE /cart/{product_id}` – remove & restore stock

Frontend (Vite): persistent cart panel (bottom-left), toast notifications for actions, disabled add button when out of stock.

## Prerequisites

* Node.js (v18+ recommended)
* Python 3.11+

## Quick Start (Backend & Frontend in Parallel)

Open two terminals at repo root.

Terminal 1 – Backend:
```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r <(python - <<'PY'
import tomllib,sys
data=tomllib.load(open('03_python_fastapi_project/pyproject.toml','rb'))
for d in data['project']['dependencies']:
	print(d)
PY
)
export PYTHONPATH=03_python_fastapi_project:$PYTHONPATH
python -m uvicorn 03_python_fastapi_project.main:app --reload --port 8000
```

Terminal 2 – Frontend:
```bash
cd 05_design
npm install
npm run dev
```

Visit: http://localhost:5174 (API served on http://127.0.0.1:8000)

## Simpler One-Liners (macOS/Linux)

Backend deps then start:
```bash
python -m venv .venv && source .venv/bin/activate && python -m pip install --upgrade pip && \
python - <<'PY'
import tomllib, subprocess
deps=tomllib.load(open('03_python_fastapi_project/pyproject.toml','rb'))['project']['dependencies']
subprocess.check_call(["python","-m","pip","install", *deps])
PY
PYTHONPATH=03_python_fastapi_project:$PYTHONPATH python -m uvicorn 03_python_fastapi_project.main:app --reload --port 8000
```

Frontend in another terminal:
```bash
cd 05_design && npm install && npm run dev
```

## Development Notes

* Cart quantity set to 0 via PUT returns a status object instead of a cart item.
* Frontend uses remove endpoint for zeroing – avoids ambiguous stale item.
* Toasts replace blocking `alert()` calls.

## Next Improvements (Optional)

* Automated tests (pytest + httpx; React component tests)
* User/session scoped cart
* Persistent cart storage (e.g., per user auth)
* Better accessibility for toast & cart controls
* CI workflow for lint + tests
