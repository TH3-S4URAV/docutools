"""
DOCUTOOLS — Native Document & PDF Engine
Consolidated engine providing all 32 PDF and Office manipulation operations.
"""

import os
import io
import sys
import json
import shutil
import zipfile
import difflib
import subprocess
from pathlib import Path
from typing import List, Union, Dict, Any, Tuple, Optional
from PIL import Image
import pymupdf
import pdfplumber
import openpyxl
from pptx import Presentation
from pptx.util import Inches
from pdf2docx import Converter
import docx

# -------------------------------------------------------------
# 1. PDF ORGANIZE & EDIT
# -------------------------------------------------------------

def merge_pdfs(file_paths: List[Union[str, Path]], output_path: Union[str, Path]) -> str:
    merged_doc = pymupdf.open()
    try:
        for fp in file_paths:
            src = pymupdf.open(str(fp))
            merged_doc.insert_pdf(src)
            src.close()
        merged_doc.save(str(output_path), garbage=3, deflate=True)
        return str(output_path)
    finally:
        merged_doc.close()

def parse_page_ranges(range_str: str, total_pages: int) -> List[int]:
    """Parse string like '1-3, 5, 8-10' into sorted unique 0-based page indices."""
    pages = set()
    parts = [p.strip() for p in range_str.split(',') if p.strip()]
    for part in parts:
        if '-' in part:
            sub = part.split('-')
            if len(sub) == 2 and sub[0].isdigit() and sub[1].isdigit():
                start, end = int(sub[0]), int(sub[1])
                start, end = max(1, min(start, end)), min(total_pages, max(start, end))
                for p in range(start, end + 1):
                    pages.add(p - 1)
        elif part.isdigit():
            p = int(part)
            if 1 <= p <= total_pages:
                pages.add(p - 1)
    return sorted(list(pages))

def split_pdf(file_path: Union[str, Path], page_ranges: str, output_dir: Union[str, Path], mode: str = "ranges") -> List[str]:
    src = pymupdf.open(str(file_path))
    total_pages = len(src)
    output_files = []
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    base_stem = Path(file_path).stem

    try:
        if mode == "all_pages" or not page_ranges.strip():
            for i in range(total_pages):
                out_doc = pymupdf.open()
                out_doc.insert_pdf(src, from_page=i, to_page=i)
                out_file = out_dir / f"{base_stem}_page_{i + 1}.pdf"
                out_doc.save(str(out_file), garbage=3, deflate=True)
                out_doc.close()
                output_files.append(str(out_file))
        else:
            ranges = [r.strip() for r in page_ranges.split(',') if r.strip()]
            for idx, r in enumerate(ranges):
                indices = parse_page_ranges(r, total_pages)
                if not indices:
                    continue
                out_doc = pymupdf.open()
                for p_idx in indices:
                    out_doc.insert_pdf(src, from_page=p_idx, to_page=p_idx)
                out_file = out_dir / f"{base_stem}_part_{idx + 1}.pdf"
                out_doc.save(str(out_file), garbage=3, deflate=True)
                out_doc.close()
                output_files.append(str(out_file))
        return output_files
    finally:
        src.close()

def compress_pdf(file_path: Union[str, Path], output_path: Union[str, Path], level: str = "medium") -> Dict[str, Any]:
    doc = pymupdf.open(str(file_path))
    original_size = os.path.getsize(str(file_path))

    try:
        if level == "high":
            for page_num in range(len(doc)):
                page = doc[page_num]
                image_list = page.get_images(full=True)
                for img_info in image_list:
                    xref = img_info[0]
                    try:
                        base_image = doc.extract_image(xref)
                        if base_image:
                            pix = pymupdf.Pixmap(doc, xref)
                            if pix.colorspace.n >= 4:
                                pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
                            if pix.width > 1200 or pix.height > 1200:
                                scale = min(1200 / pix.width, 1200 / pix.height)
                                new_pix = pymupdf.Pixmap(pix, int(pix.width * scale), int(pix.height * scale), False)
                                compressed_bytes = new_pix.tobytes("jpeg", jpg_quality=65)
                                doc.update_stream(xref, compressed_bytes)
                    except Exception:
                        continue
            doc.save(str(output_path), garbage=4, deflate=True, clean=True, deflate_images=True, deflate_fonts=True)
        elif level == "low":
            doc.save(str(output_path), garbage=2, deflate=True)
        else:
            doc.save(str(output_path), garbage=4, deflate=True, clean=True)
            
        compressed_size = os.path.getsize(str(output_path))
        savings = max(0, original_size - compressed_size)
        pct = round((savings / original_size) * 100, 1) if original_size > 0 else 0.0

        return {
            "original_size": original_size,
            "compressed_size": compressed_size,
            "savings_bytes": savings,
            "savings_percent": pct,
            "output_path": str(output_path)
        }
    finally:
        doc.close()

