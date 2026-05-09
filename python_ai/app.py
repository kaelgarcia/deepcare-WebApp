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

<<<<<<< HEAD
# This is the correct working model
model = tf.keras.models.load_model(
    r"D:\wamp64\www\deepcare-WebApp\python_ai\skin_disease_efficientnetb0_v2.keras"
)
=======
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = keras.models.load_model(os.path.join(BASE_DIR, "best_model_fixed.keras"))
>>>>>>> e4409fa55a68628b42c372a9a729c79ca1f9629e

# Class order — UPDATE after training prints the class order
# These must match the alphabetical folder order from your dataset
classes = [
    "Acne",                                       # 0
    "Actinic Keratosis",                          # 1
    "Atopic Dermatitis",                          # 2
    "Basal Cell Carcinoma",                       # 3
    "Benign Keratosis",                           # 4
    "Bullous Disease",                            # 5
    "Cellulitis / Impetigo",                      # 6
    "Eczema",                                     # 7
    "Exanthems and Drug Eruptions",               # 8
    "Herpes / HPV and other STDs",                # 9
    "Light Diseases and Pigmentation Disorders",  # 10
    "Lupus and Connective Tissue Diseases",       # 11
    "Melanocytic Nevi",                           # 12
    "Melanoma / Skin Cancer / Moles",             # 13
    "Poison Ivy / Contact Dermatitis",            # 14
    "Psoriasis",                                  # 15
    "Rosacea",                                    # 16
    "Scabies / Lyme Disease / Infestations",      # 17
    "Seborrheic Keratoses and Benign Tumors",     # 18
    "Systemic Disease",                           # 19
    "Tinea / Ringworm / Candidiasis",             # 20
    "Urticaria / Hives",                          # 21
    "Vascular Tumors",                            # 22
    "Vasculitis",                                 # 23
    "Warts / Molluscum / Viral Infections",       # 24
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

    # Pass RAW pixels (0-255) — model handles all preprocessing internally
    # rescaling (÷255) → normalization (fitted ImageNet stats) → rescaling_1
    # DO NOT manually normalize
    img_array = np.array(image, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array, verbose=0)
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
        response["warning"] = (
            "Low confidence. Please upload a clearer, "
            "closer photo of the affected skin area."
        )

    return response