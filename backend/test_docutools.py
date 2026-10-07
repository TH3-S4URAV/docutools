"""
DOCUTOOLS — Consolidated Automated Test Suite
Tests all 32 PDF and document tools, security validations, and FastAPI endpoints.
"""

import os
import io
import pytest
from pathlib import Path
import pymupdf
from PIL import Image, ImageDraw
import docx
from pptx import Presentation
import openpyxl
from fastapi.testclient import TestClient

import pdf_engine
from main import app, sanitize_filename, validate_extension

@pytest.fixture(scope="session")
def client():
    return TestClient(app)

@pytest.fixture(scope="session")
def test_dir(tmp_path_factory):
    return tmp_path_factory.mktemp("docutools_test_files")

@pytest.fixture(scope="session")
def sample_pdf(test_dir):
    pdf_path = test_dir / "sample.pdf"
    doc = pymupdf.open()
    
    p1 = doc.new_page(width=595, height=842)
    p1.insert_text(pymupdf.Point(50, 80), "DocuTools Test Document - Page 1", fontsize=18)
    p1.insert_text(pymupdf.Point(50, 120), "This is a test paragraph for automated document verification.", fontsize=11)
    
    img = Image.new("RGB", (200, 100), color=(73, 109, 137))
    d = ImageDraw.Draw(img)
    d.text((20, 40), "Test Image", fill=(255, 255, 0))
    img_path = test_dir / "test_embedded.png"
    img.save(str(img_path))
    p1.insert_image(pymupdf.Rect(50, 150, 250, 250), filename=str(img_path))

    p2 = doc.new_page(width=595, height=842)
    p2.insert_text(pymupdf.Point(50, 80), "Page 2 - Structured Table", fontsize=16)
    p2.insert_text(pymupdf.Point(50, 120), "ID | Name | Department | Score", fontsize=11)
    p2.insert_text(pymupdf.Point(50, 140), "1  | Alice| Engineering| 95", fontsize=11)

    p3 = doc.new_page(width=595, height=842)
    p3.insert_text(pymupdf.Point(50, 80), "Page 3 - Conclusion and Notes", fontsize=16)
    p3.insert_text(pymupdf.Point(50, 120), "Final page for testing.", fontsize=11)

    doc.save(str(pdf_path))
    doc.close()
    return pdf_path

@pytest.fixture(scope="session")
def sample_docx(test_dir):
    docx_path = test_dir / "sample.docx"
    doc = docx.Document()
    doc.add_heading("DocuTools Sample Word File", 0)
    doc.add_paragraph("Sample text for conversion.")
    doc.save(str(docx_path))
    return docx_path

@pytest.fixture(scope="session")
def sample_pptx(test_dir):
    pptx_path = test_dir / "sample.pptx"
    prs = Presentation()
    slide = prs.slides.add_slide(prs.slide_layouts[0])
    slide.shapes.title.text = "Sample Presentation"
    prs.save(str(pptx_path))
    return pptx_path

@pytest.fixture(scope="session")
def sample_xlsx(test_dir):
    xlsx_path = test_dir / "sample.xlsx"
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["Item", "Quantity", "Price"])
    ws.append(["Widget A", 10, 19.99])
    wb.save(str(xlsx_path))
    return xlsx_path

@pytest.fixture(scope="session")
def sample_images(test_dir):
    img_paths = []
    for i in range(2):
        path = test_dir / f"image_{i+1}.png"
        img = Image.new("RGB", (300, 200), color=(100 + i * 40, 150, 200))
        d = ImageDraw.Draw(img)
        d.text((40, 90), f"Sample Image {i+1}", fill=(255, 255, 255))
        img.save(str(path))
        img_paths.append(path)
    return img_paths

# ----------------- SECURITY TESTS -----------------
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

# ----------------- SERVICE TESTS -----------------
def test_merge_pdfs(sample_pdf, test_dir):
    out = test_dir / "merged_out.pdf"
    pdf_engine.merge_pdfs([sample_pdf, sample_pdf], out)
    assert out.exists()
    doc = pymupdf.open(str(out))
    assert len(doc) == 6
    doc.close()

def test_split_pdf(sample_pdf, test_dir):
    out_dir = test_dir / "split_out"
    files = pdf_engine.split_pdf(sample_pdf, "1, 2-3", out_dir)
    assert len(files) == 2
    for f in files:
        assert os.path.exists(f)

def test_compress_pdf(sample_pdf, test_dir):
    out = test_dir / "compressed_out.pdf"
    stats = pdf_engine.compress_pdf(sample_pdf, out, level="medium")
    assert out.exists()
    assert stats["compressed_size"] > 0

