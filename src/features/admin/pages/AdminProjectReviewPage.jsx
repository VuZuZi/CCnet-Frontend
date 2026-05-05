import { useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import useAdminProjectReviewPage from "../hooks/useAdminProjectReviewPage";
import AdminProjectReviewHeader from "../components/projectReview/AdminProjectReviewHeader";
import AIReviewAssistantPanel from "../components/projectReview/AIReviewAssistantPanel";
import AdminDecisionPanel from "../components/projectReview/AdminDecisionPanel";
import AdminFeedbackModal from "../components/projectReview/AdminFeedbackModal";
import ManualAIBypassConfirmModal from "../components/projectReview/ManualAIBypassConfirmModal";
import DocumentPreviewModal from "../components/projectReview/DocumentPreviewModal";
import {
  BeneficiaryReviewSection,
  BudgetReviewSection,
  EvidenceReviewSection,
  MilestoneLogicReviewSection,
  OrganizerTrustReviewSection,
  ProjectSummaryReviewSection,
  ReviewHistorySection,
  TimelineLocationReviewSection,
} from "../components/projectReview/ProjectReviewDataBlocks";

const SECTION_ALIASES = {
  project_summary: "overview",
  summary: "overview",
  description: "overview",
  beneficiary: "beneficiary",
  budget: "budget",
  milestones: "milestones",
  milestone_logic: "milestones",
  evidence: "evidence",
  evidence_plan: "evidence",
  organizer: "organizer",
  organizer_trust: "organizer",
  documents: "documents",
  media: "documents",
  timeline: "timeline",
  location: "timeline",
};

const SECTION_SCROLL_TARGETS = {
  overview: "project_summary",
  project_summary: "project_summary",
  beneficiary: "beneficiary",
  budget: "budget",
  milestones: "milestones",
  milestone_logic: "milestones",
  evidence: "evidence",
  documents: "evidence",
  timeline: "timeline",
  organizer: "organizer",
  organizer_trust: "organizer",
  policy: "project_summary",
};

const SECTION_SUMMARY_LABELS = {
  overview: "Tổng quan dự án",
  beneficiary: "Người thụ hưởng",
  budget: "Ngân sách",
  milestones: "Milestone",
  evidence: "Bằng chứng / tài liệu",
  documents: "Bằng chứng / tài liệu",
  timeline: "Thời gian / địa điểm",
  organizer: "Organizer",
  policy: "Chính sách",
};

const SEVERITY_WEIGHT = {
  critical: 4,
  needs_review: 3,
  warning: 2,
  info: 1,
};

const REVIEWABLE_STATUSES = new Set([
  "PENDING",
  "PENDING_APPROVAL",
  "UNDER_REVIEW",
  "REVISION_REQUESTED",
]);

const MAX_DECISION_REASON_LENGTH = 3900;

const limitDecisionReason = (value) =>
  String(value || "").slice(0, MAX_DECISION_REASON_LENGTH);

const clampDecisionReason = (value) =>
  limitDecisionReason(value).trim();

const groupFindings = (findings = []) => {
  const bySection = {};
  const byTarget = {};
  const maxSeverityBySection = {};

  findings.forEach((finding) => {
    const rawSection = finding.section || "policy";
    const section = SECTION_ALIASES[rawSection] || rawSection;

    bySection[section] = [...(bySection[section] || []), finding];

    if (finding.targetId) {
      byTarget[finding.targetId] = [
        ...(byTarget[finding.targetId] || []),
        finding,
      ];
    }

    const currentWeight = SEVERITY_WEIGHT[maxSeverityBySection[section]] || 0;
    const newWeight = SEVERITY_WEIGHT[finding.severity] || 0;

    if (newWeight > currentWeight) {
      maxSeverityBySection[section] = finding.severity;
    }
  });

  return { bySection, byTarget, maxSeverityBySection };
};

export default function AdminProjectReviewPage() {
  const { id } = useParams();

  const {
    review,
    isLoading,
    isFetching,
    refetch,
    retryAIReview,
    isRetryingAIReview,
    decideProject,
    isDeciding,
  } = useAdminProjectReviewPage(id);

  const [checklist, setChecklist] = useState({});
  const [decisionReason, setDecisionReason] = useState("");
  const [pendingApprovalPayload, setPendingApprovalPayload] = useState(null);
  const [manualBypassReason, setManualBypassReason] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [decisionCompleted, setDecisionCompleted] = useState(false);

  const project = review?.project;
  const latestRun = review?.latestAIReviewRun;
  const aiStatus = latestRun?.status || "NONE";

  const currentStatus = String(project?.status || "").toUpperCase();
  const isReviewableStatus = REVIEWABLE_STATUSES.has(currentStatus);
  const shouldHideDecisionActions = decisionCompleted || !isReviewableStatus;

  const findings = useMemo(
    () => latestRun?.findings || latestRun?.normalizedOutput?.findings || [],
    [latestRun]
  );

  const checklistSuggestions = useMemo(
    () =>
      latestRun?.checklistSuggestions ||
      latestRun?.normalizedOutput?.checklistSuggestions ||
      [],
    [latestRun]
  );

  const { bySection, byTarget, maxSeverityBySection } = useMemo(
    () => groupFindings(findings),
    [findings]
  );

  const sectionSummary = useMemo(() => {
    return Object.entries(bySection)
      .map(([section, items]) => ({
        section,
        label: SECTION_SUMMARY_LABELS[section] || section,
        count: items.length,
        severity: maxSeverityBySection[section] || "info",
        criticalCount: items.filter((f) => f.severity === "critical").length,
        warningCount: items.filter((f) => f.severity === "warning").length,
        needsReviewCount: items.filter((f) => f.severity === "needs_review")
          .length,
      }))
      .sort(
        (a, b) =>
          (SEVERITY_WEIGHT[b.severity] || 0) -
          (SEVERITY_WEIGHT[a.severity] || 0)
      );
  }, [bySection, maxSeverityBySection]);

  const revisionSuggestions = useMemo(
    () =>
      [
        ...new Set(
          findings
            .map((finding) =>
              String(finding?.suggestedRevisionText || "").trim()
            )
            .filter(Boolean)
        ),
      ],
    [findings]
  );

  const effectiveChecklist = {
    ...(review?.checklistDefaults || {}),
    ...checklist,
  };

  const aiIsCurrent =
    latestRun?.status === "COMPLETED" &&
    Number(latestRun?.submissionVersion) === Number(review?.submissionVersion) &&
    latestRun?.projectSnapshotHash === review?.projectSnapshotHash;

  const updateChecklist = (key, checked) => {
    setChecklist((prev) => ({ ...prev, [key]: checked }));
  };

  const insertSuggestion = useCallback((text) => {
    setDecisionReason((prev) => {
      const current = String(prev || "").trim();
      const merged = current ? `${current}\n\n${text}` : text;
      return clampDecisionReason(merged);
    });
  }, []);

  const applyFeedbackFromModal = useCallback((text) => {
    setDecisionReason(clampDecisionReason(text));
  }, []);

  const buildDecisionPayload = (decision, extra = {}) => {
    const safeReason = clampDecisionReason(decisionReason);

    return {
      decision,
      expectedStatus: project?.status,
      expectedSubmissionVersion: review?.submissionVersion,
      expectedProjectSnapshotHash: review?.projectSnapshotHash,
      checklist: effectiveChecklist,
      reason: safeReason,
      feedback: safeReason,
      aiReviewRunId: latestRun?._id || null,
      manualAiBypassAcknowledged: false,
      manualAiBypassReason: "",
      ...extra,
    };
  };

  const submitDecision = async (decision) => {
    if (shouldHideDecisionActions) return;

    const payload = buildDecisionPayload(decision);

    if (decision === "APPROVED" && !aiIsCurrent) {
      setPendingApprovalPayload(payload);
      return;
    }

    await decideProject(payload);
    setDecisionCompleted(true);
    await refetch();
  };

  const confirmManualBypassApproval = async () => {
    if (!pendingApprovalPayload || shouldHideDecisionActions) return;

    await decideProject({
      ...pendingApprovalPayload,
      manualAiBypassAcknowledged: true,
      manualAiBypassReason: clampDecisionReason(manualBypassReason),
      checklist: {
        ...pendingApprovalPayload.checklist,
        ai_reviewed_or_bypassed: true,
      },
    });

    setDecisionCompleted(true);
    setPendingApprovalPayload(null);
    setManualBypassReason("");
    await refetch();
  };

  const scrollToSection = (section) => {
    const targetId = SECTION_SCROLL_TARGETS[section] || section;
    const element = document.getElementById(targetId);

    element?.scrollIntoView({ behavior: "smooth", block: "start" });
    element?.focus?.({ preventScroll: true });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f3f4f6]">
        <div className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow-sm">
          <Loader2 size={18} className="animate-spin text-amber-500" />
          Đang tải cockpit kiểm duyệt...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <AdminProjectReviewHeader
          project={project}
          review={review}
          aiRun={latestRun}
          isFetching={isFetching}
          onRefresh={() => refetch()}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="space-y-5">
            <AIReviewAssistantPanel
              run={latestRun}
              findings={findings}
              checklistSuggestions={checklistSuggestions}
              sectionSummary={sectionSummary}
              onRetry={retryAIReview}
              isRetrying={isRetryingAIReview}
              onFindingClick={scrollToSection}
              onInsertSuggestion={insertSuggestion}
            />

            <ProjectSummaryReviewSection
              project={project}
              findings={bySection.overview}
              sectionSeverity={maxSeverityBySection.overview}
            />

            <BeneficiaryReviewSection
              project={project}
              findings={bySection.beneficiary}
              sectionSeverity={maxSeverityBySection.beneficiary}
            />

            <BudgetReviewSection
              project={project}
              findings={bySection.budget}
              sectionSeverity={maxSeverityBySection.budget}
            />

            <MilestoneLogicReviewSection
              project={project}
              findings={bySection.milestones}
              sectionSeverity={maxSeverityBySection.milestones}
              findingsByTarget={byTarget}
            />

            <EvidenceReviewSection
              project={project}
              findings={bySection.evidence || bySection.documents}
              sectionSeverity={
                maxSeverityBySection.evidence || maxSeverityBySection.documents
              }
              onPreviewFile={setPreviewFile}
            />

            <TimelineLocationReviewSection
              project={project}
              findings={bySection.timeline}
              sectionSeverity={maxSeverityBySection.timeline}
            />

            <OrganizerTrustReviewSection
              organizerTrust={review?.organizerTrust}
              findings={bySection.organizer}
              sectionSeverity={maxSeverityBySection.organizer}
            />

            <ReviewHistorySection records={review?.reviewRecords || []} />
          </main>

          <AdminDecisionPanel
            checklist={effectiveChecklist}
            onChecklistChange={updateChecklist}
            decisionReason={decisionReason}
            onReasonChange={(value) =>
              setDecisionReason(limitDecisionReason(value))
            }
            onDecision={submitDecision}
            isSubmitting={isDeciding}
            isDecisionCompleted={shouldHideDecisionActions}
            aiIsCurrent={aiIsCurrent}
            aiStatus={aiStatus}
            revisionSuggestions={revisionSuggestions}
            checklistSuggestions={checklistSuggestions}
            onOpenFeedbackModal={() => setFeedbackModalOpen(true)}
          />
        </div>
      </div>

      <ManualAIBypassConfirmModal
        open={Boolean(pendingApprovalPayload)}
        reason={manualBypassReason}
        onReasonChange={(value) =>
          setManualBypassReason(limitDecisionReason(value))
        }
        onClose={() => setPendingApprovalPayload(null)}
        onConfirm={confirmManualBypassApproval}
        loading={isDeciding}
      />

      <AdminFeedbackModal
        open={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmit={applyFeedbackFromModal}
        checklistSuggestions={checklistSuggestions}
        findings={findings}
        initialText={decisionReason}
      />

      <DocumentPreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}
