import React, { useState } from 'react';
import * as Sentry from '@sentry/browser';

const ScriptResult = ({ script }) => {
  const [copied, setCopied] = useState(false);

  if (!script) {
    return null;
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy script: ', error);
      Sentry.captureException(error, {
        extra: { scriptLength: script.length }
      });
    }
  };

  return (
    <div className="card max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">نص فيديو الريلز</h2>
        <button
          onClick={copyToClipboard}
          className="btn-secondary flex items-center gap-2"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              تم النسخ
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
              </svg>
              نسخ النص
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 whitespace-pre-wrap">
        {script}
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-2">نصائح للتصوير:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>ابدأ بهوك قوي في أول 3 ثواني لجذب المشاهدين</li>
          <li>تحدث بثقة ووضوح وحماس</li>
          <li>استخدم الإضاءة الجيدة والخلفية المناسبة</li>
          <li>تأكد من جودة الصوت</li>
          <li>أضف نصوص على الفيديو (captions) لزيادة المشاهدات</li>
        </ul>
      </div>
    </div>
  );
};

export default ScriptResult;