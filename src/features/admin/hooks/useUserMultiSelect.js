import { useEffect, useMemo, useRef, useState } from "react";
import { adminAPI } from "../api/adminAPI";
import {
  PAGE_SIZE,
  mergeUniqueUsers,
  normalizeUsersResponse,
} from "../utils/userMultiSelect.utils";
import {
  useAuthStore,
  authSelectors,
} from "@/features/auth/stores/useAuthStore";

export default function useUserMultiSelect({
  value = [],
  onChange,
  allowedRoles = [],
}) {
  const currentUser = useAuthStore(authSelectors.user);

  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);

  const rootRef = useRef(null);
  const modalRef = useRef(null);
  const listRef = useRef(null);
  const debounceRef = useRef(null);

  const currentUserId = useMemo(() => {
    return String(
      currentUser?._id ||
        currentUser?.id ||
        currentUser?.userId ||
        ""
    );
  }, [currentUser]);

  const selectedIds = useMemo(
    () =>
      new Set((value || []).map((user) => String(user?._id || user?.id || ""))),
    [value]
  );

  const normalizedAllowedRoles = useMemo(
    () =>
      (allowedRoles || [])
        .map((role) => String(role || "").trim().toLowerCase())
        .filter(Boolean),
    [allowedRoles]
  );

  const filterOutCurrentUser = (items = []) => {
    if (!currentUserId) return items;

    return items.filter((user) => {
      const userId = String(user?._id || user?.id || "");
      return userId && userId !== currentUserId;
    });
  };

  const fetchUsers = async ({
    nextPage = 1,
    search = "",
    replace = false,
  } = {}) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const params = {
        search,
        page: nextPage,
        limit: PAGE_SIZE,
      };

      if (normalizedAllowedRoles.length === 1) {
        params.role = normalizedAllowedRoles[0];
      }

      const response = await adminAPI.getUsers(params);
      const { items, pagination } = normalizeUsersResponse(response);

      const filteredByRole = normalizedAllowedRoles.length
        ? items.filter((user) =>
            normalizedAllowedRoles.includes(
              String(user?.role || "").toLowerCase()
            )
          )
        : items;

      const finalItems = filterOutCurrentUser(filteredByRole);

      setUsers((prev) => {
        if (replace) return finalItems;
        return mergeUniqueUsers(prev, finalItems);
      });

      if (pagination) {
        setHasMore(pagination.page < pagination.totalPages);
      } else {
        setHasMore(finalItems.length === PAGE_SIZE);
      }

      setPage(nextPage);
      setIsInitialLoaded(true);
    } catch (error) {
      console.error("[UserMultiSelect] Failed to fetch users:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handlePointerDown = (event) => {
      const clickedInsideRoot = rootRef.current?.contains(event.target);
      const clickedInsideModal = modalRef.current?.contains(event.target);

      if (!clickedInsideRoot && !clickedInsideModal) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchUsers({
        nextPage: 1,
        search: keyword.trim(),
        replace: true,
      });
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [keyword, isOpen, normalizedAllowedRoles.join("|"), currentUserId]);

  useEffect(() => {
    if (isOpen && !isInitialLoaded) {
      fetchUsers({
        nextPage: 1,
        search: "",
        replace: true,
      });
    }
  }, [isOpen, isInitialLoaded]);

  useEffect(() => {
    if (!isOpen) return;

    setUsers([]);
    setPage(1);
    setHasMore(true);
    setIsInitialLoaded(false);
    setKeyword("");
  }, [normalizedAllowedRoles.join("|"), currentUserId]);

  const toggleUser = (user) => {
    const id = String(user?._id || user?.id || "");
    const exists = selectedIds.has(id);

    if (exists) {
      onChange((value || []).filter((item) => String(item?._id || item?.id) !== id));
      return;
    }

    onChange([...(value || []), user]);
  };

  const removeUser = (userId) => {
    onChange(
      (value || []).filter(
        (item) => String(item?._id || item?.id) !== String(userId)
      )
    );
  };

  const handleScroll = () => {
    if (!listRef.current || isLoading || !hasMore) return;

    const { scrollTop, clientHeight, scrollHeight } = listRef.current;
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 40;

    if (nearBottom) {
      fetchUsers({
        nextPage: page + 1,
        search: keyword.trim(),
        replace: false,
      });
    }
  };

  return {
    isOpen,
    setIsOpen,
    keyword,
    setKeyword,
    users,
    hasMore,
    isLoading,
    rootRef,
    modalRef,
    listRef,
    selectedIds,
    toggleUser,
    removeUser,
    handleScroll,
  };
}