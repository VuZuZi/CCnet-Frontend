import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save, Send } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { PageLoader } from "@/shared/components/ui/PageLoader";
import { MilestonesBlock } from "../components/MilestonesBlock";
import { useUpdatingProjectDetail } from "../hooks/useProjectQueries";
import {
  useConfirmUpdatingProject,
  useUpdateUpdatingProject,
} from "../hooks/useProjectMutations";
import { updatingMilestonesSchema } from "../validations/projectSchema";

const formatDateForInput = (isoString) => {
  if (!isoString) return "";
  return new Date(isoString).toISOString().split("T")[0];
};

const formatMoney = (value) => Number(value || 0).toLocaleString("vi-VN");

export function ProjectUpdatingMilestonesPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: project,
    isLoading,
    isError,
  } = useUpdatingProjectDetail(id);

  const { mutateAsync: updateProject, isPending: isSaving } =
    useUpdateUpdatingProject();
  const { mutateAsync: confirmProject, isPending: isConfirming } =
    useConfirmUpdatingProject();

  const isFunded = project?.projectType === "FUNDED";
  const fundedAmount =
    project?.financialDetail?.availableBalance ??
    project?.fundedAmountFromEscrow ??
    project?.currentAmount ??
    0;
  const matchingAmount = isFunded ? Number(fundedAmount || 0) : 0;
  const isBusy = isSaving || isConfirming;

  const methods = useForm({
    resolver: zodResolver(
      updatingMilestonesSchema({
        isFunded,
        matchAmount: matchingAmount,
        projectStartDate: project?.startDate,
        projectEndDate: project?.endDate,
      }),
    ),
    mode: "onChange",
    reValidateMode: "onChange",
    values: {
      targetAmount: matchingAmount,
      milestones: Array.isArray(project?.milestones)
        ? project.milestones.map((milestone) => ({
            ...milestone,
            startDate: formatDateForInput(milestone?.startDate),
            endDate: formatDateForInput(milestone?.endDate),
          }))
        : [],
    },
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = methods;

  const buildPayload = (data) => ({
    milestones: Array.isArray(data?.milestones) ? data.milestones : [],
  });

  const handleSave = handleSubmit(async (data) => {
    await updateProject({
      id,
      data: buildPayload(data),
    });
  });

  const handleConfirm = handleSubmit(async (data) => {
    await updateProject({
      id,
      data: buildPayload(data),
    });
    await confirmProject(id);
    navigate(`/projects/${id}`);
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
          <p className="text-xl font-black text-red-500">
            Không thể mở biểu mẫu cập nhật dự án
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Dự án có thể không ở trạng thái `Updating` hoặc bạn không có quyền truy cập.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#FFFDF8_0%,#FFF7E2_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <button
            type="button"
            onClick={() => navigate(`/projects/${id}`)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Quay lại dự án
          </button>

          <div className="mt-5">
            <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-amber-700">
              Updating
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              Cập nhật milestone cho dự án
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {project?.title}
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                Số tiền phải khớp
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {formatMoney(matchingAmount)}đ
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Tổng ngân sách milestone phải trùng với số tiền hiện tại của dự án.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-amber-700">
                Yêu cầu từ quản trị viên
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-900">
                {project?.updateRequestReason || "Chưa có lý do cụ thể từ quản trị viên."}
              </p>
            </div>
          </div>
        </div>

        <FormProvider {...methods}>
          <form className="space-y-6">
            <MilestonesBlock
              control={control}
              errors={errors}
              isFunded={isFunded}
              projectStartDate={project?.startDate}
              projectEndDate={project?.endDate}
            />

            <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={isBusy}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Lưu cập nhật
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isBusy}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black text-slate-900 transition hover:bg-amber-600 disabled:opacity-60"
              >
                {isConfirming ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Xác nhận gửi admin
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

export default ProjectUpdatingMilestonesPage;
