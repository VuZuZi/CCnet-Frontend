import { useNavigate } from "react-router-dom";
import { useAdminUsersManager } from "../hooks/useAdminUsersManager";
import UserManagementHeader from "../components/users/UserManagementHeader";
import UserFilters from "../components/users/UserFilters";
import UserDirectoryTable from "../components/users/UserDirectoryTable";
import UserDetailModal from "../components/users/UserDetailModal";
import UserBanModal from "../components/users/UserBanModal";

const UserManagement = () => {
  const navigate = useNavigate();

  const {
    searchInput,
    setSearchInput,
    activeFilter,
    setActiveFilter,
    page,
    setPage,
    selectedUser,
    setSelectedUser,
    actionReason,
    setActionReason,
    usersQuery,
    filteredUsers,
    pageStats,
    totalPages,
    visiblePages,
    openBanModal,
    closeModal,
    handleConfirmAction,
    handleLoadUserDetail,
    pendingBanUserId,
    confirmState,
    modalUser,
    modalLoading,
    requireReason,
    reasonLabel,
    reasonPlaceholder,
  } = useAdminUsersManager();

  const handleFilterChange = (nextFilter) => {
    setActiveFilter(nextFilter);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <UserManagementHeader
        pageStats={pageStats}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        onOpenHistory={() => navigate("/admin/user-action-logs")}
      />

      <UserFilters
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
      />

      <UserDirectoryTable
        users={filteredUsers}
        isLoading={usersQuery.isLoading}
        isFetching={usersQuery.isFetching}
        page={page}
        totalPages={totalPages}
        visiblePages={visiblePages}
        pendingBanUserId={pendingBanUserId}
        onPageChange={setPage}
        onOpenDetail={setSelectedUser}
        onOpenBanModal={openBanModal}
      />

      <UserDetailModal
        open={Boolean(selectedUser)}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        loadUserDetail={handleLoadUserDetail}
      />

      <UserBanModal
        open={confirmState.open}
        title={
          modalUser?.normalizedStatus === "banned"
            ? "Bỏ cấm người dùng này?"
            : "Cấm người dùng này?"
        }
        description={
          modalUser?.normalizedStatus === "banned"
            ? "Hành động này sẽ khôi phục quyền truy cập nền tảng của người dùng này."
            : "Hành động này sẽ hạn chế quyền truy cập nền tảng của người dùng này."
        }
        confirmText={modalUser?.normalizedStatus === "banned" ? "Bỏ cấm" : "Cấm"}
        confirmClassName={
          modalUser?.normalizedStatus === "banned"
            ? "bg-emerald-600 hover:bg-emerald-700"
            : "bg-red-600 hover:bg-red-700"
        }
        loading={modalLoading}
        requireReason={requireReason}
        reason={actionReason}
        onReasonChange={setActionReason}
        reasonLabel={reasonLabel}
        reasonPlaceholder={reasonPlaceholder}
        onClose={closeModal}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};

export default UserManagement;