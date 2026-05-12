import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import numpy as np
import tensorflow as tf
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.models import load_model
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report

# =============================================================================
# CONFIGURATION
# =============================================================================

BASE_DIR   = r"E:\DATASETs\AI\AI\AI\final_dataset"
TRAIN_DIR  = os.path.join(BASE_DIR, "train")
TEST_DIR   = os.path.join(BASE_DIR, "test")
UNSEEN_DIR = os.path.join(BASE_DIR, "unseen")

IMG_SIZE   = 224
BATCH_SIZE = 32

BEST_MODEL_PATH  = r"E:\DATASETs\AI\AI\AI\best_model.keras"
FINAL_MODEL_PATH = r"E:\DATASETs\AI\AI\AI\skin_disease_efficientnetb0_v2.keras"
PLOT_PATH        = r"E:\DATASETs\AI\AI\AI\training_metrics.png"

# =============================================================================
# STEP 1 — VERIFY DATASET + PRINT CLASS ORDER
# =============================================================================

print("\n[Step 1] Dataset summary:")
valid_ext = {'.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff', '.tif', '.webp'}

for split, path in [("train", TRAIN_DIR), ("test", TEST_DIR), ("unseen", UNSEEN_DIR)]:
    split_classes = sorted([
        d for d in os.listdir(path)
        if os.path.isdir(os.path.join(path, d))
    ])
    total_imgs = sum(
        len([f for f in os.listdir(os.path.join(path, c))
             if os.path.splitext(f)[1].lower() in valid_ext])
        for c in split_classes
    )
    print(f"  {split:8s}: {len(split_classes):3d} classes, ~{total_imgs} images")

print("\n  Class order — copy this into app.py:")
train_classes = sorted([
    d for d in os.listdir(TRAIN_DIR)
    if os.path.isdir(os.path.join(TRAIN_DIR, d))
])
for i, c in enumerate(train_classes):
    print(f"    {i:2d}: {c}")

# =============================================================================
# STEP 2 — DATA GENERATORS
# =============================================================================

print("\n[Step 2] Creating data generators...")

train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    rotation_range=20,
    zoom_range=0.2,
    shear_range=0.1,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True,
    brightness_range=[0.8, 1.2]
)

eval_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input
)

train_data = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=True
)

test_data = eval_datagen.flow_from_directory(
    TEST_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=False
)

unseen_data = eval_datagen.flow_from_directory(
    UNSEEN_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=False
)

NUM_CLASSES = train_data.num_classes
print(f"\n  NUM_CLASSES  : {NUM_CLASSES}")
print(f"  train        : {train_data.samples} images")
print(f"  test         : {test_data.samples} images")
print(f"  unseen       : {unseen_data.samples} images")

# =============================================================================
# STEP 3 — LOAD CHECKPOINT AND RESUME PHASE 2
# =============================================================================

print(f"\n[Step 3] Loading checkpoint from '{BEST_MODEL_PATH}'...")
model = load_model(BEST_MODEL_PATH)
print(f"  Loaded. Val accuracy so far: 78.77%")

# Unfreeze last 50 layers for continued fine-tuning
for layer in model.layers[:-50]:
    layer.trainable = False
for layer in model.layers[-50:]:
    layer.trainable = True

trainable = sum(1 for l in model.layers if l.trainable)
print(f"  Trainable layers: {trainable}")

model.compile(
    optimizer=Adam(learning_rate=1e-4),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# =============================================================================
# STEP 4 — CALLBACKS
# =============================================================================

callbacks = [
    EarlyStopping(
        monitor='val_accuracy',
        patience=5,
        restore_best_weights=True,
        verbose=1
    ),
    ModelCheckpoint(
        BEST_MODEL_PATH,
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1
    ),
    ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=3,
        verbose=1,
        min_lr=1e-7
    )
]

# =============================================================================
# STEP 5 — CONTINUE TRAINING
# =============================================================================

