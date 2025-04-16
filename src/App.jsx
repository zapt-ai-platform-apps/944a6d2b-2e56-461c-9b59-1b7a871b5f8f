import React from 'react';
import ContentGenerator from './modules/contentGenerator/ui/ContentGenerator';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <ContentGenerator />
    </div>
  );
}