import { useState, useMemo } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { useUserProfile } from '../hooks/useUserProfile';
import { useUpdateUserProfile } from '../hooks/useUpdateUserProfile';
import { useChangePassword } from '../hooks/useChangePassword';
import {
  ProfileCover,
  ProfileHeader,
  ProfileStats,
  ProfileTabs,
  ProfileAbout,
  ProfileSkills,
  EditProfileModal,
  ChangePasswordModal,
  PostsPlaceholder,
} from '../components';
import styles from '../styles/ProfilePage.module.css';

// Tab config - removed "about" since it's now in sidebar
const TABS = [
  { id: 'posts', label: 'Posts' },
  { id: 'projects', label: 'Projects' },
];

export function ProfilePage() {
  const { data: user, isLoading } = useUserProfile();
  const updateProfile = useUpdateUserProfile();
  const changePassword = useChangePassword();

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('posts');

  // User initials for avatar fallback
  const fullName = user?.fullName;
  const initials = useMemo(() => {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [fullName]);

  // Handlers
  const handleSaveProfile = (data) => {
    updateProfile.updateProfile(data, {
      onSuccess: () => setShowEditModal(false),
    });
  };

  const handleChangePassword = (data) => {
    changePassword.changePassword(data, {
      onSuccess: () => setShowPasswordModal(false),
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner animation="border" />
      </div>
    );
  }

  // No user
  if (!user) {
    return (
      <Container className={styles.notFound}>
        <h2>User not found</h2>
      </Container>
    );
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return <PostsPlaceholder />;
      case 'projects':
        return (
          <div className={styles.comingSoon}>
            <span>🚀</span>
            <h3>Projects coming soon</h3>
            <p>This feature is under development.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.profilePage}>
      {/* Cover & Avatar */}
      <ProfileCover user={user} initials={initials} />

      {/* Name, Bio, Actions */}
      <ProfileHeader
        user={user}
        onEditProfile={() => setShowEditModal(true)}
        onChangePassword={() => setShowPasswordModal(true)}
      />

      {/* Stats */}
      <ProfileStats stats={user.stats} />

      {/* Tabs */}
      <ProfileTabs 
        tabs={TABS}
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Two-column Layout */}
      <div className={styles.contentWrapper}>
        <Container className={styles.container}>
          {/* Left Sidebar - About & Skills */}
          <aside className={styles.sidebar}>
            <div className={styles.stickyWrapper}>
              <ProfileAbout user={user} />
              <ProfileSkills skills={user.skills} />
            </div>
          </aside>

          {/* Right Content - Posts/Projects */}
          <main className={styles.mainContent}>
            {renderTabContent()}
          </main>
        </Container>
      </div>

      {/* Modals */}
      <EditProfileModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        user={user}
        onSave={handleSaveProfile}
        isPending={updateProfile.isPending}
      />

      <ChangePasswordModal
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
        onSubmit={handleChangePassword}
        isPending={changePassword.isPending}
        hasPassword={user.hasPassword}
      />
    </div>
  );
}

export default ProfilePage;
