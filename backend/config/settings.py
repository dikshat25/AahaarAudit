import os
from pathlib import Path

# Base directory for the backend
BASE_DIR = Path(__file__).resolve().parent.parent

# PPE Model Configuration
PPE_MODEL_PATH = os.environ.get('PPE_MODEL_PATH', str(BASE_DIR / 'models' / 'best.pt'))
