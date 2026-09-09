from pathlib import Path
from typing import Union, Tuple, Optional
import pymupdf

def add_watermark(file_path: Union[str, Path], output_path: Union[str, Path],
                  text: str, opacity: float = 0.3, font_size: float = 40,
                  angle: float = 45, color: Tuple[float, float, float] = (0.5, 0.5, 0.5),
                  position: str = "center") -> str:
    """Stamp a watermark onto all pages of a PDF with arbitrary angle rotation support."""
    if not text.strip():
        raise ValueError("Watermark text cannot be empty.")

    doc = pymupdf.open(str(file_path))
    try:
        for page in doc:
            rect = page.rect
            center = pymupdf.Point(rect.width / 2, rect.height / 2)
            
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
    """Add page numbers to each page with flexible positioning and formatting."""
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
            else:  # top-left
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
    """Overlay a drawn or uploaded signature image onto a specific PDF page."""
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