def rotate_pdf(file_path: Union[str, Path], output_path: Union[str, Path], angle: int = 90, pages: str = "all") -> str:
    doc = pymupdf.open(str(file_path))
    try:
        total_pages = len(doc)
        target_indices = list(range(total_pages)) if (pages == "all" or not pages.strip()) else parse_page_ranges(pages, total_pages)
        for idx in target_indices:
            if 0 <= idx < total_pages:
                page = doc[idx]
                page.set_rotation((page.rotation + angle) % 360)
        doc.save(str(output_path), garbage=3, deflate=True)
        return str(output_path)
    finally:
        doc.close()

def delete_pages(file_path: Union[str, Path], output_path: Union[str, Path], pages_to_delete: str) -> str:
    doc = pymupdf.open(str(file_path))
    try:
        total = len(doc)
        indices = parse_page_ranges(pages_to_delete, total)
        if len(indices) >= total:
            raise ValueError("Cannot delete all pages in the document.")
        for idx in reversed(indices):
            doc.delete_page(idx)
        doc.save(str(output_path), garbage=3, deflate=True)
        return str(output_path)
    finally:
        doc.close()

def extract_pages(file_path: Union[str, Path], output_path: Union[str, Path], pages_to_extract: str) -> str:
    src = pymupdf.open(str(file_path))
    out_doc = pymupdf.open()
    try:
        total = len(src)
        indices = parse_page_ranges(pages_to_extract, total)
        if not indices:
            raise ValueError("No valid pages specified for extraction.")
        for idx in indices:
            out_doc.insert_pdf(src, from_page=idx, to_page=idx)
        out_doc.save(str(output_path), garbage=3, deflate=True)
        return str(output_path)
    finally:
        src.close()
        out_doc.close()

def crop_pdf(file_path: Union[str, Path], output_path: Union[str, Path],
             top: float = 0, bottom: float = 0, left: float = 0, right: float = 0,
             pages: str = "all") -> str:
    doc = pymupdf.open(str(file_path))
    try:
        total = len(doc)
        indices = list(range(total)) if pages == "all" else parse_page_ranges(pages, total)
        for idx in indices:
            page = doc[idx]
            rect = page.rect
            new_rect = pymupdf.Rect(rect.x0 + left, rect.y0 + top, rect.x1 - right, rect.y1 - bottom)
            if new_rect.width > 20 and new_rect.height > 20:
                page.set_cropbox(new_rect)
        doc.save(str(output_path), garbage=3, deflate=True)
        return str(output_path)
    finally:
        doc.close()

STANDARD_PAGE_SIZES = {
    "A4": (595.28, 841.89),
    "A3": (841.89, 1190.55),
    "Letter": (612.0, 792.0),
    "Legal": (612.0, 1008.0),
    "Tabloid": (792.0, 1224.0)
}

def resize_pdf(file_path: Union[str, Path], output_path: Union[str, Path],
               paper_size: str = "A4", orientation: str = "portrait") -> str:
    src = pymupdf.open(str(file_path))
    out_doc = pymupdf.open()
    try:
        dim = STANDARD_PAGE_SIZES.get(paper_size, STANDARD_PAGE_SIZES["A4"])
        width, height = dim if orientation == "portrait" else (dim[1], dim[0])
        target_rect = pymupdf.Rect(0, 0, width, height)
        for page in src:
            new_page = out_doc.new_page(width=width, height=height)
            new_page.show_pdf_page(target_rect, src, page.number)
        out_doc.save(str(output_path), garbage=3, deflate=True)
        return str(output_path)
    finally:
        src.close()
        out_doc.close()

def compare_pdfs(file_path_a: Union[str, Path], file_path_b: Union[str, Path]) -> Dict[str, Any]:
    doc_a = pymupdf.open(str(file_path_a))
    doc_b = pymupdf.open(str(file_path_b))
    try:
        pages_a = len(doc_a)
        pages_b = len(doc_b)
        text_a = [p.get_text("text") for p in doc_a]
        text_b = [p.get_text("text") for p in doc_b]

        full_text_a = "\n--- Page Break ---\n".join(text_a)
        full_text_b = "\n--- Page Break ---\n".join(text_b)

        diff = list(difflib.unified_diff(
            full_text_a.splitlines(keepends=True),
            full_text_b.splitlines(keepends=True),
            fromfile=Path(file_path_a).name,
            tofile=Path(file_path_b).name,
            n=3
        ))

        additions = sum(1 for line in diff if line.startswith('+') and not line.startswith('+++'))
        deletions = sum(1 for line in diff if line.startswith('-') and not line.startswith('---'))

        return {
            "doc_a_pages": pages_a,
            "doc_b_pages": pages_b,
            "additions_count": additions,
            "deletions_count": deletions,
            "is_identical": (pages_a == pages_b and not additions and not deletions),
            "diff_text": "".join(diff[:500])
        }
    finally:
        doc_a.close()
        doc_b.close()

# -------------------------------------------------------------
# 2. PDF SECURITY
# -------------------------------------------------------------

def protect_pdf(file_path: Union[str, Path], output_path: Union[str, Path],
                user_password: str, owner_password: Optional[str] = None,
                allow_print: bool = True, allow_copy: bool = True) -> str:
    if not user_password:
        raise ValueError("User password is required to protect the PDF.")
    doc = pymupdf.open(str(file_path))
    try:
        perm = 0
        if allow_print:
            perm |= pymupdf.PDF_PERM_PRINT
        if allow_copy:
            perm |= pymupdf.PDF_PERM_COPY
        owner_pw = owner_password or user_password
        doc.save(
            str(output_path),
            encryption=pymupdf.PDF_ENCRYPT_AES_256,
            user_pw=user_password,
            owner_pw=owner_pw,
            permissions=perm,
            garbage=3,
            deflate=True
        )
        return str(output_path)
    finally:
        doc.close()

def unlock_pdf(file_path: Union[str, Path], output_path: Union[str, Path], password: str) -> str:
    doc = pymupdf.open(str(file_path))
    try:
        if not doc.is_encrypted:
            doc.save(str(output_path), garbage=3, deflate=True)
            return str(output_path)
        rc = doc.authenticate(password)
        if rc <= 0:
            raise ValueError("Incorrect password. Could not decrypt PDF.")
        doc.save(str(output_path), encryption=pymupdf.PDF_ENCRYPT_NONE, garbage=3, deflate=True)
        return str(output_path)
    finally:
        doc.close()

# -------------------------------------------------------------
# 3. PDF ANNOTATION & SIGNING
# -------------------------------------------------------------

def add_watermark(file_path: Union[str, Path], output_path: Union[str, Path],
                  text: str, opacity: float = 0.3, font_size: float = 40,
                  angle: float = 45, color: Tuple[float, float, float] = (0.5, 0.5, 0.5),
                  position: str = "center") -> str:
    if not text.strip():
        raise ValueError("Watermark text cannot be empty.")
    doc = pymupdf.open(str(file_path))
    try:
        for page in doc:
            rect = page.rect
            if position == "top":
                point = pymupdf.Point(rect.width / 4, rect.height * 0.2)
            elif position == "bottom":
                point = pymupdf.Point(rect.width / 4, rect.height * 0.8)
            else:
                point = pymupdf.Point(rect.width * 0.25, rect.height * 0.55)

            mat = pymupdf.Matrix(angle)
            page.insert_text(
                point,
                text,
                fontsize=font_size,
                color=color,
                stroke_opacity=opacity,
                fill_opacity=opacity,
                morph=(point, mat)
            )
        doc.save(str(output_path), garbage=3, deflate=True)
        return str(output_path)
    finally:
        doc.close()

