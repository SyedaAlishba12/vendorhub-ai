'use client';

import React from 'react';
import { Modal } from './Modal';

export interface ConfirmationDialogProps {
  /** Whether the dialog is currently open. */
  isOpen: boolean;
  /** Callback fired when the dialog should close (cancel). */
  onClose: () => void;
  /** Callback fired when the user confirms. */
  onConfirm: () => void;
  /** Title of the confirmation dialog. */
  title: string;
  /** Message body of the confirmation dialog. */
  message: string;
  /** Label for the confirm button. Defaults to 'Confirm'. */
  confirmLabel?: string;
  /** Label for the cancel button. Defaults to 'Cancel'. */
  cancelLabel?: string;
  /** Variant for the confirm button styling. Defaults to 'default'. */
  variant?: 'default' | 'danger';
}

/**
 * ConfirmationDialog — a reusable yes/no confirmation prompt using Modal.
 */
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
}) => {
  const confirmButtonClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white border-transparent'
      : 'bg-slate-900 hover:bg-slate-800 text-white border-transparent';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col gap-6">
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-200 ${confirmButtonClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;