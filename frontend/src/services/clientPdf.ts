import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import { ProcessResult } from '../types';

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