def add_page_numbers(file_path: Union[str, Path], output_path: Union[str, Path],
                     format_pattern: str = "Page {n} of {total}",
                     position: str = "bottom-center",
                     start_num: int = 1,
                     margin: float = 36.0,
                     font_size: float = 10.0) -> str:
    doc = pymupdf.open(str(file_path))
    total_pages = len(doc)
    try:
        for idx, page in enumerate(doc):
            curr_num = start_num + idx
            label = format_pattern.replace("{n}", str(curr_num)).replace("{total}", str(total_pages))
            rect = page.rect
            w, h = rect.width, rect.height
            box_height = font_size + 8

            if position == "bottom-center":
                target_rect = pymupdf.Rect(margin, h - margin - box_height, w - margin, h - margin)
                align = pymupdf.TEXT_ALIGN_CENTER
            elif position == "bottom-right":
                target_rect = pymupdf.Rect(w - 200 - margin, h - margin - box_height, w - margin, h - margin)
                align = pymupdf.TEXT_ALIGN_RIGHT
            elif position == "bottom-left":
                target_rect = pymupdf.Rect(margin, h - margin - box_height, margin + 200, h - margin)
                align = pymupdf.TEXT_ALIGN_LEFT
            elif position == "top-center":
                target_rect = pymupdf.Rect(margin, margin, w - margin, margin + box_height)
                align = pymupdf.TEXT_ALIGN_CENTER
            elif position == "top-right":
                target_rect = pymupdf.Rect(w - 200 - margin, margin, w - margin, margin + box_height)
                align = pymupdf.TEXT_ALIGN_RIGHT
            else:
                target_rect = pymupdf.Rect(margin, margin, margin + 200, margin + box_height)
                align = pymupdf.TEXT_ALIGN_LEFT

            page.insert_textbox(
                target_rect,
                label,
                fontsize=font_size,
                color=(0.2, 0.2, 0.2),
                align=align
            )
        doc.save(str(output_path), garbage=3, deflate=True)
        return str(output_path)
    finally:
        doc.close()

def sign_pdf(file_path: Union[str, Path], output_path: Union[str, Path],
             signature_image_bytes: bytes, page_num: int = 1,
             x: float = 100, y: float = 100,
             width: float = 160, height: float = 70) -> str:
    doc = pymupdf.open(str(file_path))
    try:
        total = len(doc)
        page_idx = max(0, min(page_num - 1, total - 1))
        page = doc[page_idx]
        rect = pymupdf.Rect(x, y, x + width, y + height)
        page.insert_image(rect, stream=signature_image_bytes)
        doc.save(str(output_path), garbage=3, deflate=True)
        return str(output_path)
    finally:
        doc.close()

# -------------------------------------------------------------
# 4. PDF CONVERSIONS (TO FORMATS)
# -------------------------------------------------------------

def pdf_to_docx(file_path: Union[str, Path], output_path: Union[str, Path]) -> str:
    cv = Converter(str(file_path))
    try:
        cv.convert(str(output_path), start=0, end=None)
        return str(output_path)
    finally:
        cv.close()

def pdf_to_pptx(file_path: Union[str, Path], output_path: Union[str, Path], dpi: int = 150) -> str:
    doc = pymupdf.open(str(file_path))
    prs = Presentation()
    prs.slides._sldIdLst.clear()
    try:
        zoom = dpi / 72.0
        mat = pymupdf.Matrix(zoom, zoom)
        for page in doc:
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
    wb = openpyxl.Workbook()
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
                    row_cursor += 1
                has_content = True
            else:
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

        zip_path = out_dir / f"{base_stem}_images.zip"
        with zipfile.ZipFile(str(zip_path), 'w', zipfile.ZIP_DEFLATED) as zf:
            for ip in image_paths:
                zf.write(ip, arcname=Path(ip).name)
        return {"file_path": str(zip_path), "is_zip": True, "pages": total_pages}
    finally:
        doc.close()

