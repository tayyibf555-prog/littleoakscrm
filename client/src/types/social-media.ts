export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';

export interface SocialMediaAccount {
  id: string;
  platform: string;
  accountName: string;
  isConnected: boolean;
  createdAt: string;
}

export interface SocialMediaPost {
  id: string;
  authorId: string;
  content: string;
  mediaUrls: string[];
  platforms: string[];
  status: PostStatus;
  scheduledFor: string | null;
  publishedAt: string | null;
  consentVerified: boolean;
  childrenInPost: string[];
  author?: {
    staffProfile?: { firstName: string; lastName: string } | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConsentChild {
  id: string;
  firstName: string;
  lastName: string;
  socialMediaConsent?: {
    canPostPhotos: boolean;
    platforms: string[];
  } | null;
}
