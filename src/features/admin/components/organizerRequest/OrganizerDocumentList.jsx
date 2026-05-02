import { useMemo, useState } from "react";
import OrganizerDocumentCard from "./OrganizerDocumentCard";
import OrganizerDocumentPreviewModal from "./OrganizerDocumentPreviewModal";

const DOCUMENT_ITEMS = [
  {
    key: "idCardFront",
    title: "Mặt trước CMND/CCCD",
    emptyText: "Hồ sơ này không bao gồm ảnh giấy tờ cá nhân theo quy trình mới.",
  },
  {
    key: "idCardBack",
    title: "Mặt sau CMND/CCCD",
    emptyText: "Hồ sơ này không bao gồm ảnh giấy tờ cá nhân theo quy trình mới.",
  },
  {
    key: "selfie",
    title: "Ảnh chân dung tự chụp",
    emptyText: "Hồ sơ này không bao gồm ảnh chân dung theo quy trình mới.",
  },
  {
    key: "businessLicense",
    title: "Giấy tờ pháp lý / QĐ thành lập",
    emptyText: "Chưa cung cấp",
  },
  {
    key: "bankProof",
    title: "Tài liệu hỗ trợ đối chiếu ngân hàng",
    emptyText: "Chưa cung cấp",
  },
];

const LEGACY_IDENTITY_KEYS = new Set(["idCardFront", "idCardBack", "selfie"]);

export function OrganizerDocumentList({ request }) {
  const [previewItem, setPreviewItem] = useState(null);

  const items = useMemo(() => {
    return DOCUMENT_ITEMS.filter((item) => {
      if (LEGACY_IDENTITY_KEYS.has(item.key)) {
        return Boolean(request?.[item.key]);
      }
      if (item.key === "businessLicense" && !request?.businessLicense) {
        if (request?.organizationLegalType === "COMMUNITY_GROUP" || request?.organizationLegalType === "OTHER") {
          return false;
        }
      }
      return true;
    }).map((item) => ({
      ...item,
      file: request?.[item.key] || null,
    }));
  }, [request]);

  const hasAnyLegacyDoc =
    request?.idCardFront || request?.idCardBack || request?.selfie;

  return (
    <>
      {!hasAnyLegacyDoc && (
        <div className="mb-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
          Hồ sơ áp dụng quy trình mới, không yêu cầu tải lên ảnh giấy tờ cá nhân (CCCD/CMND/Selfie) để bảo vệ quyền riêng tư.
        </div>
      )}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {items.map((item) => (
          <OrganizerDocumentCard
            key={item.key}
            title={item.title}
            file={item.file}
            emptyText={item.emptyText}
            onView={setPreviewItem}
          />
        ))}
      </div>

      <OrganizerDocumentPreviewModal
        open={Boolean(previewItem)}
        title={previewItem?.title}
        file={previewItem?.file}
        onClose={() => setPreviewItem(null)}
      />
    </>
  );
}

export default OrganizerDocumentList;
