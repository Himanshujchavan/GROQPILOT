from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import logging
from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer
import torch

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize model (will download on first run)
try:
    logger.info("Loading AI model...")
    model_name = "facebook/blenderbot-400M-distill"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name)
    logger.info("AI model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")
    model = None
    tokenizer = None

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '')
        history = data.get('history', [])
        
        logger.info(f"Received message: {message}")
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        # Generate response
        if model and tokenizer:
            # Format conversation history
            conversation = ""
            for msg in history[-5: 
            # Format conversation history
            conversation = ""
            for msg in history[-5:]:
                role = msg.get('role', '')
                content = msg.get('content', '')
                if role == 'user':
                    conversation += f"User: {content}\n"
                else:
                    conversation += f"Assistant: {content}\n"
            
            conversation += f"User: {message}\nAssistant:"
            
            # Generate response
            inputs = tokenizer(conversation, return_tensors="pt")
            outputs = model.generate(
                inputs["input_ids"],
                max_length=200,
                pad_token_id=tokenizer.eos_token_id,
                temperature=0.7,
            )
            response = tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extract just the assistant's response
            if "Assistant:" in response:
                response = response.split("Assistant:")[-1].strip()
            
            logger.info(f"Generated response: {response}")
            return jsonify({"response": response})
        else:
            # Fallback response if model failed to load
            logger.warning("Using fallback response as model is not available")
            return jsonify({"response": "I'm running in fallback mode with limited capabilities. My AI model couldn't be loaded properly."})
            
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    status = "online" if model and tokenizer else "limited"
    return jsonify({"status": status})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
