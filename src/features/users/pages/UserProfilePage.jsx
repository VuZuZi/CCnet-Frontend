import { Container, Row, Col, Card } from 'react-bootstrap';
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
    <div className="min-vh-100 bg-light py-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={7}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div style={{ minWidth: 0 }}>
                    <h3 className="fw-bold mb-1">{fullName}</h3>
                    <div className="text-muted">{email}</div>
                    <div className="text-muted small mt-2">
                      Followers: {followers} · Following: {following}
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      variant={isFollowing ? 'danger' : 'gray'}
                      disabled={!canAction || isToggleLoading || isFollowFetching}
                      onClick={onToggleFollow}
                    >
                      {isFollowing ? 'UnFollow' : 'Follow'}
                    </Button>

                    <Button
                      variant="yellow"
                      disabled={!canAction || isChatLoading}
                      onClick={onChat}
                      isLoading={isChatLoading}
                    >
                      Chat
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default UserProfilePage;
