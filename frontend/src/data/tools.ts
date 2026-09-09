import { ToolItem } from '../types';

export const TOOLS: ToolItem[] = [
  // --- PDF ORGANIZE / EDIT (1-11) ---
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
    description: 'Visually sort, reorder, rotate, or delete PDF pages with an interactive thumbnail grid.',
    category: 'pdf_organize',
    iconName: 'LayoutGrid',
    badgeBg: 'bg-teal-100 dark:bg-teal-950/60',
    badgeColor: 'text-teal-600 dark:text-teal-400',
    accept: '.pdf',
    endpoint: '/api/tools/extract-pages',
    customComponent: 'organize',
    popular: true
  },
  {
    id: 'delete-pdf-pages',
    title: 'Delete PDF Pages',
    description: 'Remove unwanted or blank pages from your PDF document in seconds.',
    category: 'pdf_organize',
    iconName: 'Trash2',
    badgeBg: 'bg-red-100 dark:bg-red-950/60',
    badgeColor: 'text-red-600 dark:text-red-400',
    accept: '.pdf',
    endpoint: '/api/tools/delete-pages'
  },
  {
    id: 'extract-pdf-pages',
    title: 'Extract PDF Pages',
    description: 'Select specific pages from a large PDF and save them as a new, compact document.',
    category: 'pdf_organize',
    iconName: 'Scissors',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
    badgeColor: 'text-purple-600 dark:text-purple-400',
    accept: '.pdf',
    endpoint: '/api/tools/extract-pages'
  },
  {
    id: 'crop-pdf',
    title: 'Crop PDF',
    description: 'Trim page margins, remove headers/footers, or frame specific content areas.',
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
    description: 'Adjust document dimensions to standard paper formats including A4, Letter, and Legal.',
    category: 'pdf_organize',
    iconName: 'Maximize2',
    badgeBg: 'bg-cyan-100 dark:bg-cyan-950/60',
    badgeColor: 'text-cyan-600 dark:text-cyan-400',
    accept: '.pdf',
    endpoint: '/api/tools/resize'
  },
  {
    id: 'compare-pdf',
    title: 'Compare PDF',
    description: 'Compare two PDF documents side-by-side to highlight textual and structural changes.',
    category: 'pdf_organize',
    iconName: 'GitCompare',
    badgeBg: 'bg-violet-100 dark:bg-violet-950/60',
    badgeColor: 'text-violet-600 dark:text-violet-400',
    accept: '.pdf',
    endpoint: '/api/tools/compare',
    customComponent: 'compare'
  },

  // --- PDF SECURITY (12-13) ---
  {
    id: 'protect-pdf',
    title: 'Protect PDF',
    description: 'Encrypt your document with robust AES password protection and custom print permissions.',
    category: 'pdf_security',
    iconName: 'Lock',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeColor: 'text-amber-600 dark:text-amber-400',
    accept: '.pdf',
    endpoint: '/api/tools/protect',
    popular: true
  },
  {
    id: 'unlock-pdf',
    title: 'Unlock PDF',
    description: 'Remove PDF security and passwords when authorized so you can edit and share freely.',
    category: 'pdf_security',
    iconName: 'Unlock',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeColor: 'text-emerald-600 dark:text-emerald-400',
    accept: '.pdf',
    endpoint: '/api/tools/unlock'
  },

  // --- PDF ANNOTATION / DOCUMENT (14-16) ---
  {
    id: 'add-watermark',
    title: 'Add Watermark',
    description: 'Stamp custom text or confidential disclaimers across all pages with opacity control.',
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
    description: 'Draw a digital signature or upload an image to stamp onto contracts and agreements.',
    category: 'pdf_annotate',
    iconName: 'PenTool',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
    badgeColor: 'text-blue-600 dark:text-blue-400',
    accept: '.pdf',
    endpoint: '/api/tools/sign',
    customComponent: 'signature',
    popular: true
  },
  {
    id: 'add-page-numbers',
    title: 'Add Page Numbers',
    description: 'Insert clean, professional page numbering in your preferred position and format.',
    category: 'pdf_annotate',
    iconName: 'Hash',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/60',
    badgeColor: 'text-indigo-600 dark:text-indigo-400',
    accept: '.pdf',
    endpoint: '/api/tools/page-numbers'
  },

  // --- PDF CONVERSION (17-22) ---
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
    description: 'Convert each page of your PDF into high-resolution JPG images packaged neatly.',
    category: 'convert_from_pdf',
    iconName: 'Image',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeColor: 'text-amber-600 dark:text-amber-400',
    accept: '.pdf',
    endpoint: '/api/tools/pdf-to-images'
  },
  {
    id: 'pdf-to-png',
    title: 'PDF to PNG',
    description: 'Render crisp, transparent PNG images from your PDF pages with lossless quality.',
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

  // --- OTHER -> PDF (23-29) ---
  {
    id: 'word-to-pdf',
    title: 'Word to PDF',
    description: 'Convert DOCX documents into standard PDF files with exact layout and font fidelity.',
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
    description: 'Convert PPTX slide decks into presentation-ready, universally shareable PDF files.',
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
    description: 'Convert XLSX spreadsheets and data sheets into clean, formatted PDF documents.',
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
    description: 'Convert one or multiple JPG photos into a single, beautifully bound PDF document.',
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
    description: 'Convert PNG images into a clean PDF document with customized page margins.',
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
    description: 'Convert HTML files or styled web code snippets directly into high-fidelity PDF documents.',
    category: 'convert_to_pdf',
    iconName: 'FileCode',
    badgeBg: 'bg-cyan-100 dark:bg-cyan-950/60',
    badgeColor: 'text-cyan-600 dark:text-cyan-400',
    accept: '.html,.htm',
    endpoint: '/api/tools/html-to-pdf'
  },
  {
    id: 'scan-to-pdf',
    title: 'Scan to PDF',
    description: 'Use your webcam or phone camera to capture physical papers and compile them into a PDF.',
    category: 'convert_to_pdf',
    iconName: 'ScanLine',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/60',
    badgeColor: 'text-indigo-600 dark:text-indigo-400',
    accept: 'image/*',
    endpoint: '/api/tools/images-to-pdf',
    customComponent: 'scanner',
    popular: true
  },

  // --- OCR & EXTRA (30-32) ---
  {
    id: 'ocr-image-to-text',
    title: 'OCR / Image to Text',
    description: 'Extract editable text from scanned documents and photos using optical character recognition.',
    category: 'ocr_extra',
    iconName: 'Sparkles',
    badgeBg: 'bg-violet-100 dark:bg-violet-950/60',
    badgeColor: 'text-violet-600 dark:text-violet-400',
    accept: 'image/*,.pdf',
    endpoint: '/api/tools/ocr',
    customComponent: 'ocr',
    popular: true
  },
  {
    id: 'ocr-to-pdf',
    title: 'OCR to PDF',
    description: 'Convert scanned images and non-selectable documents into fully searchable PDFs.',
    category: 'ocr_extra',
    iconName: 'FileSearch',
    badgeBg: 'bg-fuchsia-100 dark:bg-fuchsia-950/60',
    badgeColor: 'text-fuchsia-600 dark:text-fuchsia-400',
    accept: 'image/*',
    endpoint: '/api/tools/ocr-to-pdf'
  },
  {
    id: 'extract-images-from-pdf',
    title: 'Extract Images from PDF',
    description: 'Pull all embedded photos, diagrams, and illustrations from a PDF and download as a ZIP.',
    category: 'ocr_extra',
    iconName: 'FolderArchive',
    badgeBg: 'bg-teal-100 dark:bg-teal-950/60',
    badgeColor: 'text-teal-600 dark:text-teal-400',
    accept: '.pdf',
    endpoint: '/api/tools/extract-images'
  }
];

export const CATEGORIES = [
  { id: 'all', label: 'All Tools', count: 32 },
  { id: 'pdf_organize', label: 'PDF Organize & Edit', count: 11 },
  { id: 'pdf_security', label: 'PDF Security', count: 2 },
  { id: 'pdf_annotate', label: 'Annotate & Sign', count: 3 },
  { id: 'convert_from_pdf', label: 'Convert from PDF', count: 6 },
  { id: 'convert_to_pdf', label: 'Convert to PDF', count: 7 },
  { id: 'ocr_extra', label: 'OCR & Utilities', count: 3 }
];
