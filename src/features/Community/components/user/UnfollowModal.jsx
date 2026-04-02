import React from "react";
import { Button } from "@/shared/components/ui/Button/Button";

export const UnfollowModal = ({
  isOpen,
  user,
  isPending,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !user) return null;

  const titleOf = user?.fullName || user?.email || "this user";

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-light-gray flex justify-between items-center bg-white">
          <h3 className="font-bold text-lg text-black m-0">Unfollow</h3>
        </div>
        <div className="p-6 text-black bg-white">
          Are you sure you want to unfollow <strong>{titleOf}</strong>?
        </div>
        <div className="px-6 py-4 border-t border-light-gray bg-off-white flex justify-end gap-3 rounded-b-xl">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={isPending} onClick={onConfirm}>
            Unfollow
          </Button>
        </div>
      </div>
    </div>
  );
};
