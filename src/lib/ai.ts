import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const hasApiKey = apiKey.trim().length > 0;

const genAI = hasApiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface InterviewQuestion {
  question: string;
  category: 'Technical' | 'Behavioral';
  expectedAnswerTips: string;
}

// Generate Interview Questions
export async function generateInterviewQuestions(skills: string, role: string): Promise<InterviewQuestion[]> {
  if (hasApiKey && genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        Generate 5 interview questions (technical and behavioral) for a candidate applying for the role "${role}" with skills "${skills}".
        
        Return ONLY a JSON array matching this TypeScript interface (no markdown blocks, just raw JSON):
        [
          {
            "question": "question text",
            "category": "Technical" or "Behavioral",
            "expectedAnswerTips": "bullet points on what a strong response should cover"
          }
        ]
      `;
      
      const response = await model.generateContent(prompt);
      const text = response.response.text().trim();
      const cleanJson = text.replace(/^```json/i, '').replace(/```$/i, '').trim();
      return JSON.parse(cleanJson) as InterviewQuestion[];
    } catch (err) {
      console.error('Gemini interview generation error, using simulation:', err);
    }
  }

  // Fallback Simulation
  return [
    {
      question: `Can you explain a complex project where you successfully utilized ${skills.split(',')[0] || 'your core skills'}?`,
      category: 'Technical',
      expectedAnswerTips: 'Explain the business problem, your design decisions, the tech stack selection, and specific performance/business results you achieved.'
    },
    {
      question: 'Tell me about a time you had a technical disagreement with a teammate. How did you resolve it?',
      category: 'Behavioral',
      expectedAnswerTips: 'Focus on collaboration, objective testing of ideas, communication style, and keeping the focus on customer results rather than personal bias.'
    },
    {
      question: 'How do you handle production issues or bugs under tight deadlines?',
      category: 'Behavioral',
      expectedAnswerTips: 'Describe a structured debugging approach, mitigation steps, keeping stakeholders informed, and implementing post-mortem fixes.'
    },
    {
      question: 'What is your experience with API design, performance optimization, and responsive design systems?',
      category: 'Technical',
      expectedAnswerTips: 'Mention RESTful patterns, caching protocols (Redis/CDN), database indexing, accessibility scales (WCAG), and frontend bundle optimization.'
    },
    {
      question: `Where do you see the future of ${role || 'engineering'} heading, and how do you keep up with new tools?`,
      category: 'Behavioral',
      expectedAnswerTips: 'List specific blogs, newsletters, tech communities, and side-projects you work on to test new tools and architecture paradigms.'
    }
  ];
}
