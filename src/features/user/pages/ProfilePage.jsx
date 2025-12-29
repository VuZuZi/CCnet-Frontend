import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import { useUserProfile } from '../hooks/useUserProfile';
import { useUpdateUserProfile } from '../hooks/useUpdateUserProfile';
import { useChangePassword } from '../hooks/useChangePassword';
import { useToast } from '@/shared/contexts/ToastContext';
import styles from '../styles/ProfilePage.module.css';

export function ProfilePage() {
  const toast = useToast();
  const { data: user, isLoading } = useUserProfile();
  const updateProfile = useUpdateUserProfile();
  const changePassword = useChangePassword();

  const initialValues = useMemo(() => ({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
  }), [user]);

  const [values, setValues] = useState(initialValues);
  const [editing, setEditing] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        location: values.location.trim(),
        bio: values.bio.trim(),
      };
      await updateProfile.mutateAsync(payload);
      setEditing(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Cannot update profile';
      toast.error(message);
    }
  };

  const handleChangePassword = async () => {
    if (!pw.newPassword || pw.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (pw.newPassword !== pw.confirmPassword) {
      toast.error('Password confirmation does not match');
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const message = error.response?.data?.message || 'Cannot change password';
      toast.error(message);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 text-white">
        Đang tải hồ sơ...
      </div>
    );
  }

  const initials = (user.fullName || user.email || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <Container style={{ maxWidth: 'var(--container-max)' }}>
          <p className={styles.heroTag}>Community & Relief</p>
          <h1 className="fw-bold mb-2">Hồ sơ kết nối cứu trợ</h1>
          <p className="text-muted mb-0">Cập nhật thông tin để mọi người biết cách liên hệ và hỗ trợ bạn.</p>
        </Container>
      </div>

      <Container style={{ maxWidth: 'var(--container-max)' }} className="pb-5">
        <Row className="g-4">
          <Col lg={8}>
            <Card className={`${styles.cardDark} p-4 p-md-5`}>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className={`rounded-circle d-flex justify-content-center align-items-center ${styles.avatar}`}>
                  {initials}
                </div>
                <div>
                  <h4 className="mb-1">{user.fullName || 'Chưa có tên'}</h4>
                  <Badge className={`${styles.badgeLight} me-2`}>Verified email</Badge>
                  <Badge className={styles.badgeBlue}>Open to connect</Badge>
                </div>
                <div className="ms-auto d-flex gap-2">
                  {!editing ? (
                    <Button
                      variant="primary"
                      className="fw-semibold"
                      onClick={() => setEditing(true)}
                    >
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline-secondary" onClick={() => { setValues(initialValues); setEditing(false); }}>
                        Hủy
                      </Button>
                      <Button
                        variant="primary"
                        className="fw-semibold"
                        onClick={handleSave}
                        disabled={updateProfile.isPending}
                      >
                        Lưu
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Họ tên</Form.Label>
                    <Form.Control
                      type="text"
                      value={values.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      disabled={!editing}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" value={values.email} disabled readOnly />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Số điện thoại</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="+84 9xx"
                      value={values.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      disabled={!editing}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Khu vực</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ví dụ: Đà Nẵng, Việt Nam"
                      value={values.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      disabled={!editing}
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Giới thiệu / Nhu cầu</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Mô tả ngắn gọn bạn cần gì hoặc có thể hỗ trợ gì"
                      value={values.bio}
                      onChange={(e) => handleChange('bio', e.target.value)}
                      disabled={!editing}
                    />
                    <div className="d-flex justify-content-end mt-1 text-muted small">
                      {values.bio.length}/240
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col lg={4} className="d-flex flex-column gap-3">
            <Card className={`${styles.cardSoft} p-4`}>
              <h5 className="mb-3">Hướng dẫn an toàn</h5>
              <ul className="mb-0 small">
                <li>Chỉ chia sẻ số liên hệ khi bạn thấy tin cậy.</li>
                <li>Ưu tiên gặp tại điểm cộng đồng được xác nhận.</li>
                <li>Báo cáo hành vi bất thường cho quản trị.</li>
              </ul>
            </Card>

            {user.hasPassword ? (
              <Card className={`${styles.cardSoft} p-4`}>
                <h5 className="mb-2">Đổi mật khẩu</h5>
                <div className="mb-2">
                  <Form.Label>Mật khẩu hiện tại</Form.Label>
                  <Form.Control
                    type="password"
                    value={pw.currentPassword}
                    onChange={(e) => setPw((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  />
                </div>
                <div className="mb-2">
                  <Form.Label>Mật khẩu mới</Form.Label>
                  <Form.Control
                    type="password"
                    value={pw.newPassword}
                    onChange={(e) => setPw((prev) => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
                <div className="mb-3">
                  <Form.Label>Nhập lại mật khẩu mới</Form.Label>
                  <Form.Control
                    type="password"
                    value={pw.confirmPassword}
                    onChange={(e) => setPw((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
                <Button
                  variant="primary"
                  className="w-100 fw-semibold"
                  onClick={handleChangePassword}
                  disabled={changePassword.isPending}
                >
                  Đổi mật khẩu
                </Button>
              </Card>
            ) : (
              <Card className={`${styles.cardSoft} p-4`}>
                <h5 className="mb-2">Tài khoản Google</h5>
                <p className="mb-0 text-muted small">Bạn đăng nhập bằng Google nên không cần đổi mật khẩu tại đây.</p>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ProfilePage;
