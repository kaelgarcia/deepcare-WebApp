import os

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import tensorflow as tf
import keras
import numpy as np
import io
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://127.0.0.1"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = keras.models.load_model(os.path.join(BASE_DIR, "best_model_fixed.keras"))

# Exact class order matching training folder names (alphabetical as Keras sees them)
classes = [
    "Acne",                                       # 0  acne
    "Actinic Keratosis",                          # 1  actinic-kerastosis
    "Atopic Dermatitis",                          # 2  atopic-dermatitis
    "Basal Cell Carcinoma",                       # 3  basal-cell-carcinoma
    "Benign Keratosis",                           # 4  benign-kerastosis
    "Bullous Disease",                            # 5  bullous-disease
    "Cellulitis / Impetigo",                      # 6  cellulitis-impetigo
    "Eczema",                                     # 7  Eczema
    "Exanthems and Drug Eruptions",               # 8  Exanthems and Drug Eruptions
    "Herpes / HPV and other STDs",                # 9  Herpes HPV and other STDs Photos
    "Light Diseases and Pigmentation Disorders",  # 10 Light Diseases and Disorders of Pigmentation
    "Lupus and Connective Tissue Diseases",       # 11 Lupus-and-other-connective-tissue
    "Melanocytic Nevi",                           # 12 melanocytic-nevi
    "Melanoma / Skin Cancer / Moles",             # 13 melanoma-skin-cancer-and-moles
    "Poison Ivy / Contact Dermatitis",            # 14 poison-ivy
    "Psoriasis",                                  # 15 psoriasis-pictures
    "Rosacea",                                    # 16 rosacea
    "Scabies / Lyme Disease / Infestations",      # 17 Scabies Lyme Disease and other Infestations
    "Seborrheic Keratoses and Benign Tumors",     # 18 Seborrheic Keratoses and other Benign Tumors
    "Systemic Disease",                           # 19 Systemic Disease
    "Tinea / Ringworm / Candidiasis",             # 20 Tinea Ringworm Candidiasis and other Fungal
    "Urticaria / Hives",                          # 21 urticaria-hives
    "Vascular Tumors",                            # 22 vascular-tumors
    "Vasculitis",                                 # 23 vasculitis-photo
    "Warts / Molluscum / Viral Infections"        # 24 wart-molluscum-and-other-viral-infections
]

CONFIDENCE_THRESHOLD = 50.0


@app.get("/")
def home():
    return {"message": "DeepCare AI Server Running"}


@app.get("/model-info")
def model_info():
    return {
        "output_shape": str(model.output_shape),
        "num_classes": model.output_shape[-1],
        "classes": classes
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        return {"success": False, "message": "Uploaded file is not an image."}

    contents = await file.read()

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        return {"success": False, "message": "Could not read image."}

    image = image.resize((224, 224))
    img_array = np.array(image, dtype=np.float32)

    # Pass raw pixels — the model has built-in preprocessing layers:
    #   rescaling (÷255) → normalization (ImageNet mean/std) → rescaling_1
    # DO NOT manually normalize — just pass 0-255 float array
    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array)
    predicted_index = int(np.argmax(prediction))
    confidence = float(np.max(prediction)) * 100

    all_predictions = [
        {"class": classes[i], "confidence": round(float(prediction[0][i]) * 100, 2)}
        for i in range(len(classes))
    ]
    all_predictions.sort(key=lambda x: x["confidence"], reverse=True)

    response = {
        "success": True,
        "prediction": classes[predicted_index],
        "confidence": round(confidence, 2),
        "top_5": all_predictions[:5]
    }

    if confidence < CONFIDENCE_THRESHOLD:
        response["warning"] = "Low confidence. Please upload a clearer, closer photo of the affected skin area."

    return response
