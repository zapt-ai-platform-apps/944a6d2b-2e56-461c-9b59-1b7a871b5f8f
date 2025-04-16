import React, { useState } from 'react';
import { narrativeContent } from '../constants';
import { eventBus, events } from '../../core/events';

const NarrativeCard = ({ narrativeKey, onContinue }) => {
  const narrative = narrativeContent[narrativeKey];
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!narrative) return null;
  
  const handleContinue = () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    eventBus.publish(events.NARRATIVE_VIEWED, { narrativeKey });
    
    if (onContinue) {
      onContinue(narrativeKey);
    }
    
    // We don't reset isSubmitting because the component will be unmounted/replaced
  };
  
  return (
    <div className="card max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">{narrative.title}</h2>
      
      <p className="text-gray-700 mb-6 text-right leading-relaxed">
        {narrative.content}
      </p>
      
      <button
        className="mt-4 w-full btn-primary"
        onClick={handleContinue}
        disabled={isSubmitting}
      >
        {isSubmitting ? 
          <div className="flex justify-center items-center">
            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
            جارٍ التحميل...
          </div> : 
          'استمرار'
        }
      </button>
    </div>
  );
};

export default NarrativeCard;