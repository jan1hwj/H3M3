from flask import Flask, render_template, request, jsonify
from huggingface_hub import InferenceClient
from PIL import Image
import io
import os
from dotenv import load_dotenv
from recipe_generator import generate_recipe_auto, generate_recipe_custom

load_dotenv()

app = Flask(__name__, template_folder='templates', static_folder='static', static_url_path='/')

# Initialize the InferenceClient with your API token
API_TOKEN = os.getenv("HF_TOKEN")
if not API_TOKEN:
    app.logger.error("Hugging Face API token not found.")
    raise ValueError("Missing Hugging Face API token in .env file")

client = InferenceClient(model="hustvl/yolos-small", token=API_TOKEN)

@app.route('/')
def index():
    return render_template('step1.html')

@app.route('/upload_image', methods=['POST'])
def upload_image():
    try:
        if 'ingredient_image' not in request.files:
            app.logger.error("No file part in request.")
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['ingredient_image']
        if file.filename == '':
            app.logger.error("No file selected.")
            return jsonify({"error": "No file selected"}), 400

        if not file.content_type.startswith("image/"):
            app.logger.error("Invalid file type. Only images are allowed.")
            return jsonify({"error": "Invalid file type. Please upload an image."}), 400

        app.logger.debug("Converting uploaded image to bytes...")
        image = Image.open(file).convert("RGB")
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='JPEG')
        img_byte_arr = img_byte_arr.getvalue()

        app.logger.debug("Sending image to Hugging Face API...")
        results = client.image_classification(img_byte_arr)

        app.logger.debug(f"Raw Hugging Face API results: {results}")

        detected_objects = [
            obj['label'] for obj in results if obj.get('score', 0) > 0.5
        ]
        unique_objects = list(set(detected_objects))
        app.logger.debug(f"Unique detected ingredients: {unique_objects}")
        return jsonify({"ingredients": unique_objects})
    
    except Exception as e:
        app.logger.error(f"Error in /upload_image: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/step2", methods=['GET', 'POST'])
def step2():
    ingredients = request.form.get('ingredients', '').split(",")
    app.logger.debug(f"Received ingredients for Step 2: {ingredients}")
    return render_template('step2.html', ingredients=ingredients)

@app.route('/generate_recipe', methods=['POST'])
def generate_recipe_route():
    try:
        ingredients = request.json.get('ingredients', [])
        app.logger.debug(f"Ingredients received for Quick Generation:{ingredients}")

        recipe = generate_recipe_auto(ingredients)
        app.logger.debug(f"Generated recipe:{recipe}")

        return jsonify({"recipe": recipe})
    except Exception as e:
        app.logger.error(f"Error in /generate_recipe:{str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate_recipe_custom', methods=['POST'])
def generate_recipe_custom_route():
    try:
        data = request.json
        cuisine = data.get("cuisine", "Any")
        servings = int(data.get("servings", "1"))
        flavor = data.get("flavor", "Any")
        ingredients = data.get("ingredients", [])

        app.logger.debug(f"Customization options - Cuisine: {cuisine}, Servings: {servings}, Flavor: {flavor}")
        app.logger.debug(f"Ingredients: {ingredients}")

        recipe = generate_recipe_custom(ingredients, cuisine, servings, flavor)
        app.logger.debug(f"Generated customized recipe: {recipe}")

        return jsonify({"recipe": recipe})
    except Exception as e:
        app.logger.error(f"Error in /generate_recipe_custom: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
