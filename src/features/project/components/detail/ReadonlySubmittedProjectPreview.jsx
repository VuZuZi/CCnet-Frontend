import PreviewProjectCard from "../create-project/step3/PreviewProjectCard";
import PreviewUploadedMedia from "../create-project/step3/PreviewUploadedMedia";

const normalizeCoverMedia = (coverMedia) => {
  if (!coverMedia) return [];

  if (Array.isArray(coverMedia)) {
    return coverMedia.filter(Boolean);
  }

  if (coverMedia.url || coverMedia.publicId || coverMedia._id) {
    return [coverMedia];
  }

  return [];
};

const normalizeDocuments = (documents) => {
  if (!Array.isArray(documents)) return [];
  return documents.filter(Boolean);
};

const normalizeMilestones = (milestones) => {
  if (!Array.isArray(milestones)) return [];

  return milestones.map((milestone) => ({
    milestoneId: milestone?.milestoneId || undefined,
    title: milestone?.title || "",
    description: milestone?.description || "",
    targetAmount: Number(milestone?.targetAmount || 0),
    startDate: milestone?.startDate || "",
    endDate: milestone?.endDate || "",
    deliverables: milestone?.deliverables || "",
    location: milestone?.location || null,
    evidencePolicy: milestone?.evidencePolicy || null,
    status: milestone?.status || undefined,
  }));
};

const normalizeVolunteerRoles = (roles) => {
  if (!Array.isArray(roles)) return [];

  return roles.map((role) => ({
    roleId: role?.roleId || undefined,
    title: role?.title || "",
    quantity: Number(role?.quantity || 0),
    skills: Array.isArray(role?.skillsRequired)
      ? role.skillsRequired.join(", ")
      : role?.skills || "",
    skillsRequired: Array.isArray(role?.skillsRequired)
      ? role.skillsRequired
      : [],
    location: role?.location || "",
    duration: role?.duration || "",
  }));
};

const mapProjectToReadonlyFormData = (project = {}) => ({
  projectType: project?.projectType || "FUNDED",
  title: project?.title || "",
  category: project?.category || "",
  location: project?.location || null,
  description: project?.description || "",
  beneficiaryInfo: project?.beneficiaryInfo || { details: "" },

  startDate: project?.startDate || "",
  endDate: project?.endDate || "",

  targetAmount: Number(project?.targetAmount || 0),
  milestones: normalizeMilestones(project?.milestones),

  needsVolunteers: Boolean(project?.needsVolunteers),
  volunteerRoles: normalizeVolunteerRoles(project?.volunteerRoles),

  coverMedia: normalizeCoverMedia(project?.coverMedia),
  documents: normalizeDocuments(project?.documents),
  deletedDocumentIds: [],

  fromHelpRequestId: project?.fromHelpRequestId || null,
});

export function ReadonlySubmittedProjectPreview({ project }) {
  const formData = mapProjectToReadonlyFormData(project);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-6 py-5 text-amber-900 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">
          Chỉ xem, không chỉnh sửa
        </p>

        <h2 className="mt-2 text-xl font-black text-slate-900">
          Nội dung dự án đã nộp
        </h2>

        <p className="mt-2 text-sm leading-7 text-amber-900">
          Đây là bản xem lại toàn bộ thông tin bạn đã gửi cho Ban quản trị kiểm
          duyệt. Trong thời gian chờ duyệt, bạn không thể chỉnh sửa nội dung dự
          án.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="min-w-0 space-y-6 lg:col-span-7">
          <PreviewProjectCard formData={formData} />
        </div>

        <div className="min-w-0 space-y-6 lg:col-span-5">
          <PreviewUploadedMedia formData={formData} />
        </div>
      </div>
    </div>
  );
}

export default ReadonlySubmittedProjectPreview;