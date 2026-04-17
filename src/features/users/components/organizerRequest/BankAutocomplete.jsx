import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { labelClass, inputClass } from "../../constants/organizerRequestStyles";
import FormErrorText from "./FormErrorText";

export function BankAutocomplete({
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

  useEffect(() => {
    const matchedBank = banks.find(
      (bank) =>
        bank.name === value ||
        bank.displayLabel === value ||
        bank.shortName === value ||
        bank.code === value
    );

    if (matchedBank) {
      setInputValue(matchedBank.displayLabel);
    } else {
      setInputValue(value || "");
    }
  }, [value, banks]);

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

  useEffect(() => {
    setActiveIndex(0);
  }, [inputValue]);

  const handleSelectBank = (bank) => {
    onChange(bank.name);
    setInputValue(bank.displayLabel);
    setIsOpen(false);
  };

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    setInputValue(nextValue);
    onChange(nextValue);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleToggleDropdown = () => {
    setIsOpen((prev) => !prev);
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
          value={inputValue}
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
                Loading bank list...
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
                No matching banks found.
              </div>
            )}
          </div>
        </div>
      ) : null}

      <FormErrorText>{error}</FormErrorText>
    </div>
  );
}

export default BankAutocomplete;