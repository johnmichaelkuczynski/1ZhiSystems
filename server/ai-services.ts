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

// Generate speech using Azure Speech Services
async function generateSpeech(text: string, voice: string = 'alloy'): Promise<Buffer> {
  try {
    const endpoint = process.env.AZURE_SPEECH_ENDPOINT;
    const apiKey = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;

    if (!endpoint || !apiKey || !region) {
      throw new Error('Azure Speech credentials not configured');
    }

    // Map OpenAI-style voices to Azure voices
    const voiceMapping: { [key: string]: string } = {
      'alloy': 'en-US-AriaNeural',
      'echo': 'en-US-DavisNeural', 
      'fable': 'en-GB-LibbyNeural',
      'onyx': 'en-US-GuyNeural',
      'nova': 'en-US-JennyNeural',
      'shimmer': 'en-US-MichelleNeural'
    };

    const azureVoice = voiceMapping[voice] || 'en-US-AriaNeural';

    // Create SSML for Azure Speech
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${azureVoice}">
          <prosody rate="1.0" pitch="0%">
            ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </prosody>
        </voice>
      </speak>
    `;

    // Make request to Azure Speech API
    console.log('Calling Azure Speech API with endpoint:', endpoint);
    console.log('Using voice:', azureVoice);
    console.log('Text length:', text.length);
    
    const response = await fetch(`${endpoint}/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'ZhiSystems/1.0'
      },
      body: ssml
    });

    console.log('Azure Speech API response status:', response.status);
    console.log('Azure Speech API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure Speech API error response:', errorText);
      throw new Error(`Azure Speech API error: ${response.status} - ${errorText}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    return audioBuffer;
  } catch (error) {
    console.error('Error generating speech with Azure:', error);
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

export async function generatePodcast(request: TextProcessingRequest): Promise<{ script: PodcastScript; audioUrl?: string }> {
  const mode = request.podcastMode || 'normal-two';
  let systemPrompt = "";
  let prompt = "";
  let hosts: { name: string; role: string; }[] = [];

  // Configure prompts based on podcast mode
  switch (mode) {
    case 'normal-one':
      systemPrompt = "You are an expert podcast host. Create engaging, conversational podcast content with a single narrator that makes complex topics accessible and interesting. Write in a natural speaking style with smooth transitions.";
      prompt = `Create a single-host podcast episode based on the following text. Write as a solo narrator speaking directly to listeners:

Text to discuss:
${request.selectedText}

Create a complete podcast script with:
- Engaging introduction
- Clear explanation of key concepts
- Conclusion with key takeaways

Keep it conversational and accessible, around 300-500 words for a 3-4 minute podcast.`;
      hosts = [{ name: "Alex", role: "Host" }];
      break;

    case 'normal-two':
      systemPrompt = "You are creating a two-host podcast with natural conversation between hosts. Create engaging dialogue that makes complex topics accessible through discussion between two knowledgeable hosts.";
      prompt = `Create a two-host podcast episode based on the following text. Format as a natural conversation between HOST 1 and HOST 2:

Text to discuss:
${request.selectedText}

Create a complete podcast script with:
- HOST 1: Welcome and introduction
- Natural back-and-forth discussion between hosts
- HOST 2: Conclusion and wrap-up

Format each line as "HOST 1:" or "HOST 2:" followed by their dialogue. Make it conversational and engaging, around 400-600 words for a 4-5 minute podcast.`;
      hosts = [
        { name: "Alex", role: "Host 1" },
        { name: "Sam", role: "Host 2" }
      ];
      break;

    case 'custom-one':
      systemPrompt = `You are an expert podcast host. Create engaging, conversational podcast content with a single narrator. ${request.podcastInstructions}`;
      prompt = `Create a single-host podcast episode based on the following text. Follow these custom instructions: ${request.podcastInstructions}

Text to discuss:
${request.selectedText}

Create a complete podcast script following the custom instructions provided. Keep it engaging and accessible.`;
      hosts = [{ name: "Alex", role: "Host" }];
      break;

    case 'custom-two':
      systemPrompt = `You are creating a two-host podcast with natural conversation between hosts. ${request.podcastInstructions}`;
      prompt = `Create a two-host podcast episode based on the following text. Follow these custom instructions: ${request.podcastInstructions}

Text to discuss:
${request.selectedText}

Format as a natural conversation between HOST 1 and HOST 2. Each line should start with "HOST 1:" or "HOST 2:" followed by their dialogue. Follow the custom instructions provided.`;
      hosts = [
        { name: "Alex", role: "Host 1" },
        { name: "Sam", role: "Host 2" }
      ];
      break;
  }

  const scriptResponse = await callAI(request.provider, prompt, systemPrompt);
  console.log('Generated script response length:', scriptResponse.length);
  console.log('Generated script preview:', scriptResponse.substring(0, 200) + '...');
  
  // Parse the script into components
  let introduction = "";
  let mainContent = scriptResponse;
  let conclusion = "";
  
  // Try to extract introduction and conclusion if structured
  const lines = scriptResponse.split('\n').filter(line => line.trim());
  if (lines.length > 3) {
    introduction = lines.slice(0, Math.floor(lines.length * 0.2)).join('\n');
    conclusion = lines.slice(Math.floor(lines.length * 0.8)).join('\n');
    mainContent = lines.slice(Math.floor(lines.length * 0.2), Math.floor(lines.length * 0.8)).join('\n');
  }

  // Ensure script is not too long for TTS (max 4000 characters to be safe)
  let finalScript = scriptResponse;
  if (finalScript.length > 4000) {
    finalScript = finalScript.substring(0, 3900) + "... Thanks for listening to this episode!";
  }

  let audioUrl: string | undefined;

  // Generate audio if requested
  if (request.includeAudio) {
    console.log('Generating audio for podcast...');
    console.log('Voice selection:', request.voiceSelection);
    try {
      const audioBuffer = await generateSpeech(finalScript, request.voiceSelection);
      console.log('Audio generated successfully, buffer size:', audioBuffer.length);
      
      // Create a unique filename and save the audio
      const timestamp = Date.now();
      const filename = `podcast_${timestamp}.mp3`;
      const audioPath = `/tmp/${filename}`;
      
      // Write the audio buffer to file
      fs.writeFileSync(audioPath, audioBuffer);
      console.log('Audio file saved to:', audioPath);
      audioUrl = `/api/audio/${filename}`;
    } catch (error) {
      console.error('Failed to generate audio:', error);
      console.error('Audio generation error details:', error instanceof Error ? error.stack : error);
      // Continue without audio
    }
  }
  
  // Return script and optional audio URL
  return {
    script: {
      title: `AI Generated Podcast - ${mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')} Mode`,
      introduction: introduction || 'Welcome to this episode...',
      mainContent: mainContent,
      conclusion: conclusion || 'Thanks for listening!',
      estimatedDuration: mode.includes('two') ? '4-5 minutes' : '3-4 minutes',
      mode,
      hosts
    },
    audioUrl
  };
}

