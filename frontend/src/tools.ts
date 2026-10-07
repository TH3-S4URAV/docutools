import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';

// -------------------------------------------------------------
// TYPES & DATA STRUCTURES
// -------------------------------------------------------------
export type ToolCategory = 
  | 'all'
  | 'pdf_organize'
  | 'pdf_security'
  | 'pdf_annotate'
  | 'convert_from_pdf'
  | 'convert_to_pdf'
  | 'ocr_extra';

export interface ToolItem {
  id: string;
  title: string;
  description: string;
  category: ToolCategory;
  iconName: string;
  badgeBg: string;
  badgeColor: string;
  accept: string;
  multiple?: boolean;
  endpoint: string;
  popular?: boolean;
  customComponent?: 'organize' | 'signature' | 'scanner' | 'compare' | 'ocr';
}

export interface ProcessResult {
  blob?: Blob;
  downloadUrl?: string;
  filename: string;
  originalSize?: number;
  resultSize?: number;
  savingsPercent?: number;
  message?: string;
  data?: any;
}

// -------------------------------------------------------------
// 32 PRODUCTION TOOLS CATALOG
// -------------------------------------------------------------
export const TOOLS: ToolItem[] = [
  // --- PDF ORGANIZE / EDIT ---
  {
    id: 'merge-pdf',
    title: 'Merge PDF',
    description: 'Combine multiple PDFs into a single document in any custom order you choose.',
    category: 'pdf_organize',
    iconName: 'Combine',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
    badgeColor: 'text-rose-600 dark:text-rose-400',
    accept: '.pdf',
    multiple: true,
    endpoint: '/api/tools/merge',
    popular: true
  },
  {
    id: 'split-pdf',
    title: 'Split PDF',
    description: 'Separate individual pages or extract custom page ranges into clean standalone documents.',
    category: 'pdf_organize',
    iconName: 'Split',
    badgeBg: 'bg-orange-100 dark:bg-orange-950/60',
    badgeColor: 'text-orange-600 dark:text-orange-400',
    accept: '.pdf',
    endpoint: '/api/tools/split',
    popular: true
  },
  {
    id: 'compress-pdf',
    title: 'Compress PDF',
    description: 'Reduce PDF file size significantly while retaining crisp text and image clarity.',
    category: 'pdf_organize',
    iconName: 'Minimize2',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeColor: 'text-amber-600 dark:text-amber-400',
    accept: '.pdf',
    endpoint: '/api/tools/compress',
    popular: true
  },
  {
    id: 'edit-pdf',
    title: 'Edit PDF',
    description: 'Annotate, add text, highlight content, or draw shapes directly onto your PDF pages.',
    category: 'pdf_organize',
    iconName: 'Edit3',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/60',
    badgeColor: 'text-indigo-600 dark:text-indigo-400',
    accept: '.pdf',
    endpoint: '/api/tools/watermark',
    popular: true
  },
  {
    id: 'rotate-pdf',
    title: 'Rotate PDF',
    description: 'Rotate individual or all pages 90°, 180°, or 270° to permanently fix page orientation.',
    category: 'pdf_organize',
    iconName: 'RotateCw',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
    badgeColor: 'text-blue-600 dark:text-blue-400',
    accept: '.pdf',
    endpoint: '/api/tools/rotate'
  },
  {
    id: 'organize-pdf',
    title: 'Organize PDF',
    description: 'Sort, reorder, rotate, and delete specific pages interactively with a visual grid thumbnail view.',
    category: 'pdf_organize',
    iconName: 'LayoutGrid',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
    badgeColor: 'text-purple-600 dark:text-purple-400',
    accept: '.pdf',
    endpoint: '/api/tools/rotate',
    customComponent: 'organize'
  },
  {
    id: 'delete-pages',
    title: 'Delete Pages',
    description: 'Remove unwanted pages or sections from your PDF document and generate a clean copy.',
    category: 'pdf_organize',
    iconName: 'Trash2',
    badgeBg: 'bg-red-100 dark:bg-red-950/60',
    badgeColor: 'text-red-600 dark:text-red-400',
    accept: '.pdf',
    endpoint: '/api/tools/delete-pages'
  },
  {
    id: 'extract-pages',
    title: 'Extract Pages',
    description: 'Select and export specific pages or page ranges from a large PDF into a new separate document.',
    category: 'pdf_organize',
    iconName: 'FileCheck2',
    badgeBg: 'bg-teal-100 dark:bg-teal-950/60',
    badgeColor: 'text-teal-600 dark:text-teal-400',
    accept: '.pdf',
    endpoint: '/api/tools/extract-pages'
  },
  {
    id: 'crop-pdf',
    title: 'Crop PDF',
    description: 'Trim margins, borders, or blank edges from your PDF document pages with millimeter precision.',
    category: 'pdf_organize',
    iconName: 'Crop',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeColor: 'text-emerald-600 dark:text-emerald-400',
    accept: '.pdf',
    endpoint: '/api/tools/crop'
  },
  {
    id: 'resize-pdf',
    title: 'Resize PDF',
    description: 'Scale and standardize page dimensions to standard sizes like A4, Letter, Legal, or A3.',
    category: 'pdf_organize',
    iconName: 'Scaling',
    badgeBg: 'bg-cyan-100 dark:bg-cyan-950/60',
    badgeColor: 'text-cyan-600 dark:text-cyan-400',
    accept: '.pdf',
    endpoint: '/api/tools/resize'
  },
  {
    id: 'compare-pdf',
    title: 'Compare PDF',
    description: 'Compare two PDF documents side by side to instantly highlight text and content revisions.',
    category: 'pdf_organize',
    iconName: 'GitCompare',
    badgeBg: 'bg-violet-100 dark:bg-violet-950/60',
    badgeColor: 'text-violet-600 dark:text-violet-400',
    accept: '.pdf',
    endpoint: '/api/tools/compare',
    customComponent: 'compare'
  },

  // --- PDF SECURITY ---
  {
    id: 'protect-pdf',
    title: 'Protect PDF',
    description: 'Secure your confidential PDF documents with AES-256 encryption and custom permissions.',
    category: 'pdf_security',
    iconName: 'Lock',
    badgeBg: 'bg-red-100 dark:bg-red-950/60',
    badgeColor: 'text-red-600 dark:text-red-400',
    accept: '.pdf',
    endpoint: '/api/tools/protect',
    popular: true
  },
  {
    id: 'unlock-pdf',
    title: 'Unlock PDF',
    description: 'Remove password restrictions from protected PDFs so you can freely read, print, and share them.',
    category: 'pdf_security',
    iconName: 'Unlock',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeColor: 'text-emerald-600 dark:text-emerald-400',
    accept: '.pdf',
    endpoint: '/api/tools/unlock',
    popular: true
  },

  // --- PDF ANNOTATION & SIGN ---
  {
    id: 'add-watermark',
    title: 'Add Watermark',
    description: 'Stamp custom text or confidential watermarks across pages with angle, opacity, and size controls.',
    category: 'pdf_annotate',
    iconName: 'Stamp',
    badgeBg: 'bg-pink-100 dark:bg-pink-950/60',
    badgeColor: 'text-pink-600 dark:text-pink-400',
    accept: '.pdf',
    endpoint: '/api/tools/watermark'
  },
  {
    id: 'sign-pdf',
    title: 'Sign PDF',
    description: 'Draw or upload your digital signature and stamp it securely anywhere on any page.',
    category: 'pdf_annotate',
    iconName: 'PenTool',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/60',
    badgeColor: 'text-indigo-600 dark:text-indigo-400',
    accept: '.pdf',
    endpoint: '/api/tools/sign',
    popular: true,
    customComponent: 'signature'
  },
  {
    id: 'page-numbers',
    title: 'Page Numbers',
    description: 'Insert numbering patterns (e.g., Page 1 of 10) at headers or footers with customizable styling.',
    category: 'pdf_annotate',
    iconName: 'Hash',
    badgeBg: 'bg-sky-100 dark:bg-sky-950/60',
    badgeColor: 'text-sky-600 dark:text-sky-400',
    accept: '.pdf',
    endpoint: '/api/tools/page-numbers'
  },

  // --- CONVERT FROM PDF ---
  {
    id: 'pdf-to-word',
    title: 'PDF to Word',
    description: 'Convert PDFs to editable Microsoft Word (.docx) format while preserving tables and layouts.',
    category: 'convert_from_pdf',
    iconName: 'FileText',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
    badgeColor: 'text-blue-600 dark:text-blue-400',
    accept: '.pdf',
    endpoint: '/api/tools/pdf-to-docx',
    popular: true
  },
  {
    id: 'pdf-to-powerpoint',
    title: 'PDF to PowerPoint',
    description: 'Turn your PDF documents and slides into editable Microsoft PowerPoint (.pptx) presentations.',
    category: 'convert_from_pdf',
    iconName: 'Presentation',
    badgeBg: 'bg-orange-100 dark:bg-orange-950/60',
    badgeColor: 'text-orange-600 dark:text-orange-400',
    accept: '.pdf',
    endpoint: '/api/tools/pdf-to-pptx'
  },
  {
    id: 'pdf-to-excel',
    title: 'PDF to Excel',
    description: 'Extract tables and structured data grids from PDF documents into Excel spreadsheets (.xlsx).',
    category: 'convert_from_pdf',
    iconName: 'FileSpreadsheet',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeColor: 'text-emerald-600 dark:text-emerald-400',
    accept: '.pdf',
    endpoint: '/api/tools/pdf-to-xlsx',
    popular: true
  },
  {
    id: 'pdf-to-jpg',
    title: 'PDF to JPG',
    description: 'Convert PDF to Image (JPG). Turn each PDF page into high-resolution JPG photos and images.',
    category: 'convert_from_pdf',
    iconName: 'Image',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeColor: 'text-amber-600 dark:text-amber-400',
    accept: '.pdf',
    endpoint: '/api/tools/pdf-to-images',
    popular: true
  },
  {
    id: 'pdf-to-png',
    title: 'PDF to PNG',
    description: 'Convert PDF to Image (PNG). Render crisp, transparent PNG pictures from PDF pages with lossless clarity.',
    category: 'convert_from_pdf',
    iconName: 'Image',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
    badgeColor: 'text-purple-600 dark:text-purple-400',
    accept: '.pdf',
    endpoint: '/api/tools/pdf-to-images'
  },
  {
    id: 'pdf-to-text',
    title: 'PDF to Text',
    description: 'Extract clean UTF-8 plain text from your PDF document for easy reading and analysis.',
    category: 'convert_from_pdf',
    iconName: 'FileCode',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeColor: 'text-slate-700 dark:text-slate-300',
    accept: '.pdf',
    endpoint: '/api/tools/pdf-to-txt'
  },

  // --- CONVERT TO PDF ---
  {
    id: 'word-to-pdf',
    title: 'Word to PDF',
    description: 'Convert Microsoft Word documents (.docx, .doc) into high-fidelity, printable PDF files.',
    category: 'convert_to_pdf',
    iconName: 'FileText',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
    badgeColor: 'text-blue-600 dark:text-blue-400',
    accept: '.docx,.doc',
    endpoint: '/api/tools/docx-to-pdf',
    popular: true
  },
  {
    id: 'powerpoint-to-pdf',
    title: 'PowerPoint to PDF',
    description: 'Convert slide decks (.pptx, .ppt) into standard PDF documents suitable for viewing on any device.',
    category: 'convert_to_pdf',
    iconName: 'Presentation',
    badgeBg: 'bg-orange-100 dark:bg-orange-950/60',
    badgeColor: 'text-orange-600 dark:text-orange-400',
    accept: '.pptx,.ppt',
    endpoint: '/api/tools/pptx-to-pdf'
  },
  {
    id: 'excel-to-pdf',
    title: 'Excel to PDF',
    description: 'Transform spreadsheet sheets (.xlsx, .xls) into organized PDF tables and reports.',
    category: 'convert_to_pdf',
    iconName: 'FileSpreadsheet',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeColor: 'text-emerald-600 dark:text-emerald-400',
    accept: '.xlsx,.xls',
    endpoint: '/api/tools/xlsx-to-pdf'
  },
  {
    id: 'jpg-to-pdf',
    title: 'JPG to PDF',
    description: 'Convert JPG photos and graphics into a clean, unified PDF file with custom margins.',
    category: 'convert_to_pdf',
    iconName: 'Image',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeColor: 'text-amber-600 dark:text-amber-400',
    accept: '.jpg,.jpeg',
    multiple: true,
    endpoint: '/api/tools/images-to-pdf',
    popular: true
  },
  {
    id: 'png-to-pdf',
    title: 'PNG to PDF',
    description: 'Merge PNG photos, screenshots, and graphics into a multi-page PDF document.',
    category: 'convert_to_pdf',
    iconName: 'Image',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
    badgeColor: 'text-purple-600 dark:text-purple-400',
    accept: '.png',
    multiple: true,
    endpoint: '/api/tools/images-to-pdf'
  },
  {
    id: 'html-to-pdf',
    title: 'HTML to PDF',
    description: 'Render web page HTML files or raw HTML code snippets into a PDF with CSS formatting.',
    category: 'convert_to_pdf',
    iconName: 'Code',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
    badgeColor: 'text-rose-600 dark:text-rose-400',
    accept: '.html,.htm',
    endpoint: '/api/tools/html-to-pdf'
  },
  {
    id: 'scan-to-pdf',
    title: 'Scan to PDF',
    description: 'Capture documents, receipts, or notes with your camera and compile them into a PDF.',
    category: 'convert_to_pdf',
    iconName: 'Camera',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/60',
    badgeColor: 'text-indigo-600 dark:text-indigo-400',
    accept: '.jpg,.jpeg,.png',
    endpoint: '/api/tools/images-to-pdf',
    customComponent: 'scanner'
  },

  // --- OCR & UTILITIES ---
  {
    id: 'ocr-pdf',
    title: 'OCR Image to Text',
    description: 'Extract editable text from scanned documents, screenshots, and photos with OCR.',
    category: 'ocr_extra',
    iconName: 'ScanText',
    badgeBg: 'bg-cyan-100 dark:bg-cyan-950/60',
    badgeColor: 'text-cyan-600 dark:text-cyan-400',
    accept: '.jpg,.jpeg,.png,.webp,.bmp',
    endpoint: '/api/tools/ocr',
    popular: true
  },
  {
    id: 'ocr-searchable-pdf',
    title: 'OCR to Searchable PDF',
    description: 'Embed an invisible text layer behind scanned images to make PDFs searchable and selectable.',
    category: 'ocr_extra',
    iconName: 'FileSearch',
    badgeBg: 'bg-teal-100 dark:bg-teal-950/60',
    badgeColor: 'text-teal-600 dark:text-teal-400',
    accept: '.jpg,.jpeg,.png,.webp,.bmp',
    endpoint: '/api/tools/ocr-pdf'
  },
  {
    id: 'extract-images',
    title: 'Extract Images from PDF',
    description: 'Extract all embedded photos, illustrations, and raster graphics from inside a PDF file into a ZIP.',
    category: 'ocr_extra',
    iconName: 'Images',
    badgeBg: 'bg-violet-100 dark:bg-violet-950/60',
    badgeColor: 'text-violet-600 dark:text-violet-400',
    accept: '.pdf',
    endpoint: '/api/tools/extract-images'
  }
];

