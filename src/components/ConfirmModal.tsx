import React from "react";
import { AlertTriangle, Trash2, RefreshCw, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  detail?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  detail,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-[#141414] shadow-[6px_6px_0px_#141414] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 text-white flex items-center justify-between ${
          variant === "danger"
            ? "bg-red-700 border-b-2 border-[#141414]"
            : variant === "warning"
            ? "bg-amber-600 border-b-2 border-[#141414]"
            : "bg-[#141414] border-b-2 border-[#141414]"
        }`}>
          <div className="flex items-center space-x-2">
            {variant === "danger" ? (
              <Trash2 className="w-5 h-5 text-white" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-white" />
            )}
            <h3 className="font-mono font-bold text-sm tracking-wide uppercase">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-black/20 p-1 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 bg-[#F8F9FA] space-y-3">
          <p className="text-sm font-semibold text-[#141414] leading-relaxed">
            {message}
          </p>
          {detail && (
            <div className="p-2.5 bg-white border border-[#141414]/30 font-mono text-xs text-[#141414]/80 break-words">
              {detail}
            </div>
          )}
          <p className="text-[11px] text-[#141414]/60 font-mono">
            Esta ação não pode ser desfeita e atualizará o armazenamento local imediatamente.
          </p>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-[#141414] flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono font-bold uppercase border border-[#141414] bg-white hover:bg-[#E4E3E0] text-[#141414] transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase text-white border border-[#141414] shadow-[2px_2px_0px_#141414] transition-all cursor-pointer ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : variant === "warning"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
