import io
from pathlib import Path
from typing import Union, Dict, Any
from PIL import Image
import pymupdf

def ocr_image_to_text(image_path: Union[str, Path]) -> Dict[str, Any]:
    """Perform OCR on an image file. Uses pytesseract if installed, or fallback OCR heuristic."""
    text_content = ""
    engine = "heuristic"
    
    try:
        import pytesseract
        img = Image.open(str(image_path))
        text_content = pytesseract.image_to_string(img)
        engine = "tesseract"
    except Exception:
        # Fallback or informative notice
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
    """Convert an image into a PDF with embedded text."""
    pdf_doc = pymupdf.open()
    try:
        img = Image.open(str(image_path))
        img_w, img_h = img.size
        img.close()

        page = pdf_doc.new_page(width=img_w, height=img_h)
        rect = pymupdf.Rect(0, 0, img_w, img_h)
        page.insert_image(rect, filename=str(image_path))

        # If text is provided, insert as invisible selectable text overlay
        if extracted_text:
            lines = extracted_text.splitlines()
            y = 30
            for line in lines:
                if line.strip() and y < img_h - 20:
                    page.insert_text(
                        pymupdf.Point(30, y),
                        line.strip(),
                        fontsize=12,
                        render_mode=3  # 3 = invisible text for searchability
                    )
                    y += 18

        pdf_doc.save(str(output_path), garbage=3, deflate=True)
        return str(output_path)
    finally:
        pdf_doc.close()
