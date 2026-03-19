import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-16 h-16 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <Loader2 className="w-6 h-6 text-primary animate-pulse" />
      </div>
      <p className="mt-4 text-slate-500 font-medium animate-pulse">
        Đang tải dữ liệu...
      </p>
    </div>
  );
}