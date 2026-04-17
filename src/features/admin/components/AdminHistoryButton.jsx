import { History } from "lucide-react";
import { Link } from "react-router-dom";

export function AdminHistoryButton({
  onClick,
  to,
  children = "View History",
  className = "",
  type = "button",
  disabled = false,
}) {
  const baseClassName =
    "inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50";

  if (to) {
    return (
      <Link
        to={to}
        className={`${baseClassName} ${className}`}
        aria-disabled={disabled}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
          }
        }}
      >
        <History size={16} strokeWidth={2.3} />
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClassName} ${className}`}
    >
      <History size={16} strokeWidth={2.3} />
      <span>{children}</span>
    </button>
  );
}

export default AdminHistoryButton;