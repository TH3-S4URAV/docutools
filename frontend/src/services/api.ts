import { ProcessResult } from '../types';
import { clientMergePdfs, clientRotatePdf, clientImagesToPdf, clientAddWatermark, clientAddPageNumbers } from './clientPdf';

export async function processToolRequest(endpoint: string, formData: FormData): Promise<ProcessResult> {
  const url = endpoint.startsWith('http') ? endpoint : endpoint;
  
  try {
    const response = await fetch(url, {
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

    // Client-side fallback handler for static / serverless deployments
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
