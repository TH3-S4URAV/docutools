import time
import shutil
import logging
from pathlib import Path
from app.core.config import TMP_DIR, CLEANUP_MAX_AGE_SECONDS

logger = logging.getLogger(__name__)

def cleanup_path(target_path: Path):
    try:
        if not target_path or not target_path.exists():
            return
        if target_path.is_file() or target_path.is_symlink():
            target_path.unlink(missing_ok=True)
        elif target_path.is_dir():
            shutil.rmtree(target_path, ignore_errors=True)
    except Exception as e:
        logger.warning(f"Error cleaning up {target_path}: {e}")

def cleanup_old_files():
    now = time.time()
    count = 0
    if not TMP_DIR.exists():
        return count
    for item in TMP_DIR.rglob('*'):
        try:
            if item.is_file():
                mtime = item.stat().st_mtime
                if now - mtime > CLEANUP_MAX_AGE_SECONDS:
                    item.unlink(missing_ok=True)
                    count += 1
            elif item.is_dir() and item != TMP_DIR:
                if not any(item.iterdir()):
                    item.rmdir()
        except Exception:
            continue
    return count
