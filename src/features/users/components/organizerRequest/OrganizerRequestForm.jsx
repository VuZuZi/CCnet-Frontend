import { useEffect, useMemo, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Landmark,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import OrganizerSectionCard from "./OrganizerSectionCard";
import OrganizerDocumentField from "./OrganizerDocumentField";
import { useVietnamBanks } from "../../hooks/useVietnamBanks";

const ORGANIZATION_TYPES = [
  { value: "NGO", label: "NGO" },
  { value: "CHARITY", label: "Charity" },
  { value: "COMMUNITY", label: "Community" },
  { value: "EDUCATION", label: "Education" },
  { value: "MEDICAL", label: "Medical" },
  { value: "RELIGIOUS", label: "Religious" },
  { value: "OTHER", label: "Other" },
];

const labelClass = "mb-2 block text-sm font-medium text-slate-700";
const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white";
const selectClass = `${inputClass} appearance-none pr-10`;

function ErrorText({ children }) {
  if (!children) return null;
  return <p className="mt-2 text-xs text-rose-500">{children}</p>;
}

function BankAutocomplete({
  value,
  onChange,
  banks,
  isLoading,
  error,
  placeholder = "Enter bank name",
}) {
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedLabel = useMemo(() => {
    const matchedBank = banks.find(
      (bank) =>
        bank.name === value ||
        bank.displayLabel === value ||
        bank.shortName === value ||
        bank.code === value,
    );

    if (matchedBank) return matchedBank.displayLabel;
    return value || "";
  }, [banks, value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBanks = useMemo(() => {
    const keyword = inputValue.trim().toLowerCase();

    if (!keyword) {
      return banks.slice(0, 12);
    }

    return banks
      .filter((bank) => {
        const haystack = [
          bank.name,
          bank.shortName,
          bank.code,
          bank.bin,
          bank.displayLabel,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(keyword);
      })
      .slice(0, 12);
  }, [banks, inputValue]);

  const handleSelectBank = (bank) => {
    onChange(bank.name);
    setInputValue(bank.displayLabel);
    setActiveIndex(0);
    setIsOpen(false);
  };

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    setInputValue(nextValue);
    setActiveIndex(0);
    onChange(nextValue);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setInputValue(selectedLabel);
    setIsOpen(true);
  };

  const handleToggleDropdown = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) setInputValue(selectedLabel);
      return next;
    });
    inputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }

    if (!filteredBanks.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) =>
        prev >= filteredBanks.length - 1 ? 0 : prev + 1
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) =>
        prev <= 0 ? filteredBanks.length - 1 : prev - 1
      );
    }

    if (event.key === "Enter" && isOpen) {
      event.preventDefault();
      handleSelectBank(filteredBanks[activeIndex]);
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className={labelClass}>Bank Name</label>

      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400">
          <Search size={16} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={isOpen ? inputValue : selectedLabel}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`${inputClass} pl-10 pr-12`}
        />

        <button
          type="button"
          onClick={handleToggleDropdown}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
          <div className="max-h-72 overflow-y-auto py-2">
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-slate-500">
                Đang tải danh sách ngân hàng...
              </div>
            ) : filteredBanks.length > 0 ? (
              filteredBanks.map((bank, index) => {
                const isActive = index === activeIndex;

                return (
                  <button
                    key={bank.id || bank.bin || bank.code || bank.name}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectBank(bank);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex w-full flex-col px-4 py-3 text-left transition ${
                      isActive ? "bg-amber-50" : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-sm font-semibold text-slate-800">
                      {bank.shortName || bank.code || bank.name}
                    </span>
                    <span className="mt-0.5 text-xs text-slate-500">
                      {bank.name}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500">
                Không tìm thấy ngân hàng phù hợp.
              </div>
            )}
          </div>
        </div>
      ) : null}

      <ErrorText>{error}</ErrorText>
    </div>
  );
}

