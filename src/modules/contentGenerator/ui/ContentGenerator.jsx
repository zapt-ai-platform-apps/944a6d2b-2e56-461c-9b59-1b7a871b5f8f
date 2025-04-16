import React, { useState } from 'react';
import ContentForm from './ContentForm';
import HookResults from './HookResults';
import ScriptResult from './ScriptResult';
import * as Sentry from '@sentry/browser';

const ContentGenerator = () => {
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateContent = async (formData) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('Generating content with input:', formData);
      
      const response = await fetch('/api/generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'حدث خطأ أثناء إنشاء المحتوى');
      }

      const data = await response.json();
      console.log('Generated content:', data);
      setGeneratedContent(data);
    } catch (error) {
      console.error('Error generating content:', error);
      setError(error.message || 'حدث خطأ أثناء إنشاء المحتوى');
      Sentry.captureException(error, {
        extra: { formData }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">منشئ هوكات السوشيال ميديا</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          أداة ذكية لإنشاء هوكات قوية ونصوص فيديو تجذب الجمهور وتحقق انتشاراً واسعاً على منصات التواصل الاجتماعي
        </p>
      </header>

      <div className="space-y-8">
        <ContentForm 
          onGenerateContent={generateContent}
          isGenerating={isGenerating}
        />

        {error && (
          <div className="max-w-3xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}

        {isGenerating && (
          <div className="max-w-3xl mx-auto card">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-lg">جاري إنشاء محتوى مميز لك...</p>
            </div>
          </div>
        )}

        {!isGenerating && generatedContent && (
          <>
            <HookResults hooks={generatedContent.hooks} />
            <ScriptResult script={generatedContent.script} />
          </>
        )}
        
        <footer className="text-center text-sm text-gray-500 max-w-3xl mx-auto mt-12">
          <p>
            تم إنشاؤه بواسطة{' '}
            <a href="https://www.zapt.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              ZAPT
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ContentGenerator;