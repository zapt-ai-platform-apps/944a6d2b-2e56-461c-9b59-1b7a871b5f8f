import React, { useState } from 'react';
import { questions } from '../constants';
import { eventBus, events } from '../../core/events';

const QuestionCard = ({ questionId, onAnswer }) => {
  const question = questions.find(q => q.id === questionId);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!question) return null;
  
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };
  
  const handleSubmit = () => {
    if (!selectedOption || isSubmitting) return;
    
    setIsSubmitting(true);
    
    eventBus.publish(events.QUESTION_ANSWERED, {
      questionId: question.id,
      answer: selectedOption,
      narrativeKey: question.narrativeKey
    });
    
    if (onAnswer) {
      onAnswer(question.id, selectedOption);
    }
    
    setSelectedOption(null);
    // We don't reset isSubmitting because the component will be unmounted/replaced
  };
  
  return (
    <div className="card max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-right">{question.text}</h2>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <div 
            key={index}
            className={`option-card ${selectedOption === option 
              ? 'option-card-selected' 
              : 'option-card-default'}`}
            onClick={() => handleOptionSelect(option)}
          >
            {option}
          </div>
        ))}
      </div>
      
      <button
        className={`mt-6 w-full py-2 px-4 rounded-lg cursor-pointer transition-colors
          ${selectedOption && !isSubmitting
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        onClick={handleSubmit}
        disabled={!selectedOption || isSubmitting}
      >
        {isSubmitting ? 
          <div className="flex justify-center items-center">
            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
            جارٍ التقديم...
          </div> : 
          'التالي'
        }
      </button>
    </div>
  );
};

export default QuestionCard;