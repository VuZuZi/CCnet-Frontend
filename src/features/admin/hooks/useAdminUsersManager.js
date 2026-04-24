import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../api/adminAPI";
import { useToast } from "@/shared/contexts/ToastContext";
import { ADMIN_QUERY_KEYS } from "../constants/admin.queryKeys";
import {
  USER_PAGE_SIZE,
  normalizeUserStatus,
  normalizeUsersResponse,
  getErrorMessage,
  buildVisiblePages,
} from "../utils/adminUser.utils";

function normalizeUserDetailResponse(response) {
  if (!response) return null;
  if (response?.data?.data) return response.data.data;
  if (response?.data) return response.data;
  return response;
}

export function useAdminUsersManager() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pendingBanUserId, setPendingBanUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionReason, setActionReason] = useState("");
  const [confirmState, setConfirmState] = useState({
    open: false,
    type: null,
    user: null,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearchText(searchInput.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const userListParams = useMemo(
    () => ({
      page,
      limit: USER_PAGE_SIZE,
      search: searchText,
    }),
    [page, searchText]
  );

  const usersQuery = useQuery({
    queryKey: ADMIN_QUERY_KEYS.users.list(userListParams),
    queryFn: async () => {
      const res = await adminAPI.getUsers(userListParams);
      return normalizeUsersResponse(res, USER_PAGE_SIZE);
    },
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });

  const { items: rawUsers, pagination } = usersQuery.data || {
    items: [],
    pagination: { page: 1, limit: USER_PAGE_SIZE, total: 0, totalPages: 1 },
  };

  const normalizedUsers = useMemo(
    () =>
      (rawUsers || []).map((user) => ({
        ...user,
        normalizedStatus: normalizeUserStatus(user),
      })),
    [rawUsers]
  );

  const filteredUsers = useMemo(() => {
    if (activeFilter === "ACTIVE") {
      return normalizedUsers.filter((user) => user.normalizedStatus === "active");
    }

    if (activeFilter === "BANNED") {
      return normalizedUsers.filter((user) => user.normalizedStatus === "banned");
    }

    return normalizedUsers;
  }, [normalizedUsers, activeFilter]);

  useEffect(() => {
    if (!usersQuery.isLoading && page > 1 && filteredUsers.length === 0) {
      setPage(1);
    }
  }, [page, filteredUsers.length, usersQuery.isLoading]);

  const pageStats = useMemo(
    () => ({
      total: pagination?.total || 0,
      active: normalizedUsers.filter((u) => u.normalizedStatus === "active").length,
      banned: normalizedUsers.filter((u) => u.normalizedStatus === "banned").length,
    }),
    [pagination, normalizedUsers]
  );

  const totalPages = Math.max(1, pagination?.totalPages || 1);
  const visiblePages = buildVisiblePages(page, totalPages);

  const openBanModal = (user) => {
    setActionReason("");
    setConfirmState({
      open: true,
      type: "ban",
      user,
    });
  };

  const closeModal = () => {
    setActionReason("");
    setConfirmState({
      open: false,
      type: null,
      user: null,
    });
  };

  const handleLoadUserDetail = async (userId) => {
    const response = await adminAPI.getUserDetail(userId);
    const detailUser = normalizeUserDetailResponse(response);

    return detailUser
      ? {
          ...detailUser,
          normalizedStatus: normalizeUserStatus(detailUser),
        }
      : null;
  };

  const handleConfirmAction = async () => {
    const user = confirmState.user;

    if (!user || confirmState.type !== "ban") return;

    const isBanned = user.normalizedStatus === "banned";
    const trimmedReason = String(actionReason || "").trim();

    if (!trimmedReason) {
      toast.error("Vui lòng nhập lý do cho thao tác này.");
      return;
    }

    try {
      setPendingBanUserId(user._id);

      const res = await adminAPI.toggleBan(user._id, {
        reason: trimmedReason,
      });

      const updatedUser = res?.data?.data;

      queryClient.setQueryData(
        ADMIN_QUERY_KEYS.users.list(userListParams),
        (previousData) => {
          if (!previousData) return previousData;

          return {
            ...previousData,
            items: (previousData.items || []).map((item) =>
              item._id === user._id ? { ...item, ...updatedUser } : item
            ),
          };
        }
      );

      setSelectedUser((previousValue) =>
        previousValue && previousValue._id === user._id
          ? {
              ...previousValue,
              ...updatedUser,
              normalizedStatus: normalizeUserStatus({
                ...previousValue,
                ...updatedUser,
              }),
            }
          : previousValue
      );

      await queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.users.all(),
      });

      await queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.actionLogs.all(),
      });

      toast.success(
        isBanned
          ? "Đã mở khóa người dùng thành công."
          : "Đã khóa người dùng thành công."
      );

      closeModal();
    } catch (error) {
      toast.error(getErrorMessage(error, "Cập nhật trạng thái khóa thất bại."));
    } finally {
      setPendingBanUserId(null);
    }
  };

  const modalUser = confirmState.user;
  const isBanModal = confirmState.type === "ban";
  const modalLoading = isBanModal && pendingBanUserId === modalUser?._id;
  const requireReason = isBanModal;

  const reasonLabel =
    isBanModal && modalUser?.normalizedStatus === "banned"
      ? "Reason for unban"
      : "Reason for ban";

  const reasonPlaceholder =
    isBanModal && modalUser?.normalizedStatus === "banned"
      ? "Enter the reason for restoring access..."
      : "Enter the reason for restricting access...";

  return {
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
  };
}

export default useAdminUsersManager;
