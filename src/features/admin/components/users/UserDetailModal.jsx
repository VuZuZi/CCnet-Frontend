import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CircleAlert,
  CircleOff,
  CircleUserRound,
  Loader2,
  Mail,
  MapPin,
  Phone,
  UserRound,
  X,
} from "lucide-react";
import {
  formatDateTime,
  getInitials,
  getRoleClass,
  getStatusMeta,
  normalizeUserStatus,
} from "../../utils/adminUser.utils";

function hasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

function getUserLocationValue(user) {
  if (!user) return "";

  const pick = (...values) => {
    for (const value of values) {
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
    return "";
  };

  const joinParts = (parts = []) => parts.filter(Boolean).join(", ").trim();

  if (typeof user.location === "string" && user.location.trim()) {
    return user.location.trim();
  }

  if (user.location && typeof user.location === "object") {
    const directAddress = pick(
      user.location.address,
      user.location.fullAddress,
      user.location.displayName,
      user.location.label,
      user.location.name
    );
    if (directAddress) return directAddress;

    const composedLocation = joinParts([
      pick(user.location.street, user.location.addressLine, user.location.line1),
      pick(user.location.ward, user.location.wardName),
      pick(user.location.district, user.location.districtName),
      pick(
        user.location.city,
        user.location.province,
        user.location.provinceName
      ),
      pick(user.location.country),
    ]);
    if (composedLocation) return composedLocation;
  }

  if (typeof user.address === "string" && user.address.trim()) {
    return user.address.trim();
  }

  if (user.address && typeof user.address === "object") {
    const directAddress = pick(
      user.address.address,
      user.address.fullAddress,
      user.address.displayName,
      user.address.label
    );
    if (directAddress) return directAddress;

    const composedAddress = joinParts([
      pick(user.address.street, user.address.addressLine, user.address.line1),
      pick(user.address.ward, user.address.wardName),
      pick(user.address.district, user.address.districtName),
      pick(user.address.city, user.address.province, user.address.provinceName),
      pick(user.address.country),
    ]);
    if (composedAddress) return composedAddress;
  }

  if (user.profile && typeof user.profile === "object") {
    const profileAddress = pick(
      user.profile.location,
      user.profile.address,
      user.profile.fullAddress
    );
    if (profileAddress) return profileAddress;
  }

  if (user.organization && typeof user.organization === "object") {
    const orgLocation = user.organization.location;

    if (typeof orgLocation === "string" && orgLocation.trim()) {
      return orgLocation.trim();
    }

    if (orgLocation && typeof orgLocation === "object") {
      const directOrgAddress = pick(
        orgLocation.address,
        orgLocation.fullAddress,
        orgLocation.displayName,
        orgLocation.label,
        orgLocation.name
      );
      if (directOrgAddress) return directOrgAddress;

      const composedOrgAddress = joinParts([
        pick(orgLocation.street, orgLocation.addressLine, orgLocation.line1),
        pick(orgLocation.ward, orgLocation.wardName),
        pick(orgLocation.district, orgLocation.districtName),
        pick(
          orgLocation.city,
          orgLocation.province,
          orgLocation.provinceName
        ),
        pick(orgLocation.country),
      ]);
      if (composedOrgAddress) return composedOrgAddress;
    }
  }

  return "";
}

function getUserTitleValue(user) {
  if (!user) return "";

  if (typeof user.headline === "string" && user.headline.trim()) {
    return user.headline.trim();
  }

  const normalizedRole = String(user.role || "").toLowerCase();
  if (
    normalizedRole === "organizer" &&
    typeof user.title === "string" &&
    user.title.trim()
  ) {
    return user.title.trim();
  }

  return "";
}

function InfoItem({ icon, label, value, mono = false, tone = "slate" }) {
  const toneMap = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    violet: "bg-violet-100 text-violet-700",
    red: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="mb-2 flex items-center gap-2">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            toneMap[tone] || toneMap.slate
          }`}
        >
          {icon}
        </div>

        <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </div>
      </div>

      <div
        className={`break-all text-sm font-semibold text-slate-800 ${
          mono ? "font-mono text-[13px]" : ""
        }`}
        style={{ overflowWrap: "anywhere" }}
      >
        {value}
      </div>
    </div>
  );
}

function UserDetailModal({ open, user, onClose, loadUserDetail }) {
  const [detailUser, setDetailUser] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !user?._id || typeof loadUserDetail !== "function") {
      setDetailUser(null);
      setDetailError("");
      setIsLoadingDetail(false);
      return;
    }

    let cancelled = false;

    const fetchDetail = async () => {
      try {
        setIsLoadingDetail(true);
        setDetailError("");

        const result = await loadUserDetail(user._id);

        if (!cancelled) {
          setDetailUser(result || null);
        }
      } catch (error) {
        if (!cancelled) {
          setDetailUser(null);
          setDetailError(
            error?.response?.data?.message ||
              error?.message ||
              "Không tải được chi tiết người dùng."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDetail(false);
        }
      }
    };

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [open, user?._id, loadUserDetail]);

  const displayUser = detailUser || user;

  const statusMeta = useMemo(
    () => getStatusMeta(normalizeUserStatus(displayUser)),
    [displayUser]
  );

  const infoItems = useMemo(() => {
    if (!displayUser) return [];

    const items = [
      {
        key: "email",
        icon: <Mail size={16} strokeWidth={2.3} />,
        label: "Email",
        value: displayUser.email,
        tone: "blue",
      },
      {
        key: "userId",
        icon: <UserRound size={16} strokeWidth={2.3} />,
        label: "ID Người dùng",
        value: displayUser._id,
        tone: "amber",
        mono: true,
      },
      {
        key: "createdAt",
        icon: <CalendarDays size={16} strokeWidth={2.3} />,
        label: "Ngày tạo",
        value: formatDateTime(displayUser.createdAt),
        tone: "slate",
      },
      {
        key: "updatedAt",
        icon: <CalendarDays size={16} strokeWidth={2.3} />,
        label: "Cập nhật lần cuối",
        value: formatDateTime(displayUser.updatedAt),
        tone: "slate",
      },
      {
        key: "phone",
        icon: <Phone size={16} strokeWidth={2.3} />,
        label: "Số điện thoại",
        value: displayUser.phone,
        tone: "slate",
      },
      {
        key: "location",
        icon: <MapPin size={16} strokeWidth={2.3} />,
        label: "Địa chỉ",
        value: getUserLocationValue(displayUser),
        tone: "slate",
      },
      {
        key: "headline",
        icon: <UserRound size={16} strokeWidth={2.3} />,
        label: "Chức danh",
        value: getUserTitleValue(displayUser),
        tone: "slate",
      },
      {
        key: "about",
        icon: <CircleUserRound size={16} strokeWidth={2.3} />,
        label: "Giới thiệu",
        value: displayUser.about,
        tone: "slate",
        fullRow: true,
      },
    ];

    return items.filter((item) => hasValue(item.value));
  }, [displayUser]);

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Đóng hộp thoại"
      />

      <div
        className="relative z-10 flex max-h-[85vh] w-full max-w-4xl min-w-0 flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-center gap-4">
            {displayUser?.avatar ? (
              <img
                src={displayUser.avatar}
                alt="Ảnh đại diện"
                className="h-16 w-16 rounded-3xl object-cover ring-1 ring-slate-200 sm:h-20 sm:w-20"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-xl font-black text-slate-600 ring-1 ring-slate-200 sm:h-20 sm:w-20 sm:text-2xl">
                {getInitials(displayUser?.fullName)}
              </div>
            )}

            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
                <CircleUserRound size={12} strokeWidth={2.3} />
                Chi tiết người dùng
              </div>

              <h3
                className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl"
                style={{ overflowWrap: "anywhere" }}
              >
                {displayUser?.fullName || "Người dùng chưa đặt tên"}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${getRoleClass(
                    displayUser?.role
                  )}`}
                >
                  {displayUser?.role || "user"}
                </span>

                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusMeta.className}`}
                >
                  {statusMeta.label}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-16 text-slate-500">
              <Loader2 size={20} className="mr-2 animate-spin text-amber-500" />
              Đang tải chi tiết người dùng...
            </div>
          ) : detailError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-rose-500">
                <CircleAlert size={22} />
              </div>
              <p className="font-bold text-rose-700">
                Không tải được chi tiết người dùng
              </p>
              <p className="mt-1 text-sm text-rose-600">{detailError}</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <InfoItem
                  icon={<CircleOff size={16} strokeWidth={2.3} />}
                  label="Trạng thái tài khoản"
                  value={statusMeta.label}
                  tone={statusMeta.label === "Banned" ? "red" : "green"}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {infoItems.map((item) =>
                  item.fullRow ? (
                    <div key={item.key} className="md:col-span-2">
                      <InfoItem
                        icon={item.icon}
                        label={item.label}
                        value={item.value}
                        mono={item.mono}
                        tone={item.tone}
                      />
                    </div>
                  ) : (
                    <InfoItem
                      key={item.key}
                      icon={item.icon}
                      label={item.label}
                      value={item.value}
                      mono={item.mono}
                      tone={item.tone}
                    />
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDetailModal;