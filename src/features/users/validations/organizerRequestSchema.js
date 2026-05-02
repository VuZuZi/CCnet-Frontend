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

const emptyArrayItemsToUndefined = (value) => {
  if (!Array.isArray(value)) return value;

  const filtered = value
    .map((item) => (typeof item === "string" ? item.trim() : item))
    .filter(Boolean);

  return filtered.length > 0 ? filtered : undefined;
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

const requiredDocumentSchema = optionalDocumentSchema.refine((v) => !!v, {
  message: "Vui lòng tải lên tệp này.",
});

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

export const organizerRequestSchema = z
  .object({
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
      .refine((v) => typeof v === "string" && v.length >= 1, {
        message: "Vui lòng nhập thông tin này.",
      })
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
      emptyToUndefined,
      z
        .string({ required_error: "Vui lòng nhập thông tin này." })
        .url("Website không hợp lệ")
        .min(1, "Vui lòng nhập thông tin này.")
    ),

    organizationLegalType: z.preprocess(
      emptyToUndefined,
      z
        .string({
          required_error: "Vui lòng chọn hình thức pháp lý của tổ chức/nhóm.",
          invalid_type_error: "Vui lòng chọn hình thức pháp lý của tổ chức/nhóm.",
        })
        .min(1, "Vui lòng chọn hình thức pháp lý của tổ chức/nhóm.")
        .refine(
          (val) =>
            [
              "COMPANY",
              "REGISTERED_NGO",
              "HOUSEHOLD_BUSINESS",
              "COMMUNITY_GROUP",
              "OTHER",
            ].includes(val),
          { message: "Vui lòng chọn hình thức pháp lý của tổ chức/nhóm." }
        )
    ),

    taxCode: z.string().trim().optional(),
    legalRegistrationNumber: z.string().trim().optional(),
    activityDescription: z.string().trim().optional().or(z.literal("")),
    proofLinks: z.preprocess(
      emptyArrayItemsToUndefined,
      z
        .array(
          z
            .string()
            .trim()
            .url("Liên kết minh chứng phải bắt đầu bằng http:// hoặc https://.")
            .regex(
              /^https?:\/\//i,
              "Liên kết minh chứng phải bắt đầu bằng http:// hoặc https://."
            )
        )
        .max(5, "Tối đa 5 liên kết")
        .optional()
    ),

    idCardFront: optionalDocumentSchema,
    idCardBack: optionalDocumentSchema,
    selfie: optionalDocumentSchema,
    businessLicense: requiredDocumentSchema,
    bankProof: requiredDocumentSchema,

    bankName: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập thông tin này.")
      .max(200, "Tên ngân hàng quá dài"),

    bankBin: z.string().trim().max(10, "Mã BIN không hợp lệ").optional().default(""),

    bankAccountNumber: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      z
        .string()
        .min(1, "Vui lòng nhập thông tin này.")
        .regex(BANK_ACCOUNT_REGEX, "Số tài khoản phải từ 8 đến 19 chữ số")
    ),

    bankAccountName: z
      .string()
      .transform(normalizeText)
      .refine((v) => typeof v === "string" && v.length > 0, { message: "Vui lòng nhập thông tin này." })
      .refine((v) => ACCOUNT_NAME_REGEX.test(v), {
        message: "Tên chủ tài khoản chỉ được gồm chữ cái và khoảng trắng",
      }),

    notes: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : value),
      z.string().max(1000, "Ghi chú tối đa 1000 ký tự").optional().default("")
    ),

    commitment: z
      .object({
        isAccepted: z.boolean().optional(),
        agreements: z
          .array(z.string())
          .min(5, "Bạn phải đồng ý với tất cả các điều khoản"),
        signerName: z
          .string()
          .min(2, "Họ và tên người ký phải có ít nhất 2 ký tự"),
        version: z.string().min(1),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const {
      organizationLegalType,
      taxCode,
      legalRegistrationNumber,
      activityDescription,
      proofLinks,
    } = data;

    if (
      ["COMPANY", "REGISTERED_NGO", "HOUSEHOLD_BUSINESS"].includes(
        organizationLegalType
      )
    ) {
      if (!taxCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng nhập thông tin này.",
          path: ["taxCode"],
        });
      }
      if (!legalRegistrationNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng nhập thông tin này.",
          path: ["legalRegistrationNumber"],
        });
      }
    }

    if (organizationLegalType === "COMMUNITY_GROUP") {
      if (!activityDescription || activityDescription.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Vui lòng mô tả hoạt động tối thiểu 10 ký tự.",
          path: ["activityDescription"],
        });
      }
      if (!proofLinks || proofLinks.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng cung cấp ít nhất 1 liên kết minh chứng hoạt động.",
          path: ["proofLinks"],
        });
      }
    }

    if (organizationLegalType === "OTHER") {
      if (!activityDescription || activityDescription.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Vui lòng mô tả hoạt động tối thiểu 10 ký tự.",
          path: ["activityDescription"],
        });
      }
    }
  });

export default organizerRequestSchema;
