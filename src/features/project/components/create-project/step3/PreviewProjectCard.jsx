import PreviewStatusPill from "./PreviewStatusPill";
import {
  getPreviewCategoryLabel,
  getPreviewProjectTypeLabel,
} from "./utils/step3Preview.utils";

const formatMoney = (value) => Number(value || 0).toLocaleString("vi-VN");

const formatDate = (value) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleDateString("vi-VN");
};

export function PreviewProjectCard({ formData }) {
  const milestones = Array.isArray(formData?.milestones) ? formData.milestones : [];
  const volunteerRoles = Array.isArray(formData?.volunteerRoles)
    ? formData.volunteerRoles
    : [];

  return (
    <div className="min-w-0 space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <PreviewStatusPill tone="amber">
          {getPreviewProjectTypeLabel(formData?.projectType)}
        </PreviewStatusPill>

        <PreviewStatusPill tone="blue">
          {getPreviewCategoryLabel(formData?.category)}
        </PreviewStatusPill>

        {formData?.needsVolunteers ? (
          <PreviewStatusPill tone="emerald">Cần tình nguyện viên</PreviewStatusPill>
        ) : null}
      </div>

      <div className="min-w-0">
        <h2 className="break-words text-2xl font-black tracking-tight text-slate-900">
          {formData?.title || "Dự án chưa có tiêu đề"}
        </h2>

        <p className="mt-2 break-words text-sm text-slate-500">
          {formData?.location?.address || "Chưa có địa điểm"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
            Đối tượng thụ hưởng
          </p>
          <p className="mt-2 break-all whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {formData?.beneficiaryInfo?.details || "Chưa có thông tin đối tượng thụ hưởng"}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
            Thời gian thực hiện
          </p>
          <p className="mt-2 break-words text-sm leading-6 text-slate-700">
            Bắt đầu: {formatDate(formData?.startDate)}
          </p>
          <p className="break-words text-sm leading-6 text-slate-700">
            Kết thúc: {formatDate(formData?.endDate)}
          </p>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
          Câu chuyện dự án
        </p>
        <div
          className="prose prose-slate mt-3 max-w-none break-words text-sm [&_*]:max-w-full [&_img]:h-auto [&_img]:max-w-full [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_td]:break-words [&_th]:break-words [&_p]:break-words"
          dangerouslySetInnerHTML={{
            __html: formData?.description || "<p>Chưa có câu chuyện dự án.</p>",
          }}
        />
      </div>

      {formData?.projectType === "FUNDED" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-amber-700">
            Gây quỹ
          </p>
          <p className="mt-2 text-lg font-black text-slate-900">
            {formatMoney(formData?.targetAmount)}đ
          </p>

          {milestones.length > 0 ? (
            <div className="mt-4 space-y-3">
              {milestones.map((milestone, index) => (
                <div
                  key={`${milestone?.title || "milestone"}-${index}`}
                  className="min-w-0 rounded-xl border border-amber-200 bg-white p-3"
                >
                  <p className="break-words font-bold text-slate-900">
                    {milestone?.title || `Mốc ${index + 1}`}
                  </p>
                  <p className="mt-1 break-words text-sm text-slate-600">
                    {formatMoney(milestone?.targetAmount)}đ
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {formData?.needsVolunteers ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-emerald-700">
            Vị trí tình nguyện viên
          </p>

          {volunteerRoles.length === 0 ? (
            <p className="mt-2 text-sm text-emerald-700">
              Chưa có vị trí tình nguyện viên nào.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {volunteerRoles.map((role, index) => (
                <div
                  key={`${role?.title || "role"}-${index}`}
                  className="min-w-0 rounded-xl border border-emerald-200 bg-white p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="break-words font-bold text-slate-900">
                      {role?.title || `Vị trí ${index + 1}`}
                    </p>
                    <p className="text-sm font-semibold text-emerald-700">
                      {Number(role?.quantity || 0)} người
                    </p>
                  </div>

                  {role?.skills ? (
                    <p className="mt-1 break-words text-sm text-slate-600">
                      Kỹ năng: {role.skills}
                    </p>
                  ) : null}

                  {role?.location ? (
                    <p className="mt-1 break-words text-sm text-slate-600">
                      Địa điểm/Thời gian: {role.location}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default PreviewProjectCard;