// Speech synthesis services for podcast generation
import axios from 'axios';

export interface SpeechConfig {
  provider: 'azure' | 'google';
  voice: string;
  speed: number;
  pitch: number;
}

export async function generateAudio(text: string, config: SpeechConfig): Promise<string> {
  try {
    if (config.provider === 'azure') {
      return await generateAzureAudio(text, config);
    } else if (config.provider === 'google') {
      return await generateGoogleAudio(text, config);
    }
    throw new Error(`Unsupported speech provider: ${config.provider}`);
  } catch (error) {
    console.error('Error generating audio:', error);
    throw new Error(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function generateAzureAudio(text: string, config: SpeechConfig): Promise<string> {
  const endpoint = process.env.AZURE_SPEECH_ENDPOINT;
  const apiKey = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!endpoint || !apiKey || !region) {
    throw new Error('Azure Speech credentials not configured');
  }

  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
      <voice name="${config.voice || 'en-US-AriaNeural'}">
        <prosody rate="${config.speed || 1.0}" pitch="${config.pitch || 0}%">
          ${text}
        </prosody>
      </voice>
    </speak>
  `;

  const response = await axios.post(
    `${endpoint}/cognitiveservices/v1`,
    ssml,
    {
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
      },
      responseType: 'arraybuffer'
    }
  );

  const fs = await import('fs/promises');
  const path = await import('path');

  const filename = 'test-podcast';
  const audioPath = path.join(process.cwd(), 'public', 'audio', `${filename}.mp3`);
  await fs.mkdir(path.dirname(audioPath), { recursive: true });
  await fs.writeFile(audioPath, response.data);

  return `/audio/${filename}.mp3`;
}

async function generateGoogleAudio(text: string, config: SpeechConfig): Promise<string> {
  const apiKey = process.env.GOOGLE_SPEECH_API_KEY;

  if (!apiKey) {
    throw new Error('Google Speech API key not configured');
  }

  const response = await axios.post(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: config.voice || 'en-US-Wavenet-D',
        ssmlGender: 'NEUTRAL'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: config.speed || 1.0,
        pitch: config.pitch || 0
      }
    }
  );

  if (response.data?.audioContent) {
    return `data:audio/mp3;base64,${response.data.audioContent}`;
  }

  throw new Error('Failed to generate audio with Google Speech API');
}

export const VOICE_OPTIONS = {
  azure: [
    { value: 'en-US-AriaNeural', label: 'Aria (Female, US)' },
    { value: 'en-US-DavisNeural', label: 'Davis (Male, US)' },
    { value: 'en-US-ElizabethNeural', label: 'Elizabeth (Female, US)' },
    { value: 'en-US-GuyNeural', label: 'Guy (Male, US)' },
    { value: 'en-US-JennyNeural', label: 'Jenny (Female, US)' },
    { value: 'en-US-MichelleNeural', label: 'Michelle (Female, US)' },
    { value: 'en-US-RogerNeural', label: 'Roger (Male, US)' },
    { value: 'en-US-SteffanNeural', label: 'Steffan (Male, US)' }
  ],
  google: [
    { value: 'en-US-Wavenet-A', label: 'Wavenet A (Female)' },
    { value: 'en-US-Wavenet-B', label: 'Wavenet B (Male)' },
    { value: 'en-US-Wavenet-C', label: 'Wavenet C (Female)' },
    { value: 'en-US-Wavenet-D', label: 'Wavenet D (Male)' },
    { value: 'en-US-Wavenet-E', label: 'Wavenet E (Female)' },
    { value: 'en-US-Wavenet-F', label: 'Wavenet F (Male)' }
  ]
};
