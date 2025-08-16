import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
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
          max_tokens: 8000, // Increased for longer content
          temperature: 0.7,
        });
        return openaiResponse.choices[0]?.message?.content || '';

      case 'anthropic':
        const anthropicResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8000, // Increased for longer content
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
          max_tokens: 8000, // Increased for longer content
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
          max_tokens: 8000, // Increased for longer content
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

// Generate speech using OpenAI TTS and save to public/audio
async function generateTwoHostAudio(script: string, primaryVoice: string = 'alloy', secondaryVoice: string = 'echo', filename?: string): Promise<string> {
  try {
    console.log('=== GENERATING TWO-HOST AUDIO ===');
    console.log(`Primary voice requested: ${primaryVoice}`);
    console.log(`Secondary voice requested: ${secondaryVoice}`);
    
    // CRITICAL: Use the exact user-selected voices
    const voices = { host1: primaryVoice, host2: secondaryVoice };
    console.log(`FINAL voices to use: ALEX = ${voices.host1}, SAM = ${voices.host2}`);
    
    // Parse the script to create segments with speaker attribution
    const lines = script.split('\n').filter(line => line.trim());
    interface AudioSegment {
      speaker: 'host1' | 'host2';
      text: string;
      voice: string;
    }
    
    const segments: AudioSegment[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('ALEX:') || trimmed.startsWith('HOST 1:')) {
        const content = trimmed.replace(/^(ALEX:|HOST 1:)/, '').trim();
        if (content.length > 0) {
          segments.push({
            speaker: 'host1',
            text: content,
            voice: voices.host1
          });
        }
      } else if (trimmed.startsWith('SAM:') || trimmed.startsWith('HOST 2:')) {
        const content = trimmed.replace(/^(SAM:|HOST 2:)/, '').trim();
        if (content.length > 0) {
          segments.push({
            speaker: 'host2',
            text: content,
            voice: voices.host2
          });
        }
      } else if (trimmed.length > 0) {
        // Non-host lines (like narration), assign to ALEX (host1)
        segments.push({
          speaker: 'host1',
          text: trimmed,
          voice: voices.host1
        });
      }
    }
    
    console.log(`Generated ${segments.length} audio segments`);
    
    // Generate individual audio files for each segment
    const fs = await import("fs/promises");
    const path = await import("path");
    const timestamp = Date.now();
    
    const segmentFiles: string[] = [];
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`Generating segment ${i + 1}/${segments.length}: ${segment.speaker} (${segment.voice})`);
      
      try {
        const segmentAudio = await generateOpenAIAudioAsBuffer(segment.text, segment.voice);
        const segmentPath = path.join(process.cwd(), "public", "audio", `segment_${timestamp}_${i}.mp3`);
        await fs.mkdir(path.dirname(segmentPath), { recursive: true });
        await fs.writeFile(segmentPath, segmentAudio);
        segmentFiles.push(segmentPath);
      } catch (error) {
        console.error(`Error generating segment ${i}:`, error);
        // Continue with other segments
      }
    }
    
    if (segmentFiles.length === 0) {
      throw new Error('No audio segments were generated successfully');
    }
    
    // Create final filename
    const finalFilename = filename || `podcast_${timestamp}`;
    const finalPath = path.join(process.cwd(), "public", "audio", `${finalFilename}.mp3`);
    
    // Simple concatenation: combine all audio buffers
    console.log(`Combining ${segmentFiles.length} audio segments...`);
    
    if (segmentFiles.length === 1) {
      // Single segment, just copy it
      await fs.copyFile(segmentFiles[0], finalPath);
    } else {
      // Multiple segments: Use Node.js to combine audio properly
      try {
        // Create a simple concatenation approach for MP3 files
        // Read all segments and write them sequentially
        const writeStream = require('fs').createWriteStream(finalPath);
        
        for (const segmentFile of segmentFiles) {
          const segmentBuffer = await fs.readFile(segmentFile);
          writeStream.write(segmentBuffer);
        }
        
        writeStream.end();
        
        // Wait for write stream to finish
        await new Promise((resolve, reject) => {
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });
        
      } catch (combineError) {
        console.error('Error combining audio files:', combineError);
        // Emergency fallback: copy first file
        await fs.copyFile(segmentFiles[0], finalPath);
      }
    }
    
    // Clean up segment files
    for (const segmentFile of segmentFiles) {
      try {
        await fs.unlink(segmentFile);
      } catch (error) {
        console.warn('Could not delete segment file:', segmentFile);
      }
    }
    
    console.log('Two-host audio generated successfully');
    return `/audio/${finalFilename}.mp3`;
    
  } catch (error) {
    console.error('Error generating two-host audio:', error);
    throw error; // Don't fallback to single voice - show the actual error
  }
}

