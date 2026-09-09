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
