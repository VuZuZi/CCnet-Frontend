import { useState } from 'react';

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

  return (
    <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 sm:p-6">
      <h3 className="text-base font-bold text-slate-900">Admin Assignment</h3>
      <p className="mt-1 text-sm text-slate-600">
        Assign this need help request to an organizer. Suggestions are ranked by relevance and location.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Assign Organizer
        </button>

        {helpRequest?.assignedOrganizerId?.fullName ? (
          <span className="text-sm text-slate-700">
            Current organizer: <strong>{helpRequest.assignedOrganizerId.fullName}</strong>
          </span>
        ) : (
          <span className="text-sm text-slate-500">No organizer assigned yet.</span>
        )}
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
