# Deployment Setup Guide

## Required Environment Variables

The application requires the following API keys to be configured in your deployment environment:

### Required for Core Functionality
- `OPENAI_API_KEY` - Required for TTS audio generation and AI functions
- `DATABASE_URL` - Automatically configured by Render for PostgreSQL

### Optional (for additional AI providers)
- `ANTHROPIC_API_KEY` - For Claude AI support
- `PERPLEXITY_API_KEY` - For Perplexity AI support  
- `DEEPSEEK_API_KEY` - For DeepSeek AI support

### Legacy (not currently used)
- `AZURE_SPEECH_ENDPOINT` - Legacy Azure Speech Services
- `AZURE_SPEECH_KEY` - Legacy Azure Speech Services
- `AZURE_SPEECH_REGION` - Legacy Azure Speech Services
- `GOOGLE_SPEECH_API_KEY` - Legacy Google Speech Services

## Render Deployment Steps

1. **Deploy to Render**
   - Push your code to GitHub
   - Connect your GitHub repository to Render
   - Use the provided `render.yaml` configuration

2. **Configure Environment Variables**
   - In Render dashboard, go to your service settings
   - Add the following environment variables:
     - `OPENAI_API_KEY` - Your OpenAI API key (required)
     - `ANTHROPIC_API_KEY` - Your Anthropic API key (optional)
     - `PERPLEXITY_API_KEY` - Your Perplexity API key (optional)
     - `DEEPSEEK_API_KEY` - Your DeepSeek API key (optional)

3. **Database Setup**
   - Database will be automatically created and configured
   - `DATABASE_URL` will be automatically set

4. **Deploy**
   - Render will automatically build and deploy your application
   - The health check endpoint is configured at `/api/journal`

## API Key Requirements

- **Minimum**: `OPENAI_API_KEY` is required for:
  - Text-to-speech audio generation
  - AI-powered content processing
  - Podcast creation

- **Optional**: Other API keys enable additional AI provider options in the interface

## Troubleshooting

If deployment fails:

1. **Check Build Logs**: Look for specific error messages in Render deployment logs
2. **Verify API Keys**: Ensure required environment variables are set
3. **Database Connection**: Verify DATABASE_URL is properly configured
4. **Health Check**: The app should respond at `/api/journal` endpoint

## Local Development

For local development, create a `.env` file with your API keys:

```env
DATABASE_URL=your_local_database_url
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
PERPLEXITY_API_KEY=your_perplexity_key
DEEPSEEK_API_KEY=your_deepseek_key
```

Run the application with:
```bash
npm run dev
```