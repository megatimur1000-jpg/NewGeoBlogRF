import React from 'react';
import { useNavigate } from 'react-router-dom';

const PublicLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Добро пожаловать в ГеоБлог.РФ
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Ваш путеводитель по России
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700"
          >
            Войти в систему
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicLanding;
