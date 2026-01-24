import React, { useState } from 'react';

interface ReportModalProps {
  onSubmit: (message: string) => void;
  onCancel: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ onSubmit, onCancel }) => {
  const [message, setMessage] = useState('');

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Пожаловаться на метку</h2>
        <textarea
          placeholder="Опишите проблему"
          value={message}
          onChange={e => setMessage(e.target.value)}
          style={{ width: '100%', minHeight: 80 }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button type="button" onClick={onCancel}>Отмена</button>
          <button type="button" onClick={() => onSubmit(message)} disabled={!message.trim()}>Отправить</button>
        </div>
      </div>
      <style>{`
        .modal-backdrop {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 3000;
        }
        .modal-content {
          background: #fff; border-radius: 10px; padding: 24px; min-width: 320px; box-shadow: 0 4px 24px rgba(0,0,0,0.18);
        }
      `}</style>
    </div>
  );
};

export default ReportModal;