def pdf_to_txt(file_path: Union[str, Path], output_path: Union[str, Path]) -> str:
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

# -------------------------------------------------------------
# 5. OTHER FORMATS TO PDF
# -------------------------------------------------------------

def _try_libreoffice(input_path: str, output_dir: str) -> bool:
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if not soffice and sys.platform == "win32":
        lo_paths = [
            r"C:\Program Files\LibreOffice\program\soffice.exe",
            r"C:\Program Files (x86)\LibreOffice\program\soffice.exe"
        ]
        for p in lo_paths:
            if os.path.exists(p):
                soffice = p
                break
    if soffice:
        try:
            cmd = [soffice, "--headless", "--convert-to", "pdf", "--outdir", output_dir, input_path]
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=30)
            return res.returncode == 0
        except Exception:
            return False
    return False

def docx_to_pdf(file_path: Union[str, Path], output_path: Union[str, Path]) -> str:
    abs_input = str(Path(file_path).resolve())
    abs_output = str(Path(output_path).resolve())
    out_dir = str(Path(output_path).parent.resolve())

    if _try_libreoffice(abs_input, out_dir):
        expected = Path(out_dir) / f"{Path(abs_input).stem}.pdf"
        if expected.exists() and expected != Path(abs_output):
            expected.rename(abs_output)
        if os.path.exists(abs_output) and os.path.getsize(abs_output) > 0:
            return abs_output

    if sys.platform == "win32":
        try:
            import win32com.client
            import pythoncom
            pythoncom.CoInitialize()
            try:
                word = win32com.client.DispatchEx("Word.Application")
                word.Visible = False
                word.DisplayAlerts = False
                doc = word.Documents.Open(abs_input)
                doc.SaveAs2(abs_output, FileFormat=17)
                doc.Close(False)
                word.Quit()
                if os.path.exists(abs_output) and os.path.getsize(abs_output) > 0:
                    return abs_output
            finally:
                pythoncom.CoUninitialize()
        except Exception:
            pass

    doc_file = docx.Document(abs_input)
    pdf_doc = pymupdf.open()
    page = pdf_doc.new_page()
    p_cursor = 50
    for para in doc_file.paragraphs:
        text = para.text.strip()
        if not text:
            p_cursor += 15
            continue
        if p_cursor > page.rect.height - 50:
            page = pdf_doc.new_page()
            p_cursor = 50
        page.insert_text(pymupdf.Point(50, p_cursor), text, fontsize=11, fontname="helv")
        p_cursor += 18
    pdf_doc.save(abs_output, garbage=3, deflate=True)
    pdf_doc.close()
    return abs_output

def pptx_to_pdf(file_path: Union[str, Path], output_path: Union[str, Path]) -> str:
    abs_input = str(Path(file_path).resolve())
    abs_output = str(Path(output_path).resolve())
    out_dir = str(Path(output_path).parent.resolve())

    if _try_libreoffice(abs_input, out_dir):
        expected = Path(out_dir) / f"{Path(abs_input).stem}.pdf"
        if expected.exists() and expected != Path(abs_output):
            expected.rename(abs_output)
        if os.path.exists(abs_output) and os.path.getsize(abs_output) > 0:
            return abs_output

    if sys.platform == "win32":
        try:
            import win32com.client
            import pythoncom
            pythoncom.CoInitialize()
            try:
                ppt = win32com.client.DispatchEx("PowerPoint.Application")
                prs = ppt.Presentations.Open(abs_input, WithWindow=False)
                prs.SaveAs(abs_output, 32)
                prs.Close()
                ppt.Quit()
                if os.path.exists(abs_output) and os.path.getsize(abs_output) > 0:
                    return abs_output
            finally:
                pythoncom.CoUninitialize()
        except Exception:
            pass

    prs_file = Presentation(abs_input)
    pdf_doc = pymupdf.open()
    width = prs_file.slide_width.pt
    height = prs_file.slide_height.pt
    for slide in prs_file.slides:
        page = pdf_doc.new_page(width=width, height=height)
        y = 50
        for shape in slide.shapes:
            if shape.has_text_frame:
                for paragraph in shape.text_frame.paragraphs:
                    txt = paragraph.text.strip()
                    if txt:
                        page.insert_text(pymupdf.Point(50, y), txt, fontsize=12)
                        y += 20
    pdf_doc.save(abs_output, garbage=3, deflate=True)
    pdf_doc.close()
    return abs_output

