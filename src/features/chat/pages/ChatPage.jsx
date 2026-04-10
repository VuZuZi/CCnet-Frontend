import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { BriefcaseBusiness } from 'lucide-react';

import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';

import { useConversations } from '../hooks/conversations/useConversations';
import { useCreateConversation } from '../hooks/conversations/useCreateConversation';
import { useConversationActions } from '../hooks/conversations/useConversationActions';

import { ConversationList } from '../components/conversation/ConversationList';
import { CreateGroupModal } from '../components/group/CreateGroupModal';
import { ConversationAssetsDrawer } from '../components/assets/ConversationAssetsDrawer';
import { ManageGroupModal } from '../components/group/ManageGroupModal';

import ChatHeader from '../components/layout/ChatHeader';
import ChatSidebar from '../components/layout/ChatSidebar';
import ChatMembersPanel from '../components/group/ChatMembersPanel';
import ChatEmptyState from '../components/layout/ChatEmptyState';
import ConversationView from '../components/conversation/ConversationView';

import {
  getConversationTitle,
  isGroupConversation,
} from '../utils/conversation';

export function ChatPage() {
  const navigate = useNavigate();
  const { conversationId: routeConversationId } = useParams();
  const queryClient = useQueryClient();

  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const { conversations, isLoading } = useConversations();
  const { createConversationAsync, isLoading: isCreatingGroup } = useCreateConversation();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showAssetsDrawer, setShowAssetsDrawer] = useState(false);
  const [showManageGroupModal, setShowManageGroupModal] = useState(false);
  const [initialAssetsTab, setInitialAssetsTab] = useState('image');

  const actionMenuRef = useRef(null);

  const selectedConversationId = String(routeConversationId || '');

  const activeConversation = useMemo(() => {
    return (
      (conversations || []).find(
        (item) => String(item?._id || '') === String(selectedConversationId)
      ) || null
    );
  }, [conversations, selectedConversationId]);

  const isGroup = isGroupConversation(activeConversation);
  const title = getConversationTitle(activeConversation, myId);
  const participantCount = activeConversation?.participants?.length || 0;
  const shouldShowMembersToggle = isGroup && participantCount > 1;
  const isProjectConversation = Boolean(activeConversation?.projectId);

  const {
    isSavingGroupMeta,
    isAddingMembers,
    removingMemberId,
    isLeavingGroup,
    handleUpdateGroupMeta,
    handleAddMembers,
    handleRemoveMember,
    handleLeaveGroup,
  } = useConversationActions({
    conversationId: selectedConversationId,
    queryClient,
    navigate,
  });

  useEffect(() => {
    if (isLoading) return;
    if (selectedConversationId) return;
    if (!Array.isArray(conversations) || !conversations.length) return;

    navigate(`/messages/${conversations[0]._id}`, { replace: true });
  }, [isLoading, selectedConversationId, conversations, navigate]);

  useEffect(() => {
    setShowMembers(false);
    setShowManageGroupModal(false);
  }, [selectedConversationId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        // reserved for future
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConversationSelected = (conversationId) => {
    navigate(`/messages/${conversationId}`);
  };

  const handleCreateGroup = async (payload) => {
    const created = await createConversationAsync(payload);
    if (created?._id) {
      setShowCreateGroupModal(false);
      navigate(`/messages/${created._id}`);
    }
  };

  const handleUpdateMeta = async (payload) => {
    const updated = await handleUpdateGroupMeta(payload);
    if (updated?._id) {
      setShowManageGroupModal(false);
    }
    return updated;
  };

  const handleOpenAssets = (tab = 'image') => {
    setInitialAssetsTab(tab);
    setShowAssetsDrawer(true);
  };

  return (
    <div className="flex h-[calc(100vh-72px)] min-h-0 bg-[#f6f7fb]">
      <ChatSidebar>
        <div className="border-b border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-black text-gray-900">Đoạn chat</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Danh sách chat cá nhân, nhóm thường và nhóm dự án
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateGroupModal(true)}
              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-black text-slate-900 hover:bg-amber-500"
            >
              Tạo nhóm
            </button>
          </div>

          <input
            type="text"
            placeholder="Tìm đoạn chat theo tên..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full rounded-full border border-amber-400 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white p-2">
          <ConversationList
            onConversationSelected={handleConversationSelected}
            searchKeyword={searchKeyword}
          />
        </div>
      </ChatSidebar>

      <ConversationView
        conversationId={selectedConversationId}
        onOpenFullPage={null}
        header={({
          conversation,
          title: headerTitle,
          pinnedCount,
          onOpenPinnedMessages,
        }) => (
          <div className="flex flex-col">
            <ChatHeader
              conversation={conversation}
              myId={myId}
              title={headerTitle}
              isGroup={conversation?.type === 'group'}
              participantCount={conversation?.participants?.length || 0}
              pinnedCount={pinnedCount}
              onOpenPinnedMessages={onOpenPinnedMessages}
              onOpenManageGroup={() => setShowManageGroupModal(true)}
              isWidget={false}
              isFullPage={true}
            />

            {isProjectConversation ? (
              <div className="border-b border-slate-200 bg-amber-50 px-5 py-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-bold text-amber-700">
                  <BriefcaseBusiness size={14} />
                  Nhóm dự án
                </div>
              </div>
            ) : null}
          </div>
        )}
        emptyState={<ChatEmptyState />}
      />

      {activeConversation ? (
        <ChatMembersPanel
          conversation={activeConversation}
          title={title}
          isGroup={isGroup}
          participantCount={participantCount}
          shouldShowMembersToggle={shouldShowMembersToggle}
          showMembers={showMembers}
          onToggleMembers={() => setShowMembers((prev) => !prev)}
          onOpenAssets={handleOpenAssets}
        />
      ) : null}

      <CreateGroupModal
        open={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        conversations={conversations}
        myId={myId}
        onCreateGroup={handleCreateGroup}
        isCreating={isCreatingGroup}
      />

      <ManageGroupModal
        open={showManageGroupModal}
        onClose={() => setShowManageGroupModal(false)}
        conversation={activeConversation}
        myId={myId}
        conversations={conversations}
        onUpdateMeta={handleUpdateMeta}
        onAddMembers={handleAddMembers}
        onRemoveMember={handleRemoveMember}
        onLeaveGroup={handleLeaveGroup}
        isSavingMeta={isSavingGroupMeta}
        isAddingMembers={isAddingMembers}
        removingMemberId={removingMemberId}
        isLeavingGroup={isLeavingGroup}
      />

      <ConversationAssetsDrawer
        open={showAssetsDrawer}
        onClose={() => setShowAssetsDrawer(false)}
        conversationId={selectedConversationId}
        initialTab={initialAssetsTab}
      />
    </div>
  );
}

export default ChatPage;