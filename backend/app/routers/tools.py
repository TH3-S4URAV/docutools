import os
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse

from app.core.security import sanitize_filename, create_workspace, validate_file_size, validate_extension
from app.core.cleanup import cleanup_path
from app.services.pdf_organize import (
    merge_pdfs, split_pdf, compress_pdf, rotate_pdf, delete_pages,
    extract_pages, crop_pdf, resize_pdf, compare_pdfs
)
from app.services.pdf_security import protect_pdf, unlock_pdf
from app.services.pdf_annotate import add_watermark, add_page_numbers, sign_pdf
from app.services.pdf_convert import (
    pdf_to_docx, pdf_to_pptx, pdf_to_xlsx, pdf_to_images, pdf_to_txt
)
from app.services.to_pdf import (
    docx_to_pdf, pptx_to_pdf, xlsx_to_pdf, images_to_pdf, html_to_pdf
)
from app.services.ocr_service import ocr_image_to_text, ocr_to_searchable_pdf
from app.services.pdf_extra import extract_images_from_pdf

router = APIRouter(prefix="/tools", tags=["Tools"])

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

# ----------------- PDF ORGANIZE & EDIT -----------------

@router.post("/merge")
async def api_merge(bg: BackgroundTasks, files: List[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least two PDF files are required to merge.")
    ws = create_workspace()
    try:
        saved_paths = []
        for f in files:
            validate_extension(f.filename, "pdf")
            saved_paths.append(await save_upload(f, ws))

        out_path = ws / "merged_document.pdf"
        merge_pdfs(saved_paths, out_path)
        return build_download_response(out_path, "merged_document.pdf", bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"PDF merge failed: {str(e)}")

@router.post("/split")
async def api_split(
    bg: BackgroundTasks,
    file: UploadFile = File(...),
    ranges: str = Form(""),
    mode: str = Form("ranges")
):
    validate_extension(file.filename, "pdf")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_dir = ws / "split_output"
        created_files = split_pdf(in_path, ranges, out_dir, mode=mode)
        if not created_files:
            raise HTTPException(status_code=400, detail="No pages matched the specified range.")

        if len(created_files) == 1:
            out_file = Path(created_files[0])
            return build_download_response(out_file, out_file.name, bg, ws)
        else:
            # Create zip of all split files
            import zipfile
            zip_path = ws / f"{in_path.stem}_split_pages.zip"
            with zipfile.ZipFile(str(zip_path), 'w', zipfile.ZIP_DEFLATED) as zf:
                for cf in created_files:
                    zf.write(cf, arcname=Path(cf).name)
            return build_download_response(zip_path, zip_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"PDF split failed: {str(e)}")

@router.post("/compress")
async def api_compress(
    bg: BackgroundTasks,
    file: UploadFile = File(...),
    level: str = Form("medium")
):
    validate_extension(file.filename, "pdf")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_path = ws / f"compressed_{in_path.name}"
        stats = compress_pdf(in_path, out_path, level=level)
        extra = {
            "X-Original-Size": str(stats["original_size"]),
            "X-Result-Size": str(stats["compressed_size"]),
            "X-Savings-Percent": str(stats["savings_percent"])
        }
        return build_download_response(out_path, out_path.name, bg, ws, extra_headers=extra)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Compression failed: {str(e)}")

@router.post("/rotate")
async def api_rotate(
    bg: BackgroundTasks,
    file: UploadFile = File(...),
    angle: int = Form(90),
    pages: str = Form("all")
):
    validate_extension(file.filename, "pdf")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_path = ws / f"rotated_{in_path.name}"
        rotate_pdf(in_path, out_path, angle=angle, pages=pages)
        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Rotation failed: {str(e)}")

@router.post("/delete-pages")
async def api_delete_pages(
    bg: BackgroundTasks,
    file: UploadFile = File(...),
    pages: str = Form(...)
):
    validate_extension(file.filename, "pdf")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_path = ws / f"cleaned_{in_path.name}"
        delete_pages(in_path, out_path, pages)
        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Failed to delete pages: {str(e)}")

@router.post("/extract-pages")
async def api_extract_pages(
    bg: BackgroundTasks,
    file: UploadFile = File(...),
    pages: str = Form(...)
):
    validate_extension(file.filename, "pdf")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_path = ws / f"extracted_{in_path.name}"
        extract_pages(in_path, out_path, pages)
        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Failed to extract pages: {str(e)}")

@router.post("/crop")
async def api_crop(
    bg: BackgroundTasks,
    file: UploadFile = File(...),
    top: float = Form(0),
    bottom: float = Form(0),
    left: float = Form(0),
    right: float = Form(0),
    pages: str = Form("all")
):
    validate_extension(file.filename, "pdf")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_path = ws / f"cropped_{in_path.name}"
        crop_pdf(in_path, out_path, top=top, bottom=bottom, left=left, right=right, pages=pages)
        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Cropping failed: {str(e)}")

@router.post("/resize")
async def api_resize(
    bg: BackgroundTasks,
    file: UploadFile = File(...),
    paper_size: str = Form("A4"),
    orientation: str = Form("portrait")
):
    validate_extension(file.filename, "pdf")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_path = ws / f"resized_{in_path.name}"
        resize_pdf(in_path, out_path, paper_size=paper_size, orientation=orientation)
        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Resizing failed: {str(e)}")

@router.post("/compare")
async def api_compare(
    bg: BackgroundTasks,
    file_a: UploadFile = File(...),
    file_b: UploadFile = File(...)
):
    validate_extension(file_a.filename, "pdf")
    validate_extension(file_b.filename, "pdf")
    ws = create_workspace()
    try:
        path_a = await save_upload(file_a, ws)
        path_b = await save_upload(file_b, ws)
        comparison = compare_pdfs(path_a, path_b)
        cleanup_path(ws)
        return JSONResponse(content=comparison)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")

# ----------------- PDF SECURITY -----------------

@router.post("/protect")
async def api_protect(
    bg: BackgroundTasks,
    file: UploadFile = File(...),
    password: str = Form(...),
    allow_print: bool = Form(True),
    allow_copy: bool = Form(True)
):
    validate_extension(file.filename, "pdf")
    if not password.strip():
        raise HTTPException(status_code=400, detail="Password cannot be empty.")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_path = ws / f"protected_{in_path.name}"
        protect_pdf(in_path, out_path, password, allow_print=allow_print, allow_copy=allow_copy)
        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"PDF protection failed: {str(e)}")

@router.post("/unlock")
async def api_unlock(
    bg: BackgroundTasks,
    file: UploadFile = File(...),
    password: str = Form(...)
):
    validate_extension(file.filename, "pdf")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_path = ws / f"unlocked_{in_path.name}"
        unlock_pdf(in_path, out_path, password)
        return build_download_response(out_path, out_path.name, bg, ws)
    except ValueError as ve:
        cleanup_path(ws)
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"PDF unlock failed: {str(e)}")