// -------------------------------------------------------------
// CLIENT-SIDE PROCESSING FALLBACKS (PDF-LIB / WASM)
// -------------------------------------------------------------
export async function clientMergePdfs(files: File[]): Promise<ProcessResult> {
  const mergedPdf = await PDFDocument.create();
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  const mergedPdfBytes = await mergedPdf.save();
  const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);
  return {
    blob,
    downloadUrl,
    filename: 'merged_document.pdf',
    resultSize: blob.size,
    message: 'Merged successfully in browser!'
  };
}

export async function clientRotatePdf(file: File, angle: number): Promise<ProcessResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  for (const page of pages) {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + angle) % 360));
  }
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);
  return {
    blob,
    downloadUrl,
    filename: `rotated_${file.name}`,
    resultSize: blob.size
  };
}

export async function clientImagesToPdf(files: File[]): Promise<ProcessResult> {
  const pdfDoc = await PDFDocument.create();
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let img;
    if (file.type.includes('png') || file.name.endsWith('.png')) {
      img = await pdfDoc.embedPng(arrayBuffer);
    } else {
      img = await pdfDoc.embedJpg(arrayBuffer);
    }
    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);
  return {
    blob,
    downloadUrl,
    filename: 'compiled_images.pdf',
    resultSize: blob.size
  };
}

export async function clientAddWatermark(file: File, text: string, opacity: number = 0.3): Promise<ProcessResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width / 4,
      y: height / 2,
      size: 42,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: opacity || 0.3,
      rotate: degrees(45)
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);
  return {
    blob,
    downloadUrl,
    filename: `watermarked_${file.name}`,
    resultSize: blob.size
  };
}

export async function clientAddPageNumbers(file: File, pattern: string = 'Page {n} of {total}'): Promise<ProcessResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    const page = pages[i];
    const { width } = page.getSize();
    const label = pattern.replace('{n}', `${i + 1}`).replace('{total}', `${total}`);
    page.drawText(label, {
      x: width / 2 - 30,
      y: 25,
      size: 10,
      font,
      color: rgb(0.2, 0.2, 0.2)
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);
  return {
    blob,
    downloadUrl,
    filename: `numbered_${file.name}`,
    resultSize: blob.size
  };
}

// -------------------------------------------------------------
// API CLIENT REQUEST HANDLER
// -------------------------------------------------------------
export async function processToolRequest(endpoint: string, formData: FormData): Promise<ProcessResult> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMsg = 'Processing failed. Please check the file and try again.';
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorMsg = errorData.detail;
        }
      } catch {
        // Not JSON
      }
      throw new Error(errorMsg);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return {
        filename: 'result.json',
        data,
        message: data.message || 'Analysis complete!'
      };
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    let filename = 'processed_document';
    const disposition = response.headers.get('content-disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const resultSize = parseInt(response.headers.get('x-result-size') || `${blob.size}`, 10);
    const originalSize = parseInt(response.headers.get('x-original-size') || '0', 10);
    const savingsPercent = parseFloat(response.headers.get('x-savings-percent') || '0');

    return {
      blob,
      downloadUrl,
      filename,
      originalSize: originalSize || undefined,
      resultSize,
      savingsPercent: savingsPercent || undefined,
    };
  } catch (error: any) {
    console.warn('Backend unavailable, attempting client-side fallback:', error);
    try {
      if (endpoint.includes('/merge')) {
        const files = formData.getAll('files') as File[];
        if (files && files.length >= 2) return await clientMergePdfs(files);
      } else if (endpoint.includes('/rotate')) {
        const file = formData.get('file') as File;
        const angle = parseInt(formData.get('angle') as string) || 90;
        if (file) return await clientRotatePdf(file, angle);
      } else if (endpoint.includes('/images-to-pdf')) {
        const files = formData.getAll('files') as File[];
        if (files && files.length > 0) return await clientImagesToPdf(files);
      } else if (endpoint.includes('/watermark')) {
        const file = formData.get('file') as File;
        const text = (formData.get('text') as string) || 'CONFIDENTIAL';
        const opacity = parseFloat(formData.get('opacity') as string) || 0.3;
        if (file) return await clientAddWatermark(file, text, opacity);
      } else if (endpoint.includes('/page-numbers')) {
        const file = formData.get('file') as File;
        const pattern = (formData.get('format_pattern') as string) || 'Page {n} of {total}';
        if (file) return await clientAddPageNumbers(file, pattern);
      }
    } catch (clientErr: any) {
      console.error('Client fallback failed:', clientErr);
    }
    throw new Error(error.message || 'Processing failed or server is temporarily unreachable.');
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
