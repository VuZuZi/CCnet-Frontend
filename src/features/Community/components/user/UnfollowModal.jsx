import React from "react";
import { Button } from "@/shared/components/ui/Button/Button";
import { useBodyScrollLock } from "@/shared/hooks/useBodyScrollLock";

export const UnfollowModal = ({
  isOpen,
  user,
  isPending,
  onClose,
  onConfirm,
}) => {
  useBodyScrollLock(isOpen);

  if (!isOpen || !user) return null;

  const titleOf = user?.fullName || user?.email || "người dùng này";

  return (
    <div className="ccnet-modal-overlay fixed inset-0 z-[1050] flex items-center justify-center bg-slate-950/45 p-4">
      <div className="ccnet-modal-panel flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="px-6 py-4 border-b border-light-gray flex justify-between items-center bg-white">
          <h3 className="font-bold text-lg text-black m-0">Bỏ theo dõi</h3>
        </div>
        <div className="p-6 text-black bg-white">
          Bạn có chắc chắn muốn bỏ theo dõi <strong>{titleOf}</strong> không?
        </div>
        <div className="px-6 py-4 border-t border-light-gray bg-off-white flex justify-end gap-3 rounded-b-xl">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="danger" isLoading={isPending} onClick={onConfirm}>
            Bỏ theo dõi
          </Button>
        </div>
      </div>
    </div>
  );
};
