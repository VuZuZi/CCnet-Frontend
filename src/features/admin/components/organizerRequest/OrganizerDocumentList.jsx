import { useMemo, useState } from "react";
import OrganizerDocumentCard from "./OrganizerDocumentCard";
import OrganizerDocumentPreviewModal from "./OrganizerDocumentPreviewModal";

const DOCUMENT_ITEMS = [
  {
    key: "idCardFront",
    title: "Mặt trước CMND/CCCD",
    emptyText: "Chưa cung cấp",
  },
  {
    key: "idCardBack",
    title: "Mặt sau CMND/CCCD",
    emptyText: "Chưa cung cấp",
  },
  {
    key: "selfie",
    title: "Ảnh chân dung tự chụp",
    emptyText: "Chưa cung cấp ảnh",
  },
  {
    key: "businessLicense",
    title: "Giấy phép kinh doanh",
    emptyText: "Chưa cung cấp",
  },
  {
    key: "bankProof",
    title: "Minh chứng ngân hàng",
    emptyText: "Chưa cung cấp",
  },
];

export function OrganizerDocumentList({ request }) {
  const [previewItem, setPreviewItem] = useState(null);

  const items = useMemo(
    () =>
      DOCUMENT_ITEMS.map((item) => ({
        ...item,
        file: request?.[item.key] || null,
      })),
    [request]
  );

  return (
    <>
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
