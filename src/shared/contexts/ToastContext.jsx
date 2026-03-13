import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/shared/components/ui/Button/Button';

const ToastContext = createContext(null);

const ToastItem = ({ id, message, variant, duration, onRemove }) => {
  const [isShowing, setIsShowing] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const enterTimer = setTimeout(() => setIsShowing(true), 10);
    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => handleRemove(), duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleRemove = () => {
    setIsShowing(false);
    setIsLeaving(true);
    setTimeout(() => onRemove(id), 300); 
  };

  const variantStyles = {
    success: {
      icon: <CheckCircle2 size={22} className="text-emerald-500" />,
      bgIcon: "bg-emerald-50",
      border: "border-emerald-100",
    },
    danger: {
      icon: <AlertCircle size={22} className="text-red-500" />,
      bgIcon: "bg-red-50",
      border: "border-red-100",
    },
    warning: {
      icon: <AlertTriangle size={22} className="text-amber-500" />,
      bgIcon: "bg-amber-50",
      border: "border-amber-100",
    },
    info: {
      icon: <Info size={22} className="text-blue-500" />,
      bgIcon: "bg-blue-50",
      border: "border-blue-100",
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.info;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "pointer-events-auto flex items-center p-3.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/50 border transition-all duration-300 ease-out w-[320px] sm:w-[380px]",
        currentVariant.border,
        isShowing && !isLeaving ? "translate-x-0 opacity-100 scale-100" : "translate-x-8 opacity-0 scale-95"
      )}
    >
      <div className={cn("flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full", currentVariant.bgIcon)}>
        {currentVariant.icon}
      </div>

      <div className="ml-3 flex-1 min-w-0 pr-2">
        <p className="text-sm font-semibold text-slate-700 leading-snug break-words">{message}</p>
      </div>

      <div className="flex-shrink-0">
        <button
          type="button"
          className="inline-flex rounded-full p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
          onClick={handleRemove}
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

ToastItem.propTypes = {
  id: PropTypes.string.isRequired, 
  message: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['success', 'danger', 'warning', 'info']).isRequired,
  duration: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, variant = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, variant, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, duration = 4000) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration = 5000) => addToast(message, 'danger', duration), [addToast]);
  const warning = useCallback((message, duration = 4000) => addToast(message, 'warning', duration), [addToast]);
  const info = useCallback((message, duration = 4000) => addToast(message, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      
      <div
        aria-live="polite"
        className="fixed top-0 right-0 z-[9999] flex flex-col items-end px-4 py-6 pointer-events-none sm:px-6 sm:py-8 gap-3 max-h-screen overflow-hidden"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            id={toast.id}
            message={toast.message}
            variant={toast.variant}
            duration={toast.duration}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}