import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ModalShellProps {
  onClose: () => void;
  children: React.ReactNode;
  widthClassName?: string;
}

export const ModalShell: React.FC<ModalShellProps> = ({ onClose, children, widthClassName = 'max-w-2xl' }) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${widthClassName} rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'default',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const iconColor = tone === 'danger' ? 'text-rose-500 bg-rose-500/10' : 'text-blue-400 bg-blue-500/10';
  const confirmClass =
    tone === 'danger'
      ? 'bg-rose-600 hover:bg-rose-500 text-white'
      : 'bg-blue-600 hover:bg-blue-500 text-white';

  return (
    <ModalShell onClose={onCancel} widthClassName="max-w-md">
      <div className="p-6 space-y-4">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full shrink-0 ${iconColor}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">{title}</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors mt-4"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors mt-4 ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

interface InlineBannerProps {
  message: string | null;
  tone?: 'success' | 'error';
  onClose: () => void;
}

export const InlineBanner: React.FC<InlineBannerProps> = ({ message, tone = 'success', onClose }) => {
  if (!message) return null;
  const toneClass =
    tone === 'success'
      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      : 'bg-rose-500/10 border-rose-500/30 text-rose-400';

  return (
    <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-lg ${toneClass}`}>
      <span>{message}</span>
      <button type="button" onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
