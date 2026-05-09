# DeepCare – Skin Disease AI Diagnosis Web App

DeepCare is a web application that uses a deep learning model (EfficientNetB0) to diagnose skin conditions from uploaded images. The frontend is served via WAMP, and the AI backend runs as a FastAPI server.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend (PHP) | WAMP Server (Apache + PHP) |
| AI Server | Python, FastAPI, Uvicorn |
| AI Model | TensorFlow + Keras (EfficientNetB0) |
| Database | MySQL (via WAMP) |

---

## Required Dependencies

### Python Version
- **Python 3.11** (3.12+ is not tested and may cause issues)

### Python Packages (exact versions)

| Package | Version |
|---|---|
| tensorflow | 2.21.0 |
| keras | 3.12.0 |
| fastapi | latest |
| uvicorn | latest |
| pillow | latest |
| numpy | latest |
| python-multipart | latest |

Install all at once:

```bash
pip install "tensorflow==2.21.0" "keras==3.12.0" fastapi uvicorn pillow numpy python-multipart
```

### WAMP Server
- **WAMP 3.x** for Windows — download from [https://www.wampserver.com](https://www.wampserver.com)
- Requires PHP 7.4+ with `curl` extension enabled

---

## Project Structure

```
deepcare-WebApp/
├── backend/
│   ├── db.php
│   ├── get_assessment.php
│   ├── google_auth.php
│   ├── login.php
│   ├── predict_skin.php        ← bridges browser to AI server
│   ├── save_assessment.php
│   └── signup.php
├── css/
├── html/
│   ├── chat.html               ← main AI diagnosis page
│   ├── assessment.html
│   └── ...
├── js/
│   ├── chat.js                 ← handles image upload and result display
│   └── ...
├── database/
│   └── deepcare_db.sql
├── python_ai/
│   ├── app.py                  ← FastAPI AI server
│   ├── best_model_fixed.keras  ← patched EfficientNetB0 model
│   ├── fix_model.py            ← one-time model patch script
│   ├── start_server.bat        ← double-click to start AI server
│   └── finder.py               ← debug/test script (not used in production)
└── README.md
```

---

## First-Time Setup

### Step 1 — Install WAMP
1. Download and install WAMP from [https://www.wampserver.com](https://www.wampserver.com)
2. Place the project folder in `C:\wamp64\www\deepcare-WebApp\`
3. Start WAMP — the system tray icon should turn **green**

### Step 2 — Import the Database
1. Open `http://localhost/phpmyadmin`
2. Create a new database named `deepcare_db`
3. Click **Import** and select `database/deepcare_db.sql`
4. Click **Go**

### Step 3 — Install Python Dependencies
Open a terminal and run:

```bash
pip install "tensorflow==2.21.0" "keras==3.12.0" fastapi uvicorn pillow numpy python-multipart
```

### Step 4 — Patch the AI Model (one time only)
The model file must be patched once to remove deprecated layer config fields.

```bash
cd C:\wamp64\www\deepcare-WebApp\python_ai
python fix_model.py
```

You should see:
```
Done! Patched model saved to: ...best_model_fixed.keras
```

This only needs to be done **once**. After that, `best_model_fixed.keras` is the file used by the server.

### Step 5 — Verify `app.py` is using the fixed model
Open `python_ai/app.py` and confirm line 22 reads:

```python
model = keras.models.load_model(os.path.join(BASE_DIR, "best_model_fixed.keras"))
```

---

## Running the Website

You must start **two servers** before using the site:

### 1. Start WAMP
Click the WAMP icon in your system tray and select **Start All Services**. The icon must be **green** before continuing.

### 2. Start the AI Server
Double-click `python_ai/start_server.bat`, or run manually in a terminal:

```bash
cd C:\wamp64\www\deepcare-WebApp\python_ai
uvicorn app:app --host 127.0.0.1 --port 8000
```

Wait until you see:
```
INFO:     Application startup complete.
```

This takes 20–60 seconds on first run because the model loads into memory.

### 3. Open the Website
Navigate to:
```
http://localhost/deepcare-WebApp/html/login.html
```

---

## How the AI Works

1. User uploads a skin photo in `chat.html`
2. `chat.js` sends the image to `backend/predict_skin.php` via `fetch()`
3. `predict_skin.php` forwards the image to the FastAPI server at `http://127.0.0.1:8000/predict` using cURL
4. FastAPI resizes the image to 224×224, passes it through the EfficientNetB0 model
5. The model returns a prediction across 25 skin condition classes
6. The result (condition name, confidence %, top 5 predictions) is returned to the browser and displayed in the chat window

### Supported Skin Conditions (25 classes)
Acne, Actinic Keratosis, Atopic Dermatitis, Basal Cell Carcinoma, Benign Keratosis, Bullous Disease, Cellulitis / Impetigo, Eczema, Exanthems and Drug Eruptions, Herpes / HPV and other STDs, Light Diseases and Pigmentation Disorders, Lupus and Connective Tissue Diseases, Melanocytic Nevi, Melanoma / Skin Cancer / Moles, Poison Ivy / Contact Dermatitis, Psoriasis, Rosacea, Scabies / Lyme Disease / Infestations, Seborrheic Keratoses and Benign Tumors, Systemic Disease, Tinea / Ringworm / Candidiasis, Urticaria / Hives, Vascular Tumors, Vasculitis, Warts / Molluscum / Viral Infections

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `http://127.0.0.1:8000/` | Health check |
| GET | `http://127.0.0.1:8000/model-info` | Returns model output shape and class list |
| POST | `http://127.0.0.1:8000/predict` | Accepts image file, returns prediction |

### Example `/predict` Response
```json
{
  "success": true,
  "prediction": "Acne",
  "confidence": 87.43,
  "top_5": [
    { "class": "Acne", "confidence": 87.43 },
    { "class": "Rosacea", "confidence": 6.21 },
    { "class": "Eczema", "confidence": 3.10 },
    { "class": "Psoriasis", "confidence": 1.85 },
    { "class": "Atopic Dermatitis", "confidence": 0.94 }
  ]
}
```

If confidence is below 50%, a warning is also returned:
```json
{
  "warning": "Low confidence. Please upload a clearer, closer photo of the affected skin area."
}
```

---

## Troubleshooting

**AI server won't start — model load error**
Run `python fix_model.py` again and confirm `best_model_fixed.keras` exists in `python_ai/`.

**`predict_skin.php` returns "Could not reach the AI server"**
The AI server is not running. Start it with `start_server.bat` before using the website.

**WAMP icon is orange or red**
Another program (usually Skype or IIS) is using port 80 or 3306. Stop those services or change WAMP's port in its settings.

**Prediction takes a long time**
The first prediction after server start is slow (2–5 seconds) because the model is loading into memory. Subsequent predictions are faster (~200ms).

---

## Important Disclaimer

> DeepCare AI results are for **informational purposes only** and are **not a substitute for professional medical diagnosis**. Always consult a licensed dermatologist for any skin condition.

---

## Authors

DeepCare Development Team