import { useLocation, useParams } from 'react-router-dom';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';
import { useCreateConversation } from '@/features/chat/hooks/useCreateConversation';
import { useChatStore } from '@/features/chat/stores/useChatStore';
import { useFollowUserStatus } from '../hooks/useFollowUserStatus';
import { useFollowUserStats } from '../hooks/useFollowUserStats';
import { useToggleFollowUser } from '../hooks/useToggleFollowUser';
import { Button } from '@/shared/components/ui/Button/Button';

function isObjectId(id) {
  return typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]+$/.test(id);
}

export function UserProfilePage() {
  const { id } = useParams();
  const location = useLocation();
  const stateUser = location.state?.user || null;

  const me = useAuthStore(authSelectors.user);
  const myId = me?.userId || me?._id || me?.id;

  const openConversation = useChatStore((s) => s.openConversation);
  const focusConversation = useChatStore((s) => s.focusConversation);

  const { createConversationAsync, isLoading: isChatLoading } = useCreateConversation();

  const userId = String(stateUser?.id || id || '').trim();
  const fullName = stateUser?.fullName || 'Unknown';
  const email = stateUser?.email || '';

  const canAction = isObjectId(userId) && String(userId) !== String(myId);

  const { isFollowing, isFetching: isFollowFetching } = useFollowUserStatus(userId);
  const { followers, following } = useFollowUserStats(userId);
  const { toggle, isLoading: isToggleLoading } = useToggleFollowUser(userId);

  const onChat = async () => {
    if (!canAction) return;
    const convo = await createConversationAsync({ participantId: userId });
    const cid = String(convo?._id || '').trim();
    if (!cid) return;
    openConversation(cid);
    focusConversation(cid);
  };

  const onToggleFollow = () => {
    if (!canAction) return;
    toggle(isFollowing);
  };

  return (
    <div className="min-h-screen bg-off-white py-12 px-4">
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white shadow-sm border border-light-gray rounded-2xl p-6 md:p-8">
          
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-2xl text-black mb-1 truncate">{fullName}</h3>
              <div className="text-gray truncate">{email}</div>
              <div className="text-gray text-sm mt-3 font-medium">
                <span className="text-black">{followers}</span> Followers · <span className="text-black">{following}</span> Following
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2 md:mt-0 shrink-0">
              <Button
                variant={isFollowing ? 'danger' : 'gray'}
                disabled={!canAction || isToggleLoading || isFollowFetching}
                onClick={onToggleFollow}
                className="!py-2 !px-4"
              >
                {isFollowing ? 'UnFollow' : 'Follow'}
              </Button>

              <Button
                variant="yellow"
                disabled={!canAction || isChatLoading}
                onClick={onChat}
                isLoading={isChatLoading}
                className="!py-2 !px-4"
              >
                Chat
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;