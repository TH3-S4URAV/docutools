import re
import uuid
import unicodedata
from pathlib import Path
from fastapi import HTTPException
from app.core.config import UPLOAD_DIR, MAX_UPLOAD_SIZE

ALLOWED_EXTENSIONS = {
    'pdf': ['.pdf'],
    'image': ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff'],
    'office': ['.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls'],
    'html': ['.html', '.htm', '.txt'],
    'all_docs': ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls', '.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff', '.html', '.htm', '.txt']
}

def sanitize_filename(filename: str) -> str:
    if not filename:
        return f'document_{uuid.uuid4().hex[:8]}.bin'
    
    # Normalize unicode
    filename = unicodedata.normalize('NFKD', filename)
    
    # Extract only basename (prevent path traversal like ../../etc/passwd)
    filename = Path(filename).name
    
    # Remove null bytes and dangerous control chars
    filename = filename.replace('\x00', '').strip()
    
    # Keep safe chars (alphanumerics, dash, underscore, dot, spaces)
    safe_name = re.sub(r'[^a-zA-Z0-9._\- ]', '_', filename)
    safe_name = re.sub(r'\.{2,}', '.', safe_name)  # No multiple consecutive dots
    
    if not safe_name or safe_name.startswith('.'):
        safe_name = f'file_{uuid.uuid4().hex[:8]}{safe_name}'
        
    return safe_name[:120]

def create_workspace() -> Path:
    ws_id = uuid.uuid4().hex
    ws_path = UPLOAD_DIR / ws_id
    ws_path.mkdir(parents=True, exist_ok=True)
    return ws_path

def validate_file_size(size_bytes: int):
    if size_bytes > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f'File exceeds maximum permitted size of {MAX_UPLOAD_SIZE // (1024 * 1024)}MB'
        )

def validate_extension(filename: str, category: str = 'all_docs'):
    ext = Path(filename).suffix.lower()
    allowed = ALLOWED_EXTENSIONS.get(category, ALLOWED_EXTENSIONS['all_docs'])
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f'Unsupported file type "{ext}". Allowed: {", ".join(allowed)}'
        )
