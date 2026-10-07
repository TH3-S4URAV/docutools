import os
import sys
import subprocess
import webbrowser
import time
from pathlib import Path
import uvicorn

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"
FRONTEND_DIST = FRONTEND_DIR / "dist"

def ensure_frontend_built():
    if not (FRONTEND_DIST / "index.html").exists():
        print("[DocuTools] Frontend build not detected. Building frontend...")
        try:
            subprocess.run(["npm", "run", "build"], cwd=str(FRONTEND_DIR), check=True, shell=True)
            print("[DocuTools] Frontend build completed successfully.")
        except Exception as e:
            print(f"[DocuTools Warning] Could not build frontend: {e}")

def main():
    print("=" * 60)
    print("  DOCUTOOLS — All your document tools in one place.")
    print("=" * 60)
    print(f"Working Directory: {ROOT_DIR}")

    ensure_frontend_built()

    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    url = f"http://{host}:{port}"

    print(f"\n[DocuTools] Starting unified server at {url}")
    print(f"[DocuTools] API Documentation available at {url}/docs")
    print(f"[DocuTools] Press Ctrl+C to terminate.\n")

    # Add backend directory to sys.path
    sys.path.insert(0, str(BACKEND_DIR))

    uvicorn.run("main:app", host=host, port=port, app_dir=str(BACKEND_DIR))

if __name__ == "__main__":
    main()
