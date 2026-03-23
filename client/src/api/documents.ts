import api from './client';
import type { Document, DocumentCategory } from '@/types/document';

export interface ListDocumentsParams {
  category?: DocumentCategory;
}

export interface CreateDocumentData {
  title: string;
  description?: string;
  category: DocumentCategory;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface UpdateDocumentData {
  title?: string;
  description?: string;
  category?: DocumentCategory;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export const documentsApi = {
  list: (params?: ListDocumentsParams) =>
    api.get<Document[]>('/documents', { params }),

  get: (id: string) =>
    api.get<Document>(`/documents/${id}`),

  create: (data: CreateDocumentData) =>
    api.post<Document>('/documents', data),

  update: (id: string, data: UpdateDocumentData) =>
    api.put<Document>(`/documents/${id}`, data),

  delete: (id: string) =>
    api.delete(`/documents/${id}`),
};