# ----------------- PDF ANNOTATION / SIGN -----------------

@router.post("/watermark")
async def api_watermark(
    bg: BackgroundTasks,
    file: UploadFile = File(...),
    text: str = Form(...),
    opacity: float = Form(0.3),
    font_size: float = Form(40),
    angle: float = Form(45),
    position: str = Form("center")
):
    validate_extension(file.filename, "pdf")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_path = ws / f"watermarked_{in_path.name}"
        add_watermark(in_path, out_path, text=text, opacity=opacity, font_size=font_size, angle=angle, position=position)
        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Adding watermark failed: {str(e)}")

@router.post("/page-numbers")
async def api_page_numbers(
    bg: BackgroundTasks,
    file: UploadFile = File(...),
    format_pattern: str = Form("Page {n} of {total}"),
    position: str = Form("bottom-center"),
    start_num: int = Form(1)
):
    validate_extension(file.filename, "pdf")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_path = ws / f"numbered_{in_path.name}"
        add_page_numbers(in_path, out_path, format_pattern=format_pattern, position=position, start_num=start_num)
        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Adding page numbers failed: {str(e)}")

@router.post("/sign")
async def api_sign(
    bg: BackgroundTasks,
    file: UploadFile = File(...),
    signature: UploadFile = File(...),
    page_num: int = Form(1),
    x: float = Form(100),
    y: float = Form(100),
    width: float = Form(160),
    height: float = Form(70)
):
    validate_extension(file.filename, "pdf")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        sig_bytes = await signature.read()
        out_path = ws / f"signed_{in_path.name}"
        sign_pdf(in_path, out_path, sig_bytes, page_num=page_num, x=x, y=y, width=width, height=height)
        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Signing PDF failed: {str(e)}")

# ----------------- PDF CONVERSIONS -----------------

@router.post("/pdf-to-docx")
async def api_pdf_to_docx(bg: BackgroundTasks, file: UploadFile = File(...)):
    validate_extension(file.filename, "pdf")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_path = ws / f"{in_path.stem}.docx"
        pdf_to_docx(in_path, out_path)
        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Conversion to Word failed: {str(e)}")

@router.post("/pdf-to-pptx")
async def api_pdf_to_pptx(bg: BackgroundTasks, file: UploadFile = File(...)):
    validate_extension(file.filename, "pdf")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_path = ws / f"{in_path.stem}.pptx"
        pdf_to_pptx(in_path, out_path)
        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Conversion to PowerPoint failed: {str(e)}")

@router.post("/pdf-to-xlsx")
async def api_pdf_to_xlsx(bg: BackgroundTasks, file: UploadFile = File(...)):
    validate_extension(file.filename, "pdf")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_path = ws / f"{in_path.stem}.xlsx"
        pdf_to_xlsx(in_path, out_path)
        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Conversion to Excel failed: {str(e)}")

