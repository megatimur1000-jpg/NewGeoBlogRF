// frontend/src/components/Modal.tsx
import React from 'react';
const Modal: React.FC<{ onClose: () => void, children: React.ReactNode }> = ({ onClose, children }) => (
  <div>
    <button onClick={onClose}>Закрыть</button>
    {children}
  </div>
);
export default Modal;
