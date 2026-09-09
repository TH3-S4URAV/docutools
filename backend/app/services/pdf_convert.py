import io
import zipfile
from pathlib import Path
from typing import Union, List, Dict, Any
import pymupdf
import pdfplumber
import openpyxl
from pptx import Presentation
from pptx.util import Inches, Pt
from pdf2docx import Converter

def pdf_to_docx(file_path: Union[str, Path], output_path: Union[str, Path]) -> str:
    """Convert PDF to Word DOCX preserving layouts, tables, and images."""
    cv = Converter(str(file_path))
    try:
        cv.convert(str(output_path), start=0, end=None)
        return str(output_path)
    finally:
        cv.close()

def pdf_to_pptx(file_path: Union[str, Path], output_path: Union[str, Path], dpi: int = 150) -> str:
    """Convert PDF pages into PowerPoint presentation slides."""
    doc = pymupdf.open(str(file_path))
    prs = Presentation()
    
    # Remove default empty slide
    prs.slides._sldIdLst.clear()

    try:
        zoom = dpi / 72.0
        mat = pymupdf.Matrix(zoom, zoom)

        for page in doc:
            # Set slide width and height to match PDF page aspect ratio
            rect = page.rect
            prs.slide_width = Inches(rect.width / 72.0)
            prs.slide_height = Inches(rect.height / 72.0)

            blank_layout = prs.slide_layouts[6]
            slide = prs.slides.add_slide(blank_layout)

            pix = page.get_pixmap(matrix=mat, alpha=False)
            img_bytes = pix.tobytes("png")

            img_stream = io.BytesIO(img_bytes)
            slide.shapes.add_picture(img_stream, Inches(0), Inches(0), prs.slide_width, prs.slide_height)

        prs.save(str(output_path))
        return str(output_path)
    finally:
        doc.close()

def pdf_to_xlsx(file_path: Union[str, Path], output_path: Union[str, Path]) -> str:
    """Extract tables and tabular data from PDF into an Excel workbook."""
    wb = openpyxl.Workbook()
    # Remove default sheet
    wb.remove(wb.active)

    with pdfplumber.open(str(file_path)) as pdf:
        has_content = False
        for page_idx, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            ws = wb.create_sheet(title=f"Page_{page_idx + 1}")
            row_cursor = 1

            if tables:
                for table in tables:
                    for row in table:
                        for col_idx, cell_value in enumerate(row):
                            ws.cell(row=row_cursor, column=col_idx + 1, value=str(cell_value or ""))
                        row_cursor += 1
                    row_cursor += 1  # Blank row between tables
                has_content = True
            else:
                # If no formal table detected, extract plain text lines as tabular rows
                text = page.extract_text()
                if text:
                    for line in text.splitlines():
                        ws.cell(row=row_cursor, column=1, value=line)
                        row_cursor += 1
                    has_content = True

        if not has_content:
            ws = wb.create_sheet(title="Content")
            ws.cell(row=1, column=1, value="No text or tabular data found in PDF.")

    wb.save(str(output_path))
    return str(output_path)

def pdf_to_images(file_path: Union[str, Path], output_dir: Union[str, Path],
                  img_format: str = "png", dpi: int = 200) -> Dict[str, Any]:
    """Render PDF pages to PNG or JPG images. Returns single image path or zip archive path."""
    doc = pymupdf.open(str(file_path))
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    base_stem = Path(file_path).stem
    total_pages = len(doc)
    image_paths = []

    try:
        zoom = dpi / 72.0
        mat = pymupdf.Matrix(zoom, zoom)
        ext = "jpg" if img_format.lower() in ["jpg", "jpeg"] else "png"

        for idx, page in enumerate(doc):
            pix = page.get_pixmap(matrix=mat, alpha=(ext == "png"))
            img_file = out_dir / f"{base_stem}_page_{idx + 1}.{ext}"
            if ext == "jpg":
                pix.save(str(img_file), jpg_quality=92)
            else:
                pix.save(str(img_file))
            image_paths.append(str(img_file))

        if total_pages == 1:
            return {"file_path": image_paths[0], "is_zip": False, "pages": 1}

        # Multiple pages: package into ZIP
        zip_path = out_dir / f"{base_stem}_images.zip"
        with zipfile.ZipFile(str(zip_path), 'w', zipfile.ZIP_DEFLATED) as zf:
            for ip in image_paths:
                zf.write(ip, arcname=Path(ip).name)

        return {"file_path": str(zip_path), "is_zip": True, "pages": total_pages}
    finally:
        doc.close()

def pdf_to_txt(file_path: Union[str, Path], output_path: Union[str, Path]) -> str:
    """Extract clean structured text from PDF."""
    doc = pymupdf.open(str(file_path))
    try:
        parts = []
        for idx, page in enumerate(doc):
            text = page.get_text("text")
            parts.append(f"--- [Page {idx + 1}] ---\n{text}\n")
        
        full_text = "\n".join(parts)
        with open(str(output_path), 'w', encoding='utf-8') as f:
            f.write(full_text)
        return str(output_path)
    finally:
        doc.close()
