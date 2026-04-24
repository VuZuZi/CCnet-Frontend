import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../api/adminAPI";
import { EMPTY_ROLE_SELECTIONS } from "../utils/adminNotificationComposer.constants";
import {
  buildNotificationPayload,
  buildNotificationSummaryText,
  getNotificationSuccessMessage,
} from "../utils/adminNotificationComposer.utils";

const INITIAL_FORM = {
  title: "",
  message: "",
  severity: "info",
  recipientMode: "all",
};

export default function useAdminNotificationComposer() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState(INITIAL_FORM);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [roleSelections, setRoleSelections] = useState(EMPTY_ROLE_SELECTIONS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const titleCount = form.title.length;
  const messageCount = form.message.length;

  useEffect(() => {
    if (!alert.message) return;

    const timer = setTimeout(() => {
      setAlert({ type: "", message: "" });
    }, 3000);

    return () => clearTimeout(timer);
  }, [alert]);

  const summaryText = useMemo(
    () =>
      buildNotificationSummaryText({
        recipientMode: form.recipientMode,
        selectedRoles,
        roleSelections,
      }),
    [form.recipientMode, selectedRoles, roleSelections]
  );

  const clearAlert = () => setAlert({ type: "", message: "" });

  const resetComposer = () => {
    setForm(INITIAL_FORM);
    setSelectedRoles([]);
    setRoleSelections(EMPTY_ROLE_SELECTIONS);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    clearAlert();

    if (name === "recipientMode" && value === "all") {
      setSelectedRoles([]);
      setRoleSelections(EMPTY_ROLE_SELECTIONS);
    }
  };

  const toggleRole = (roleValue) => {
    setSelectedRoles((prev) => {
      const exists = prev.includes(roleValue);

      if (exists) {
        setRoleSelections((current) => ({
          ...current,
          [roleValue]: [],
        }));
        return prev.filter((item) => item !== roleValue);
      }

      return [...prev, roleValue];
    });

    clearAlert();
  };

  const updateRoleSelection = (role, users) => {
    setRoleSelections((prev) => ({
      ...prev,
      [role]: users,
    }));
    clearAlert();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearAlert();

    let payload;
    try {
      payload = buildNotificationPayload({
        form,
        selectedRoles,
        roleSelections,
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: error.message || "Dữ liệu thông báo không hợp lệ.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await adminAPI.createNotification(payload);
      const data = response?.data?.data || response?.data || null;

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin", "notification-history"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin", "action-logs"],
        }),
      ]);

      setAlert({
        type: "success",
        message: getNotificationSuccessMessage(data),
      });

      resetComposer();
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Gửi thông báo thất bại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    selectedRoles,
    roleSelections,
    isSubmitting,
    alert,
    titleCount,
    messageCount,
    summaryText,
    clearAlert,
    handleChange,
    toggleRole,
    updateRoleSelection,
    handleSubmit,
  };
}
