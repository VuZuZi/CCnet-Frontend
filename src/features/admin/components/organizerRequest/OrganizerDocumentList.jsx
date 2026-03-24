import { useMemo, useState } from "react";
import OrganizerDocumentCard from "./OrganizerDocumentCard";
import OrganizerDocumentPreviewModal from "./OrganizerDocumentPreviewModal";

const DOCUMENT_ITEMS = [
  {
    key: "idCardFront",
    title: "Government Issued ID",
    emptyText: "No government ID submitted",
  },
  {
    key: "idCardBack",
    title: "Selfie with ID",
    emptyText: "No selfie document submitted",
  },
  {
    key: "businessLicense",
    title: "Business Registration / License",
    emptyText: "No business license submitted",
  },
  {
    key: "bankProof",
    title: "Bank Proof",
    emptyText: "No bank proof submitted",
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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