import React, { useState } from 'react';
import * as Sentry from '@sentry/browser';

const HookResults = ({ hooks }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!hooks || hooks.length === 0) {
    return null;
  }

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy text: ', error);
      Sentry.captureException(error, {
        extra: { text }
      });
    }
  };

  return (
    <div className="card max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">هوكات جذابة للمحتوى</h2>
      <p className="text-gray-600 mb-6 text-center">
        استخدم هذه الهوكات لجذب المتابعين وزيادة التفاعل على منشوراتك
      </p>

      <div className="space-y-4">
        {hooks.map((hook, index) => (
          <div 
            key={index} 
            className="border border-blue-200 bg-blue-50 rounded-lg p-4 relative"
          >
            <p className="text-lg font-medium">{hook}</p>
            <button
              onClick={() => copyToClipboard(hook, index)}
              className="absolute top-2 left-2 p-2 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-100 transition-colors"
            >
              {copiedIndex === index ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                  <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          اختر الهوك المناسب لمنصة التواصل الاجتماعي التي تستهدفها (فيسبوك، انستجرام، تيكتوك)
        </p>
      </div>
    </div>
  );
};

export default HookResults;