from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import tensorflow as tf
import numpy as np
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = tf.keras.models.load_model(
    r"D:\wamp64\www\deepcare-WebApp\python_ai\skin_disease_efficientnetb0_updated.keras"
)

classes = [
    "Acne",
    "Actinic Keratosis",
    "Atopic Dermatitis",
    "Basal Cell Carcinoma",
    "Benign Keratosis",
    "Bullous Disease",
    "Cellulitis / Impetigo",
    "Eczema",
    "Exanthems and Drug Eruptions",
    "Herpes / HPV and other STDs",
    "Light Diseases and Pigmentation Disorders",
    "Lupus and Connective Tissue Diseases",
    "Melanocytic Nevi",
    "Melanoma / Skin Cancer / Moles",
    "Poison Ivy / Contact Dermatitis",
    "Psoriasis",
    "Rosacea",
    "Scabies / Lyme Disease / Infestations",
    "Seborrheic Keratoses and Benign Tumors",
    "Systemic Disease",
    "Tinea / Ringworm / Candidiasis / Fungal Infections",
    "Urticaria / Hives",
    "Vascular Tumors",
    "Vasculitis",
    "Warts / Molluscum / Viral Infections"
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

    # EfficientNet preprocessor — scales pixels to [-1, 1]
    img_array = img_array / 127.5 - 1.0
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