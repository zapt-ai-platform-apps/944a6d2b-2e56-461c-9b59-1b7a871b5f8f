import React, { useState, useEffect } from 'react';
import { questions } from '../../questions/constants';
import { api as progressApi } from '../../progress/api';
import { eventBus, events } from '../../core/events';
import QuestionCard from '../../questions/ui/QuestionCard';
import NarrativeCard from '../../narrative/ui/NarrativeCard';
import ProgressIndicator from '../../progress/ui/ProgressIndicator';
import * as Sentry from '@sentry/browser';

const Journey = () => {
  const [progress, setProgress] = useState(null);
  const [showNarrative, setShowNarrative] = useState(true);
  const [currentNarrativeKey, setCurrentNarrativeKey] = useState('intro');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load progress on initial mount
  useEffect(() => {
    try {
      const savedProgress = progressApi.loadProgress();
      setProgress(savedProgress);
      setIsCompleted(savedProgress.completed);
      
      // If we're at the end, show conclusion
      if (savedProgress.currentQuestionId > questions.length) {
        setShowNarrative(true);
        setCurrentNarrativeKey('conclusion');
      } else if (savedProgress.viewedNarratives.length === 1) {
        // Only intro viewed, show it
        setShowNarrative(true);
        setCurrentNarrativeKey('intro');
      } else {
        // Determine if we should show a narrative or question
        const lastNarrativeKey = savedProgress.viewedNarratives[savedProgress.viewedNarratives.length - 1];
        const currentQuestion = questions.find(q => q.id === savedProgress.currentQuestionId);
        
        if (currentQuestion && lastNarrativeKey === currentQuestion.narrativeKey) {
          // If we've seen the narrative for the current question, show the question
          setShowNarrative(false);
        } else if (currentQuestion) {
          // Otherwise show the narrative for the current question
          setShowNarrative(true);
          setCurrentNarrativeKey(currentQuestion.narrativeKey);
        }
      }
      setIsLoading(false);
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error loading journey progress:', error);
      // Fallback to default state
      const defaultProgress = progressApi.resetProgress();
      setProgress(defaultProgress);
      setShowNarrative(true);
      setCurrentNarrativeKey('intro');
      setIsLoading(false);
    }
  }, []);
  
  // Subscribe to events
  useEffect(() => {
    const questionSubscription = eventBus.subscribe(events.QUESTION_ANSWERED, ({ questionId, answer, narrativeKey }) => {
      try {
        console.log('Question answered:', questionId, answer);
        const nextQuestionId = questionId + 1;
        const updatedProgress = progressApi.updateAnswer(questionId, answer);
        setProgress(updatedProgress);
        
        // If that was the last question, show conclusion
        if (nextQuestionId > questions.length) {
          progressApi.completeJourney();
          setIsCompleted(true);
          setShowNarrative(true);
          setCurrentNarrativeKey('conclusion');
        } else {
          // Otherwise show the narrative for the next question
          const nextQuestion = questions.find(q => q.id === nextQuestionId);
          if (nextQuestion) {
            setShowNarrative(true);
            setCurrentNarrativeKey(nextQuestion.narrativeKey);
          }
        }
      } catch (error) {
        Sentry.captureException(error);
        console.error('Error processing question answer:', error);
      }
    });
    
    const narrativeSubscription = eventBus.subscribe(events.NARRATIVE_VIEWED, ({ narrativeKey }) => {
      try {
        console.log('Narrative viewed:', narrativeKey);
        const updatedProgress = progressApi.viewNarrative(narrativeKey);
        setProgress(updatedProgress);
        
        // If this is the conclusion, we're done
        if (narrativeKey === 'conclusion') {
          return;
        }
        
        // Otherwise, show the current question
        setShowNarrative(false);
      } catch (error) {
        Sentry.captureException(error);
        console.error('Error processing narrative view:', error);
      }
    });
    
    const resetSubscription = eventBus.subscribe(events.JOURNEY_RESET, () => {
      try {
        console.log('Journey reset initiated');
        const resetProgress = progressApi.resetProgress();
        setProgress(resetProgress);
        setIsCompleted(false);
        setShowNarrative(true);
        setCurrentNarrativeKey('intro');
      } catch (error) {
        Sentry.captureException(error);
        console.error('Error resetting journey:', error);
      }
    });
    
    return () => {
      questionSubscription();
      narrativeSubscription();
      resetSubscription();
    };
  }, []);
  
  // Handle journey reset
  const handleReset = () => {
    eventBus.publish(events.JOURNEY_RESET);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={handleReset}
          className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
        >
          إعادة البدء
        </button>
        <h1 className="text-3xl font-bold text-right">رحلة الاكتشاف</h1>
      </div>
      
      {!isCompleted && !showNarrative && (
        <ProgressIndicator currentQuestionId={progress.currentQuestionId} />
      )}
      
      <div className="mb-8">
        {showNarrative ? (
          <NarrativeCard 
            narrativeKey={currentNarrativeKey}
            onContinue={() => {}} // Event bus handles this
          />
        ) : (
          <QuestionCard 
            questionId={progress.currentQuestionId}
            onAnswer={() => {}} // Event bus handles this
          />
        )}
      </div>
      
      {isCompleted && (
        <div className="text-center mt-8">
          <p className="text-gray-700 mb-4">شكراً لإكمالك هذه الرحلة. نأمل أن تكون قد وجدت فيها ما يساعدك في اكتشاف قيمتك الحقيقية ومعنى حياتك.</p>
          <button
            onClick={handleReset}
            className="py-2 px-4 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
          >
            بدء رحلة جديدة
          </button>
        </div>
      )}
      
      <div className="mt-8 text-center text-sm text-gray-600">
        <a href="https://www.zapt.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
          Made on ZAPT
        </a>
      </div>
    </div>
  );
};

export default Journey;