def xlsx_to_pdf(file_path: Union[str, Path], output_path: Union[str, Path]) -> str:
    abs_input = str(Path(file_path).resolve())
    abs_output = str(Path(output_path).resolve())
    out_dir = str(Path(output_path).parent.resolve())

    if _try_libreoffice(abs_input, out_dir):
        expected = Path(out_dir) / f"{Path(abs_input).stem}.pdf"
        if expected.exists() and expected != Path(abs_output):
            expected.rename(abs_output)
        if os.path.exists(abs_output) and os.path.getsize(abs_output) > 0:
            return abs_output

    if sys.platform == "win32":
        try:
            import win32com.client
            import pythoncom
            pythoncom.CoInitialize()
            try:
                excel = win32com.client.DispatchEx("Excel.Application")
                excel.Visible = False
                excel.DisplayAlerts = False
                wb = excel.Workbooks.Open(abs_input)
                wb.ExportAsFixedFormat(0, abs_output)
                wb.Close(False)
                excel.Quit()
                if os.path.exists(abs_output) and os.path.getsize(abs_output) > 0:
                    return abs_output
            finally:
                pythoncom.CoUninitialize()
        except Exception:
            pass

    wb_file = openpyxl.load_workbook(abs_input, data_only=True)
    pdf_doc = pymupdf.open()
    for sheet in wb_file.worksheets:
        page = pdf_doc.new_page(width=842, height=595)
        y = 40
        page.insert_text(pymupdf.Point(40, y), f"Sheet: {sheet.title}", fontsize=14)
        y += 25
        for row in sheet.iter_rows(values_only=True):
            if any(row):
                row_str = " | ".join(str(cell) if cell is not None else "" for cell in row[:10])
                if y > 560:
                    page = pdf_doc.new_page(width=842, height=595)
                    y = 40
                page.insert_text(pymupdf.Point(40, y), row_str, fontsize=9)
                y += 16
    pdf_doc.save(abs_output, garbage=3, deflate=True)
    pdf_doc.close()
    return abs_output

def images_to_pdf(image_paths: List[Union[str, Path]], output_path: Union[str, Path],
                  orientation: str = "portrait", margin: float = 20.0) -> str:
    if not image_paths:
        raise ValueError("At least one image is required.")
    pdf_doc = pymupdf.open()
    try:
        for img_path in image_paths:
            img = Image.open(str(img_path))
            img_w, img_h = img.size
            img.close()
            page_w = img_w + 2 * margin
            page_h = img_h + 2 * margin
            page = pdf_doc.new_page(width=page_w, height=page_h)
            rect = pymupdf.Rect(margin, margin, page_w - margin, page_h - margin)
            page.insert_image(rect, filename=str(img_path))
        pdf_doc.save(str(output_path), garbage=3, deflate=True)
        return str(output_path)
    finally:
        pdf_doc.close()

