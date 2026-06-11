import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { pagesApi } from '../api';
import type { CreatePageRequest, UpdatePageRequest } from '../types';

export const usePages = () => {
  return useQuery({
    queryKey: ['pages'],
    queryFn: () => pagesApi.getPages(),
    select: (data) => data.data,
  });
};

export const usePage = (slug: string) => {
  return useQuery({
    queryKey: ['pages', slug],
    queryFn: () => pagesApi.getPageBySlug(slug),
    select: (data) => data.data,
    enabled: !!slug,
  });
};

export const useCreatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePageRequest) => pagesApi.createPage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success('Page created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to create page';
      toast.error(message);
    },
  });
};

export const useUpdatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pageId, data }: { pageId: string; data: UpdatePageRequest }) =>
      pagesApi.updatePage(pageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success('Page updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to update page';
      toast.error(message);
    },
  });
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pageId: string) => pagesApi.deletePage(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success('Page deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to delete page';
      toast.error(message);
    },
  });
};
