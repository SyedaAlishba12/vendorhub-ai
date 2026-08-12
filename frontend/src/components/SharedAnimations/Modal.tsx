'use client';

import React, { useEffect, useCallback } from 'react';

export interface ModalProps {
  /** Whether the modal is currently open. */
  isOpen: boolean;
  /** Callback fired when the modal should close (Escape key or backdrop click). */
  onClose: () => void;
  /** Title displayed in the modal header. */
  title?: string;
  /** Content rendered inside the modal panel. */
  children?: React.ReactNode;
  /** Max width class for the panel. Defaults to 'max-w-lg'. */
  maxWidth?: string;
}

/**
 * Modal — a reusable backdrop + centered panel modal.
 * Usage: <Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm">…</Modal>
 * Closes on Escape key press or backdrop click.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}) => {
  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Dialog'}
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]"
      style={{ animation: 'modalFadeIn 0.15s ease-out' }}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        className={`
          relative z-10 w-full ${maxWidth}
          bg-white rounded-2xl shadow-2xl border border-slate-200
          flex flex-col
          animate-[modalSlideIn_0.15s_ease-out]
        `}
        style={{ animation: 'modalSlideIn 0.15s ease-out' }}
      >
        {/* Header */}
        {(title !== undefined) && (
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-5 py-5 text-sm text-slate-700 leading-relaxed">
          {children}
        </div>
      </div>

      {/* Keyframe styles injected inline for zero-config usage */}
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Modal;
