import React from 'react';

interface ModalMessageProps {
  message: string;
  onClose: () => void;
  onSuggest?: () => void;
}

const ModalMessage: React.FC<ModalMessageProps> = ({ message, onClose, onSuggest }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <p style={{ marginBottom: 24 }}>{message}</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {onSuggest && (
          <button onClick={onSuggest} style={{ background: '#3498db', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600 }}>Предложить изменения</button>
        )}
        <button onClick={onClose} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600 }}>Закрыть</button>
      </div>
    </div>
    <style>{`
      .modal-backdrop {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 3000;
      }
      .modal-content {
        background: #fff; border-radius: 12px; padding: 32px 28px; min-width: 320px; max-width: 90vw; box-shadow: 0 4px 24px rgba(0,0,0,0.18);
        text-align: center;
      }
    `}</style>
  </div>
);

export default ModalMessage;
