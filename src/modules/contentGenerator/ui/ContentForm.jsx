import React, { useState } from 'react';
import * as Sentry from '@sentry/browser';

const ContentForm = ({ onGenerateContent, isGenerating }) => {
  const [formData, setFormData] = useState({
    problem: '',
    audience: '',
    desiredOutcome: ''
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prevState => ({
        ...prevState,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.problem.trim()) {
      newErrors.problem = 'برجاء إدخال المشكلة أو الموضوع';
    }
    
    if (!formData.audience.trim()) {
      newErrors.audience = 'برجاء إدخال الجمهور المستهدف';
    }
    
    if (!formData.desiredOutcome.trim()) {
      newErrors.desiredOutcome = 'برجاء إدخال النتيجة المرغوبة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      onGenerateContent(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      Sentry.captureException(error, {
        extra: { formData }
      });
    }
  };

  return (
    <div className="card max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">إنشاء محتوى جذاب للسوشيال ميديا</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="problem" className="block text-lg font-medium mb-1">
            ما هي المشكلة أو الموضوع؟
          </label>
          <textarea
            id="problem"
            name="problem"
            value={formData.problem}
            onChange={handleChange}
            placeholder="اكتب هنا المشكلة أو الموضوع الذي تريد التحدث عنه..."
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 box-border ${
              errors.problem ? 'border-red-500' : 'border-gray-300'
            }`}
            rows="3"
          />
          {errors.problem && (
            <p className="text-red-500 text-sm mt-1">{errors.problem}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="audience" className="block text-lg font-medium mb-1">
            من هو الجمهور المستهدف؟
          </label>
          <textarea
            id="audience"
            name="audience"
            value={formData.audience}
            onChange={handleChange}
            placeholder="صف الجمهور المستهدف بالتفصيل (العمر، الاهتمامات، المشاكل التي يواجهونها)..."
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 box-border ${
              errors.audience ? 'border-red-500' : 'border-gray-300'
            }`}
            rows="3"
          />
          {errors.audience && (
            <p className="text-red-500 text-sm mt-1">{errors.audience}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="desiredOutcome" className="block text-lg font-medium mb-1">
            ما هي النتيجة المرغوبة؟
          </label>
          <textarea
            id="desiredOutcome"
            name="desiredOutcome"
            value={formData.desiredOutcome}
            onChange={handleChange}
            placeholder="ما هي النتيجة التي يرغب الجمهور في تحقيقها؟"
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 box-border ${
              errors.desiredOutcome ? 'border-red-500' : 'border-gray-300'
            }`}
            rows="3"
          />
          {errors.desiredOutcome && (
            <p className="text-red-500 text-sm mt-1">{errors.desiredOutcome}</p>
          )}
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="btn-primary w-full flex justify-center items-center"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري إنشاء المحتوى...
              </>
            ) : (
              'إنشاء المحتوى'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentForm;