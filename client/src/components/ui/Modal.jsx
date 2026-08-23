import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Accessible SaaS Modal / Dialog Component Suite.
 */
export function Modal({
  isOpen,
  onClose,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  children,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const modalRef = useRef(null);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]',
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size] || sizeClasses.md} bg-slate-900 border border-slate-800 rounded-2xl shadow-modal z-10 flex flex-col max-h-[90vh] overflow-hidden animate-scale-in ${className}`}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Pass down IDs via React context or direct rendering */}
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export function ModalHeader({ className = '', children, ...props }) {
  return (
    <div className={`p-6 pb-4 border-b border-slate-800/80 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function ModalTitle({ className = '', children, ...props }) {
  return (
    <h3 className={`text-lg sm:text-xl font-semibold text-slate-100 tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function ModalDescription({ className = '', children, ...props }) {
  return (
    <p className={`text-xs sm:text-sm text-slate-400 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function ModalBody({ className = '', children, ...props }) {
  return (
    <div className={`p-6 overflow-y-auto flex-1 leading-relaxed text-sm text-slate-300 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function ModalFooter({ className = '', children, ...props }) {
  return (
    <div
      className={`p-6 pt-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-end gap-3 rounded-b-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Modal;
