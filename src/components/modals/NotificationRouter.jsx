import React from "react";
import NotificationModal from "./NotificationModal";
import NotificationContractModal from "./NotificationContractModal";
import NotificationInvoiceModal from "./NotificationInvoiceModal";

const NotificationRouter = ({ role, isOpen, onClose, refreshCount }) => {
  if (!isOpen) return null;

  if (["FINANCE", "HR", "SUPER_ADMIN"].includes(role)) {
    return (
      <NotificationModal
        isOpen={isOpen}
        onClose={onClose}
        onAction={(id, status, type) => console.log(id, status, type)}
        refreshCount={refreshCount}
      />
    );
  }

  if (role === "CONTRACT") {
    return <NotificationContractModal isOpen={isOpen} onClose={onClose} />;
  }

  if (role === "INVOICE") {
    return <NotificationInvoiceModal isOpen={isOpen} onClose={onClose} />;
  }

  return null;
};

export default NotificationRouter;
