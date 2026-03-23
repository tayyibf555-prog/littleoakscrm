export type DocumentCategory = 'POLICY' | 'FORM' | 'CERTIFICATE' | 'OFSTED' | 'RISK_ASSESSMENT' | 'OTHER';

export interface Document {
  id: string;
  title: string;
  description: string | null;
  category: DocumentCategory;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  POLICY: 'Policy',
  FORM: 'Form',
  CERTIFICATE: 'Certificate',
  OFSTED: 'Ofsted',
  RISK_ASSESSMENT: 'Risk Assessment',
  OTHER: 'Other',
};
