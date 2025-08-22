import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { formatJournalHeader, parseMarkdown } from "@/lib/journal-utils";
import type { JournalIssue } from "@shared/schema";
import InteractiveJournal from "@/components/InteractiveJournal";
import { useState } from "react";
import type { AIProvider, TextProcessingRequest, TestQuestion, PodcastScript, CognitiveMap, SummaryThesis, SuggestedReadings } from "@shared/ai-services";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Download, Volume2, Loader2 } from "lucide-react";

export default function JournalIssuePage() {
  const params = useParams();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<any>(null);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({});
  // Extract Roman numeral from vol-i format and convert to number
  const volumeParam = params.volume?.replace('vol-', '');
  const issueParam = params.issue?.replace('no-', '');
  
  // Convert Roman to number (simple conversion for common cases)
  const romanToNumber = (roman: string): number => {
    const romanNumerals: { [key: string]: number } = {
      'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9, 'x': 10
    };
    return romanNumerals[roman.toLowerCase()] || parseInt(roman) || 0;
  };
  
  const volume = volumeParam ? romanToNumber(volumeParam) : null;
  const issue = issueParam ? parseInt(issueParam) : null;

  const { data: journalIssue, isLoading, error } = useQuery<JournalIssue>({
    queryKey: ["/api/journal", volume, issue],
    queryFn: async () => {
      const response = await fetch(`/api/journal/${volume}/${issue}`);
      if (!response.ok) {
        throw new Error("Failed to fetch journal issue");
      }
      return response.json();
    },
    enabled: volume !== null && issue !== null,
  });

  if (volume === null || issue === null) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-red-600">Invalid journal issue URL</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading journal issue...</div>
        </div>
      </div>
    );
  }

  if (error || !journalIssue) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/journal" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Journal
          </Link>
          <div className="text-center text-red-600">Journal issue not found</div>
        </div>
      </div>
    );
  }

  // Format the publication date
  const publishedDate = new Date(journalIssue.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedHeader = formatJournalHeader(
    journalIssue.volume,
    journalIssue.issue,
    journalIssue.year,
    publishedDate
  );

  // Function to process entire article with AI
  const processFullArticleWithAI = async (action: string) => {
    if (!journalIssue?.body) {
      toast({
        title: "No content available",
        description: "Article content is not available.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const request: TextProcessingRequest = {
        selectedText: journalIssue.body,
        action: action as any,
        provider: 'openai' as AIProvider,
        includeAudio: action === 'podcast' ? true : false,
        voiceSelection: action === 'podcast' ? 'alloy' : undefined,
        podcastMode: action === 'podcast' ? 'normal-two' : undefined
      };

      const response = await fetch(`/api/ai/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to process ${action}`);
      }

      const data = await response.json();
      setModalContent(data);
      setShowModal(true);

    } catch (error) {
      console.error(`Error processing ${action}:`, error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [key]: true });
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const downloadAudio = async (audioUrl: string, filename: string = 'podcast.mp3') => {
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: "Podcast downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download podcast. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderModalContent = () => {
    if (!modalContent) {
      return <div className="p-4 text-center text-gray-500">No content available</div>;
    }

    // Determine action from modal content structure
    let actionType: string;
    if (modalContent.result && typeof modalContent.result === 'string') {
      if (modalContent.result.includes('# Study Guide')) {
        actionType = 'study-guide';
      } else if (modalContent.result.includes('thesis') || modalContent.result.includes('Thesis')) {
        actionType = 'thesis-deep-dive';
      } else {
        actionType = 'rewrite';
      }
    } else if (modalContent.questions) {
      actionType = 'test-me';
    } else if (modalContent.script || modalContent.audioUrl) {
      actionType = 'podcast';
    } else if (modalContent.map) {
      actionType = 'cognitive-map';
    } else if (modalContent.result && modalContent.result.thesis && modalContent.result.summary) {
      actionType = 'summary-thesis';
    } else if (modalContent.readings) {
      actionType = 'suggested-readings';
    } else {
      actionType = 'rewrite';
    }

    switch (actionType) {
      case 'rewrite':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Rewritten Text</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(modalContent.result, 'rewrite')}
              >
                {copiedStates.rewrite ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="whitespace-pre-wrap">{modalContent.result}</p>
            </div>
          </div>
        );

      case 'study-guide':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Study Guide</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(modalContent.result, 'study-guide')}
              >
                {copiedStates['study-guide'] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="whitespace-pre-wrap">{modalContent.result}</div>
            </div>
          </div>
        );

      case 'test-me':
        const questions: TestQuestion[] = modalContent.questions || [];
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Questions</h3>
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <p className="font-medium mb-3">{question.question}</p>
                  {question.type === 'multiple-choice' && question.options ? (
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            onChange={(e) => setTestAnswers({ ...testAnswers, [index]: e.target.value })}
                            className="text-blue-600"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <Textarea
                      placeholder="Enter your answer..."
                      value={testAnswers[index] || ''}
                      onChange={(e) => setTestAnswers({ ...testAnswers, [index]: e.target.value })}
                      className="mt-2"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'podcast':
        const script: PodcastScript = modalContent.script || {};
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{script.title}</h3>
            <Badge variant="secondary">Duration: {script.estimatedDuration}</Badge>
            
            {modalContent.audioUrl && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4" />
                    <span className="font-medium">Audio Version</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAudio(modalContent.audioUrl, `podcast-${Date.now()}.mp3`)}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
                <audio controls className="w-full" preload="metadata">
                  <source src={modalContent.audioUrl} type="audio/mpeg" />
                  <source src={modalContent.audioUrl} type="audio/mp3" />
                  Your browser does not support audio playback.
                </audio>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Introduction</h4>
                <p className="text-gray-700">{script.introduction}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Main Content</h4>
                <div className="text-gray-700 whitespace-pre-wrap">{script.mainContent}</div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Conclusion</h4>
                <p className="text-gray-700">{script.conclusion}</p>
              </div>
            </div>
          </div>
        );

      case 'cognitive-map':
        const map: CognitiveMap = modalContent.map;
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cognitive Map</h3>
            
            {/* Visual Node Map */}
            <div className="relative bg-gray-50 rounded-lg border overflow-hidden" style={{ height: '600px', width: '100%', maxWidth: '800px' }}>
              <svg width="800" height="600" className="absolute inset-0">
                {/* Render connections first (behind nodes) */}
                {map.connections?.map((connection, i) => {
                  const fromNode = map.nodes?.find(n => n.id === connection.from);
                  const toNode = map.nodes?.find(n => n.id === connection.to);
                  if (!fromNode || !toNode) return null;
                  
                  return (
                    <g key={i}>
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke={connection.type === 'strong' ? '#374151' : '#9CA3AF'}
                        strokeWidth={connection.type === 'strong' ? 2 : 1}
                        strokeDasharray={connection.type === 'weak' ? '5,5' : '0'}
                      />
                      <text
                        x={(fromNode.x + toNode.x) / 2}
                        y={(fromNode.y + toNode.y) / 2 - 5}
                        textAnchor="middle"
                        className="fill-gray-600 text-xs"
                      >
                        {connection.label}
                      </text>
                    </g>
                  );
                })}
                
                {/* Render nodes */}
                {map.nodes?.map((node) => {
                  const radius = node.type === 'central' ? 70 : node.type === 'primary' ? 55 : 40;
                  const maxCharsPerLine = node.type === 'central' ? 12 : node.type === 'primary' ? 10 : 8;
                  const words = node.label.split(' ');
                  const lines = [];
                  let currentLine = '';
                  
                  // Wrap text into lines
                  for (const word of words) {
                    if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
                      currentLine = currentLine ? currentLine + ' ' + word : word;
                    } else {
                      if (currentLine) lines.push(currentLine);
                      currentLine = word;
                    }
                  }
                  if (currentLine) lines.push(currentLine);
                  
                  // Limit to 3 lines max
                  if (lines.length > 3) {
                    lines.splice(2);
                    lines[2] = lines[2].substring(0, maxCharsPerLine - 3) + '...';
                  }
                  
                  return (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius}
                        fill={node.color}
                        stroke="#fff"
                        strokeWidth="3"
                        className="cursor-pointer hover:opacity-80"
                      />
                      {lines.map((line, i) => (
                        <text
                          key={i}
                          x={node.x}
                          y={node.y + (i - (lines.length - 1) / 2) * 14}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-white font-medium pointer-events-none"
                          style={{ fontSize: node.type === 'central' ? '13px' : node.type === 'primary' ? '11px' : '10px' }}
                        >
                          {line}
                        </text>
                      ))}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        );

      case 'summary-thesis':
        const summaryThesis: SummaryThesis = modalContent.result;
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Summary + Thesis</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Summary</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-wrap">{summaryThesis.summary}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Thesis Statement</h4>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">{summaryThesis.thesis}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'thesis-deep-dive':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Thesis Deep Dive</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(modalContent.result, 'thesis-deep-dive')}
              >
                {copiedStates['thesis-deep-dive'] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="whitespace-pre-wrap">{modalContent.result}</div>
            </div>
          </div>
        );

      case 'suggested-readings':
        const readings: SuggestedReadings = modalContent.readings;
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Suggested Readings</h3>
            <div className="space-y-4">
              {readings.categories?.map((category, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-blue-700">{category.name}</h4>
                  <div className="space-y-2">
                    {category.books?.map((book, bookIndex) => (
                      <div key={bookIndex} className="pl-4 border-l-2 border-blue-200">
                        <p className="font-medium">{book.title}</p>
                        <p className="text-sm text-gray-600">by {book.author}</p>
                        {book.reason && <p className="text-sm text-gray-700 mt-1">{book.reason}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div className="p-4 text-center text-gray-500">Unknown content type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Zhi Systems
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/journal" className="text-blue-600 hover:text-blue-800">
              Journal
            </Link>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 pb-6 border-b border-gray-200">
          <pre className="font-serif text-lg leading-relaxed text-gray-900 whitespace-pre-line">
            {formattedHeader}
          </pre>
        </header>

        {/* Interactive Article Body */}
        <div className="prose prose-lg max-w-none">
          <InteractiveJournal 
            content={journalIssue.body}
            issueId={journalIssue.id}
            title={journalIssue.title}
          />
        </div>

        {/* Individual AI Function Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Functions for Full Article</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button 
              className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => processFullArticleWithAI('rewrite')}
              disabled={isProcessing}
            >
              <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm font-medium text-blue-700 text-center">
                {isProcessing ? (
                  <div className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  'Create Full Rewrite'
                )}
              </span>
            </button>

            <button 
              className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors group"
              onClick={() => processFullArticleWithAI('study-guide')}
              disabled={isProcessing}
            >
              <svg className="w-6 h-6 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-sm font-medium text-green-700 text-center">Create Full Study Guide</span>
            </button>

            <button 
              className="flex flex-col items-center justify-center p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors group"
              onClick={() => processFullArticleWithAI('test-me')}
              disabled={isProcessing}
            >
              <svg className="w-6 h-6 text-red-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-red-700 text-center">Create Full Test Me</span>
            </button>

            <button 
              className="flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors group"
              onClick={() => processFullArticleWithAI('podcast')}
              disabled={isProcessing}
            >
              <svg className="w-6 h-6 text-orange-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="text-sm font-medium text-orange-700 text-center">Create Full Podcast</span>
            </button>

            <button 
              className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors group"
              onClick={() => processFullArticleWithAI('cognitive-map')}
              disabled={isProcessing}
            >
              <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-sm font-medium text-purple-700 text-center">Create Full Cognitive Map</span>
            </button>

            <button 
              className="flex flex-col items-center justify-center p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors group"
              onClick={() => processFullArticleWithAI('summary-thesis')}
              disabled={isProcessing}
            >
              <svg className="w-6 h-6 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium text-indigo-700 text-center">Create Full Summary + Thesis</span>
            </button>

            <button 
              className="flex flex-col items-center justify-center p-4 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-colors group"
              onClick={() => processFullArticleWithAI('thesis-deep-dive')}
              disabled={isProcessing}
            >
              <svg className="w-6 h-6 text-yellow-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-sm font-medium text-yellow-700 text-center">Create Full Thesis Deep Dive</span>
            </button>

            <button 
              className="flex flex-col items-center justify-center p-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors group"
              onClick={() => processFullArticleWithAI('suggested-readings')}
              disabled={isProcessing}
            >
              <svg className="w-6 h-6 text-teal-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-sm font-medium text-teal-700 text-center">Create Full Suggested Readings</span>
            </button>
          </div>
        </div>

        {/* Results Modal */}
        <Dialog open={showModal} onOpenChange={(open) => {
          setShowModal(open);
          if (!open) {
            setModalContent(null);
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {(() => {
                  if (!modalContent) return 'AI Result';
                  
                  if (modalContent.result && typeof modalContent.result === 'string') {
                    if (modalContent.result.includes('# Study Guide')) return 'Study Guide';
                    if (modalContent.result.includes('thesis') || modalContent.result.includes('Thesis')) return 'Thesis Deep Dive';
                    return 'Rewritten Text';
                  } else if (modalContent.questions) return 'Test Questions';
                  else if (modalContent.script || modalContent.audioUrl) return 'AI Generated Podcast';
                  else if (modalContent.map) return 'Cognitive Map';
                  else if (modalContent.result && modalContent.result.thesis) return 'Summary + Thesis';
                  else if (modalContent.readings) return 'Suggested Readings';
                  else return 'AI Result';
                })()}
              </DialogTitle>
            </DialogHeader>
            {renderModalContent()}
          </DialogContent>
        </Dialog>

        {/* Tags */}
        {journalIssue.tags && journalIssue.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {journalIssue.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back Navigation */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <Link 
            href="/journal"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Journal
          </Link>
        </div>
      </article>
    </div>
  );
}