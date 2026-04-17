import { PageLoader } from "@/shared/components/ui/PageLoader";
import ProjectActionReasonModal from "../components/projects/ProjectActionReasonModal";
import AdminProjectPreviewHeader from "../components/projects/AdminProjectPreviewHeader";
import AdminProjectPreviewContent from "../components/projects/AdminProjectPreviewContent";
import useAdminProjectPreviewPage from "../hooks/useAdminProjectPreviewPage";

export default function AdminProjectPreviewPage() {
  const {
    navigate,
    project,
    isFetching,
    isError,
    activeTab,
    setActiveTab,
    isHighlighted,
    isProcessing,
    modalState,
    isReviewable,
    revisionCount,
    canRequestRevision,
    handleApprove,
    handleOpenModal,
    handleCloseModal,
    handleSubmitModal,
  } = useAdminProjectPreviewPage();

  if (isFetching) return <PageLoader />;

  if (isError || !project) {
    return (
      <div className="rounded-[28px] border border-red-100 bg-white p-10 text-center text-red-500 shadow-sm">
        Không tìm thấy dự án hoặc dự án đã bị xóa.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <AdminProjectPreviewHeader
        project={project}
        isReviewable={isReviewable}
        canRequestRevision={canRequestRevision}
        revisionCount={revisionCount}
        isProcessing={isProcessing}
        onBack={() => navigate("/admin/projects")}
        onApprove={handleApprove}
        onOpenModal={handleOpenModal}
      />

      <ProjectActionReasonModal
        open={modalState.open}
        project={project}
        actionKey={modalState.actionKey}
        loading={isProcessing}
        onClose={handleCloseModal}
        onConfirm={handleSubmitModal}
      />

      <AdminProjectPreviewContent
        project={project}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isHighlighted={isHighlighted}
        revisionCount={revisionCount}
      />
    </div>
  );
}