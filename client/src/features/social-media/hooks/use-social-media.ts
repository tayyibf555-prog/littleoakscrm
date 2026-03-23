import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialMediaApi } from '@/api/social-media';
import type { CreatePostData } from '@/api/social-media';

export function useSocialMediaAccounts() {
  return useQuery({
    queryKey: ['social-media-accounts'],
    queryFn: () => socialMediaApi.listAccounts().then((res) => res.data),
  });
}

export function useConsentChildren() {
  return useQuery({
    queryKey: ['social-media-consent-children'],
    queryFn: () => socialMediaApi.listConsentChildren().then((res) => res.data),
  });
}

export function useSocialMediaPosts() {
  return useQuery({
    queryKey: ['social-media-posts'],
    queryFn: () => socialMediaApi.listPosts().then((res) => res.data),
  });
}

export function useSocialMediaPost(id: string) {
  return useQuery({
    queryKey: ['social-media-posts', id],
    queryFn: () => socialMediaApi.getPost(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) =>
      socialMediaApi.createPost(data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['social-media-posts'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => socialMediaApi.deletePost(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['social-media-posts'] });
    },
  });
}
