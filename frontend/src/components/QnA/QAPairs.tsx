import React from 'react';
import { QnaPair } from '../../services/qnaService';

interface QAPairsProps {
  pairs: QnaPair[];
}

const QAPairs: React.FC<QAPairsProps> = ({ pairs }) => {
  if (pairs.length === 0) {
    return <div className="text-sm text-gray-500">Пока нет вопросов и ответов</div>;
  }
  return (
    <div className="space-y-3">
      {pairs.map(({ question, answer }) => (
        <div key={question.id} className="border rounded-md p-3 bg-white">
          <div className="text-gray-800 whitespace-pre-wrap">
            <span className="font-semibold text-blue-700">Вопрос: </span>
            {question.body}
          </div>
          {answer && (
            <div className="text-gray-800 whitespace-pre-wrap mt-2">
              <span className="font-semibold text-green-700">Ответ: </span>
              {answer.body}
            </div>
          )}
          <div className="mt-1 text-xs text-gray-500">
            {new Date(question.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QAPairs;


