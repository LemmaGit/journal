import React from "react";
import { AlertTriangle, Info, CheckCircle2, AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info" | "success";
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  showCancel = true,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}) => {
  if (!isOpen) return null;

  // Select icon and colors based on type
  const getModalStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
          iconBg: "bg-emerald-500/10 border border-emerald-500/20",
          confirmBtn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 focus:ring-emerald-500",
        };
      case "warning":
        return {
          icon: <AlertCircle className="h-6 w-6 text-amber-500" />,
          iconBg: "bg-amber-500/10 border border-amber-500/20",
          confirmBtn: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20 focus:ring-amber-500",
        };
      case "info":
        return {
          icon: <Info className="h-6 w-6 text-sky-500" />,
          iconBg: "bg-sky-500/10 border border-sky-500/20",
          confirmBtn: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 focus:ring-indigo-500",
        };
      case "danger":
      default:
        return {
          icon: <AlertTriangle className="h-6 w-6 text-rose-500 animate-pulse" />,
          iconBg: "bg-rose-500/10 border border-rose-500/20",
          confirmBtn: "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 focus:ring-rose-500",
        };
    }
  };

  const styles = getModalStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onCancel}
      />
      
      {/* Modal Content Card */}
      <div className="relative bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl max-w-sm w-full p-6 shadow-2xl overflow-hidden animate-slide-up backdrop-blur-xl">
        {/* Glow effect at top (Tradzilla vibe) */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${
          type === "success" ? "bg-emerald-500" : type === "warning" ? "bg-amber-500" : type === "info" ? "bg-sky-500" : "bg-rose-500"
        }`} />

        <div className="flex gap-4 items-start pt-2">
          {/* Circular Icon Wrapper */}
          <div className={`p-3 rounded-2xl shrink-0 flex items-center justify-center ${styles.iconBg}`}>
            {styles.icon}
          </div>
          
          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 font-sans tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed font-sans">
              {message}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 justify-end pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50">
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl text-slate-500 dark:text-slate-400 transition-all active:scale-[0.97] cursor-pointer"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl active:scale-[0.97] transition-all shadow-lg cursor-pointer ${styles.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
