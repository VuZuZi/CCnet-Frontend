import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore, authSelectors } from "@/features/auth/stores/useAuthStore";
import { searchAPI } from "../api/searchAPI";

export function useGlobalSearch({ debounceMs = 180, limit = 8 } = {}) {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(String(query || "").trim());
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const enabled = isAuthenticated && debounced.length > 0;

  const q = useQuery({
    queryKey: ["search", "global", "navbar", debounced, limit],
    queryFn: () =>
      searchAPI.globalSearch({
        q: debounced,
        limit,
        type: "navbar",
      }),
    enabled,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  const groups = useMemo(() => {
    const data = q.data || {};
    const result = [];

    const users = Array.isArray(data?.groups?.user) ? data.groups.user : [];
    const organizers =
      Array.isArray(data?.groups?.organizer) ? data.groups.organizer : [];
    const projects =
      Array.isArray(data?.groups?.project) ? data.groups.project : [];
    const needHelps =
      Array.isArray(data?.groups?.needhelp) ? data.groups.needhelp : [];
    const communityPosts =
      Array.isArray(data?.groups?.communitypost)
        ? data.groups.communitypost
        : [];

    if (users.length) {
      result.push({
        key: "user",
        label: "Users",
        items: users.map((item) => ({
          kind: item.kind || "user",
          id: item.id,
          title: item.title || item.fullName || item.email || "User",
          subtitle: item.subtitle || item.email || "",
          avatar: item.avatar || "",
          link: item.link || `/users/${String(item.id)}`,
          payload: item.payload || item,
        })),
      });
    }

    if (organizers.length) {
      result.push({
        key: "organizer",
        label: "Organizers",
        items: organizers.map((item) => ({
          kind: item.kind || "organizer",
          id: item.id,
          title: item.title || item.fullName || item.email || "Organizer",
          subtitle: item.subtitle || item.email || "",
          avatar: item.avatar || "",
          link: item.link || `/users/${String(item.id)}`,
          payload: item.payload || item,
        })),
      });
    }

    if (projects.length) {
      result.push({
        key: "project",
        label: "Projects",
        items: projects.map((item) => ({
          kind: item.kind || "project",
          id: item.id,
          title: item.title || item.name || "Project",
          subtitle: item.subtitle || item.code || "",
          avatar: item.avatar || "",
          link: item.link || `/projects/${String(item.id)}`,
          payload: item.payload || item,
        })),
      });
    }

    if (needHelps.length) {
      result.push({
        key: "needhelp",
        label: "Need Help",
        items: needHelps.map((item) => ({
          kind: item.kind || "needhelp",
          id: item.id,
          title: item.title || "Need help",
          subtitle: item.subtitle || "",
          avatar: item.avatar || "",
          link: item.link || `/need-help/${String(item.id)}`,
          payload: item.payload || item,
        })),
      });
    }

    if (communityPosts.length) {
      result.push({
        key: "communitypost",
        label: "Community Posts",
        items: communityPosts.map((item) => ({
          kind: item.kind || "communitypost",
          id: item.id,
          title: item.title || "Community post",
          subtitle: item.subtitle || "",
          avatar: item.avatar || "",
          link: item.link || `/community/${String(item.id)}`,
          payload: item.payload || item,
        })),
      });
    }

    return result;
  }, [q.data]);

  return {
    query,
    setQuery,
    groups,
    isAuthenticated,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
    error: q.error,
  };
}

export default useGlobalSearch;