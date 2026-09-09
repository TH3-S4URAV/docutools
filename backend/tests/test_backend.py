import os
import io
import pytest
from pathlib import Path
import pymupdf
from PIL import Image

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
from app.services.pdf_extra import extract_images_from_pdf
from app.services.ocr_service import ocr_image_to_text, ocr_to_searchable_pdf
from app.core.security import sanitize_filename, validate_extension, validate_file_size

def test_security_filename_sanitization():
    bad_name = "../../../malicious_file\x00_test.exe.pdf"
    clean = sanitize_filename(bad_name)
    assert ".." not in clean
    assert "/" not in clean
    assert "\\" not in clean
    assert "\x00" not in clean
    assert clean.endswith(".pdf")

def test_security_extension_validation():
    validate_extension("doc.pdf", "pdf")
    with pytest.raises(Exception):
        validate_extension("malware.exe", "pdf")

def test_merge_pdfs(sample_pdf, test_dir):
    out = test_dir / "merged_out.pdf"
    merge_pdfs([sample_pdf, sample_pdf], out)
    assert out.exists()
    doc = pymupdf.open(str(out))
    assert len(doc) == 6  # 3 pages + 3 pages
    doc.close()

def test_split_pdf(sample_pdf, test_dir):
    out_dir = test_dir / "split_out"
    files = split_pdf(sample_pdf, "1, 2-3", out_dir)
    assert len(files) == 2
    for f in files:
        assert os.path.exists(f)

def test_compress_pdf(sample_pdf, test_dir):
    out = test_dir / "compressed_out.pdf"
    stats = compress_pdf(sample_pdf, out, level="medium")
    assert out.exists()
    assert "compressed_size" in stats
    assert stats["compressed_size"] > 0

def test_rotate_pdf(sample_pdf, test_dir):
    out = test_dir / "rotated_out.pdf"
    rotate_pdf(sample_pdf, out, angle=90)
    assert out.exists()
    doc = pymupdf.open(str(out))
    assert doc[0].rotation == 90
    doc.close()

def test_delete_pages(sample_pdf, test_dir):
    out = test_dir / "deleted_out.pdf"
    delete_pages(sample_pdf, out, "2")
    assert out.exists()
    doc = pymupdf.open(str(out))
    assert len(doc) == 2
    doc.close()

def test_extract_pages(sample_pdf, test_dir):
    out = test_dir / "extracted_out.pdf"
    extract_pages(sample_pdf, out, "1, 3")
    assert out.exists()
    doc = pymupdf.open(str(out))
    assert len(doc) == 2
    doc.close()

def test_crop_pdf(sample_pdf, test_dir):
    out = test_dir / "cropped_out.pdf"
    crop_pdf(sample_pdf, out, top=30, bottom=30, left=20, right=20)
    assert out.exists()
    doc = pymupdf.open(str(out))
    cropbox = doc[0].cropbox
    assert cropbox.width < 595
    doc.close()

def test_resize_pdf(sample_pdf, test_dir):
    out = test_dir / "resized_out.pdf"
    resize_pdf(sample_pdf, out, paper_size="Letter", orientation="portrait")
    assert out.exists()
    doc = pymupdf.open(str(out))
    rect = doc[0].rect
    assert round(rect.width) == 612
    assert round(rect.height) == 792
    doc.close()

def test_compare_pdfs(sample_pdf, test_dir):
    mod_pdf = test_dir / "sample_mod.pdf"
    doc = pymupdf.open(str(sample_pdf))
    doc[0].insert_text(pymupdf.Point(50, 400), "Brand New Modification Line")
    doc.save(str(mod_pdf))
    doc.close()

    res = compare_pdfs(sample_pdf, mod_pdf)
    assert res["is_identical"] is False
    assert res["additions_count"] > 0

def test_protect_and_unlock_pdf(sample_pdf, test_dir):
    protected = test_dir / "protected.pdf"
    protect_pdf(sample_pdf, protected, user_password="SecretPassword123")
    assert protected.exists()

    # Verify protected file cannot be read without password
    doc = pymupdf.open(str(protected))
    assert doc.is_encrypted is True
    doc.close()

    # Test unlock with wrong password
    with pytest.raises(ValueError):
        unlock_pdf(protected, test_dir / "fail_unlock.pdf", password="WrongPassword")

    # Test unlock with correct password
    unlocked = test_dir / "unlocked.pdf"
    unlock_pdf(protected, unlocked, password="SecretPassword123")
    assert unlocked.exists()
    unlocked_doc = pymupdf.open(str(unlocked))
    assert unlocked_doc.is_encrypted is False
    unlocked_doc.close()

