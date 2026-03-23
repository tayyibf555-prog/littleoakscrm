import api from './client';
import type { SocialMediaAccount, SocialMediaPost, ConsentChild } from '@/types/social-media';

export interface CreatePostData {
  content: string;
  mediaUrls?: string[];
  platforms: string[];
  scheduledFor?: string;
  childrenInPost?: string[];
}

export const socialMediaApi = {
  listAccounts: () =>
    api.get<SocialMediaAccount[]>('/social-media/accounts'),

  listConsentChildren: () =>
    api.get<ConsentChild[]>('/social-media/consent-children'),

  listPosts: () =>
    api.get<SocialMediaPost[]>('/social-media/posts'),

  getPost: (id: string) =>
    api.get<SocialMediaPost>(`/social-media/posts/${id}`),

  createPost: (data: CreatePostData) =>
    api.post<SocialMediaPost>('/social-media/posts', data),

  deletePost: (id: string) =>
    api.delete(`/social-media/posts/${id}`),
};
