import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
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

// Generate speech using OpenAI TTS
async function generateSpeech(text: string): Promise<Buffer> {
  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'alloy',
      input: text,
      response_format: 'mp3'
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
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
  const systemPrompt = "You are an expert educator creating assessment questions. Generate varied, challenging questions that test comprehension, analysis, and critical thinking. Always respond with valid JSON only, no markdown formatting or code blocks.";
  
  const prompt = `Create a test with 5-8 questions based on the following text. Include multiple choice, short answer, and essay questions. Respond with ONLY valid JSON in this exact format (no markdown, no code blocks):

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
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const parsed = JSON.parse(cleanResponse);
    return parsed.questions || [];
  } catch (error) {
    console.error('Failed to parse test questions:', error);
    console.error('Raw response:', response);
    return [];
  }
}

export async function generatePodcast(request: TextProcessingRequest): Promise<{ script: PodcastScript; audioUrl: string }> {
  const systemPrompt = "You are an expert podcast host. Create engaging, conversational podcast content that makes complex topics accessible and interesting. Write in a natural speaking style with smooth transitions.";
  
  const prompt = `Create a complete podcast episode based on the following text. Make it engaging and conversational, suitable for audio consumption. Write as if you're speaking directly to listeners:

Text to discuss:
${request.selectedText}

Create a full podcast script that flows naturally when spoken aloud.`;

  const scriptResponse = await callAI(request.provider, prompt, systemPrompt);
  
  // Generate audio using OpenAI TTS
  const audioBuffer = await generateSpeech(scriptResponse);
  
  // Create a unique filename and save the audio
  const timestamp = Date.now();
  const filename = `podcast_${timestamp}.mp3`;
  const audioPath = `/tmp/${filename}`;
  
  // Write the audio buffer to file
  fs.writeFileSync(audioPath, audioBuffer);
  
  // Return both script and audio URL
  return {
    script: {
      title: 'AI Generated Podcast',
      introduction: 'Podcast introduction...',
      mainContent: scriptResponse,
      conclusion: 'Thanks for listening!',
      estimatedDuration: '5-10 minutes'
    },
    audioUrl: `/api/audio/${filename}`
  };
}

export async function generateCognitiveMap(request: TextProcessingRequest): Promise<CognitiveMap> {
  const systemPrompt = "You are an expert in knowledge mapping and conceptual analysis. Create clear, hierarchical cognitive maps that visualize relationships between ideas. Always respond with valid JSON only, no markdown formatting or code blocks.";
  
  const prompt = `Create a cognitive map for the following text. Identify the central concept and main branches with their interconnections. Respond with ONLY valid JSON in this exact format (no markdown, no code blocks):

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
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const parsed = JSON.parse(cleanResponse);
    return {
      centralConcept: parsed.centralConcept || 'Main Concept',
      mainBranches: parsed.mainBranches || [],
      keyInsights: parsed.keyInsights || []
    };
  } catch (error) {
    console.error('Failed to parse cognitive map:', error);
    console.error('Raw response:', response);
    return {
      centralConcept: 'Main Concept',
      mainBranches: [],
      keyInsights: []
    };
  }
}

export async function generateSummaryThesis(request: TextProcessingRequest): Promise<SummaryThesis> {
  const systemPrompt = "You are an expert at distilling complex ideas into clear, concise summaries and identifying core theses. Always respond with valid JSON only, no markdown formatting or code blocks.";
  
  const prompt = `Analyze the following text and provide:
1. A one-line thesis statement that captures the main argument
2. A one-paragraph summary

Respond with ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "thesis": "One line thesis statement here",
  "summary": "One paragraph summary here"
}

Text:
${request.selectedText}`;

  const response = await callAI(request.provider, prompt, systemPrompt);
  
  try {
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const parsed = JSON.parse(cleanResponse);
    return {
      thesis: parsed.thesis || 'Main thesis not identified',
      summary: parsed.summary || 'Summary not available'
    };
  } catch (error) {
    console.error('Failed to parse summary thesis:', error);
    console.error('Raw response:', response);
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
  const systemPrompt = "You are a research librarian and academic expert. Recommend relevant, high-quality readings that complement and extend the given material. Always respond with valid JSON only, no markdown formatting or code blocks.";
  
  const prompt = `Based on the following text, suggest relevant readings including primary sources and supplementary materials. Respond with ONLY valid JSON in this exact format (no markdown, no code blocks):

{
  "primarySources": [
    {
      "title": "Book/article title",
      "author": "Author name", 
      "relevance": "Why this is relevant",
      "difficulty": "beginner"
    }
  ],
  "supplementaryReadings": [
    {
      "title": "Title",
      "author": "Author",
      "relevance": "Relevance explanation",
      "type": "book"
    }
  ]
}

Text:
${request.selectedText}`;

  const response = await callAI(request.provider, prompt, systemPrompt);
  
  try {
    // Clean the response to remove any markdown formatting
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const parsed = JSON.parse(cleanResponse);
    return {
      primarySources: parsed.primarySources || [],
      supplementaryReadings: parsed.supplementaryReadings || []
    };
  } catch (error) {
    console.error('Failed to parse suggested readings:', error);
    console.error('Raw response:', response);
    return {
      primarySources: [],
      supplementaryReadings: []
    };
  }
}