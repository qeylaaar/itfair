import os
import json
import joblib
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, roc_curve
import data_processing as dp
import config

def build_model(input_shape, learning_rate=0.001, dropout_rate=0.3):
    model = tf.keras.Sequential([
        tf.keras.layers.GRU(
            64,
            input_shape=input_shape,
            return_sequences=True,
            dropout=dropout_rate,
            recurrent_dropout=0.2
        ),
        tf.keras.layers.GRU(
            32,
            dropout=dropout_rate,
            recurrent_dropout=0.2
        ),
        tf.keras.layers.Dense(16, activation='relu'),
        tf.keras.layers.Dropout(dropout_rate),
        tf.keras.layers.Dense(1, activation='sigmoid')
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss='binary_crossentropy',
        metrics=[
            'accuracy',
            tf.keras.metrics.Recall(name='recall'),
            tf.keras.metrics.Precision(name='precision')
        ]
    )
    return model

def train_model():
    # 1. Muat data
    print("[1/4] Memuat data...")
    dataset, scaler, _ = dp.load_kesimpulan_sequences(is_training=True)
    
    # Bagi dataset menjadi train/val
    dataset = dataset.shuffle(1000)
    n_samples = len(list(dataset))
    val_size = int(0.2 * n_samples)
    train_dataset = dataset.skip(val_size)
    val_dataset = dataset.take(val_size)
    
    # Dapatkan input shape
    for batch in train_dataset.take(1):
        # batch[0].shape adalah (batch_size, sequence_length, n_features)
        # Kita hanya perlu (sequence_length, n_features)
        input_shape = batch[0].shape[1:]  # Ambil setelah batch size
        print(f"Input shape: {input_shape}")

    # 2. Bangun model
    print("\n[2/4] Membangun model...")
    model = build_model(input_shape)
    
    # 3. Callbacks
    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        tf.keras.callbacks.ModelCheckpoint(
            config.MODEL_PATH,
            monitor='val_recall',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-6,
            verbose=1
        )
    ]
    
    # 4. Latih model
    print("\n[3/4] Melatih model...")
    history = model.fit(
        train_dataset,
        validation_data=val_dataset,
        epochs=100,
        callbacks=callbacks,
        verbose=1
    )
    
    # 5. Simpan model dan scaler
    print("\n[4/4] Menyimpan model dan scaler...")
    model.save(config.MODEL_PATH)
    joblib.dump(scaler, config.SCALER_PATH)
    
    # Simpan konfigurasi model
    model_config = {
        'input_shape': list(input_shape),  # Konversi ke list Python
        'sequence_length': int(input_shape[0]),
        'n_features': int(input_shape[1])
    }
    with open(config.CONFIG_PATH, 'w') as f:
        json.dump(model_config, f)
    
    print(f"\n✅ Training selesai! Model disimpan di {config.MODEL_PATH}")
    return model, history

if __name__ == "__main__":
    train_model()