def test_watermark_pdf(sample_pdf, test_dir):
    out = test_dir / "watermarked.pdf"
    add_watermark(sample_pdf, out, text="CONFIDENTIAL", opacity=0.4, font_size=36)
    assert out.exists()
    doc = pymupdf.open(str(out))
    assert "CONFIDENTIAL" in doc[0].get_text()
    doc.close()

def test_page_numbers_pdf(sample_pdf, test_dir):
    out = test_dir / "numbered.pdf"
    add_page_numbers(sample_pdf, out, format_pattern="Page {n} of {total}")
    assert out.exists()
    doc = pymupdf.open(str(out))
    assert "Page 1 of 3" in doc[0].get_text()
    doc.close()

def test_sign_pdf(sample_pdf, test_dir, sample_images):
    out = test_dir / "signed.pdf"
    sig_bytes = open(str(sample_images[0]), "rb").read()
    sign_pdf(sample_pdf, out, signature_image_bytes=sig_bytes, page_num=1, x=100, y=100)
    assert out.exists()
    doc = pymupdf.open(str(out))
    # Check that an image exists on page 1
    assert len(doc[0].get_images()) >= 1
    doc.close()

def test_pdf_to_docx(sample_pdf, test_dir):
    out = test_dir / "output.docx"
    pdf_to_docx(sample_pdf, out)
    assert out.exists()
    assert out.stat().st_size > 0

def test_pdf_to_pptx(sample_pdf, test_dir):
    out = test_dir / "output.pptx"
    pdf_to_pptx(sample_pdf, out)
    assert out.exists()
    assert out.stat().st_size > 0

def test_pdf_to_xlsx(sample_pdf, test_dir):
    out = test_dir / "output.xlsx"
    pdf_to_xlsx(sample_pdf, out)
    assert out.exists()
    assert out.stat().st_size > 0

def test_pdf_to_images(sample_pdf, test_dir):
    out_dir = test_dir / "images_out"
    res = pdf_to_images(sample_pdf, out_dir, img_format="png")
    assert res["is_zip"] is True
    assert os.path.exists(res["file_path"])

def test_pdf_to_txt(sample_pdf, test_dir):
    out = test_dir / "output.txt"
    pdf_to_txt(sample_pdf, out)
    assert out.exists()
    content = open(str(out), encoding="utf-8").read()
    assert "DocuTools Test Document" in content

def test_docx_to_pdf(sample_docx, test_dir):
    out = test_dir / "docx_converted.pdf"
    docx_to_pdf(sample_docx, out)
    assert out.exists()
    assert out.stat().st_size > 0

def test_pptx_to_pdf(sample_pptx, test_dir):
    out = test_dir / "pptx_converted.pdf"
    pptx_to_pdf(sample_pptx, out)
    assert out.exists()
    assert out.stat().st_size > 0

def test_xlsx_to_pdf(sample_xlsx, test_dir):
    out = test_dir / "xlsx_converted.pdf"
    xlsx_to_pdf(sample_xlsx, out)
    assert out.exists()
    assert out.stat().st_size > 0

def test_images_to_pdf(sample_images, test_dir):
    out = test_dir / "images_converted.pdf"
    images_to_pdf(sample_images, out)
    assert out.exists()
    doc = pymupdf.open(str(out))
    assert len(doc) == 2
    doc.close()

def test_html_to_pdf(test_dir):
    html = "<html><body><h1>Hello HTML to PDF</h1><p>Testing conversion</p></body></html>"
    out = test_dir / "html_converted.pdf"
    html_to_pdf(html, out)
    assert out.exists()
    doc = pymupdf.open(str(out))
    assert len(doc) >= 1
    doc.close()

def test_extract_images_from_pdf(sample_pdf, test_dir):
    out_dir = test_dir / "extracted_imgs"
    res = extract_images_from_pdf(sample_pdf, out_dir)
    assert res["total_images"] >= 1
    assert os.path.exists(res["file_path"])

def test_ocr_to_searchable_pdf(sample_images, test_dir):
    out = test_dir / "searchable.pdf"
    ocr_to_searchable_pdf(sample_images[0], out, extracted_text="Extracted text line")
    assert out.exists()
    doc = pymupdf.open(str(out))
    assert len(doc) == 1
    doc.close()
