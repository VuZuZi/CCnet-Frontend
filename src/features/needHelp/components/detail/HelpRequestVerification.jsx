import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Mail,
  Phone,
  UserRound,
  FileStack,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

import { EvidenceGallery } from './EvidenceGallery';

const getPopulatedEntity = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : null;

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
        <Icon size={13} />
        {label}
      </div>
      <div className="mt-3 text-sm leading-7 text-slate-700">{children}</div>
    </div>
  );
}

export function HelpRequestVerification({
  helpRequest,
  showEvidence = true,
  compact = false,
}) {
  const {
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
    <section
      className={`rounded-[24px] border border-slate-200 bg-white shadow-sm ${
        compact ? 'p-5' : 'p-6'
      }`}
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700 ring-1 ring-amber-200">
        <ShieldCheck size={13} />
        Theo dõi xử lý
      </div>

      <h2
        className={`mt-4 font-black tracking-tight text-slate-950 ${
          compact ? 'text-lg' : 'text-xl'
        }`}
      >
        Thông tin xử lý
      </h2>

      <div className="mt-6 grid gap-4">
        <DetailRow icon={UserRound} label="Tổ chức được gợi ý">
          {organizer ? (
            <>
              <p className="font-semibold text-slate-900">{organizer.fullName}</p>
              <p className="text-slate-500">
                {organizer.email || 'Thông tin liên hệ tổ chức có trong hồ sơ.'}
              </p>
            </>
          ) : (
            <p className="text-slate-500">Chưa có tổ chức nào được gợi ý.</p>
          )}
        </DetailRow>

        <DetailRow icon={FolderKanban} label="Dự án liên kết">
          {linkedProject ? (
            <Link
              to={`/projects/${linkedProject._id || linkedProject.id}`}
              className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-700"
            >
              {linkedProject.title}
            </Link>
          ) : (
            <p className="text-slate-500">Chưa có dự án nào được tạo từ yêu cầu này.</p>
          )}
        </DetailRow>

        {(contactPhone || contactEmail) && !compact && (
          <DetailRow icon={Phone} label="Thông tin liên hệ">
            <div className="flex flex-col gap-3">
              {contactPhone ? (
                <a
                  href={`tel:${contactPhone}`}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Phone size={15} className="text-amber-500" />
                  {contactPhone}
                </a>
              ) : null}

              {contactEmail ? (
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex max-w-full w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Mail size={15} className="shrink-0 text-amber-500" />
                  <span className="break-all">{contactEmail}</span>
                </a>
              ) : null}
            </div>
          </DetailRow>
        )}

        {rejectionReason ? (
          <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-rose-700">
              <AlertTriangle size={13} />
              Lý do từ chối
            </div>
            <p className="mt-3 text-sm leading-7 text-rose-900">{rejectionReason}</p>
          </div>
        ) : null}
      </div>

      {showEvidence ? (
        <div className="mt-6 border-t border-slate-100 pt-6">
          <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            <FileStack size={13} />
            Minh chứng & Tệp đính kèm
          </div>

          {evidences.length > 0 ? (
            <EvidenceGallery evidences={evidences} />
          ) : (
            <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">
              Chưa có tệp minh chứng nào được đính kèm cho yêu cầu này.
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

export default HelpRequestVerification;
