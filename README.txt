Short Note Generator
====================

This project extracts text from PDF files and generates short notes, key points, and exam-style questions using a local text-generation model.

Setup
-----
1. Navigate to the project directory:
   cd '/Users/satyaprakashpaikaray/Desktop/short note generator'

2. Install dependencies:
   python3 -m pip install -r requirements.txt

Run
---
1. Start the server:
   export HF_HUB_DISABLE_PROGRESS_BARS=1
   python3 main.py

2. Open a browser and visit:
   http://0.0.0.0:8000

Notes
-----
- The first run may download the model weights, which can take time.
- The app uses FastAPI and serves static files from the `static` folder.
- Upload PDFs through the front-end page at `/`.

Files
-----
- main.py: FastAPI application and upload endpoint
- ml_pipeline.py: text processing and generation logic
- pdf_parser.py: PDF text extraction
- static/: front-end files (`index.html`, `app.js`, `styles.css`)
- requirements.txt: Python dependencies
