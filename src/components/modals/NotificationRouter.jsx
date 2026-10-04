import React from "react";
import NotificationModal from "./NotificationModal";
import NotificationContractInvoiceModal from "./NotificationContractInvoiceModal";
import NotificationFinanceModal from "./NotificationFinanceModal";

const NotificationRouter = ({ role, isOpen, onClose, refreshCount }) => {
  if (!isOpen) return null;

  // =======================================================
  // HRIS + SUPER ADMIN
  // =======================================================

  if (["HR", "SUPER_ADMIN"].includes(role)) {
    return (
      <NotificationModal
        isOpen={isOpen}
        onClose={onClose}
        onAction={(id, status, type) => console.log(id, status, type)}
        refreshCount={refreshCount}
      />
    );
  }

  // =======================================================
  // FINANCE
  // =======================================================

  if (role === "FINANCE") {
    return (
      <NotificationFinanceModal
        isOpen={isOpen}
        onClose={onClose}
        refreshCount={refreshCount}
      />
    );
  }

  // =======================================================
  // CONTRACT + INVOICE
  // =======================================================

  if (["CONTRACT", "INVOICE"].includes(role)) {
    return (
      <NotificationContractInvoiceModal
        role={role}
        isOpen={isOpen}
        onClose={onClose}
        refreshCount={refreshCount}
      />
    );
  }

  return null;
};

export default NotificationRouter;