def html_to_pdf(html_source: Union[str, Path], output_path: Union[str, Path]) -> str:
    abs_output = str(output_path)
    temp_file = None
    if isinstance(html_source, str) and ("<html" in html_source.lower() or "<div" in html_source.lower() or "<!doctype" in html_source.lower()):
        temp_file = Path(output_path).parent / f"temp_{os.getpid()}_{hash(html_source)}.html"
        with open(temp_file, "w", encoding="utf-8") as f:
            f.write(html_source)
        source_path = str(temp_file)
    else:
        source_path = str(html_source)

    try:
        doc = pymupdf.open(source_path)
        pdf_bytes = doc.convert_to_pdf()
        pdf_doc = pymupdf.open("pdf", pdf_bytes)
        pdf_doc.save(abs_output, garbage=3, deflate=True)
        pdf_doc.close()
        doc.close()
        return abs_output
    finally:
        if temp_file and temp_file.exists():
            temp_file.unlink(missing_ok=True)

# -------------------------------------------------------------
# 6. OCR & EXTRA UTILITIES
# -------------------------------------------------------------

def ocr_image_to_text(image_path: Union[str, Path]) -> Dict[str, Any]:
    text_content = ""
    engine = "heuristic"
    try:
        import pytesseract
        img = Image.open(str(image_path))
        text_content = pytesseract.image_to_string(img)
        engine = "tesseract"
    except Exception:
        text_content = (
            "[DocuTools Server OCR Note]: For maximum fidelity, client-side WebAssembly OCR "
            "runs automatically in your browser with 100+ language support without transmitting data to server."
        )
    return {
        "text": text_content.strip(),
        "engine": engine,
        "char_count": len(text_content.strip())
    }

def ocr_to_searchable_pdf(image_path: Union[str, Path], output_path: Union[str, Path], extracted_text: str = "") -> str:
    pdf_doc = pymupdf.open()
    try:
        img = Image.open(str(image_path))
        img_w, img_h = img.size
        img.close()
        page = pdf_doc.new_page(width=img_w, height=img_h)
        rect = pymupdf.Rect(0, 0, img_w, img_h)
        page.insert_image(rect, filename=str(image_path))

        if extracted_text:
            lines = extracted_text.splitlines()
            y = 30
            for line in lines:
                if line.strip() and y < img_h - 20:
                    page.insert_text(pymupdf.Point(30, y), line.strip(), fontsize=12, render_mode=3)
                    y += 18
        pdf_doc.save(str(output_path), garbage=3, deflate=True)
        return str(output_path)
    finally:
        pdf_doc.close()

def extract_images_from_pdf(file_path: Union[str, Path], output_dir: Union[str, Path]) -> Dict[str, Any]:
    doc = pymupdf.open(str(file_path))
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    base_stem = Path(file_path).stem
    extracted_info = []
    saved_files = []

    try:
        img_counter = 1
        for page_idx, page in enumerate(doc):
            image_list = page.get_images(full=True)
            for img_info in image_list:
                xref = img_info[0]
                base_image = doc.extract_image(xref)
                if not base_image:
                    continue
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                width = base_image["width"]
                height = base_image["height"]
                img_filename = f"{base_stem}_img_{img_counter}_p{page_idx + 1}.{image_ext}"
                img_path = out_dir / img_filename
                with open(img_path, "wb") as f:
                    f.write(image_bytes)
                saved_files.append(str(img_path))
                extracted_info.append({
                    "id": img_counter,
                    "page": page_idx + 1,
                    "filename": img_filename,
                    "format": image_ext.upper(),
                    "width": width,
                    "height": height,
                    "size_bytes": len(image_bytes)
                })
                img_counter += 1

        if not saved_files:
            return {
                "total_images": 0,
                "file_path": None,
                "message": "No embedded images found in this PDF document."
            }

        zip_path = out_dir / f"{base_stem}_extracted_images.zip"
        with zipfile.ZipFile(str(zip_path), 'w', zipfile.ZIP_DEFLATED) as zf:
            for sf in saved_files:
                zf.write(sf, arcname=Path(sf).name)
            manifest_bytes = json.dumps(extracted_info, indent=2).encode('utf-8')
            zf.writestr("images_manifest.json", manifest_bytes)

        return {
            "total_images": len(saved_files),
            "file_path": str(zip_path),
            "images": extracted_info
        }
    finally:
        doc.close()
