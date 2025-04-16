import * as Sentry from '@sentry/node';

// Initialize Sentry
Sentry.init({
  dsn: process.env.VITE_PUBLIC_SENTRY_DSN,
  environment: process.env.VITE_PUBLIC_APP_ENV,
  initialScope: {
    tags: {
      type: 'backend',
      projectId: process.env.VITE_PUBLIC_APP_ID
    }
  }
});

export default async function handler(req, res) {
  console.log('Generate content API called');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { problem, audience, desiredOutcome } = req.body;
    
    // Validate required inputs
    if (!problem || !audience || !desiredOutcome) {
      return res.status(400).json({ 
        error: 'المرجو إدخال جميع المعلومات المطلوبة (المشكلة، الجمهور المستهدف، والنتيجة المرغوبة)'
      });
    }
    
    console.log('Generating content for:', { problem, audience, desiredOutcome });

    // Construct prompt for OpenAI
    const prompt = `
      أنت خبير محتوى سوشيال ميديا متخصص في إنشاء محتوى فيرالي جذاب يحقق نسب مشاهدة عالية وتفاعل كبير.
      
      قم بإنشاء محتوى للسوشيال ميديا بناءً على المعلومات التالية:
      المشكلة/الموضوع: ${problem}
      الجمهور المستهدف: ${audience}
      النتيجة المرغوبة: ${desiredOutcome}
      
      أريد منك إنشاء ما يلي:
      1. خمسة هوكات قوية ومختلفة يمكن استخدامها في بداية فيديوهات السوشيال ميديا لجذب الانتباه فوراً (لكل من فيسبوك وانستجرام وتيكتوك). يجب أن تكون الهوكات مثيرة ومشوقة ومحفزة للمشاهدة.
      2. نص كامل لفيديو ريلز مدته 30-60 ثانية يستخدم أفضل هوك ويشرح المشكلة والحل بطريقة جذابة ومؤثرة.
      
      أعطني النتائج بتنسيق JSON كالتالي:
      {
        "hooks": [هوك 1، هوك 2، هوك 3، هوك 4، هوك 5],
        "script": "النص الكامل للفيديو"
      }
    `;

    // OpenAI API call
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error('فشل في إنشاء المحتوى. الرجاء المحاولة مرة أخرى لاحقًا.');
    }
    
    const completion = await openaiResponse.json();
    const responseContent = completion.choices[0].message.content;
    
    console.log('Raw response from OpenAI:', responseContent);
    
    // Parse JSON response from OpenAI
    let parsedContent;
    try {
      // Extract JSON from the response if it's wrapped in text
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseContent;
      parsedContent = JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      Sentry.captureException(error, {
        extra: { responseContent }
      });
      
      // Fallback parsing approach
      try {
        // Try to extract hooks and script from non-JSON format
        const hooks = [];
        let script = '';
        
        const lines = responseContent.split('\n');
        let inHooksSection = false;
        let inScriptSection = false;
        
        for (const line of lines) {
          if (line.includes('hooks') || line.toLowerCase().includes('هوك')) {
            inHooksSection = true;
            inScriptSection = false;
            continue;
          }
          if (line.includes('script') || line.includes('نص') || line.includes('سكريبت')) {
            inHooksSection = false;
            inScriptSection = true;
            continue;
          }
          
          const trimmedLine = line.trim();
          if (trimmedLine && inHooksSection) {
            // Remove numbering and quotes
            const cleanLine = trimmedLine.replace(/^[0-9\-\.\"\:\}]+\s*/, '').replace(/[\"\,]+$/, '');
            if (cleanLine && !cleanLine.includes('{') && !cleanLine.includes('}')) {
              hooks.push(cleanLine);
            }
          }
          
          if (trimmedLine && inScriptSection) {
            if (!trimmedLine.includes('{') && !trimmedLine.includes('}')) {
              script += trimmedLine + '\n';
            }
          }
        }
        
        if (hooks.length > 0 || script) {
          parsedContent = { hooks, script };
        } else {
          throw new Error('Could not extract content');
        }
      } catch (fallbackError) {
        console.error('Fallback parsing failed:', fallbackError);
        throw new Error('فشل في معالجة المحتوى المُنشأ. الرجاء المحاولة مرة أخرى.');
      }
    }
    
    console.log('Parsed content:', parsedContent);
    
    // Return the generated content
    return res.status(200).json(parsedContent);
    
  } catch (error) {
    console.error('Error in generateContent API:', error);
    Sentry.captureException(error, {
      extra: { requestBody: req.body }
    });
    
    return res.status(500).json({ 
      error: 'حدث خطأ أثناء إنشاء المحتوى. الرجاء المحاولة مرة أخرى لاحقًا.' 
    });
  }
}