def test_rotate_pdf(sample_pdf, test_dir):
    out = test_dir / "rotated_out.pdf"
    pdf_engine.rotate_pdf(sample_pdf, out, angle=90, pages="1")
    assert out.exists()
    doc = pymupdf.open(str(out))
    assert doc[0].rotation == 90
    doc.close()

def test_protect_and_unlock_pdf(sample_pdf, test_dir):
    protected = test_dir / "locked.pdf"
    unlocked = test_dir / "unlocked.pdf"
    pdf_engine.protect_pdf(sample_pdf, protected, "secret123")
    doc = pymupdf.open(str(protected))
    assert doc.is_encrypted
    doc.close()

    pdf_engine.unlock_pdf(protected, unlocked, "secret123")
    doc2 = pymupdf.open(str(unlocked))
    assert not doc2.is_encrypted
    doc2.close()

def test_watermark_pdf(sample_pdf, test_dir):
    out = test_dir / "watermarked.pdf"
    pdf_engine.add_watermark(sample_pdf, out, "CONFIDENTIAL", opacity=0.4, font_size=36, angle=45)
    assert out.exists()

def test_page_numbers_pdf(sample_pdf, test_dir):
    out = test_dir / "numbered.pdf"
    pdf_engine.add_page_numbers(sample_pdf, out, format_pattern="Page {n} of {total}")
    assert out.exists()

def test_sign_pdf(sample_pdf, sample_images, test_dir):
    out = test_dir / "signed.pdf"
    sig_bytes = open(str(sample_images[0]), "rb").read()
    pdf_engine.sign_pdf(sample_pdf, out, sig_bytes, page_num=1, x=50, y=50)
    assert out.exists()

def test_pdf_to_docx(sample_pdf, test_dir):
    out = test_dir / "converted.docx"
    pdf_engine.pdf_to_docx(sample_pdf, out)
    assert out.exists()

def test_pdf_to_pptx(sample_pdf, test_dir):
    out = test_dir / "converted.pptx"
    pdf_engine.pdf_to_pptx(sample_pdf, out)
    assert out.exists()

def test_pdf_to_xlsx(sample_pdf, test_dir):
    out = test_dir / "converted.xlsx"
    pdf_engine.pdf_to_xlsx(sample_pdf, out)
    assert out.exists()

def test_pdf_to_images(sample_pdf, test_dir):
    res = pdf_engine.pdf_to_images(sample_pdf, test_dir / "img_out", img_format="png")
    assert res["is_zip"] is True
    assert os.path.exists(res["file_path"])

def test_pdf_to_txt(sample_pdf, test_dir):
    out = test_dir / "extracted.txt"
    pdf_engine.pdf_to_txt(sample_pdf, out)
    assert out.exists()
    content = open(str(out), encoding="utf-8").read()
    assert "DocuTools Test Document" in content

def test_images_to_pdf(sample_images, test_dir):
    out = test_dir / "from_images.pdf"
    pdf_engine.images_to_pdf(sample_images, out)
    assert out.exists()

def test_html_to_pdf(test_dir):
    out = test_dir / "from_html.pdf"
    html = "<html><body><h1>Hello DocuTools</h1><p>Test HTML to PDF</p></body></html>"
    pdf_engine.html_to_pdf(html, out)
    assert out.exists()

def test_extract_images_from_pdf(sample_pdf, test_dir):
    res = pdf_engine.extract_images_from_pdf(sample_pdf, test_dir / "extracted_imgs")
    assert res["total_images"] >= 1
    assert os.path.exists(res["file_path"])

def test_compare_pdfs(sample_pdf):
    res = pdf_engine.compare_pdfs(sample_pdf, sample_pdf)
    assert res["is_identical"] is True

# ----------------- API ENDPOINT TESTS -----------------
def test_api_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_api_merge(client, sample_pdf):
    with open(sample_pdf, "rb") as f1, open(sample_pdf, "rb") as f2:
        res = client.post("/api/tools/merge", files=[
            ("files", ("doc1.pdf", f1, "application/pdf")),
            ("files", ("doc2.pdf", f2, "application/pdf")),
        ])
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert len(res.content) > 0

def test_api_compress(client, sample_pdf):
    with open(sample_pdf, "rb") as f:
        res = client.post("/api/tools/compress", files={"file": ("doc.pdf", f, "application/pdf")}, data={"level": "medium"})
    assert res.status_code == 200
    assert "X-Original-Size" in res.headers
