import { useEffect } from "react";
import { Check, ChevronDown, Search, Users, X } from "lucide-react";
import useUserMultiSelect from "../hooks/useUserMultiSelect";
import { getRoleBadgeClasses } from "../utils/userMultiSelect.utils";

function getUserId(user) {
  return String(user?._id || user?.id || "");
}

function SelectedChip({ user, onRemove }) {
  const userId = getUserId(user);

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      <img
        src={user?.avatar || "https://www.gravatar.com/avatar/?d=identicon"}
        alt={user?.fullName || "User avatar"}
        className="h-5 w-5 rounded-full object-cover"
      />
      <span className="max-w-[120px] truncate">
        {user?.fullName || user?.email || "Unknown user"}
      </span>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRemove(userId);
        }}
        className="text-amber-600 transition hover:text-amber-800"
      >
        <X size={12} />
      </button>
    </span>
  );
}

function UserRow({ user, isSelected, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(user)}
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all ${
        isSelected
          ? "border-amber-200 bg-amber-50 ring-1 ring-amber-100"
          : "border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/40"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <img
          src={user?.avatar || "https://www.gravatar.com/avatar/?d=identicon"}
          alt={user?.fullName || "User avatar"}
          className="h-11 w-11 rounded-full object-cover ring-1 ring-slate-200"
        />

        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-slate-900">
            {user?.fullName || "Unnamed user"}
          </div>
          <div className="truncate text-xs text-slate-500">
            {user?.email || "No email"}
          </div>
        </div>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${getRoleBadgeClasses(
            user?.role
          )}`}
        >
          {user?.role || "user"}
        </span>

        {isSelected ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white">
            <Check size={15} />
          </span>
        ) : null}
      </div>
    </button>
  );
}

function PickerModal({
  open,
  onClose,
  keyword,
  setKeyword,
  users,
  listRef,
  handleScroll,
  selectedIds,
  toggleUser,
  value,
  removeUser,
  modalRef,
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = window.document.body.style.overflow;
    const originalPaddingRight = window.document.body.style.paddingRight;

    window.document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      window.document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.document.body.style.overflow = originalOverflow;
      window.document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const showEmpty = users.length === 0;

  return (
    <div className="fixed inset-0 z-[1200] overflow-y-auto">
      <button
        type="button"
        aria-label="Close user picker"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm"
      />

      <div className="relative flex min-h-full items-start justify-center p-4 pb-8 pt-12 md:pt-16">
        <div
          ref={modalRef}
          className="relative z-10 flex h-[min(78vh,720px)] w-full max-w-3xl flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <Users size={20} />
              </div>

              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  Select users
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Search and choose recipients for this role.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              <X size={18} />
            </button>
          </div>

          <div className="shrink-0 border-b border-slate-100 bg-white px-5 py-4 md:px-6">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div className="mt-4 min-h-[34px]">
              {value.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {value.map((user) => (
                    <SelectedChip
                      key={getUserId(user)}
                      user={user}
                      onRemove={removeUser}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No users selected yet.</p>
              )}
            </div>
          </div>

          <div
            ref={listRef}
            onScroll={handleScroll}
            className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-5 py-4 md:px-6"
          >
            {showEmpty ? (
              <div className="flex h-full min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 text-center text-sm text-slate-400">
                No users found.
              </div>
            ) : (
              <div className="grid gap-3">
                {users.map((user) => {
                  const userId = getUserId(user);
                  const isSelected = selectedIds.has(userId);

                  return (
                    <UserRow
                      key={userId}
                      user={user}
                      isSelected={isSelected}
                      onToggle={toggleUser}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-4 md:px-6">
            <p className="text-sm text-slate-500">
              Selected:{" "}
              <span className="font-bold text-slate-900">{value.length}</span>
            </p>

            <div className="flex items-center gap-2">
              {value.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    value.forEach((user) => removeUser(getUserId(user)));
                  }}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Clear
                </button>
              ) : null}

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserMultiSelect({
  value = [],
  onChange,
  placeholder = "Search and select users...",
  allowedRoles = [],
}) {
  const {
    isOpen,
    setIsOpen,
    keyword,
    setKeyword,
    users,
    modalRef,
    listRef,
    selectedIds,
    toggleUser,
    removeUser,
    handleScroll,
  } = useUserMultiSelect({
    value,
    onChange,
    allowedRoles,
  });

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex min-h-[56px] w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition-all duration-200 hover:border-slate-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {value.length > 0 ? (
              value.map((user) => (
                <SelectedChip
                  key={getUserId(user)}
                  user={user}
                  onRemove={removeUser}
                />
              ))
            ) : (
              <span className="text-sm text-slate-400">{placeholder}</span>
            )}
          </div>

          <ChevronDown size={18} className="ml-3 shrink-0 text-slate-400" />
        </button>
      </div>

      <PickerModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        keyword={keyword}
        setKeyword={setKeyword}
        users={users}
        listRef={listRef}
        handleScroll={handleScroll}
        selectedIds={selectedIds}
        toggleUser={toggleUser}
        value={value}
        removeUser={removeUser}
        modalRef={modalRef}
      />
    </>
  );
}