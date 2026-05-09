import tensorflow as tf
import numpy as np
from PIL import Image

model = tf.keras.models.load_model(
    r"D:\wamp64\www\deepcare-WebApp\python_ai\best_model.keras"
)

print("=== MODEL SUMMARY ===")
model.summary()

print("\n=== TEST WITH PURE COLORS ===")
# Test with a pure red image
red = np.zeros((1, 224, 224, 3), dtype=np.float32)
red[0, :, :, 0] = 255  # all red

for name, arr in [("Pure Red /255", red/255.0), 
                   ("Pure Red -1to1", red/127.5 - 1.0)]:
    pred = model.predict(arr, verbose=0)
    print(f"{name}: max={pred.max()*100:.2f}% std={pred.std()*100:.4f}% index={np.argmax(pred)}")

print("\n=== TEST WITH RANDOM NOISE ===")
# A well-trained model should be uncertain on noise
noise = np.random.rand(1, 224, 224, 3).astype(np.float32)
pred = model.predict(noise, verbose=0)
print(f"Random noise /1.0: max={pred.max()*100:.2f}% std={pred.std()*100:.4f}%")

noise2 = noise * 255.0 / 127.5 - 1.0
pred2 = model.predict(noise2, verbose=0)
print(f"Random noise -1to1: max={pred2.max()*100:.2f}% std={pred2.std()*100:.4f}%")

print("\n=== WEIGHT CHECK ===")
# Check if weights look normal
for layer in model.layers[-5:]:
    weights = layer.get_weights()
    if weights:
        w = weights[0]
        print(f"{layer.name}: mean={w.mean():.4f} std={w.std():.4f} min={w.min():.4f} max={w.max():.4f}")