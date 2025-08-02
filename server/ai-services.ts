import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, TextProcessingRequest, TestQuestion, PodcastScript, CognitiveMap, SummaryThesis, SuggestedReadings } from '@shared/ai-services';

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Perplexity API client (uses OpenAI-compatible interface)
const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai',
});

// DeepSeek API client (uses OpenAI-compatible interface)
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

async function callAI(provider: AIProvider, prompt: string, systemPrompt?: string): Promise<string> {
  try {
    switch (provider) {
      case 'openai':
        const openaiResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          max_tokens: 4000,
          temperature: 0.7,
        });
        return openaiResponse.choices[0]?.message?.content || '';

      case 'anthropic':
        const anthropicResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }],
          ...(systemPrompt ? { system: systemPrompt } : {}),
        });
        return anthropicResponse.content[0]?.type === 'text' ? anthropicResponse.content[0].text : '';

      case 'perplexity':
        const perplexityResponse = await perplexity.chat.completions.create({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          max_tokens: 4000,
          temperature: 0.7,
        });
        return perplexityResponse.choices[0]?.message?.content || '';

      case 'deepseek':
        const deepseekResponse = await deepseek.chat.completions.create({
          model: 'deepseek-chat',
          messages: [
            ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          max_tokens: 4000,
          temperature: 0.7,
        });
        return deepseekResponse.choices[0]?.message?.content || '';

      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error calling ${provider}:`, error);
    throw new Error(`Failed to process request with ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function rewriteText(request: TextProcessingRequest): Promise<string> {
  const systemPrompt = "You are an expert editor and writer. Rewrite the given text according to the user's instructions while maintaining the core meaning and improving clarity, style, and effectiveness.";
  
  const prompt = `Please rewrite the following text according to these instructions: "${request.customInstructions || 'Improve clarity and style while maintaining the original meaning'}"

Original text:
${request.selectedText}

Provide only the rewritten text without any additional commentary.`;

  return await callAI(request.provider, prompt, systemPrompt);
}

export async function generateStudyGuide(request: TextProcessingRequest): Promise<string> {
  const systemPrompt = "You are an expert educator. Create comprehensive study guides that help students understand and learn complex material effectively.";
  
  const prompt = `Create a comprehensive study guide for the following text. Include key concepts, important points, definitions, and study questions.

Text:
${request.selectedText}

Format the study guide with clear sections and bullet points for easy reading.`;

  return await callAI(request.provider, prompt, systemPrompt);
}

export async function generateTest(request: TextProcessingRequest): Promise<TestQuestion[]> {
  const systemPrompt = "You are an expert educator creating assessment questions. Generate varied, challenging questions that test comprehension, analysis, and critical thinking.";
  
  const prompt = `Create a test with 5-8 questions based on the following text. Include multiple choice, short answer, and essay questions. Return the response as valid JSON in this format:

{
  "questions": [
    {
      "question": "Question text here",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A) Option 1",
      "explanation": "Explanation of why this is correct",
      "type": "multiple-choice"
    }
  ]
}

Text:
${request.selectedText}`;

  const response = await callAI(request.provider, prompt, systemPrompt);
  
  try {
    const parsed = JSON.parse(response);
    return parsed.questions || [];
  } catch (error) {
    console.error('Failed to parse test questions:', error);
    return [];
  }
}

export async function generatePodcast(request: TextProcessingRequest): Promise<PodcastScript> {
  const systemPrompt = "You are an expert podcast scriptwriter. Create engaging, conversational scripts that make complex topics accessible and interesting.";
  
  const prompt = `Create a podcast script based on the following text. Make it engaging and conversational, suitable for audio consumption. Return as valid JSON:

{
  "title": "Podcast episode title",
  "introduction": "Engaging introduction",
  "mainContent": "Main discussion content with natural flow",
  "conclusion": "Wrap-up and key takeaways",
  "estimatedDuration": "8-12 minutes"
}

Text:
${request.selectedText}`;

  const response = await callAI(request.provider, prompt, systemPrompt);
  
  try {
    const parsed = JSON.parse(response);
    return {
      title: parsed.title || 'Podcast Episode',
      introduction: parsed.introduction || '',
      mainContent: parsed.mainContent || '',
      conclusion: parsed.conclusion || '',
      estimatedDuration: parsed.estimatedDuration || '5-10 minutes'
    };
  } catch (error) {
    console.error('Failed to parse podcast script:', error);
    return {
      title: 'Podcast Episode',
      introduction: '',
      mainContent: response,
      conclusion: '',
      estimatedDuration: '5-10 minutes'
    };
  }
}

export async function generateCognitiveMap(request: TextProcessingRequest): Promise<CognitiveMap> {
  const systemPrompt = "You are an expert in knowledge mapping and conceptual analysis. Create clear, hierarchical cognitive maps that visualize relationships between ideas.";
  
  const prompt = `Create a cognitive map for the following text. Identify the central concept and main branches with their interconnections. Return as valid JSON:

{
  "centralConcept": "Main central idea",
  "mainBranches": [
    {
      "title": "Branch title",
      "concepts": ["concept1", "concept2"],
      "connections": ["how this connects to other branches"]
    }
  ],
  "keyInsights": ["insight1", "insight2"]
}

Text:
${request.selectedText}`;

  const response = await callAI(request.provider, prompt, systemPrompt);
  
  try {
    const parsed = JSON.parse(response);
    return {
      centralConcept: parsed.centralConcept || 'Main Concept',
      mainBranches: parsed.mainBranches || [],
      keyInsights: parsed.keyInsights || []
    };
  } catch (error) {
    console.error('Failed to parse cognitive map:', error);
    return {
      centralConcept: 'Main Concept',
      mainBranches: [],
      keyInsights: []
    };
  }
}

export async function generateSummaryThesis(request: TextProcessingRequest): Promise<SummaryThesis> {
  const systemPrompt = "You are an expert at distilling complex ideas into clear, concise summaries and identifying core theses.";
  
  const prompt = `Analyze the following text and provide:
1. A one-line thesis statement that captures the main argument
2. A one-paragraph summary

Return as valid JSON:
{
  "thesis": "One line thesis statement here",
  "summary": "One paragraph summary here"
}

Text:
${request.selectedText}`;

  const response = await callAI(request.provider, prompt, systemPrompt);
  
  try {
    const parsed = JSON.parse(response);
    return {
      thesis: parsed.thesis || 'Main thesis not identified',
      summary: parsed.summary || 'Summary not available'
    };
  } catch (error) {
    console.error('Failed to parse summary thesis:', error);
    return {
      thesis: 'Main thesis not identified',
      summary: response
    };
  }
}

export async function generateThesisDeepDive(request: TextProcessingRequest): Promise<string> {
  const systemPrompt = "You are a philosophical and analytical expert. Provide deep, nuanced analysis of theses and their implications.";
  
  const prompt = `Provide a deep analytical discussion of the main thesis in the following text. Explore its implications, assumptions, potential criticisms, and broader significance.

Text:
${request.selectedText}`;

  return await callAI(request.provider, prompt, systemPrompt);
}

export async function generateSuggestedReadings(request: TextProcessingRequest): Promise<SuggestedReadings> {
  const systemPrompt = "You are a research librarian and academic expert. Recommend relevant, high-quality readings that complement and extend the given material.";
  
  const prompt = `Based on the following text, suggest relevant readings including primary sources and supplementary materials. Return as valid JSON:

{
  "primarySources": [
    {
      "title": "Book/article title",
      "author": "Author name", 
      "relevance": "Why this is relevant",
      "difficulty": "beginner/intermediate/advanced"
    }
  ],
  "supplementaryReadings": [
    {
      "title": "Title",
      "author": "Author",
      "relevance": "Relevance explanation",
      "type": "book/article/paper/website"
    }
  ]
}

Text:
${request.selectedText}`;

  const response = await callAI(request.provider, prompt, systemPrompt);
  
  try {
    const parsed = JSON.parse(response);
    return {
      primarySources: parsed.primarySources || [],
      supplementaryReadings: parsed.supplementaryReadings || []
    };
  } catch (error) {
    console.error('Failed to parse suggested readings:', error);
    return {
      primarySources: [],
      supplementaryReadings: []
    };
  }
}