export function OrganizerRequestForm({
  form,
  onSubmit,
  onDocumentChange,
  isSubmitting = false,
  isResubmitting = false,
}) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form;

  const { banks, isLoading: isBanksLoading } = useVietnamBanks();

  const idCardFront = watch("idCardFront");
  const idCardBack = watch("idCardBack");
  const businessLicense = watch("businessLicense");

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          Become an Organizer
        </h1>
        <p className="mt-3 text-sm text-slate-500 md:text-base">
          Submit verification documents to create and manage charity projects.
        </p>
      </div>

      <OrganizerSectionCard
        icon={<UserRound size={18} />}
        title="Personal Information"
        iconClassName="bg-blue-100 text-blue-600"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              {...register("fullNameSnapshot")}
              placeholder="John Doe"
              className={inputClass}
            />
            <ErrorText>{errors.fullNameSnapshot?.message}</ErrorText>
          </div>

          <div>
            <label className={labelClass}>Phone Number</label>
            <input
              {...register("phoneSnapshot")}
              placeholder="+84..."
              className={inputClass}
            />
            <ErrorText>{errors.phoneSnapshot?.message}</ErrorText>
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input
              {...register("emailSnapshot")}
              placeholder="john@example.com"
              className={inputClass}
            />
            <ErrorText>{errors.emailSnapshot?.message}</ErrorText>
          </div>

          <div>
            <label className={labelClass}>Location</label>
            <input
              {...register("locationSnapshot")}
              placeholder="City, Country"
              className={inputClass}
            />
            <ErrorText>{errors.locationSnapshot?.message}</ErrorText>
          </div>
        </div>
      </OrganizerSectionCard>

      <OrganizerSectionCard
        icon={<Building2 size={18} />}
        title="Organization Information"
        iconClassName="bg-violet-100 text-violet-600"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>Organization Name</label>
            <input
              {...register("organizationName")}
              placeholder="Name of your organization or campaign"
              className={inputClass}
            />
            <ErrorText>{errors.organizationName?.message}</ErrorText>
          </div>

          <div className="relative">
            <label className={labelClass}>Organization Type</label>
            <select {...register("organizationType")} className={selectClass}>
              {ORGANIZATION_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-[46px] text-slate-400"
            />
            <ErrorText>{errors.organizationType?.message}</ErrorText>
          </div>

          <div>
            <label className={labelClass}>Organization Website (optional)</label>
            <input
              {...register("organizationWebsite")}
              placeholder="https://"
              className={inputClass}
            />
            <ErrorText>{errors.organizationWebsite?.message}</ErrorText>
          </div>
        </div>
      </OrganizerSectionCard>

      <OrganizerSectionCard
        icon={<ShieldCheck size={18} />}
        title="Identity Verification"
        iconClassName="bg-emerald-100 text-emerald-600"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <OrganizerDocumentField
            label="ID Card / Passport"
            description="JPG, PNG or PDF"
            accept="image/*,.pdf"
            value={idCardFront}
            onSelect={(file) => onDocumentChange("idCardFront", file)}
            error={errors.idCardFront?.message}
          />

          <OrganizerDocumentField
            label="Selfie with ID"
            description="JPG or PNG"
            accept="image/*"
            value={idCardBack}
            onSelect={(file) => onDocumentChange("idCardBack", file)}
            error={errors.idCardBack?.message}
          />

          <OrganizerDocumentField
            label="Organization License"
            description="PDF Document"
            accept=".pdf"
            value={businessLicense}
            onSelect={(file) => onDocumentChange("businessLicense", file)}
            error={errors.businessLicense?.message}
          />
        </div>
      </OrganizerSectionCard>

      <OrganizerSectionCard
        icon={<Landmark size={18} />}
        title="Bank Account Information"
        iconClassName="bg-amber-100 text-amber-700"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Controller
              name="bankName"
              control={control}
              render={({ field }) => (
                <BankAutocomplete
                  value={field.value || ""}
                  onChange={field.onChange}
                  banks={banks}
                  isLoading={isBanksLoading}
                  error={errors.bankName?.message}
                />
              )}
            />
          </div>

          <div>
            <label className={labelClass}>Account Number</label>
            <input
              {...register("bankAccountNumber")}
              placeholder="Enter account number"
              className={inputClass}
            />
            <ErrorText>{errors.bankAccountNumber?.message}</ErrorText>
          </div>

          <div>
            <label className={labelClass}>Account Holder Name</label>
            <input
              {...register("bankAccountName")}
              placeholder="Name on account"
              className={inputClass}
            />
            <ErrorText>{errors.bankAccountName?.message}</ErrorText>
          </div>
        </div>
      </OrganizerSectionCard>

      <div className="mt-6 flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <ArrowRight size={16} />
          {isSubmitting
            ? "Submitting..."
            : isResubmitting
              ? "Resubmit Application"
              : "Submit Application"}
        </button>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-700">
        Your application will be reviewed by CCNet managers. Approval may take
        1–3 business days.
      </div>

      
    </form>
  );
}

export default OrganizerRequestForm;