async function generateOpenAIAudioAsBuffer(text: string, voice: string = 'alloy'): Promise<Buffer> {
  try {
    console.log(`[OpenAI TTS] CRITICAL: Generating audio with voice: ${voice} for text: "${text.substring(0, 50)}..."`);
    console.log(`[OpenAI TTS] Voice parameter received: "${voice}"`);
    
    // Validate voice is one of the allowed OpenAI voices
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    if (!validVoices.includes(voice.toLowerCase())) {
      console.error(`INVALID VOICE: ${voice} not in allowed voices:`, validVoices);
      throw new Error(`Invalid voice selection: ${voice}. Must be one of: ${validVoices.join(', ')}`);
    }
    
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: voice.toLowerCase()
      })
    });
    
    console.log(`[OpenAI TTS] API request sent with voice: ${voice.toLowerCase()}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI TTS API error: ${response.status} - ${errorText}`);
    }

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    console.error('Error generating speech buffer with OpenAI:', error);
    throw error;
  }
}

async function generateOpenAIAudio(text: string, voice: string = 'alloy', filename?: string): Promise<string> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('SINGLE VOICE: Calling OpenAI TTS API');
    console.log('SINGLE VOICE: Using voice:', voice);
    console.log('SINGLE VOICE: Text length:', text.length);
    
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: voice.toLowerCase()
      })
    });
    
    console.log(`SINGLE VOICE: API request sent with voice: ${voice.toLowerCase()}`);

    console.log('OpenAI TTS API response status:', response.status);
    console.log('OpenAI TTS API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI TTS API error response:', errorText);
      throw new Error(`OpenAI TTS API error: ${response.status} - ${errorText}`);
    }

    // Get audio buffer
    const buffer = await response.arrayBuffer();
    console.log('Audio generated successfully, buffer size:', buffer.byteLength);

    // Create filename if not provided
    if (!filename) {
      filename = `podcast_${Date.now()}`;
    }

    // Save to public/audio directory
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "public", "audio", `${filename}.mp3`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, Buffer.from(buffer));
    console.log('Audio file saved to:', filePath);

    // Return the public URL path
    return `/audio/${filename}.mp3`;
  } catch (error) {
    console.error('Error generating speech with OpenAI:', error);
    throw error;
  }
}

