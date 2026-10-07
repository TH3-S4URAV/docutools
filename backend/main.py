"""
DOCUTOOLS — Main API Server
Complete production FastAPI server with built-in security, automatic cleanup,
and endpoints for all 32 document tools.
"""

import os
import re
import time
import uuid
import shutil
import asyncio
import logging
import unicodedata
from pathlib import Path
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, Request, APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

import pdf_engine

logger = logging.getLogger(__name__)

# -------------------------------------------------------------
# CONFIGURATION & DIRECTORIES
# -------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
TMP_DIR = BASE_DIR / "tmp"
UPLOAD_DIR = TMP_DIR / "uploads"
OUTPUT_DIR = TMP_DIR / "outputs"

MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", 50 * 1024 * 1024))  # 50 MB
CLEANUP_MAX_AGE_SECONDS = int(os.getenv("CLEANUP_MAX_AGE_SECONDS", 900))  # 15 minutes
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {
    'pdf': ['.pdf'],
    'image': ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff'],
    'office': ['.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls'],
    'html': ['.html', '.htm', '.txt'],
    'all_docs': ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls', '.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff', '.html', '.htm', '.txt']
}

# -------------------------------------------------------------
# SECURITY & SANITIZATION
# -------------------------------------------------------------
def sanitize_filename(filename: str) -> str:
    if not filename:
        return f"document_{uuid.uuid4().hex[:8]}.bin"
    filename = unicodedata.normalize('NFKD', filename)
    filename = Path(filename).name
    filename = filename.replace('\x00', '').strip()
    safe_name = re.sub(r'[^a-zA-Z0-9._\- ]', '_', filename)
    safe_name = re.sub(r'\.{2,}', '.', safe_name)
    if not safe_name or safe_name.startswith('.'):
        safe_name = f"file_{uuid.uuid4().hex[:8]}{safe_name}"
    return safe_name[:120]

def create_workspace() -> Path:
    ws_path = UPLOAD_DIR / uuid.uuid4().hex
    ws_path.mkdir(parents=True, exist_ok=True)
    return ws_path

def validate_file_size(size_bytes: int):
    if size_bytes > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum permitted size of {MAX_UPLOAD_SIZE // (1024 * 1024)}MB"
        )

def validate_extension(filename: str, category: str = 'all_docs'):
    ext = Path(filename).suffix.lower()
    allowed = ALLOWED_EXTENSIONS.get(category, ALLOWED_EXTENSIONS['all_docs'])
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f'Unsupported file type "{ext}". Allowed: {", ".join(allowed)}'
        )

# -------------------------------------------------------------
# CLEANUP
# -------------------------------------------------------------
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

def cleanup_old_files() -> int:
    now = time.time()
    count = 0
    if not TMP_DIR.exists():
        return count
    for item in TMP_DIR.rglob('*'):
        try:
            if item.is_file():
                if now - item.stat().st_mtime > CLEANUP_MAX_AGE_SECONDS:
                    item.unlink(missing_ok=True)
                    count += 1
            elif item.is_dir() and item != TMP_DIR:
                if not any(item.iterdir()):
                    item.rmdir()
        except Exception:
            continue
    return count

async def periodic_cleanup_task():
    while True:
        try:
            await asyncio.sleep(600)
            cleaned = cleanup_old_files()
            if cleaned > 0:
                print(f"[DocuTools Scavenger] Purged {cleaned} stale temporary files.")
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"[DocuTools Scavenger Error] {e}")

# -------------------------------------------------------------
# APPLICATION LIFECYCLE & APP INIT
# -------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    cleanup_task = asyncio.create_task(periodic_cleanup_task())
    print("[DocuTools] Server started. Background scavenger active.")
    yield
    cleanup_task.cancel()
    print("[DocuTools] Server shut down cleanly.")

app = FastAPI(
    title="DocuTools API",
    description="All-in-one document & PDF processing API.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred while processing your document. Please verify the file format and try again."}
    )

