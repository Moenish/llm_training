# Product Management UI (Issue #1)

React + Vite + Tailwind implementation of the provided Figma design, consuming the existing FastAPI backend in `../03_python_fastapi_project`.

## Development

1. Start backend (from repo root):
   `python -m uvicorn 03_python_fastapi_project.main:app --reload`
2. Install deps & start frontend (in this folder):
   `npm install`
   `npm run dev`

Frontend served on http://localhost:5174 (CORS allowed origin must match backend; adjust FastAPI if needed).

## Cart Feature

The UI now supports a simple shopping cart backed by new FastAPI `/cart` endpoints.

### Interactions
* Add to cart: Click the small + icon next to product stock (disabled if out of stock).
* Modify quantity: Use + / - controls in the cart panel (bottom-left) to adjust quantity.
* Remove item: Click the X icon in a cart line or decrement to 0.
* Refresh: Use the Refresh link in the cart header to re-fetch.

### Backend Endpoints
* `GET /cart/` – list items (each item includes `product` object & `quantity`).
* `POST /cart/{product_id}` – add 1 unit (atomic stock decrement) or increment existing.
* `PUT /cart/{product_id}` – set a new quantity (restores or consumes stock diff; 0 deletes).
* `DELETE /cart/{product_id}` – remove item and restore stock.

### Notes
* Stock numbers update in product cards immediately after cart mutations.
* All operations optimistic then revalidated by reloading products + cart in parallel.
* Errors surface via alert dialogs (minimal handling – consider toast system as enhancement).