print("\n[Step 4] Resuming Phase 2 fine-tuning...")
print("         Starting from val_accuracy: 0.7877")
print("         Learning rate: 1e-4 | Max epochs: 50 (early stopping)")

history = model.fit(
    train_data,
    validation_data=test_data,
    epochs=50,
    callbacks=callbacks
)

print(f"\n  Training complete.")
print(f"  Epochs run   : {len(history.history['accuracy'])}")
print(f"  Best val acc : {max(history.history['val_accuracy']):.4f}")
print(f"  Best val loss: {min(history.history['val_loss']):.4f}")

# =============================================================================
# STEP 6 — PLOT TRAINING METRICS
# =============================================================================

print(f"\n[Step 5] Saving training plot to '{PLOT_PATH}'...")

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

ax1.plot(history.history['accuracy'],     label='Train Accuracy')
ax1.plot(history.history['val_accuracy'], label='Val Accuracy')
ax1.set_title('Accuracy per Epoch (resumed)')
ax1.set_xlabel('Epoch')
ax1.set_ylabel('Accuracy')
ax1.legend()
ax1.grid(alpha=0.3)

ax2.plot(history.history['loss'],     label='Train Loss')
ax2.plot(history.history['val_loss'], label='Val Loss')
ax2.set_title('Loss per Epoch (resumed)')
ax2.set_xlabel('Epoch')
ax2.set_ylabel('Loss')
ax2.legend()
ax2.grid(alpha=0.3)

plt.suptitle('EfficientNetB0 — Resumed Fine-tuning', fontweight='bold')
plt.tight_layout()
plt.savefig(PLOT_PATH, dpi=150)
plt.close()
print(f"  Plot saved.")

# =============================================================================
# STEP 7 — OVERFITTING CHECK
# =============================================================================

train_acc = history.history['accuracy'][-1]
val_acc   = history.history['val_accuracy'][-1]

print("\n[Step 6] Overfitting check:")
print(f"  Final train accuracy : {train_acc:.4f}")
print(f"  Final val accuracy   : {val_acc:.4f}")
if abs(train_acc - val_acc) < 0.05:
    print("  → Good generalisation (gap < 5%)")
else:
    print(f"  → Possible overfitting (gap = {abs(train_acc - val_acc)*100:.1f}%)")

# =============================================================================
# STEP 8 — EVALUATION ON TEST SET
# =============================================================================

print("\n[Step 7] Loading best model for evaluation...")
best_model = load_model(BEST_MODEL_PATH)

print("\n  Classification report on TEST set:")
y_pred_test  = np.argmax(best_model.predict(test_data), axis=1)
y_true_test  = test_data.classes
class_labels = list(test_data.class_indices.keys())
print(classification_report(y_true_test, y_pred_test, target_names=class_labels))

# =============================================================================
# STEP 9 — EVALUATION ON UNSEEN DATA
# =============================================================================

print("\n[Step 8] Evaluating on UNSEEN data...")
loss_unseen, acc_unseen = best_model.evaluate(unseen_data, verbose=1)
print(f"\n  Unseen Accuracy : {acc_unseen:.4f} ({acc_unseen*100:.1f}%)")
print(f"  Unseen Loss     : {loss_unseen:.4f}")

y_pred_unseen = np.argmax(best_model.predict(unseen_data), axis=1)
y_true_unseen = unseen_data.classes
print("\nPer-class report (unseen):\n")
print(classification_report(y_true_unseen, y_pred_unseen, target_names=class_labels))

# =============================================================================
# STEP 10 — SAVE FINAL MODEL
# =============================================================================

best_model.save(FINAL_MODEL_PATH)
print(f"\n[Done] Final model saved to '{FINAL_MODEL_PATH}'")
print(f"       Best checkpoint  : '{BEST_MODEL_PATH}'")
print(f"       Training plot    : '{PLOT_PATH}'")
print("\n===  ALL STEPS COMPLETED SUCCESSFULLY  ===")