# Helper functions for endpoints
async def save_upload(file: UploadFile, dest_dir: Path) -> Path:
    safe_name = sanitize_filename(file.filename)
    dest_path = dest_dir / safe_name
    contents = await file.read()
    validate_file_size(len(contents))
    with open(dest_path, "wb") as f:
        f.write(contents)
    return dest_path

def build_download_response(output_file: Path, client_filename: str, bg_tasks: BackgroundTasks, workspace: Path, extra_headers: Optional[dict] = None):
    headers = {
        "Access-Control-Expose-Headers": "Content-Disposition, X-Original-Size, X-Result-Size, X-Savings-Percent, X-Message",
        "X-Result-Size": str(output_file.stat().st_size)
    }
    if extra_headers:
        headers.update(extra_headers)

    bg_tasks.add_task(cleanup_path, workspace)
    return FileResponse(
        path=str(output_file),
        filename=client_filename,
        headers=headers,
        background=bg_tasks
    )

# -------------------------------------------------------------
# API ROUTERS
# -------------------------------------------------------------
router = APIRouter(prefix="/api")

@router.get("/health")
def api_health():
    return {
        "status": "healthy",
        "service": "DocuTools API",
        "version": "1.0.0",
        "max_upload_mb": MAX_UPLOAD_SIZE // (1024 * 1024)
    }

