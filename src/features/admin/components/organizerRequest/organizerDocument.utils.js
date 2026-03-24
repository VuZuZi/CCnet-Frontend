export const getDocumentHref = (file) => file?.url || file?.dataUrl || "";

export const getDocumentFileName = (file, fallback = "document") =>
  file?.fileName || fallback;

export const isImageDocument = (file) => {
  const mime = String(file?.mimeType || "").toLowerCase();
  const name = String(file?.fileName || "").toLowerCase();

  return (
    mime.startsWith("image/") ||
    [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"].some((ext) =>
      name.endsWith(ext)
    )
  );
};

export const isPdfDocument = (file) => {
  const mime = String(file?.mimeType || "").toLowerCase();
  const name = String(file?.fileName || "").toLowerCase();

  return mime.includes("pdf") || name.endsWith(".pdf");
};

export const downloadDocumentFile = (file, fallbackName = "document") => {
  const href = getDocumentHref(file);
  if (!href) return;

  const link = window.document.createElement("a");
  link.href = href;
  link.download = getDocumentFileName(file, fallbackName);
  link.target = "_blank";
  link.rel = "noreferrer";
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
};