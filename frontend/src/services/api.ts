import { ProcessResult } from '../types';

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
    
    // If server returned JSON (e.g. compare-pdf or ocr)
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return {
        filename: 'result.json',
        data,
        message: data.message || 'Analysis complete!'
      };
    }

    // Otherwise binary download file
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    // Extract filename from Content-Disposition header
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
    console.error('API Error:', error);
    throw new Error(error.message || 'Network error or server unavailable. Please try again.');
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