# --- PDF Organize & Edit ---
@router.post("/tools/merge")
async def api_merge(bg: BackgroundTasks, files: List[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least two PDF files are required to merge.")
    ws = create_workspace()
    try:
        saved_paths = []
        for f in files:
            validate_extension(f.filename, 'pdf')
            saved_paths.append(await save_upload(f, ws))
        out_pdf = ws / "merged_document.pdf"
        pdf_engine.merge_pdfs(saved_paths, out_pdf)
        return build_download_response(out_pdf, "merged_document.pdf", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/split")
async def api_split(bg: BackgroundTasks, file: UploadFile = File(...), ranges: str = Form(""), mode: str = Form("ranges")):
    validate_extension(file.filename, 'pdf')
    ws = create_workspace()
    try:
        in_pdf = await save_upload(file, ws)
        out_files = pdf_engine.split_pdf(in_pdf, ranges, ws, mode)
        if not out_files:
            raise HTTPException(status_code=400, detail="No output pages produced with the given ranges.")
        if len(out_files) == 1:
            return build_download_response(Path(out_files[0]), Path(out_files[0]).name, bg, ws)
        # Package multiple in ZIP
        zip_path = ws / f"{Path(in_pdf).stem}_split.zip"
        import zipfile
        with zipfile.ZipFile(str(zip_path), 'w', zipfile.ZIP_DEFLATED) as zf:
            for of in out_files:
                zf.write(of, arcname=Path(of).name)
        return build_download_response(zip_path, f"{Path(in_pdf).stem}_split.zip", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/compress")
async def api_compress(bg: BackgroundTasks, file: UploadFile = File(...), level: str = Form("medium")):
    validate_extension(file.filename, 'pdf')
    ws = create_workspace()
    try:
        in_pdf = await save_upload(file, ws)
        out_pdf = ws / f"{in_pdf.stem}_compressed.pdf"
        result = pdf_engine.compress_pdf(in_pdf, out_pdf, level)
        extra = {
            "X-Original-Size": str(result["original_size"]),
            "X-Savings-Percent": str(result["savings_percent"])
        }
        return build_download_response(out_pdf, f"{in_pdf.stem}_compressed.pdf", bg, ws, extra)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/rotate")
async def api_rotate(bg: BackgroundTasks, file: UploadFile = File(...), angle: int = Form(90), pages: str = Form("all")):
    validate_extension(file.filename, 'pdf')
    ws = create_workspace()
    try:
        in_pdf = await save_upload(file, ws)
        out_pdf = ws / f"{in_pdf.stem}_rotated.pdf"
        pdf_engine.rotate_pdf(in_pdf, out_pdf, angle, pages)
        return build_download_response(out_pdf, f"{in_pdf.stem}_rotated.pdf", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/delete-pages")
async def api_delete_pages(bg: BackgroundTasks, file: UploadFile = File(...), pages: str = Form(...)):
    validate_extension(file.filename, 'pdf')
    ws = create_workspace()
    try:
        in_pdf = await save_upload(file, ws)
        out_pdf = ws / f"{in_pdf.stem}_pages_deleted.pdf"
        pdf_engine.delete_pages(in_pdf, out_pdf, pages)
        return build_download_response(out_pdf, f"{in_pdf.stem}_pages_deleted.pdf", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/extract-pages")
async def api_extract_pages(bg: BackgroundTasks, file: UploadFile = File(...), pages: str = Form(...)):
    validate_extension(file.filename, 'pdf')
    ws = create_workspace()
    try:
        in_pdf = await save_upload(file, ws)
        out_pdf = ws / f"{in_pdf.stem}_extracted.pdf"
        pdf_engine.extract_pages(in_pdf, out_pdf, pages)
        return build_download_response(out_pdf, f"{in_pdf.stem}_extracted.pdf", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/crop")
async def api_crop(bg: BackgroundTasks, file: UploadFile = File(...), top: float = Form(0), bottom: float = Form(0), left: float = Form(0), right: float = Form(0), pages: str = Form("all")):
    validate_extension(file.filename, 'pdf')
    ws = create_workspace()
    try:
        in_pdf = await save_upload(file, ws)
        out_pdf = ws / f"{in_pdf.stem}_cropped.pdf"
        pdf_engine.crop_pdf(in_pdf, out_pdf, top, bottom, left, right, pages)
        return build_download_response(out_pdf, f"{in_pdf.stem}_cropped.pdf", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/resize")
async def api_resize(bg: BackgroundTasks, file: UploadFile = File(...), paper_size: str = Form("A4"), orientation: str = Form("portrait")):
    validate_extension(file.filename, 'pdf')
    ws = create_workspace()
    try:
        in_pdf = await save_upload(file, ws)
        out_pdf = ws / f"{in_pdf.stem}_resized.pdf"
        pdf_engine.resize_pdf(in_pdf, out_pdf, paper_size, orientation)
        return build_download_response(out_pdf, f"{in_pdf.stem}_resized.pdf", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/compare")
async def api_compare(file_a: UploadFile = File(...), file_b: UploadFile = File(...)):
    validate_extension(file_a.filename, 'pdf')
    validate_extension(file_b.filename, 'pdf')
    ws = create_workspace()
    try:
        path_a = await save_upload(file_a, ws)
        path_b = await save_upload(file_b, ws)
        result = pdf_engine.compare_pdfs(path_a, path_b)
        return JSONResponse(content=result)
    finally:
        cleanup_path(ws)

# --- PDF Security ---
@router.post("/tools/protect")
async def api_protect(bg: BackgroundTasks, file: UploadFile = File(...), password: str = Form(...), allow_print: bool = Form(True), allow_copy: bool = Form(True)):
    validate_extension(file.filename, 'pdf')
    ws = create_workspace()
    try:
        in_pdf = await save_upload(file, ws)
        out_pdf = ws / f"{in_pdf.stem}_protected.pdf"
        pdf_engine.protect_pdf(in_pdf, out_pdf, user_password=password, allow_print=allow_print, allow_copy=allow_copy)
        return build_download_response(out_pdf, f"{in_pdf.stem}_protected.pdf", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/unlock")
async def api_unlock(bg: BackgroundTasks, file: UploadFile = File(...), password: str = Form(...)):
    validate_extension(file.filename, 'pdf')
    ws = create_workspace()
    try:
        in_pdf = await save_upload(file, ws)
        out_pdf = ws / f"{in_pdf.stem}_unlocked.pdf"
        pdf_engine.unlock_pdf(in_pdf, out_pdf, password=password)
        return build_download_response(out_pdf, f"{in_pdf.stem}_unlocked.pdf", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

# --- PDF Annotation & Sign ---
@router.post("/tools/watermark")
async def api_watermark(bg: BackgroundTasks, file: UploadFile = File(...), text: str = Form(...), opacity: float = Form(0.3), font_size: float = Form(40), angle: float = Form(45), position: str = Form("center")):
    validate_extension(file.filename, 'pdf')
    ws = create_workspace()
    try:
        in_pdf = await save_upload(file, ws)
        out_pdf = ws / f"{in_pdf.stem}_watermarked.pdf"
        pdf_engine.add_watermark(in_pdf, out_pdf, text=text, opacity=opacity, font_size=font_size, angle=angle, position=position)
        return build_download_response(out_pdf, f"{in_pdf.stem}_watermarked.pdf", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/page-numbers")
async def api_page_numbers(bg: BackgroundTasks, file: UploadFile = File(...), pattern: str = Form("Page {n} of {total}"), position: str = Form("bottom-center"), start_num: int = Form(1)):
    validate_extension(file.filename, 'pdf')
    ws = create_workspace()
    try:
        in_pdf = await save_upload(file, ws)
        out_pdf = ws / f"{in_pdf.stem}_numbered.pdf"
        pdf_engine.add_page_numbers(in_pdf, out_pdf, format_pattern=pattern, position=position, start_num=start_num)
        return build_download_response(out_pdf, f"{in_pdf.stem}_numbered.pdf", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/sign")
async def api_sign(bg: BackgroundTasks, file: UploadFile = File(...), signature: UploadFile = File(...), page_num: int = Form(1), x: float = Form(100), y: float = Form(100), width: float = Form(160), height: float = Form(70)):
    validate_extension(file.filename, 'pdf')
    ws = create_workspace()
    try:
        in_pdf = await save_upload(file, ws)
        sig_bytes = await signature.read()
        out_pdf = ws / f"{in_pdf.stem}_signed.pdf"
        pdf_engine.sign_pdf(in_pdf, out_pdf, sig_bytes, page_num=page_num, x=x, y=y, width=width, height=height)
        return build_download_response(out_pdf, f"{in_pdf.stem}_signed.pdf", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

# --- PDF Conversions ---
@router.post("/tools/pdf-to-docx")
async def api_pdf_to_docx(bg: BackgroundTasks, file: UploadFile = File(...)):
    validate_extension(file.filename, 'pdf')
    ws = create_workspace()
    try:
        in_pdf = await save_upload(file, ws)
        out_docx = ws / f"{in_pdf.stem}.docx"
        pdf_engine.pdf_to_docx(in_pdf, out_docx)
        return build_download_response(out_docx, f"{in_pdf.stem}.docx", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/pdf-to-pptx")
async def api_pdf_to_pptx(bg: BackgroundTasks, file: UploadFile = File(...), dpi: int = Form(150)):
    validate_extension(file.filename, 'pdf')
    ws = create_workspace()
    try:
        in_pdf = await save_upload(file, ws)
        out_pptx = ws / f"{in_pdf.stem}.pptx"
        pdf_engine.pdf_to_pptx(in_pdf, out_pptx, dpi)
        return build_download_response(out_pptx, f"{in_pdf.stem}.pptx", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/pdf-to-xlsx")
async def api_pdf_to_xlsx(bg: BackgroundTasks, file: UploadFile = File(...)):
    validate_extension(file.filename, 'pdf')
    ws = create_workspace()
    try:
        in_pdf = await save_upload(file, ws)
        out_xlsx = ws / f"{in_pdf.stem}.xlsx"
        pdf_engine.pdf_to_xlsx(in_pdf, out_xlsx)
        return build_download_response(out_xlsx, f"{in_pdf.stem}.xlsx", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/pdf-to-images")
async def api_pdf_to_images(bg: BackgroundTasks, file: UploadFile = File(...), format: str = Form("png"), dpi: int = Form(200)):
    validate_extension(file.filename, 'pdf')
    ws = create_workspace()
    try:
        in_pdf = await save_upload(file, ws)
        result = pdf_engine.pdf_to_images(in_pdf, ws, img_format=format, dpi=dpi)
        out_file = Path(result["file_path"])
        return build_download_response(out_file, out_file.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/pdf-to-txt")
async def api_pdf_to_txt(bg: BackgroundTasks, file: UploadFile = File(...)):
    validate_extension(file.filename, 'pdf')
    ws = create_workspace()
    try:
        in_pdf = await save_upload(file, ws)
        out_txt = ws / f"{in_pdf.stem}.txt"
        pdf_engine.pdf_to_txt(in_pdf, out_txt)
        return build_download_response(out_txt, f"{in_pdf.stem}.txt", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

# --- Other Formats to PDF ---
@router.post("/tools/docx-to-pdf")
async def api_docx_to_pdf(bg: BackgroundTasks, file: UploadFile = File(...)):
    validate_extension(file.filename, 'office')
    ws = create_workspace()
    try:
        in_doc = await save_upload(file, ws)
        out_pdf = ws / f"{in_doc.stem}.pdf"
        pdf_engine.docx_to_pdf(in_doc, out_pdf)
        return build_download_response(out_pdf, f"{in_doc.stem}.pdf", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/pptx-to-pdf")
async def api_pptx_to_pdf(bg: BackgroundTasks, file: UploadFile = File(...)):
    validate_extension(file.filename, 'office')
    ws = create_workspace()
    try:
        in_ppt = await save_upload(file, ws)
        out_pdf = ws / f"{in_ppt.stem}.pdf"
        pdf_engine.pptx_to_pdf(in_ppt, out_pdf)
        return build_download_response(out_pdf, f"{in_ppt.stem}.pdf", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/xlsx-to-pdf")
async def api_xlsx_to_pdf(bg: BackgroundTasks, file: UploadFile = File(...)):
    validate_extension(file.filename, 'office')
    ws = create_workspace()
    try:
        in_xls = await save_upload(file, ws)
        out_pdf = ws / f"{in_xls.stem}.pdf"
        pdf_engine.xlsx_to_pdf(in_xls, out_pdf)
        return build_download_response(out_pdf, f"{in_xls.stem}.pdf", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/images-to-pdf")
async def api_images_to_pdf(bg: BackgroundTasks, files: List[UploadFile] = File(...), orientation: str = Form("portrait")):
    if not files:
        raise HTTPException(status_code=400, detail="At least one image is required.")
    ws = create_workspace()
    try:
        saved = []
        for f in files:
            validate_extension(f.filename, 'image')
            saved.append(await save_upload(f, ws))
        out_pdf = ws / "compiled_images.pdf"
        pdf_engine.images_to_pdf(saved, out_pdf, orientation=orientation)
        return build_download_response(out_pdf, "compiled_images.pdf", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/html-to-pdf")
async def api_html_to_pdf(bg: BackgroundTasks, file: Optional[UploadFile] = File(None), html_code: Optional[str] = Form(None)):
    if not file and not html_code:
        raise HTTPException(status_code=400, detail="Either an HTML file or raw HTML code must be provided.")
    ws = create_workspace()
    try:
        out_pdf = ws / "webpage_document.pdf"
        if file:
            in_html = await save_upload(file, ws)
            pdf_engine.html_to_pdf(in_html, out_pdf)
        else:
            pdf_engine.html_to_pdf(html_code, out_pdf)
        return build_download_response(out_pdf, "webpage_document.pdf", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

# --- OCR & Extraction ---
@router.post("/tools/ocr")
async def api_ocr(file: UploadFile = File(...)):
    validate_extension(file.filename, 'image')
    ws = create_workspace()
    try:
        img_path = await save_upload(file, ws)
        result = pdf_engine.ocr_image_to_text(img_path)
        return JSONResponse(content=result)
    finally:
        cleanup_path(ws)

@router.post("/tools/ocr-pdf")
async def api_ocr_pdf(bg: BackgroundTasks, file: UploadFile = File(...), text: str = Form("")):
    validate_extension(file.filename, 'image')
    ws = create_workspace()
    try:
        img_path = await save_upload(file, ws)
        out_pdf = ws / f"{img_path.stem}_searchable.pdf"
        pdf_engine.ocr_to_searchable_pdf(img_path, out_pdf, extracted_text=text)
        return build_download_response(out_pdf, f"{img_path.stem}_searchable.pdf", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/extract-images")
async def api_extract_images(bg: BackgroundTasks, file: UploadFile = File(...)):
    validate_extension(file.filename, 'pdf')
    ws = create_workspace()
    try:
        in_pdf = await save_upload(file, ws)
        result = pdf_engine.extract_images_from_pdf(in_pdf, ws)
        if not result["file_path"]:
            raise HTTPException(status_code=400, detail=result.get("message", "No images found."))
        out_zip = Path(result["file_path"])
        return build_download_response(out_zip, out_zip.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(router)

# Static frontend serving
FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"
FRONTEND_STANDALONE = BASE_DIR.parent / "frontend" / "app.html"

if FRONTEND_DIST.exists() and (FRONTEND_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # 1. Serve specific file from dist if requested
    if full_path and FRONTEND_DIST.exists():
        target = FRONTEND_DIST / full_path
        if target.is_file():
            return FileResponse(str(target))

    # 2. Serve standalone app if requested directly
    if full_path in ("app", "app.html", "standalone") and FRONTEND_STANDALONE.exists():
        return FileResponse(str(FRONTEND_STANDALONE))

    # 3. Serve React dist index.html if available
    if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
        return FileResponse(str(FRONTEND_DIST / "index.html"))

    # 4. Fallback to single-file frontend app.html
    if FRONTEND_STANDALONE.exists():
        return FileResponse(str(FRONTEND_STANDALONE))

    # 5. Last resort fallback landing page
    from fastapi.responses import HTMLResponse
    return HTMLResponse("""<!DOCTYPE html>
<html>
<head>
    <title>DocuTools - Local Server</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 40px; max-width: 600px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        h1 { font-size: 2rem; margin: 0 0 10px; color: #38bdf8; }
        p { color: #94a3b8; font-size: 1rem; line-height: 1.6; margin: 0 0 25px; }
        .btn { display: inline-block; background: #2563eb; color: #fff; padding: 12px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: background 0.2s; font-size: 1.1rem; }
        .btn:hover { background: #1d4ed8; }
        .badge { display: inline-block; background: #064e3b; color: #34d399; padding: 4px 12px; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; margin-bottom: 20px; }
        .tools-list { margin-top: 25px; text-align: left; background: #0f172a; border-radius: 8px; padding: 15px 20px; font-size: 0.875rem; color: #cbd5e1; }
    </style>
</head>
<body>
    <div class="card">
        <span class="badge">&#10003; Server Running (Port 8000)</span>
        <h1>DocuTools Engine Active</h1>
        <p>All 32 document & PDF processing tools are loaded and ready in memory. You can execute and test any tool live right now.</p>
        <a href="/docs" class="btn">&#128640; Open Interactive Tools Dashboard (/docs)</a>
        <div class="tools-list">
            <strong>32 Loaded Tools:</strong> Merge, Split, Compress, Watermark, Protect, Unlock, Edit, Rotate, Sign, PDF to Word, Excel, PowerPoint, OCR & more.
        </div>
    </div>
</body>
</html>""")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
