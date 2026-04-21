export function getProgressWidth(value) {
  return `${Math.max(0, Math.min(100, value || 0))}%`;
}

export function getCardTone(uiStatus) {
  switch (uiStatus) {
    case "ACTIVE":
      return {
        card: "bg-emerald-50/40 border-emerald-100",
        header: "bg-emerald-50/55 border-emerald-100",
        section: "bg-white/90",
        timeline: "bg-emerald-50/45 border-emerald-100",
      };

    case "PENDING_APPROVAL":
      return {
        card: "bg-amber-50/45 border-amber-100",
        header: "bg-amber-50/55 border-amber-100",
        section: "bg-white/92",
        timeline: "bg-amber-50/45 border-amber-100",
      };

    case "UPDATING":
      return {
        card: "bg-amber-50/45 border-amber-100",
        header: "bg-amber-50/55 border-amber-100",
        section: "bg-white/92",
        timeline: "bg-amber-50/45 border-amber-100",
      };

    case "PAUSED":
      return {
        card: "bg-orange-50/45 border-orange-100",
        header: "bg-orange-50/55 border-orange-100",
        section: "bg-white/92",
        timeline: "bg-orange-50/40 border-orange-100",
      };

    case "COMPLETED":
      return {
        card: "bg-blue-50/45 border-blue-100",
        header: "bg-blue-50/55 border-blue-100",
        section: "bg-white/92",
        timeline: "bg-blue-50/40 border-blue-100",
      };

    case "CANCELLED":
      return {
        card: "bg-rose-50/45 border-rose-100",
        header: "bg-rose-50/55 border-rose-100",
        section: "bg-white/92",
        timeline: "bg-rose-50/40 border-rose-100",
      };

    default:
      return {
        card: "bg-white border-slate-200",
        header: "bg-slate-50/70 border-slate-200",
        section: "bg-white",
        timeline: "bg-slate-50 border-slate-200",
      };
  }
}   
