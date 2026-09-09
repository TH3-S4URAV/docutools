# DOCUTOOLS

> **"All your document tools in one place."**

DocuTools is a complete, polished, production-ready document and PDF management web platform. It delivers 32 high-performance, privacy-conscious utilities for manipulating, organizing, securing, converting, and analyzing PDFs, Office documents, and images.

---

## 📑 Complete Tool Catalog (32 Production Tools)

### 1. PDF Organize & Edit (11 Tools)
- **Merge PDF**: Combine multiple PDF documents in any custom order.
- **Split PDF**: Extract page ranges or burst all pages into standalone files (ZIP download).
- **Compress PDF**: Multi-level file size reduction (Low, Medium, High) with stream deflation and image downsampling.
- **Edit PDF**: Interactive canvas markup, freehand drawing, highlighter, and text insertion.
- **Rotate PDF**: Rotate all or specific pages by 90°, 180°, or 270°.
- **Organize PDF**: Visual drag-and-drop thumbnail grid to reorder, delete, and rotate pages.
- **Delete PDF Pages**: Remove specific page numbers or ranges.
- **Extract PDF Pages**: Extract target page numbers or ranges into a clean new PDF.
- **Crop PDF**: Precision margin cropping (top, bottom, left, right in points).
- **Resize PDF**: Standardize page dimensions to A4, Letter, Legal, or A3 formats.
- **Compare PDF**: Side-by-side textual and structural diff analyzer between two versions.

### 2. PDF Security (2 Tools)
- **Protect PDF**: AES-256 password encryption with customizable print and copy permissions.
- **Unlock PDF**: Decrypt password-protected documents with instant permission restoration.

### 3. PDF Annotation & Document (3 Tools)
- **Add Watermark**: Apply custom text watermarks with opacity, angle (e.g. 45° diagonal), and position controls.
- **Sign PDF**: Interactive digital signature drawing pad or PNG signature image stamper.
- **Add Page Numbers**: Flexible numbering formats (`Page {n} of {total}`, `{n}/{total}`), margins, and position presets.

### 4. PDF Conversions (6 Tools)
- **PDF → Word (.docx)**: Layout-preserving document reconstruction with paragraph and table recognition.
- **PDF → PowerPoint (.pptx)**: Converts PDF pages into editable PowerPoint slides matching exact aspect ratios.
- **PDF → Excel (.xlsx)**: Tabular data extraction into structured Excel workbooks.
- **PDF → JPG**: High-resolution rasterization to JPEG (packaged as ZIP for multi-page documents).
- **PDF → PNG**: Transparent, lossless page rendering to PNG.
- **PDF → Text (.txt)**: Clean plain-text extraction with page delimiters.

### 5. Other Formats → PDF (7 Tools)
- **Word → PDF**: High-fidelity DOCX to PDF conversion.
- **PowerPoint → PDF**: PPTX slide deck to PDF conversion.
- **Excel → PDF**: XLSX tabular sheets to formatted PDF conversion.
- **JPG → PDF**: Multi-image to PDF compiler with custom orientation and margins.
- **PNG → PDF**: Multi-image to PDF compiler.
- **HTML → PDF**: Raw HTML code or `.html` file rendering with full CSS styling.
- **Scan → PDF**: Live WebRTC camera scanner with grayscale/high-contrast B&W document filters.

### 6. OCR & Utilities (3 Tools)
- **OCR / Image → Text**: Optical character recognition to extract editable text from photos or scans.
- **OCR → PDF**: Creates searchable PDFs with invisible selectable text layers.
- **Extract Images from PDF**: Pulls all embedded raster graphics from a PDF into a ZIP archive with JSON metadata.

---

## 🏗 Architecture & Tech Stack

```
DocuTools Architecture:
[ React 19 + TypeScript + Tailwind CSS v4 ] (Frontend UI)
                   │
                   ▼ HTTP REST / Multipart
[ FastAPI + Uvicorn (Python 3.13) ] (API Gateway)
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
[ PyMuPDF C++ Engine ]  [ Office Conversion Engine ]
(PDF Manipulation,       (pdf2docx, python-pptx,
 Rasterization, Crypto)   openpyxl, reportlab, LibreOffice)
        │
        ▼
[ Isolated Sandboxes ] -> Automatic Background Scavenger
```

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Vite 8, Canvas Confetti.
- **Backend API**: FastAPI, Uvicorn, Python 3.13, Pydantic, Python-Multipart.
- **Document Engines**: PyMuPDF (fitz), pdf2docx, pdfplumber, openpyxl, python-pptx, python-docx, reportlab, Pillow.
- **Containerization**: Multi-stage Dockerfile & docker-compose.

---

## 🔒 Security & Privacy Guarantees

1. **UUID Sandboxing**: Every uploaded file is written to an isolated UUID folder under `tmp/`.
2. **Path Traversal Guards**: Strict filename sanitization removes directory traversal patterns (`../`), null bytes, and dangerous characters.
3. **Automatic Lifecycle Cleanup**: FastAPI `BackgroundTasks` delete temporary files immediately after download finishes.
4. **Periodic Scavenger**: A background daemon purges any abandoned temporary files older than 15 minutes.
5. **No Registration**: Frictionless, privacy-preserving usage with zero user tracking.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: v20+
- **Python**: 3.11+
- **pip** and **npm**

### 1. Clone & Install
```bash
git clone https://github.com/your-org/docutools.git
cd docutools

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install
npm run build
cd ..
```

### 2. Run the Unified Server
```bash
python run.py
```
Open **http://localhost:8000** in your browser. API docs are available at **http://localhost:8000/docs**.

---

## 🐳 Docker Deployment

Run the complete multi-stage containerized app with a single command:
```bash
docker compose up -d --build
```
Access the application at `http://localhost:8000`.

---

## 🧪 Automated Testing

DocuTools includes comprehensive automated tests covering all 32 tools, endpoint behavior, and security validations.

Run the test suite:
```bash
cd backend
python -m pytest -v
```

---

## 📄 License
Released under the [MIT License](LICENSE).
