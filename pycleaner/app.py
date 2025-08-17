from flask import Flask, request, jsonify
import spacy
import nltk
from nltk.corpus import wordnet
from collections import Counter
import threading

app = Flask(__name__)

# Download NLTK data on first run (threaded to avoid blocking)
def download_nltk():
    nltk.download('wordnet')
threading.Thread(target=download_nltk).start()

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Utility functions
def get_synonyms(word):
    synonyms = set()
    for syn in wordnet.synsets(word):
        for lemma in syn.lemmas():
            synonyms.add(lemma.name())
    return list(synonyms)

@app.route('/preprocess', methods=['POST'])
def preprocess():
    data = request.get_json()
    text = data.get('text', '')
    doc = nlp(text.lower())
    lemmatized_words = [token.lemma_ for token in doc if not token.is_stop and not token.is_punct]
    return jsonify({'lemmatized': lemmatized_words})

@app.route('/expand', methods=['POST'])
def expand():
    data = request.get_json()
    words = data.get('words', [])
    expanded_words = words.copy()
    for word in words:
        expanded_words.extend(get_synonyms(word))
    return jsonify({'expanded': expanded_words})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
