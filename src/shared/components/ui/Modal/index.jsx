import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

export function Modal({ isOpen, open, onClose, title, children, maxWidth = 'max-w-md' }) {
    const isModalOpen = isOpen || open;

    useEffect(() => {
        if (!isModalOpen) return;

        const originalStyle = window.getComputedStyle(document.body).overflow;
        
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = originalStyle;
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isModalOpen, onClose]);

    if (!isModalOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
            onMouseDown={handleBackdropClick}
        >
            <div className="min-h-screen px-4 py-12 flex items-center justify-center pointer-events-none">
                <div
                    className={clsx(
                        "relative w-full transform rounded-[24px] bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200 pointer-events-auto",
                        maxWidth
                    )}
                    role="dialog"
                    aria-modal="true"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white rounded-t-[24px] z-10 sticky top-0">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
                        <button
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 outline-none"
                            aria-label="Close modal"
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                    
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

Modal.propTypes = {
    isOpen: PropTypes.bool,
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    maxWidth: PropTypes.string,
};