import React, { createContext, useContext, useState, useCallback } from "react";
import { ConfirmModal } from "../components/ConfirmModal";

interface ShowModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info" | "success";
}

interface ModalContextType {
  showAlert: (options: ShowModalOptions) => Promise<void>;
  showConfirm: (options: ShowModalOptions) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info" | "success";
    showCancel: boolean;
    resolve: (value: boolean) => void;
  } | null>(null);

  const showAlert = useCallback((options: ShowModalOptions) => {
    return new Promise<void>((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || "OK",
        showCancel: false,
        type: options.type || "info",
        resolve: () => {
          setModalState(null);
          resolve();
        },
      });
    });
  }, []);

  const showConfirm = useCallback((options: ShowModalOptions) => {
    return new Promise<boolean>((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        showCancel: true,
        type: options.type || "danger",
        resolve: (value: boolean) => {
          setModalState(null);
          resolve(value);
        },
      });
    });
  }, []);

  const handleConfirm = () => {
    if (modalState) {
      modalState.resolve(true);
    }
  };

  const handleCancel = () => {
    if (modalState) {
      modalState.resolve(false);
    }
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {modalState && (
        <ConfirmModal
          isOpen={modalState.isOpen}
          title={modalState.title}
          message={modalState.message}
          confirmText={modalState.confirmText}
          cancelText={modalState.cancelText}
          showCancel={modalState.showCancel}
          type={modalState.type}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ModalContext.Provider>
  );
};

export const useModals = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
};