export async function rewriteText(request: TextProcessingRequest): Promise<string> {
  const systemPrompt = "You are an expert editor and writer. Rewrite the given text according to the user's instructions while maintaining the core meaning and improving clarity, style, and effectiveness. Output ONLY plain text without any markdown, formatting, asterisks, or special characters.";
  
  const prompt = `Please rewrite the following text according to these instructions: "${request.customInstructions || 'Improve clarity and style while maintaining the original meaning'}"

Original text:
${request.selectedText}

Provide only the rewritten text as plain text without any markdown formatting, asterisks, bold text, or special characters. No additional commentary.`;

  const result = await callAI(request.provider, prompt, systemPrompt);
  
  // Remove any remaining markdown formatting
  return result
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold
    .replace(/\*(.*?)\*/g, '$1')       // Remove italic
    .replace(/#{1,6}\s/g, '')         // Remove headers
    .replace(/`(.*?)`/g, '$1')        // Remove code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .trim();
}

export async function generateStudyGuide(request: TextProcessingRequest): Promise<string> {
  const systemPrompt = "You are an expert educator. Create comprehensive study guides that help students understand and learn complex material effectively. Output ONLY plain text without any markdown, formatting, asterisks, or special characters.";
  
  const prompt = `Create a comprehensive study guide for the following text. Include key concepts, important points, definitions, and study questions.

Text:
${request.selectedText}

Format the study guide as plain text with clear sections and simple bullet points using dashes or numbers. Do NOT use any markdown formatting, asterisks, bold text, or special characters.`;

  const result = await callAI(request.provider, prompt, systemPrompt);
  
  // Remove any remaining markdown formatting
  return result
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold
    .replace(/\*(.*?)\*/g, '$1')       // Remove italic
    .replace(/#{1,6}\s/g, '')         // Remove headers
    .replace(/`(.*?)`/g, '$1')        // Remove code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .trim();
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
  
  // Handle very long content by chunking if necessary
  let textToProcess = request.selectedText;
  const maxLength = 15000; // Reasonable length for AI processing
  
  if (textToProcess.length > maxLength) {
    // For very long content, extract key sections and summarize
    const sections = textToProcess.split(/\n\s*\n/).filter(section => section.trim().length > 50);
    const importantSections = sections.slice(0, Math.floor(maxLength / 300)); // Take first several sections
    textToProcess = importantSections.join('\n\n');
    
    if (textToProcess.length > maxLength) {
      textToProcess = textToProcess.substring(0, maxLength) + '...';
    }
  }

  // Configure prompts based on podcast mode
  switch (mode) {
    case 'normal-one':
      systemPrompt = "You are an expert podcast host. Create engaging, conversational podcast content with a single narrator that makes complex topics accessible and interesting. Write in a natural speaking style with smooth transitions. Output ONLY plain text without any markdown, formatting, asterisks, or special characters.";
      prompt = `Create a single-host podcast episode based on the following text. Write as a solo narrator speaking directly to listeners. Do NOT use any markdown formatting, asterisks, bold text, headers with #, or special characters:

Text to discuss:
${textToProcess}

Create a complete podcast script with:
- Engaging introduction
- Clear explanation of key concepts
- Conclusion with key takeaways

Keep it conversational and accessible. For longer content, create a comprehensive podcast that covers all key points while maintaining engagement.`;
      hosts = [{ name: "Alex", role: "Host" }];
      break;

    case 'normal-two':
      systemPrompt = "You are creating a two-host podcast with natural conversation between hosts. Create engaging dialogue that makes complex topics accessible through discussion between two knowledgeable hosts. Use clear speaker labels but make the actual dialogue sound natural and conversational. Output ONLY plain text without any markdown, formatting, asterisks, or special characters.";
      prompt = `Create a two-host podcast episode based on the following text. Write it as a natural conversation between two hosts - Alex and Sam. Use ALEX: and SAM: to indicate who is speaking, but make the actual dialogue sound natural without referring to "Host 1" or "Host 2". Do NOT use any markdown formatting, asterisks, bold text, headers with #, or special characters:

Text to discuss:
${textToProcess}

Create a complete podcast script with:
- ALEX: Welcome and introduction
- Natural back-and-forth discussion between Alex and Sam
- SAM: Conclusion and wrap-up

Format each line as "ALEX:" or "SAM:" followed by their natural dialogue. Make it conversational and engaging. For longer content, create a comprehensive discussion that covers all key points while maintaining natural dialogue flow.`;
      hosts = [
        { name: "Alex", role: "Host" },
        { name: "Sam", role: "Co-Host" }
      ];
      break;

    case 'custom-one':
      systemPrompt = `You are an expert podcast host. Create engaging, conversational podcast content with a single narrator. Output ONLY plain text without any markdown, formatting, asterisks, or special characters. ${request.podcastInstructions}`;
      prompt = `Create a single-host podcast episode based on the following text. Follow these custom instructions: ${request.podcastInstructions}. Do NOT use any markdown formatting, asterisks, bold text, headers with #, or special characters.

Text to discuss:
${textToProcess}

Create a complete podcast script following the custom instructions provided. Keep it engaging and accessible.`;
      hosts = [{ name: "Alex", role: "Host" }];
      break;

    case 'custom-two':
      systemPrompt = `You are creating a two-host podcast with natural conversation between hosts. Use clear speaker labels but make the actual dialogue sound natural and conversational. Output ONLY plain text without any markdown, formatting, asterisks, or special characters. ${request.podcastInstructions}`;
      prompt = `Create a two-host podcast episode based on the following text. Follow these custom instructions: ${request.podcastInstructions}. Write it as a natural conversation between two hosts - Alex and Sam. Use ALEX: and SAM: to indicate who is speaking. Do NOT use any markdown formatting, asterisks, bold text, headers with #, or special characters.

Text to discuss:
${textToProcess}

Format as a natural conversation between Alex and Sam. Each line should start with "ALEX:" or "SAM:" followed by their natural dialogue. Follow the custom instructions provided.`;
      hosts = [
        { name: "Alex", role: "Host" },
        { name: "Sam", role: "Co-Host" }
      ];
      break;
  }

  const rawScriptResponse = await callAI(request.provider, prompt, systemPrompt);
  
  // Strip all markdown formatting from the script
  const scriptResponse = rawScriptResponse
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold
    .replace(/\*(.*?)\*/g, '$1')       // Remove italic
    .replace(/#{1,6}\s/g, '')         // Remove headers
    .replace(/`(.*?)`/g, '$1')        // Remove code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/\-{3,}/g, '')           // Remove horizontal lines
    .trim();
    
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
    console.log('Second voice selection:', request.secondVoiceSelection);
    console.log('Podcast mode:', mode);
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `podcast_${timestamp}`;
      
      // For two-person podcasts, use different voices and combine them
      if (mode.includes('two')) {
        audioUrl = await generateTwoHostAudio(finalScript, request.voiceSelection, request.secondVoiceSelection || 'echo', filename);
      } else {
        audioUrl = await generateOpenAIAudio(finalScript, request.voiceSelection, filename);
      }
      
      console.log('Audio URL generated:', audioUrl);
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
    // Clean up any markdown in the parsed results
    const cleanThesis = (parsed.thesis || 'Main thesis not identified')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/`(.*?)`/g, '$1')
      .trim();
      
    const cleanSummary = (parsed.summary || 'Summary not available')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/`(.*?)`/g, '$1')
      .trim();
    
    return {
      thesis: cleanThesis,
      summary: cleanSummary
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
  const systemPrompt = "You are a philosophical and analytical expert. Provide deep, nuanced analysis of theses and their implications. Output ONLY plain text without any markdown, formatting, asterisks, or special characters.";
  
  const prompt = `Provide a deep analytical discussion of the main thesis in the following text. Explore its implications, assumptions, potential criticisms, and broader significance.

Text:
${request.selectedText}

Format your response as plain text with clear sections and simple bullet points using dashes or numbers. Do NOT use any markdown formatting, asterisks, bold text, headers with #, or special characters.`;

  const result = await callAI(request.provider, prompt, systemPrompt);
  
  // Remove any remaining markdown formatting
  return result
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold
    .replace(/\*(.*?)\*/g, '$1')       // Remove italic
    .replace(/#{1,6}\s/g, '')         // Remove headers
    .replace(/`(.*?)`/g, '$1')        // Remove code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .trim();
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