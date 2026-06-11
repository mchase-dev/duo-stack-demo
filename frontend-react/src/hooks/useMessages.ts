import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { messagesApi } from '../api';
import type { SendMessageRequest } from '../types';

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagesApi.getConversations(),
    select: (data) => data.data,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useConversation = (userId: string) => {
  return useQuery({
    queryKey: ['conversation', userId],
    queryFn: () => messagesApi.getConversation(userId),
    select: (data) => data.data.messages, // Extract messages array from response
    enabled: !!userId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageRequest) => messagesApi.sendMessage(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.toUserId] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to send message';
      toast.error(message);
    },
  });
};
