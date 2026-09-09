import io
import pytest
from pathlib import Path
from fastapi.testclient import TestClient
import pymupdf

from app.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["app"] == "DocuTools"
    assert "PyMuPDF" in data["engine"]

def test_api_frontend_serving():
    res = client.get("/")
    assert res.status_code == 200
    assert "text/html" in res.headers["content-type"]
    assert "DocuTools" in res.text or "<div id=\"root\">" in res.text

def test_api_merge(sample_pdf):
    with open(sample_pdf, "rb") as f1, open(sample_pdf, "rb") as f2:
        files = [
            ("files", ("doc1.pdf", f1.read(), "application/pdf")),
            ("files", ("doc2.pdf", f2.read(), "application/pdf"))
        ]
        res = client.post("/api/tools/merge", files=files)
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        doc = pymupdf.open("pdf", res.content)
        assert len(doc) == 6
        doc.close()

def test_api_split(sample_pdf):
    with open(sample_pdf, "rb") as f:
        files = {"file": ("doc.pdf", f.read(), "application/pdf")}
        data = {"ranges": "1", "mode": "ranges"}
        res = client.post("/api/tools/split", files=files, data=data)
        assert res.status_code == 200
        doc = pymupdf.open("pdf", res.content)
        assert len(doc) == 1
        doc.close()

def test_api_compress(sample_pdf):
    with open(sample_pdf, "rb") as f:
        files = {"file": ("doc.pdf", f.read(), "application/pdf")}
        data = {"level": "medium"}
        res = client.post("/api/tools/compress", files=files, data=data)
        assert res.status_code == 200
        assert "X-Result-Size" in res.headers
        doc = pymupdf.open("pdf", res.content)
        assert len(doc) == 3
        doc.close()

def test_api_rotate(sample_pdf):
    with open(sample_pdf, "rb") as f:
        files = {"file": ("doc.pdf", f.read(), "application/pdf")}
        data = {"angle": 90, "pages": "all"}
        res = client.post("/api/tools/rotate", files=files, data=data)
        assert res.status_code == 200
        doc = pymupdf.open("pdf", res.content)
        assert doc[0].rotation == 90
        doc.close()

def test_api_protect_and_unlock(sample_pdf):
    # 1. Protect
    with open(sample_pdf, "rb") as f:
        files = {"file": ("doc.pdf", f.read(), "application/pdf")}
        data = {"password": "SuperSecretPassword", "allow_print": True, "allow_copy": True}
        res_protect = client.post("/api/tools/protect", files=files, data=data)
        assert res_protect.status_code == 200
        protected_bytes = res_protect.content

    # Verify protected
    p_doc = pymupdf.open("pdf", protected_bytes)
    assert p_doc.is_encrypted is True
    p_doc.close()

    # 2. Unlock with wrong password
    files_wrong = {"file": ("protected.pdf", protected_bytes, "application/pdf")}
    res_wrong = client.post("/api/tools/unlock", files=files_wrong, data={"password": "Wrong"})
    assert res_wrong.status_code == 400

    # 3. Unlock with correct password
    files_correct = {"file": ("protected.pdf", protected_bytes, "application/pdf")}
    res_unlock = client.post("/api/tools/unlock", files=files_correct, data={"password": "SuperSecretPassword"})
    assert res_unlock.status_code == 200
    u_doc = pymupdf.open("pdf", res_unlock.content)
    assert u_doc.is_encrypted is False
    u_doc.close()

def test_api_watermark(sample_pdf):
    with open(sample_pdf, "rb") as f:
        files = {"file": ("doc.pdf", f.read(), "application/pdf")}
        data = {"text": "WATERMARK_TEST", "opacity": 0.5, "font_size": 36, "angle": 45, "position": "center"}
        res = client.post("/api/tools/watermark", files=files, data=data)
        assert res.status_code == 200
        doc = pymupdf.open("pdf", res.content)
        assert len(doc) == 3
        doc.close()

def test_api_page_numbers(sample_pdf):
    with open(sample_pdf, "rb") as f:
        files = {"file": ("doc.pdf", f.read(), "application/pdf")}
        data = {"format_pattern": "Page {n} of {total}", "position": "bottom-center", "start_num": 1}
        res = client.post("/api/tools/page-numbers", files=files, data=data)
        assert res.status_code == 200
        doc = pymupdf.open("pdf", res.content)
        assert len(doc) == 3
        doc.close()

def test_api_pdf_to_docx(sample_pdf):
    with open(sample_pdf, "rb") as f:
        files = {"file": ("doc.pdf", f.read(), "application/pdf")}
        res = client.post("/api/tools/pdf-to-docx", files=files)
        assert res.status_code == 200
        assert len(res.content) > 0

def test_api_pdf_to_txt(sample_pdf):
    with open(sample_pdf, "rb") as f:
        files = {"file": ("doc.pdf", f.read(), "application/pdf")}
        res = client.post("/api/tools/pdf-to-txt", files=files)
        assert res.status_code == 200
        assert "DocuTools Test Document" in res.text

def test_api_images_to_pdf(sample_images):
    with open(sample_images[0], "rb") as f1, open(sample_images[1], "rb") as f2:
        files = [
            ("files", ("img1.png", f1.read(), "image/png")),
            ("files", ("img2.png", f2.read(), "image/png"))
        ]
        res = client.post("/api/tools/images-to-pdf", files=files)
        assert res.status_code == 200
        doc = pymupdf.open("pdf", res.content)
        assert len(doc) == 2
        doc.close()

def test_api_html_to_pdf():
    html = "<html><body><h1>Direct HTML to PDF API Test</h1></body></html>"
    res = client.post("/api/tools/html-to-pdf", data={"html_content": html})
    assert res.status_code == 200
    doc = pymupdf.open("pdf", res.content)
    assert len(doc) >= 1
    doc.close()

def test_api_compare(sample_pdf):
    with open(sample_pdf, "rb") as f1, open(sample_pdf, "rb") as f2:
        files = {
            "file_a": ("doc1.pdf", f1.read(), "application/pdf"),
            "file_b": ("doc2.pdf", f2.read(), "application/pdf")
        }
        res = client.post("/api/tools/compare", files=files)
        assert res.status_code == 200
        data = res.json()
        assert data["is_identical"] is True
        assert data["doc_a_pages"] == 3

def test_api_extract_images(sample_pdf):
    with open(sample_pdf, "rb") as f:
        files = {"file": ("doc.pdf", f.read(), "application/pdf")}
        res = client.post("/api/tools/extract-images", files=files)
        assert res.status_code == 200
        assert res.headers["content-type"] in ["application/zip", "application/x-zip-compressed"]
        assert len(res.content) > 100
