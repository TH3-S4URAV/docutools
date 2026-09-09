import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
TMP_DIR = BASE_DIR / 'tmp'
UPLOAD_DIR = TMP_DIR / 'uploads'
OUTPUT_DIR = TMP_DIR / 'outputs'

# Limits
MAX_UPLOAD_SIZE = int(os.getenv('MAX_UPLOAD_SIZE', 50 * 1024 * 1024))  # 50 MB default
CLEANUP_MAX_AGE_SECONDS = int(os.getenv('CLEANUP_MAX_AGE_SECONDS', 900))  # 15 minutes
PORT = int(os.getenv('PORT', 8000))
HOST = os.getenv('HOST', '0.0.0.0')

# Ensure dirs exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
