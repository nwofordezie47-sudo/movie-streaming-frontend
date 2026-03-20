import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, onConfirm, title, message, type = 'info' }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className={`modal-content ${type}`}>
                {title && <h3 className="modal-title">{title}</h3>}
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    {onConfirm ? (
                        <>
                            <button className="modal-btn cancel" onClick={onClose}>
                                Cancel
                            </button>
                            <button className="modal-btn confirm" onClick={onConfirm}>
                                Confirm
                            </button>
                        </>
                    ) : (
                        <button className="modal-btn" onClick={onClose}>
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
