import React from 'react';
import { questions } from '../../questions/constants';

const ProgressIndicator = ({ currentQuestionId }) => {
  const totalQuestions = questions.length;
  const progress = Math.round((currentQuestionId - 1) / totalQuestions * 100);
  
  return (
    <div className="w-full max-w-lg mx-auto mb-4">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{progress}%</span>
        <span>الخطوة {currentQuestionId - 1} من {totalQuestions}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;