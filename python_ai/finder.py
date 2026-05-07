import tensorflow as tf
import numpy as np
from PIL import Image
from tensorflow.keras.applications.efficientnet import preprocess_input
model = tf.keras.models.load_model(
    r"D:\wamp64\www\deepcare-WebApp\python_ai\skin_disease_efficientnetb0_updated.keras"
)

def diagnose(image_path):
    image = Image.open(image_path).convert("RGB")
    print(f"Original size: {image.size}")
    
    image = image.resize((224, 224))
    img_array = np.array(image, dtype=np.float32)
    
    # Use EfficientNet preprocessor
    img_array = preprocess_input(img_array)
    
    print(f"Pixel range after preprocess: {img_array.min():.2f} - {img_array.max():.2f}")
    # Should now be roughly -1.0 to 1.0 range
    
    img_array = np.expand_dims(img_array, axis=0)
    prediction = model.predict(img_array)
    
    print(f"\nRaw output sum: {prediction.sum():.4f}")
    print(f"Max confidence: {prediction.max()*100:.2f}%")
    print(f"Std deviation: {prediction.std()*100:.4f}%")
    print(f"Top prediction index: {np.argmax(prediction)}")

diagnose(r"E:\DATASETs\AI\AI\AI\final_dataset\train\bullous-disease\benign-familial-chronic-pemphigus-4.jpg")