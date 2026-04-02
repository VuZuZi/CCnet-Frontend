import { useCallback, useState } from 'react';
import { chatAPI } from '@/features/chat/api/chat.api';
import { chatKeys } from '@/features/chat/constants/chat.queryKeys';
import { patchConversationById } from '@/features/chat/utils/cache.conversations';
import { useToast } from '@/shared/contexts/ToastContext';

export function useConversationActions({ conversationId, queryClient, navigate }) {
  const [isSavingGroupMeta, setIsSavingGroupMeta] = useState(false);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState('');
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);
  const toast = useToast();

  const refreshConversations = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
  }, [queryClient]);

  const handleUpdateGroupMeta = useCallback(
    async (payload) => {
      const cid = String(conversationId || '');
      if (!cid) return null;

      try {
        setIsSavingGroupMeta(true);
        const updated = await chatAPI.updateConversation(cid, payload);

        queryClient.setQueryData(chatKeys.conversations(), (oldData) =>
          patchConversationById(oldData, updated)
        );

        await refreshConversations();
        toast.success('Cập nhật thông tin nhóm thành công');
        return updated;
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Cập nhật thông tin nhóm thất bại');
        throw error;
      } finally {
        setIsSavingGroupMeta(false);
      }
    },
    [conversationId, queryClient, refreshConversations, toast]
  );

  const handleAddMembers = useCallback(
    async (participantIds) => {
      const cid = String(conversationId || '');
      if (!cid || !Array.isArray(participantIds) || !participantIds.length) return null;

      try {
        setIsAddingMembers(true);
        const updated = await chatAPI.addMembers(cid, participantIds);
        await refreshConversations();
        toast.success('Thêm thành viên thành công');
        return updated;
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Thêm thành viên thất bại');
        throw error;
      } finally {
        setIsAddingMembers(false);
      }
    },
    [conversationId, refreshConversations, toast]
  );

  const handleRemoveMember = useCallback(
    async (participantId) => {
      const cid = String(conversationId || '');
      const pid = String(participantId || '');
      if (!cid || !pid || removingMemberId) return null;

      try {
        setRemovingMemberId(pid);
        const updated = await chatAPI.removeMember(cid, pid);
        await refreshConversations();
        toast.success('Xóa thành viên thành công');
        return updated;
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Xóa thành viên thất bại');
        throw error;
      } finally {
        setRemovingMemberId('');
      }
    },
    [conversationId, refreshConversations, removingMemberId, toast]
  );

  const handleLeaveGroup = useCallback(async () => {
    const cid = String(conversationId || '');
    if (!cid) return false;

    try {
      setIsLeavingGroup(true);
      await chatAPI.leaveConversation(cid);
      await refreshConversations();
      toast.success('Bạn đã rời nhóm');
      navigate('/messages');
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Rời nhóm thất bại');
      throw error;
    } finally {
      setIsLeavingGroup(false);
    }
  }, [conversationId, navigate, refreshConversations, toast]);

  return {
    isSavingGroupMeta,
    isAddingMembers,
    removingMemberId,
    isLeavingGroup,
    handleUpdateGroupMeta,
    handleAddMembers,
    handleRemoveMember,
    handleLeaveGroup,
  };
}

export default useConversationActions;