import { z } from "zod";

const VN_PHONE_REGEX = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
const BANK_ACCOUNT_REGEX = /^\d{8,19}$/;
const ACCOUNT_NAME_REGEX = /^[\p{L}\s.'-]{2,150}$/u;

const emptyToUndefined = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const documentSchema = z
  .object({
    fileName: z.string().trim().min(1, "Tên file là bắt buộc"),
    mimeType: z.string().trim().min(1, "Loại file là bắt buộc"),
    size: z.coerce.number().nonnegative().optional(),
    url: z.preprocess(
      emptyToUndefined,
      z.string().url("URL file không hợp lệ").optional()
    ),
    dataUrl: z.preprocess(
      emptyToUndefined,
      z.string().min(1, "dataUrl không được rỗng").optional()
    ),
  })
  .refine((value) => value.url || value.dataUrl, {
    message: "File phải có url hoặc dataUrl",
    path: ["url"],
  });

const optionalDocumentSchema = z.preprocess((value) => {
  if (value == null) return undefined;
  if (typeof value !== "object") return value;

  const hasFileName =
    typeof value.fileName === "string" && value.fileName.trim();
  const hasMimeType =
    typeof value.mimeType === "string" && value.mimeType.trim();
  const hasUrl = typeof value.url === "string" && value.url.trim();
  const hasDataUrl =
    typeof value.dataUrl === "string" && value.dataUrl.trim();

  if (!hasFileName && !hasMimeType && !hasUrl && !hasDataUrl) {
    return undefined;
  }

  return value;
}, documentSchema.optional());

export const organizerRequestSchema = z.object({
  fullNameSnapshot: z
    .string()
    .trim()
    .min(2, "Họ tên tối thiểu 2 ký tự")
    .max(150, "Họ tên tối đa 150 ký tự"),

  emailSnapshot: z.string().trim().email("Email không hợp lệ"),

  phoneSnapshot: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? "" : trimmed;
    },
    z
      .string()
      .regex(VN_PHONE_REGEX, "Số điện thoại phải đúng định dạng Việt Nam")
      .or(z.literal(""))
      .optional()
  ),

  locationSnapshot: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().max(150, "Địa điểm tối đa 150 ký tự").optional().default("")
  ),

  organizationName: z
    .string()
    .trim()
    .min(2, "Tên tổ chức tối thiểu 2 ký tự")
    .max(200, "Tên tổ chức tối đa 200 ký tự"),

  organizationType: z.enum([
    "NGO",
    "CHARITY",
    "COMMUNITY",
    "EDUCATION",
    "MEDICAL",
    "RELIGIOUS",
    "OTHER",
  ]),

  organizationWebsite: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? "" : trimmed;
    },
    z
      .union([z.string().url("Website không hợp lệ"), z.literal("")])
      .optional()
      .default("")
  ),

  idCardFront: documentSchema,
  idCardBack: documentSchema,
  selfie: documentSchema,
  businessLicense: optionalDocumentSchema,
  bankProof: optionalDocumentSchema,

  bankName: z
    .string()
    .trim()
    .min(2, "Vui lòng chọn hoặc nhập tên ngân hàng")
    .max(200, "Tên ngân hàng quá dài"),

  bankAccountNumber: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z
      .string()
      .regex(BANK_ACCOUNT_REGEX, "Số tài khoản phải từ 8 đến 19 chữ số")
  ),

  bankAccountName: z
    .string()
    .trim()
    .regex(
      ACCOUNT_NAME_REGEX,
      "Tên chủ tài khoản chỉ được gồm chữ cái và khoảng trắng"
    ),

  notes: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().max(1000, "Ghi chú tối đa 1000 ký tự").optional().default("")
  ),
});

export default organizerRequestSchema;