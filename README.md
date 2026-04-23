# Retail Intelligence Console

A comprehensive e-commerce performance, forecasting, and strategy dashboard. 
The application relies on a **Flask** backend for data processing, segmentation (GMM), anomaly detection (Isolation Forest), and forecasting (ARIMA), paired with a **Next.js** frontend for an interactive, dashboard-driven experience.

---

## 🚀 Quick Start Instructions

This project requires **Node.js 18+** and **Python 3.10+**.

### 1. Backend Setup (Flask)
The backend requires a Python virtual environment and various machine learning libraries.

1. Navigate to the Backend folder:
   ```bash
   cd Backend
   ```
2. Activate the virtual environment (if not already done):
   ```bash
   # Windows
   .\.venv\Scripts\activate
   
   # macOS/Linux
   source .venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the development server:
   ```bash
   python app.py
   ```
   *Optional for Production*: To run the Waitress production server, run `python serve.py`.

> Note: Ensure you have your `.env` structured correctly. Refer to `config.py` for default values like `HOST`, `PORT`, and `CORS_ORIGINS`.

### 2. Frontend Setup (Next.js)
The frontend requires Node.js and npm.

1. Navigate to the frontend folder:
   ```bash
   cd dep
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy/Create `.env.local` to point to the backend:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```

---

## 🔌 API Reference
The backend exposes the following RESTful endpoints. All accept optional query parameters for filtering: `start_date`, `end_date`, `category`, and `state`.

* `GET /api/global`
  *Returns benchmark KPIs, category share, moving average revenues, and available filters.*
* `GET /api/advanced`
  *Returns model outputs: ARIMA forecasts, Segmentation clusters, Basket rules, and Anomaly data points.*
* `POST /api/upload`
  *Accepts a `multipart/form-data` file for localized analytics preprocessing.*
* `GET /api/local`
  *Returns localized KPIs and segmentations from the cached uploaded dataset.*
* `GET /api/compare`
  *Returns a gap analysis comparing the local dataset against the global baseline.*
* `GET /api/suggestions`
  *Returns natural language, actionable strategic recommendations based on the data models.*

---

## 📊 Local Dataset Schema Requirements
When uploading a custom CSV file to the `/api/upload` endpoint, your file **MUST** contain columns that map to the following required schema:

- **`order_date`** (or `date`, `created_at`, `timestamp`): The date the transaction occurred.
- **`revenue`** (or `sales`, `price`, `total`): The monetary value of the transaction.
- **`category`** (or `product_category`, `department`): The classification of the product.
- **`customer_id`** (or `user_id`, `client_id`): A unique identifier for the purchaser (used for segmentation).
- **`state`** (or `region`, `province`): The geographic location of the sale.

Optional columns (used for deeper insights if available):
- `discount_percent` (or `discount`, `promo`)
- `order_id` (used for basket parsing)
- `product_name`

The backend handles automatic alias-mapping, so exact column names aren't strictly required, provided the semantic meaning aligns with the above fields.
