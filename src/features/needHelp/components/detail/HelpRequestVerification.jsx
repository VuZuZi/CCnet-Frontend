import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  CalendarDays,
  ClipboardList,
  FolderKanban,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react';

import { formatDate } from '@/shared/lib/formatters';

import { EvidenceGallery } from './EvidenceGallery';
import { StatusBadge } from './StatusBadge';

const getPopulatedEntity = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : null;

function DetailInfoCard({ icon, label, children }) {
  const IconComponent = icon;

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        <IconComponent size={14} />
        {label}
      </div>
      <div className="mt-3 text-sm leading-6 text-slate-700">{children}</div>
    </div>
  );
}

export function HelpRequestVerification({ helpRequest }) {
  const {
    status,
    createdAt,
    rejectionReason,
    assignedOrganizerId,
    linkedProjectId,
    contactPhone,
    contactEmail,
    evidences = [],
  } = helpRequest;

  const organizer = getPopulatedEntity(assignedOrganizerId);
  const linkedProject = getPopulatedEntity(linkedProjectId);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Request Lifecycle</h2>
          <p className="text-sm text-slate-500">
            Status, assignment details, and attached documents.
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DetailInfoCard icon={CalendarDays} label="Submitted Date">
          <p className="font-semibold text-slate-900">{formatDate(createdAt) || 'Not available'}</p>
          <p className="text-slate-500">This request entered the CCNet review flow on this date.</p>
        </DetailInfoCard>

        <DetailInfoCard icon={BadgeCheck} label="Current Status">
          <p className="font-semibold text-slate-900">{status || 'PUBLISHED'}</p>
          <p className="text-slate-500">Displayed publicly in NeedHelp feed.</p>
        </DetailInfoCard>

        <DetailInfoCard icon={UserRound} label="Assigned Organizer">
          {organizer ? (
            <>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">{organizer.fullName}</p>
                {organizer.isVerified && (
                  <BadgeCheck size={16} className="text-blue-500" title="Verified" />
                )}
              </div>
              <p className="text-slate-500">{organizer.email || 'Organizer contact available on profile.'}</p>
            </>
          ) : (
            <p className="text-slate-500">No organizer has been assigned yet.</p>
          )}
        </DetailInfoCard>

        <DetailInfoCard icon={FolderKanban} label="Linked Project">
          {linkedProject ? (
            <Link
              to={`/projects/${linkedProject._id || linkedProject.id}`}
              className="font-semibold text-amber-600 transition-colors hover:text-amber-700"
            >
              {linkedProject.title}
            </Link>
          ) : (
            <p className="text-slate-500">A project has not been created from this request yet.</p>
          )}
        </DetailInfoCard>
      </div>

      {(contactPhone || contactEmail) && (
        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            <ClipboardList size={14} />
            Contact Details
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            {contactPhone && (
              <a
                href={`tel:${contactPhone}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100"
              >
                <Phone size={16} className="text-amber-500" />
                {contactPhone}
              </a>
            )}

            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100"
              >
                <Mail size={16} className="text-amber-500" />
                {contactEmail}
              </a>
            )}
          </div>
        </div>
      )}

      {rejectionReason && (
        <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-700">
            Rejection Reason
          </p>
          <p className="mt-2 text-sm leading-7 text-rose-900">{rejectionReason}</p>
        </div>
      )}

      {evidences.length > 0 ? (
        <div className="mt-6 border-t border-slate-100 pt-6">
          <EvidenceGallery evidences={evidences} />
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          No evidence files were attached to this request yet.
        </div>
      )}
    </section>
  );
}
