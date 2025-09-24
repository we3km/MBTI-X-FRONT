import React from 'react';
import './ConfirmModal.css';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, onConfirm, onClose }) => {
    if (!isOpen) {
        return null;
    }

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="confirm-modal">
                <h2 className="modal-title">{title}</h2>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <button className="modal-btn cancel-btn" onClick={onClose}>
                        아니오
                    </button>
                    <button className="modal-btn confirm-btn" onClick={handleConfirm}>
                        예
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;