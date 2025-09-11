// src/components/Modal.tsx
import React from "react";
import ReactDOM from "react-dom";
import styles from "../login/Modal.module.css"

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ onClose, children }: ModalProps) {
  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.content}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✖
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
