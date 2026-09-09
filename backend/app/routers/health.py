from fastapi import APIRouter
import sys
import platform
import pymupdf

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": "DocuTools",
        "version": "1.0.0",
        "python_version": sys.version,
        "platform": platform.platform(),
        "engine": f"PyMuPDF {pymupdf.__version__}"
    }
