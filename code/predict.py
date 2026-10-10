import tensorflow as tf
import numpy as np
from PIL import Image

# Load the trained model
model_path = 'diabetic_wound_classifier.keras'  # update with your model's path
model = tf.keras.models.load_model(model_path)

def load_and_preprocess_image(image_path, target_size=(224, 224)):
    # Open the image and convert to RGB
    img = Image.open(image_path).convert('RGB')
    # Resize the image to the target dimensions
    img = img.resize(target_size)
    # Convert image to numpy array
    img_array = np.array(img, dtype=np.float32)
    # Normalize pixel values to [0, 1]
    img_array /= 255.0
    # Add batch dimension (model expects a batch of images)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# Specify the path to your image file
image_path = 'C:\\Users\\tanis\\OneDrive\\Documents\\final year project\\archive\\A NEW DATASET SPLIT\\test\\infection\\301126.png'  # update with your image path

# Preprocess the image
img_array = load_and_preprocess_image(image_path)

# Use the model to predict the class
predictions = model.predict(img_array)

# If the model output represents class probabilities,
# extract the class with the highest probability
predicted_class = np.argmax(predictions, axis=-1)
print("Predicted class:", predicted_class)