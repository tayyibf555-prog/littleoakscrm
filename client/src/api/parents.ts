import api from './client';

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateParentData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
}

export interface LinkParentData {
  relationship: string;
}

export const parentsApi = {
  list: () =>
    api.get<Parent[]>('/parents'),

  create: (data: CreateParentData) =>
    api.post<Parent>('/parents', data),

  linkToChild: (parentId: string, childId: string, data: LinkParentData) =>
    api.post(`/parents/${parentId}/children/${childId}`, data),
};