export async function generateCognitiveMap(request: TextProcessingRequest): Promise<CognitiveMap> {
  const systemPrompt = "You are an expert in mind mapping and visual knowledge representation. Create interactive cognitive maps that show concepts as connected nodes in a visual network. Always respond with valid JSON only, no markdown formatting or code blocks.";
  
  const prompt = `Create a visual cognitive map for the following text. Design it as a network of interconnected nodes representing concepts. The central concept should be at the center (x:400, y:300), with related concepts arranged around it in a radial pattern. Respond with ONLY valid JSON in this exact format (no markdown, no code blocks):

{
  "centralConcept": "Main central idea",
  "nodes": [
    {
      "id": "central",
      "label": "Central Concept",
      "type": "central",
      "x": 400,
      "y": 300,
      "color": "#3B82F6"
    },
    {
      "id": "node1",
      "label": "Primary Concept 1",
      "type": "primary",
      "x": 200,
      "y": 150,
      "color": "#10B981"
    }
  ],
  "connections": [
    {
      "from": "central",
      "to": "node1",
      "label": "relationship description",
      "type": "strong"
    }
  ],
  "insights": ["Key insight 1", "Key insight 2"]
}

Create 5-8 nodes total. Use these colors: central (#3B82F6), primary (#10B981), secondary (#F59E0B), detail (#EF4444). Position nodes in a visually appealing radial pattern around the center. Keep node labels concise - use 1-3 words when possible for better readability in the visual map.

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
      nodes: parsed.nodes || [],
      connections: parsed.connections || [],
      insights: parsed.insights || []
    };
  } catch (error) {
    console.error('Failed to parse cognitive map:', error);
    console.error('Raw response:', response);
    return {
      centralConcept: 'Main Concept',
      nodes: [
        {
          id: 'central',
          label: 'Main Concept',
          type: 'central',
          x: 400,
          y: 300,
          color: '#3B82F6'
        }
      ],
      connections: [],
      insights: []
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