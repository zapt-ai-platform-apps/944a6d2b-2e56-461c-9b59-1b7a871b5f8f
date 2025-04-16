import { createValidator } from '../core/validators';
import { z } from 'zod';
import * as Sentry from '@sentry/browser';

// Define schema for progress data
const progressSchema = z.object({
  currentQuestionId: z.number().min(1),
  answers: z.record(z.string()),
  completed: z.boolean().default(false),
  viewedNarratives: z.array(z.string()).default([])
});

// Create validator
export const validateProgress = createValidator(progressSchema, 'Progress');

// Default initial progress
const defaultProgress = {
  currentQuestionId: 1,
  answers: {},
  completed: false,
  viewedNarratives: ['intro']
};

// Save progress to localStorage
const saveProgress = (progress) => {
  try {
    const validatedProgress = validateProgress(progress, {
      actionName: 'saveProgress',
      location: 'progress/api.js',
      direction: 'outgoing'
    });
    localStorage.setItem('discovery-journey-progress', JSON.stringify(validatedProgress));
    return validatedProgress;
  } catch (error) {
    console.error('Error saving progress:', error);
    Sentry.captureException(error);
    return null;
  }
};

// Load progress from localStorage
const loadProgress = () => {
  try {
    const savedProgress = localStorage.getItem('discovery-journey-progress');
    if (!savedProgress) return defaultProgress;
    
    const parsedProgress = JSON.parse(savedProgress);
    return validateProgress(parsedProgress, {
      actionName: 'loadProgress',
      location: 'progress/api.js',
      direction: 'incoming'
    });
  } catch (error) {
    console.error('Error loading progress:', error);
    Sentry.captureException(error);
    return defaultProgress;
  }
};

// Reset progress
const resetProgress = () => {
  localStorage.removeItem('discovery-journey-progress');
  return defaultProgress;
};

// Update answer and progress
const updateAnswer = (questionId, answer) => {
  const progress = loadProgress();
  const updatedProgress = {
    ...progress,
    answers: {
      ...progress.answers,
      [questionId]: answer
    },
    currentQuestionId: questionId + 1
  };
  return saveProgress(updatedProgress);
};

// Mark narrative as viewed
const viewNarrative = (narrativeKey) => {
  const progress = loadProgress();
  if (progress.viewedNarratives.includes(narrativeKey)) return progress;
  
  const updatedProgress = {
    ...progress,
    viewedNarratives: [...progress.viewedNarratives, narrativeKey]
  };
  return saveProgress(updatedProgress);
};

// Mark journey as completed
const completeJourney = () => {
  const progress = loadProgress();
  const updatedProgress = {
    ...progress,
    completed: true
  };
  return saveProgress(updatedProgress);
};

export const api = {
  loadProgress,
  saveProgress,
  resetProgress,
  updateAnswer,
  viewNarrative,
  completeJourney
};