import { useState } from 'react';
import { ArrowRight, ShieldCheck, UserRound } from 'lucide-react';

import { useAssignOrganizer } from '../../hooks/useHelpRequestMutations';
import { OrganizerSuggestionModal } from './OrganizerSuggestionModal';

export function AdminAssignmentPanel({ helpRequest }) {
  const [isOpen, setIsOpen] = useState(false);
  const assignMutation = useAssignOrganizer();

  const handleAssign = async (organizer) => {
    await assignMutation.mutateAsync({
      id: helpRequest._id,
      organizerId: organizer._id,
    });

    setIsOpen(false);
  };

  const assignedName = helpRequest?.assignedOrganizerId?.fullName;
  const buttonLabel = assignedName ? 'Giao lại' : 'Giao nhà tổ chức';

  const handleOpenModal = () => {
    if (assignMutation.isPending) {
      return;
    }
    setIsOpen(true);
  };

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
            <ShieldCheck size={13} />
            Giao việc
          </div>

          <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
            Giao việc cho nhà tổ chức
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Giao yêu cầu này cho nhà tổ chức phù hợp dựa trên mức độ liên quan và vị trí.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              <UserRound size={13} />
              Nhà tổ chức hiện tại
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {assignedName || 'Chưa được giao'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenModal}
            disabled={assignMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {buttonLabel}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <OrganizerSuggestionModal
        isOpen={isOpen}
        helpRequest={helpRequest}
        onClose={() => setIsOpen(false)}
        onAssign={handleAssign}
        isAssigning={assignMutation.isPending}
      />
    </section>
  );
}

export default AdminAssignmentPanel;
