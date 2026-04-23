import { z } from "zod";

const VN_PHONE_REGEX = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
const BANK_ACCOUNT_REGEX = /^\d{8,19}$/;
const ACCOUNT_NAME_REGEX = /^[\p{L}\s.'-]{2,150}$/u;
const FULL_NAME_REGEX = /^[\p{L}\s.'-]{2,100}$/u;
const ORG_NAME_REGEX = /^[\p{L}0-9\s&.,'/-]{2,200}$/u;

const emptyToUndefined = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const normalizeText = (value) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ") : value;

const documentSchema = z
  .object({
    fileName: z.string().trim().min(1, "Tên tệp là bắt buộc"),
    mimeType: z.string().trim().min(1, "Loại tệp là bắt buộc"),
    size: z.coerce.number().nonnegative().optional(),
    url: z.preprocess(
      emptyToUndefined,
      z.string().url("URL tệp không hợp lệ").optional()
    ),
    dataUrl: z.preprocess(
      emptyToUndefined,
      z.string().min(1, "dataUrl không được để trống").optional()
    ),
  })
  .refine((value) => value.url || value.dataUrl, {
    message: "Tệp phải có url hoặc dataUrl",
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

const locationSchema = z
  .object({
    type: z.literal("Point"),
    address: z.string().trim().min(3, "Vui lòng chọn địa chỉ hợp lệ."),
    coordinates: z
      .array(z.number())
      .length(2, "Vui lòng chọn địa chỉ hợp lệ."),
  })
  .refine(
    (value) =>
      Array.isArray(value.coordinates) &&
      value.coordinates.length === 2 &&
      Number.isFinite(value.coordinates[0]) &&
      Number.isFinite(value.coordinates[1]),
    {
      message: "Vui lòng chọn địa chỉ hợp lệ.",
      path: ["coordinates"],
    }
  );

export const organizerRequestSchema = z.object({
  fullNameSnapshot: z
    .string()
    .transform(normalizeText)
    .refine((v) => typeof v === "string" && v.length >= 2, {
      message: "Họ và tên phải có ít nhất 2 ký tự",
    })
    .refine((v) => v.length <= 100, {
      message: "Họ và tên tối đa 100 ký tự",
    })
    .refine((v) => FULL_NAME_REGEX.test(v), {
      message:
        "Họ và tên chỉ được gồm chữ cái, khoảng trắng, dấu chấm, dấu nháy hoặc gạch nối",
    }),

  emailSnapshot: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email là bắt buộc")
    .email("Email không hợp lệ"),

  phoneSnapshot: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      return value.replace(/\s|[-.]/g, "");
    },
    z
      .string()
      .min(1, "Số điện thoại là bắt buộc")
      .regex(VN_PHONE_REGEX, "Số điện thoại phải đúng định dạng Việt Nam")
  ),

  locationSnapshot: locationSchema,

  organizationName: z
    .string()
    .transform(normalizeText)
    .refine((v) => typeof v === "string" && v.length >= 2, {
      message: "Tên tổ chức phải có ít nhất 2 ký tự",
    })
    .refine((v) => v.length <= 200, {
      message: "Tên tổ chức tối đa 200 ký tự",
    })
    .refine((v) => ORG_NAME_REGEX.test(v), {
      message: "Tên tổ chức chứa ký tự không hợp lệ",
    }),

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
    z.union([z.string().url("Website không hợp lệ"), z.literal("")]).default("")
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

  bankBin: z
    .string()
    .trim()
    .max(10, "Mã BIN không hợp lệ")
    .optional()
    .default(""),

  bankAccountNumber: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().regex(BANK_ACCOUNT_REGEX, "Số tài khoản phải từ 8 đến 19 chữ số")
  ),

  bankAccountName: z
    .string()
    .transform(normalizeText)
    .refine((v) => ACCOUNT_NAME_REGEX.test(v), {
      message: "Tên chủ tài khoản chỉ được gồm chữ cái và khoảng trắng",
    }),

  notes: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().max(1000, "Ghi chú tối đa 1000 ký tự").optional().default("")
  ),
});

export default organizerRequestSchema;