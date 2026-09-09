import os
import io
import zipfile
import difflib
from pathlib import Path
from typing import List, Union, Dict, Any
import pymupdf

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
    """Split PDF by ranges or into individual pages. Returns list of created output file paths."""
    src = pymupdf.open(str(file_path))
    total_pages = len(src)
    output_files = []
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    base_stem = Path(file_path).stem

    try:
        if mode == "all_pages" or not page_ranges.strip():
            # Burst each page into its own PDF
            for i in range(total_pages):
                out_doc = pymupdf.open()
                out_doc.insert_pdf(src, from_page=i, to_page=i)
                out_file = out_dir / f"{base_stem}_page_{i + 1}.pdf"
                out_doc.save(str(out_file), garbage=3, deflate=True)
                out_doc.close()
                output_files.append(str(out_file))
        else:
            # Custom ranges: parts separated by comma can be separate files or one combined file
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
    """Compress PDF with varying intensity levels ('low', 'medium', 'high')."""
    doc = pymupdf.open(str(file_path))
    original_size = os.path.getsize(str(file_path))

    try:
        if level == "high":
            # Downsample images if any
            for page_num in range(len(doc)):
                page = doc[page_num]
                image_list = page.get_images(full=True)
                for img_info in image_list:
                    xref = img_info[0]
                    try:
                        base_image = doc.extract_image(xref)
                        if base_image:
                            # Re-compress pixmap with lower quality JPEG
                            pix = pymupdf.Pixmap(doc, xref)
                            if pix.colorspace.n >= 4:
                                pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
                            # Only re-insert if reasonably large
                            if pix.width > 1200 or pix.height > 1200:
                                scale = min(1200 / pix.width, 1200 / pix.height)
                                new_pix = pymupdf.Pixmap(pix, int(pix.width * scale), int(pix.height * scale), False)
                                compressed_bytes = new_pix.tobytes("jpeg", jpg_quality=65)
                                # Replace image stream
                                doc.update_stream(xref, compressed_bytes)
                    except Exception:
                        continue
            doc.save(str(output_path), garbage=4, deflate=True, clean=True, deflate_images=True, deflate_fonts=True)
        elif level == "low":
            doc.save(str(output_path), garbage=2, deflate=True)
        else:  # medium
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
    """Rotate pages by 90, 180, or 270 degrees."""
    doc = pymupdf.open(str(file_path))
    try:
        total_pages = len(doc)
        if pages == "all" or not pages.strip():
            target_indices = list(range(total_pages))
        else:
            target_indices = parse_page_ranges(pages, total_pages)

        for idx in target_indices:
            if 0 <= idx < total_pages:
                page = doc[idx]
                page.set_rotation((page.rotation + angle) % 360)

        doc.save(str(output_path), garbage=3, deflate=True)
        return str(output_path)
    finally:
        doc.close()

def delete_pages(file_path: Union[str, Path], output_path: Union[str, Path], pages_to_delete: str) -> str:
    """Delete specified 1-based page ranges from PDF."""
    doc = pymupdf.open(str(file_path))
    try:
        total = len(doc)
        indices = parse_page_ranges(pages_to_delete, total)
        if len(indices) >= total:
            raise ValueError("Cannot delete all pages in the document.")
        
        # Delete from highest to lowest index so subsequent indices don't shift
        for idx in reversed(indices):
            doc.delete_page(idx)

        doc.save(str(output_path), garbage=3, deflate=True)
        return str(output_path)
    finally:
        doc.close()

def extract_pages(file_path: Union[str, Path], output_path: Union[str, Path], pages_to_extract: str) -> str:
    """Extract specified 1-based page ranges into new PDF."""
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
    """Crop margins (in points) from pages."""
    doc = pymupdf.open(str(file_path))
    try:
        total = len(doc)
        indices = list(range(total)) if pages == "all" else parse_page_ranges(pages, total)
        for idx in indices:
            page = doc[idx]
            rect = page.rect
            new_rect = pymupdf.Rect(
                rect.x0 + left,
                rect.y0 + top,
                rect.x1 - right,
                rect.y1 - bottom
            )
            # Ensure crop rect is valid and has positive area
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
    """Resize pages to standard paper size with proportional scaling."""
    src = pymupdf.open(str(file_path))
    out_doc = pymupdf.open()
    try:
        dim = STANDARD_PAGE_SIZES.get(paper_size, STANDARD_PAGE_SIZES["A4"])
        width, height = dim if orientation == "portrait" else (dim[1], dim[0])
        target_rect = pymupdf.Rect(0, 0, width, height)

        for page in src:
            new_page = out_doc.new_page(width=width, height=height)
            # Draw old page contents scaled into new page
            new_page.show_pdf_page(target_rect, src, page.number)

        out_doc.save(str(output_path), garbage=3, deflate=True)
        return str(output_path)
    finally:
        src.close()
        out_doc.close()

def compare_pdfs(file_path_a: Union[str, Path], file_path_b: Union[str, Path]) -> Dict[str, Any]:
    """Extract and compare text content between two PDFs, highlighting additions/deletions."""
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
            "diff_text": "".join(diff[:500])  # limit diff snippet for responsiveness
        }
    finally:
        doc_a.close()
        doc_b.close()
