import { Container, Row, Col, Card, Form, Spinner, Alert, Modal } from 'react-bootstrap';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { followAPI } from '../api/followAPI';
import { useMyFollowing } from '../hooks/useMyFollowing';
import { getErrorMessage } from '@/shared/lib/httpClient';
import { useToast } from '@/shared/contexts/ToastContext';
import { Button } from '@/shared/components/ui/Button/Button';
import styles from '../styles/FollowingPage.module.css';

export function FollowingPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const limit = 50;
  const { items, isLoading, isError, errorMessage } = useMyFollowing(limit);

  const [keyword, setKeyword] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const filtered = useMemo(() => {
    const k = String(keyword || '').trim().toLowerCase();
    if (!k) return items;

    return (items || []).filter((u) => {
      const name = String(u.fullName || '').toLowerCase();
      const email = String(u.email || '').toLowerCase();
      return name.includes(k) || email.includes(k);
    });
  }, [items, keyword]);

  const unfollowMutation = useMutation({
    mutationFn: (userId) => followAPI.unfollowUser(userId),
    onSuccess: (_data, userId) => {
      queryClient.setQueryData(['follow', 'me', 'following', limit], (old) => {
        const arr = Array.isArray(old) ? old : [];
        return arr.filter((u) => String(u?.id) !== String(userId));
      });

      queryClient.invalidateQueries({ queryKey: ['follow', 'user', 'status', userId] });
      queryClient.invalidateQueries({ queryKey: ['follow', 'user', 'stats', userId] });

      toast.success('Unfollowed');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
    onSettled: () => {
      setConfirmOpen(false);
      setPendingUser(null);
    },
  });

  const goUser = (u) => {
    if (!u?.id) return;
    navigate(`/users/${u.id}`, { state: { user: u } });
  };

  const requestUnfollow = (u) => {
    setPendingUser(u);
    setConfirmOpen(true);
  };

  const confirmUnfollow = () => {
    if (!pendingUser?.id) return;
    unfollowMutation.mutate(pendingUser.id);
  };

  const titleOf = (u) => u?.fullName || u?.email || 'this user';

  return (
    <div className={styles.page}>
      <Container>
        <Row className="justify-content-center">
          <Col xl={8} lg={9}>
            <div className={styles.header}>
              <div>
                <div className={styles.title}>Following</div>
                <div className={styles.subTitle}>{items?.length || 0} accounts</div>
              </div>

              <div className={styles.searchBox}>
                <Form.Control
                  className={styles.searchInput}
                  placeholder="Search name or email..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <span className={styles.searchIcon}>⌕</span>
              </div>
            </div>

            {isLoading ? (
              <Card className={`${styles.card} shadow-sm border-0`}>
                <Card.Body className={styles.loadingBox}>
                  <Spinner animation="border" size="sm" />
                </Card.Body>
              </Card>
            ) : null}

            {isError ? (
              <Alert variant="danger" className="mb-0">
                {errorMessage || 'Failed to load following list'}
              </Alert>
            ) : null}

            {!isLoading && !isError ? (
              <div className={styles.grid}>
                {filtered.length === 0 ? (
                  <Card className={`${styles.card} shadow-sm border-0`}>
                    <Card.Body className={styles.emptyBox}>
                      <div className={styles.emptyTitle}>No results</div>
                      <div className={styles.emptySub}>Try another keyword or follow someone first.</div>
                    </Card.Body>
                  </Card>
                ) : (
                  filtered.map((u) => {
                    const title = u.fullName || u.email || 'Unknown';
                    const letter = String(title).trim().slice(0, 1).toUpperCase();

                    return (
                      <Card
                        key={u.id}
                        className={`${styles.userCard} shadow-sm border-0`}
                        role="button"
                        onClick={() => goUser(u)}
                      >
                        <Card.Body className={styles.userBody}>
                          <div className={styles.left}>
                            <div className={styles.avatarWrap}>
                              {u.avatar ? (
                                <img className={styles.avatarImg} src={u.avatar} alt={title} />
                              ) : (
                                <div className={styles.avatarFallback}>{letter}</div>
                              )}
                            </div>

                            <div className={styles.meta}>
                              <div className={styles.name}>{title}</div>
                              <div className={styles.email}>{u.email || ''}</div>
                            </div>
                          </div>

                          <div className={styles.actions}>
                            <Button
                              variant="danger"
                              disabled={unfollowMutation.isPending}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                requestUnfollow(u);
                              }}
                            >
                              Unfollow
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    );
                  })
                )}
              </div>
            ) : null}
          </Col>
        </Row>
      </Container>

      <Modal
        show={confirmOpen}
        onHide={() => {
          if (unfollowMutation.isPending) return;
          setConfirmOpen(false);
          setPendingUser(null);
        }}
        centered
      >
        <Modal.Header closeButton={!unfollowMutation.isPending}>
          <Modal.Title>Unfollow</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to unfollow <strong>{titleOf(pendingUser)}</strong>?
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            disabled={unfollowMutation.isPending}
            onClick={() => {
              setConfirmOpen(false);
              setPendingUser(null);
            }}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            isLoading={unfollowMutation.isPending}
            onClick={confirmUnfollow}
          >
            Unfollow
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default FollowingPage;
