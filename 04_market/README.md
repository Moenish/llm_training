
# Market SPA - Vite + React + FastAPI

## How to Run Frontend & Backend Together

1. **Install Frontend Dependencies**
	```sh
	cd 04_market
	npm install
	```

2. **Install Backend Dependencies**
	```sh
	cd ../03_python_fastapi_project
	pip install -r requirements.txt
	# OR if using pyproject.toml (recommended):
	pip install .
	```
	Ensure you have a Python virtual environment set up at the repo root as `.venv`.

3. **Run Both Frontend & Backend**
	```sh
	cd ../04_market
	npm run dev:all
	```
	This will start:
	- Frontend: Vite+React at http://localhost:5173
	- Backend: FastAPI at http://localhost:8000

## Notes
- The backend must be accessible at `../03_python_fastapi_project` and the Python executable at `../.venv/bin/python` from the `04_market` folder.
- If you change backend location or Python environment, update the `start-backend` script in `package.json`.
- Backend dependencies are listed in `pyproject.toml`.

## Backend Dependencies
Main dependencies (see `pyproject.toml`):
- fastapi
- uvicorn[standard]
- sqlalchemy[asyncio]
- aiosqlite
- pydantic
- pydantic-settings
- python-dotenv

## Development
You can edit the frontend in `src/` and backend in `../03_python_fastapi_project/`.