@router.post("/pdf-to-images")
async def api_pdf_to_images(
    bg: BackgroundTasks,
    file: UploadFile = File(...),
    format: str = Form("png"),
    dpi: int = Form(200)
):
    validate_extension(file.filename, "pdf")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        res = pdf_to_images(in_path, ws, img_format=format, dpi=dpi)
        out_file = Path(res["file_path"])
        return build_download_response(out_file, out_file.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Image conversion failed: {str(e)}")

@router.post("/pdf-to-txt")
async def api_pdf_to_txt(bg: BackgroundTasks, file: UploadFile = File(...)):
    validate_extension(file.filename, "pdf")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_path = ws / f"{in_path.stem}.txt"
        pdf_to_txt(in_path, out_path)
        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")

# ----------------- OTHER -> PDF -----------------

@router.post("/docx-to-pdf")
async def api_docx_to_pdf(bg: BackgroundTasks, file: UploadFile = File(...)):
    validate_extension(file.filename, "office")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_path = ws / f"{in_path.stem}.pdf"
        docx_to_pdf(in_path, out_path)
        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Word to PDF conversion failed: {str(e)}")

@router.post("/pptx-to-pdf")
async def api_pptx_to_pdf(bg: BackgroundTasks, file: UploadFile = File(...)):
    validate_extension(file.filename, "office")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_path = ws / f"{in_path.stem}.pdf"
        pptx_to_pdf(in_path, out_path)
        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"PowerPoint to PDF conversion failed: {str(e)}")

@router.post("/xlsx-to-pdf")
async def api_xlsx_to_pdf(bg: BackgroundTasks, file: UploadFile = File(...)):
    validate_extension(file.filename, "office")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_path = ws / f"{in_path.stem}.pdf"
        xlsx_to_pdf(in_path, out_path)
        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Excel to PDF conversion failed: {str(e)}")

@router.post("/images-to-pdf")
async def api_images_to_pdf(
    bg: BackgroundTasks,
    files: List[UploadFile] = File(...),
    orientation: str = Form("portrait"),
    margin: float = Form(20.0)
):
    if not files:
        raise HTTPException(status_code=400, detail="At least one image is required.")
    ws = create_workspace()
    try:
        saved_paths = []
        for f in files:
            validate_extension(f.filename, "image")
            saved_paths.append(await save_upload(f, ws))

        out_path = ws / "compiled_images.pdf"
        images_to_pdf(saved_paths, out_path, orientation=orientation, margin=margin)
        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Image to PDF conversion failed: {str(e)}")

@router.post("/html-to-pdf")
async def api_html_to_pdf(
    bg: BackgroundTasks,
    file: Optional[UploadFile] = File(None),
    html_content: Optional[str] = Form(None)
):
    ws = create_workspace()
    try:
        if file:
            in_path = await save_upload(file, ws)
            out_path = ws / f"{in_path.stem}.pdf"
            html_to_pdf(in_path, out_path)
        elif html_content and html_content.strip():
            out_path = ws / "rendered_document.pdf"
            html_to_pdf(html_content, out_path)
        else:
            raise HTTPException(status_code=400, detail="Either an HTML file or html_content string is required.")

        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"HTML to PDF failed: {str(e)}")

# ----------------- OCR & EXTRA -----------------

@router.post("/ocr")
async def api_ocr(file: UploadFile = File(...)):
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        res = ocr_image_to_text(in_path)
        cleanup_path(ws)
        return JSONResponse(content=res)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")

@router.post("/ocr-to-pdf")
async def api_ocr_to_pdf(
    bg: BackgroundTasks,
    file: UploadFile = File(...),
    extracted_text: str = Form("")
):
    validate_extension(file.filename, "image")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        out_path = ws / f"searchable_{in_path.stem}.pdf"
        ocr_to_searchable_pdf(in_path, out_path, extracted_text=extracted_text)
        return build_download_response(out_path, out_path.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Searchable PDF generation failed: {str(e)}")

@router.post("/extract-images")
async def api_extract_images(bg: BackgroundTasks, file: UploadFile = File(...)):
    validate_extension(file.filename, "pdf")
    ws = create_workspace()
    try:
        in_path = await save_upload(file, ws)
        res = extract_images_from_pdf(in_path, ws)
        if not res.get("file_path"):
            cleanup_path(ws)
            return JSONResponse(content={"message": res.get("message", "No embedded images found.")})

        zip_file = Path(res["file_path"])
        return build_download_response(zip_file, zip_file.name, bg, ws)
    except Exception as e:
        cleanup_path(ws)
        raise HTTPException(status_code=500, detail=f"Image extraction failed: {str(e)}")
