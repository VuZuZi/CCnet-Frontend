import { Link } from 'react-router-dom';
import {
  ClipboardList,
  FolderKanban,
  Mail,
  Phone,
  UserRound,
  FileStack,
  ShieldCheck,
} from 'lucide-react';

import { EvidenceGallery } from './EvidenceGallery';

const getPopulatedEntity = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : null;

function InfoBlock({ icon: Icon, label, children }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
        <Icon size={13} />
        {label}
      </div>
      <div className="mt-2 text-sm leading-6 text-slate-700">{children}</div>
    </div>
  );
}

export function HelpRequestVerification({ helpRequest }) {
  const {
    rejectionReason,
    assignedOrganizerId,
    linkedProjectId,
    contactPhone,
    contactEmail,
    evidences = [],
    status,
  } = helpRequest;

  const organizer = getPopulatedEntity(assignedOrganizerId);
  const linkedProject = getPopulatedEntity(linkedProjectId);

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
            <ShieldCheck size={13} />
            Request Lifecycle
          </div>

          <h2 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
            Assignment, contact, and evidence
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Review the operational details of this request in one place.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <InfoBlock icon={UserRound} label="Assigned Organizer">
          {organizer ? (
            <>
              <p className="font-semibold text-slate-900">{organizer.fullName}</p>
              <p className="text-slate-500">
                {organizer.email || 'Organizer contact available on profile.'}
              </p>
            </>
          ) : status === 'PENDING' ? (
            <p className="text-slate-500">No organizer can be assigned before verification.</p>
          ) : (
            <p className="text-slate-500">No organizer has been assigned yet.</p>
          )}
        </InfoBlock>

        <InfoBlock icon={FolderKanban} label="Linked Project">
          {linkedProject ? (
            <Link
              to={`/projects/${linkedProject._id || linkedProject.id}`}
              className="font-semibold text-amber-700 transition-colors hover:text-amber-800"
            >
              {linkedProject.title}
            </Link>
          ) : (
            <p className="text-slate-500">No project has been created from this request yet.</p>
          )}
        </InfoBlock>
      </div>

      {(contactPhone || contactEmail) && (
        <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            <ClipboardList size={13} />
            Contact Details
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            {contactPhone && (
              <a
                href={`tel:${contactPhone}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                <Phone size={15} className="text-amber-500" />
                {contactPhone}
              </a>
            )}

            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                <Mail size={15} className="text-amber-500 shrink-0" />
                <span className="break-all">{contactEmail}</span>
              </a>
            )}
          </div>
        </div>
      )}

      {rejectionReason && (
        <div className="mt-4 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-700">
            Rejection Reason
          </p>
          <p className="mt-2 text-sm leading-7 text-rose-900">{rejectionReason}</p>
        </div>
      )}

      <div className="mt-5 border-t border-slate-100 pt-5">
        <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          <FileStack size={13} />
          Evidence & Attachments
        </div>

        {evidences.length > 0 ? (
          <EvidenceGallery evidences={evidences} />
        ) : (
          <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">
            No evidence files were attached to this request yet.
          </div>
        )}
      </div>
    </section>
  );
}

export default HelpRequestVerification;