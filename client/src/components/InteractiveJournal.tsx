import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  BookOpen, 
  TestTube, 
  Podcast, 
  Brain, 
  Target, 
  Lightbulb, 
  BookOpenCheck,
  Play,
  Volume2,
  Loader2,
  Copy,
  Check,
  Download,
  Minimize2,
  Maximize2,
  Move
} from 'lucide-react';
import type { 
  AIProvider, 
  TextProcessingRequest, 
  TestQuestion, 
  PodcastScript, 
  CognitiveMap, 
  SummaryThesis, 
  SuggestedReadings 
} from '@shared/ai-services';
import { useToast } from '@/hooks/use-toast';

interface InteractiveJournalProps {
  content: string;
  issueId: string;
  title: string;
}

type ActionType = 'rewrite' | 'study-guide' | 'test' | 'podcast' | 'cognitive-map' | 'summary-thesis' | 'thesis-deep-dive' | 'suggested-readings';

interface ActionButton {
  action: ActionType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const ACTION_BUTTONS: ActionButton[] = [
  { action: 'rewrite', label: 'Rewrite', icon: <FileText className="w-4 h-4" />, color: 'bg-blue-500 hover:bg-blue-600' },
  { action: 'study-guide', label: 'Study Guide', icon: <BookOpen className="w-4 h-4" />, color: 'bg-green-500 hover:bg-green-600' },
  { action: 'test', label: 'Test Me', icon: <TestTube className="w-4 h-4" />, color: 'bg-purple-500 hover:bg-purple-600' },
  { action: 'podcast', label: 'Podcast', icon: <Podcast className="w-4 h-4" />, color: 'bg-orange-500 hover:bg-orange-600' },
  { action: 'cognitive-map', label: 'Cognitive Map', icon: <Brain className="w-4 h-4" />, color: 'bg-pink-500 hover:bg-pink-600' },
  { action: 'summary-thesis', label: 'Summary+Thesis', icon: <Target className="w-4 h-4" />, color: 'bg-indigo-500 hover:bg-indigo-600' },
  { action: 'thesis-deep-dive', label: 'Thesis Deep Dive', icon: <Lightbulb className="w-4 h-4" />, color: 'bg-yellow-500 hover:bg-yellow-600' },
  { action: 'suggested-readings', label: 'Suggested Readings', icon: <BookOpenCheck className="w-4 h-4" />, color: 'bg-teal-500 hover:bg-teal-600' }
];

export default function InteractiveJournal({ content, issueId, title }: InteractiveJournalProps) {
  const [selectedText, setSelectedText] = useState('');
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('openai');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<ActionType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<any>(null);
  const [customInstructions, setCustomInstructions] = useState('');
  const [includeAudio, setIncludeAudio] = useState(true); // Default to true for podcasts
  const [voiceSelection, setVoiceSelection] = useState('alloy'); // Use OpenAI-style voice names
  const [secondVoiceSelection, setSecondVoiceSelection] = useState('echo'); // Second voice for two-host mode
  const [voiceOptions, setVoiceOptions] = useState<any>({ azure: [], google: [] });
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
  const [podcastMode, setPodcastMode] = useState<'normal-one' | 'normal-two' | 'custom-one' | 'custom-two'>('normal-two');
  const [podcastInstructions, setPodcastInstructions] = useState('');
  const [useEntireArticle, setUseEntireArticle] = useState(false);
  const [isRunningFullAnalysis, setIsRunningFullAnalysis] = useState(false);
  const [fullAnalysisResults, setFullAnalysisResults] = useState<any>(null);
  const [showFullAnalysisModal, setShowFullAnalysisModal] = useState(false);

  // Download audio file function
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
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({});

  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Function to run comprehensive AI analysis (all 8 functions)
  const runFullArticleAnalysis = async () => {
    if (!content || content.trim().length === 0) {
      toast({
        title: "Error",
        description: "No content available for analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsRunningFullAnalysis(true);
    const results: any = {};

    try {
      // Run all 8 AI functions in parallel
      const analysisPromises = [
        // 1. Rewrite
        fetch('/api/ai/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: content,
            provider: selectedProvider,
            instructions: 'Rewrite this academic article to improve clarity and flow while maintaining all key arguments and evidence.'
          })
        }).then(r => r.json()).then(data => ({ type: 'rewrite', data })),

        // 2. Study Guide
        fetch('/api/ai/study-guide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: content,
            provider: selectedProvider
          })
        }).then(r => r.json()).then(data => ({ type: 'study-guide', data })),

        // 3. Test Me
        fetch('/api/ai/test-me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: content,
            provider: selectedProvider
          })
        }).then(r => r.json()).then(data => ({ type: 'test-me', data })),

        // 4. Cognitive Map
        fetch('/api/ai/cognitive-map', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: content,
            provider: selectedProvider
          })
        }).then(r => r.json()).then(data => ({ type: 'cognitive-map', data })),

        // 5. Summary + Thesis
        fetch('/api/ai/summary-thesis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: content,
            provider: selectedProvider
          })
        }).then(r => r.json()).then(data => ({ type: 'summary-thesis', data })),

        // 6. Thesis Deep Dive
        fetch('/api/ai/thesis-deep-dive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: content,
            provider: selectedProvider
          })
        }).then(r => r.json()).then(data => ({ type: 'thesis-deep-dive', data })),

        // 7. Suggested Readings
        fetch('/api/ai/suggested-readings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: content,
            provider: selectedProvider
          })
        }).then(r => r.json()).then(data => ({ type: 'suggested-readings', data })),

        // 8. Podcast
        fetch('/api/ai/podcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: content,
            provider: selectedProvider,
            includeAudio: true,
            voiceSelection: voiceSelection,
            secondVoiceSelection: secondVoiceSelection,
            mode: podcastMode,
            customInstructions: ''
          })
        }).then(r => r.json()).then(data => ({ type: 'podcast', data }))
      ];

      const analysisResults = await Promise.all(analysisPromises);
      
      // Organize results by type
      analysisResults.forEach(({ type, data }) => {
        results[type] = data;
      });

      setFullAnalysisResults(results);
      setShowFullAnalysisModal(true);
      
      toast({
        title: "Success",
        description: "Complete AI analysis generated successfully!",
      });

    } catch (error) {
      console.error('Error running full analysis:', error);
      toast({
        title: "Error",
        description: "Failed to generate complete analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunningFullAnalysis(false);
    }
  };

  useEffect(() => {
    // Load voice options
    fetch('/api/voice-options')
      .then(res => res.json())
      .then(data => setVoiceOptions(data))
      .catch(console.error);
  }, []);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const text = selection.toString().trim();
      setSelectedText(text);
      
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setToolbarPosition({
        x: rect.left + (rect.width / 2),
        y: rect.top - 60
      });
      
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
      setSelectedText('');
    }
  };

  const processWithAI = async (action: ActionType, useEntireArticle = false) => {
    const textToProcess = useEntireArticle ? content : selectedText;
    
    if (!textToProcess) {
      toast({
        title: useEntireArticle ? "No content available" : "No text selected",
        description: useEntireArticle ? "Article content is not available." : "Please select some text first.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const request: TextProcessingRequest = {
        selectedText: textToProcess,
        action,
        provider: selectedProvider,
        customInstructions: action === 'rewrite' ? customInstructions : undefined,
        includeAudio: action === 'podcast' ? true : false, // Always generate audio for podcasts
        voiceSelection: action === 'podcast' ? voiceSelection : undefined,
        secondVoiceSelection: action === 'podcast' && (podcastMode === 'normal-two' || podcastMode === 'custom-two') ? secondVoiceSelection : undefined,
        podcastMode: action === 'podcast' ? podcastMode : undefined,
        podcastInstructions: action === 'podcast' && (podcastMode === 'custom-one' || podcastMode === 'custom-two') ? podcastInstructions : undefined
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
      
      // For rewrite and podcast actions, we need to transition from the config modal to results modal
      if (action === 'rewrite' || action === 'podcast') {
        // Set currentAction to null to close the config modal
        setCurrentAction(null);
        // Small delay to ensure proper modal transition
        setTimeout(() => {
          setShowModal(true);
        }, 100);
      } else {
        setShowModal(true);
      }
      
      setShowToolbar(false);

    } catch (error) {
      console.error(`Error processing ${action}:`, error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      // Don't clear currentAction until modal is closed
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

  const submitTest = async (questions: TestQuestion[]) => {
    try {
      const response = await fetch('/api/ai/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions, userAnswers: testAnswers })
      });

      const result = await response.json();
      setModalContent({ ...modalContent, testResult: result });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Could not submit test answers.",
        variant: "destructive"
      });
    }
  };

  const renderModalContent = () => {
    if (!modalContent) {
      return <div className="p-4 text-center text-gray-500">No content available</div>;
    }

    // Determine action from modal content structure
    let actionType: ActionType;
    if (modalContent.result && typeof modalContent.result === 'string') {
      // Could be rewrite, study-guide, thesis-deep-dive
      if (modalContent.result.includes('# Study Guide')) {
        actionType = 'study-guide';
      } else if (modalContent.result.includes('thesis') || modalContent.result.includes('Thesis')) {
        actionType = 'thesis-deep-dive';
      } else {
        actionType = 'rewrite';
      }
    } else if (modalContent.questions) {
      actionType = 'test';
    } else if (modalContent.script || modalContent.audioUrl) {
      actionType = 'podcast';
    } else if (modalContent.map) {
      actionType = 'cognitive-map';
    } else if (modalContent.result && modalContent.result.thesis && modalContent.result.summary) {
      actionType = 'summary-thesis';
    } else if (modalContent.readings) {
      actionType = 'suggested-readings';
    } else {
      actionType = currentAction || 'rewrite';
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

      case 'test':
        const questions: TestQuestion[] = modalContent.questions || [];
        const testResult = modalContent.testResult;
        
        if (testResult) {
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Results</h3>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-lg font-bold">Score: {testResult.score}%</p>
                <p>{testResult.feedback}</p>
              </div>
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <p className="font-medium mb-2">{question.question}</p>
                    <p className="text-sm text-gray-600">Your answer: {testAnswers[index]}</p>
                    <p className="text-sm text-green-600">Correct answer: {question.correctAnswer}</p>
                    <p className="text-sm mt-2">{question.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        }

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
            <Button 
              onClick={() => submitTest(questions)}
              className="w-full"
              disabled={Object.keys(testAnswers).length !== questions.length}
            >
              Submit Test
            </Button>
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
                <p className="text-sm text-blue-600 mt-2">
                  Generated using OpenAI TTS-1 with "{voiceSelection}" voice
                </p>
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
            
            <Button
              variant="outline"
              onClick={() => copyToClipboard(`${script.introduction}\n\n${script.mainContent}\n\n${script.conclusion}`, 'podcast')}
            >
              {copiedStates.podcast ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              Copy Script
            </Button>
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
                      {/* Connection label */}
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

            {/* Legend */}
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span>Central</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>Primary</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span>Secondary</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>Detail</span>
              </div>
            </div>

            {/* Key Insights */}
            {map.insights && map.insights.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-lg">
                <h5 className="font-semibold mb-2">Key Insights</h5>
                {map.insights.map((insight: string, index: number) => (
                  <p key={index} className="text-sm text-amber-800 mb-1">• {insight}</p>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => copyToClipboard(`Central Concept: ${map.centralConcept}\n\nNodes: ${map.nodes?.map(n => n.label).join(', ')}\n\nConnections: ${map.connections?.map(c => `${c.from} → ${c.to}: ${c.label}`).join('\n')}`, 'cognitive-map')}
            >
              {copiedStates['cognitive-map'] ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              Copy Map Data
            </Button>
          </div>
        );

      case 'summary-thesis':
        const summaryThesis: SummaryThesis = modalContent.result;
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Summary + Thesis</h3>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Thesis</h4>
              <p className="font-medium text-blue-900">{summaryThesis.thesis}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Summary</h4>
              <p className="text-gray-700">{summaryThesis.summary}</p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(summaryThesis.thesis, 'thesis')}
              >
                {copiedStates.thesis ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy Thesis
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(summaryThesis.summary, 'summary')}
              >
                {copiedStates.summary ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy Summary
              </Button>
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
                onClick={() => copyToClipboard(modalContent.result, 'deep-dive')}
              >
                {copiedStates['deep-dive'] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
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
            
            {readings.primarySources.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Primary Sources</h4>
                <div className="space-y-3">
                  {readings.primarySources.map((source, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium">{source.title}</h5>
                        <Badge variant={
                          source.difficulty === 'beginner' ? 'default' :
                          source.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                        }>
                          {source.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">by {source.author}</p>
                      <p className="text-sm">{source.relevance}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {readings.supplementaryReadings.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Supplementary Readings</h4>
                <div className="space-y-3">
                  {readings.supplementaryReadings.map((reading, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium">{reading.title}</h5>
                        <Badge variant="outline">{reading.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">by {reading.author}</p>
                      <p className="text-sm">{reading.relevance}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <div>Content not available</div>;
    }
  };

  // Add keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showToolbar || !selectedText || isProcessing) return;
      
      // Check for number keys 1-8 to trigger actions
      const actionIndex = parseInt(e.key) - 1;
      if (actionIndex >= 0 && actionIndex < ACTION_BUTTONS.length) {
        e.preventDefault();
        const button = ACTION_BUTTONS[actionIndex];
        if (button.action === 'rewrite') {
          setCurrentAction(button.action);
          setShowModal(true);
        } else {
          setCurrentAction(button.action);
          processWithAI(button.action);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showToolbar, selectedText, isProcessing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panelPosition.x,
      y: e.clientY - panelPosition.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    setPanelPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const renderToolbar = () => {
    if (!showToolbar || !selectedText) return null;

    const baseStyle = {
      left: `${toolbarPosition.x - 250 + panelPosition.x}px`,
      top: `${toolbarPosition.y + panelPosition.y}px`,
    };

    return (
      <div
        className={`fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-200 ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
        style={baseStyle}
      >
        {/* Drag Handle */}
        <div 
          className="flex items-center justify-between p-2 bg-gray-50 rounded-t-lg cursor-grab active:cursor-grabbing border-b"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600 font-medium">AI Functions</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0"
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </Button>
        </div>

        {/* Panel Content */}
        <div className={`transition-all duration-200 ${isMinimized ? 'h-0 overflow-hidden' : 'p-2'}`}>
          <div className="mb-2">
            <Label className="text-xs">AI Provider:</Label>
            <Select value={selectedProvider} onValueChange={(value: AIProvider) => setSelectedProvider(value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div
            className="grid grid-cols-2 gap-1"
            style={{
              maxWidth: '500px'
            }}
          >
            {ACTION_BUTTONS.map((button, index) => (
              <Button
                key={button.action}
                size="sm"
                className={`text-xs h-16 flex flex-col items-center justify-center gap-1 ${button.color} text-white relative`}
                onClick={() => {
                  setCurrentAction(button.action);
                  if (button.action === 'rewrite' || button.action === 'podcast') {
                    setShowModal(true);
                  } else {
                    processWithAI(button.action);
                  }
                }}
                disabled={isProcessing}
              >
                <div className="absolute top-1 left-1 text-xs bg-black bg-opacity-20 rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                {button.icon}
                <span className="text-[10px] leading-tight text-center">{button.label}</span>
              </Button>
            ))}
          </div>

          {isProcessing && (
            <div className="mt-2 flex items-center justify-center text-xs text-gray-600">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Processing...
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRewriteModal = () => {
    if (currentAction !== 'rewrite' || !showModal) return null;

    return (
      <Dialog open={showModal} onOpenChange={(open) => {
        setShowModal(open);
        if (!open) {
          setCurrentAction(null);
          setModalContent(null);
        }
      }}>
        <DialogContent className="max-w-2xl" aria-describedby="rewrite-description">
          <DialogHeader>
            <DialogTitle>Rewrite Text</DialogTitle>
          </DialogHeader>
          <div id="rewrite-description" className="sr-only">
            Provide custom instructions for rewriting your selected text
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-instructions">Custom Instructions</Label>
              <Textarea
                id="custom-instructions"
                placeholder="How would you like the text to be rewritten? (e.g., 'Make it more formal', 'Simplify for beginners', etc.)"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
                    e.preventDefault();
                    processWithAI('rewrite');
                  }
                }}
                className="mt-1"
              />
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => processWithAI('rewrite')} 
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Rewrite Text
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderPodcastModal = () => {
    if (currentAction !== 'podcast' || !showModal) return null;

    return (
      <Dialog open={showModal} onOpenChange={(open) => {
        setShowModal(open);
        if (!open) {
          setCurrentAction(null);
          setModalContent(null);
        }
      }}>
        <DialogContent className="max-w-3xl" aria-describedby="podcast-description">
          <DialogHeader>
            <DialogTitle>Create Podcast</DialogTitle>
          </DialogHeader>
          <div id="podcast-description" className="sr-only">
            Choose your podcast format and configuration
          </div>
          
          <div className="space-y-6">
            {/* Podcast Mode Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Podcast Mode</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Normal Mode (One Host) */}
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    podcastMode === 'normal-one' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setPodcastMode('normal-one')}
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      👤
                    </div>
                  </div>
                  <h4 className="font-semibold text-center mb-2">Normal Mode (One Host)</h4>
                  <p className="text-sm text-gray-600 text-center">Single narrator discussing the content</p>
                </div>

                {/* Normal Mode (Two Hosts) */}
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    podcastMode === 'normal-two' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setPodcastMode('normal-two')}
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      👥
                    </div>
                  </div>
                  <h4 className="font-semibold text-center mb-2">Normal Mode (Two Hosts)</h4>
                  <p className="text-sm text-gray-600 text-center">Two hosts having a conversation</p>
                </div>

                {/* Custom (One Host) */}
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    podcastMode === 'custom-one' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setPodcastMode('custom-one')}
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      👤⚙️
                    </div>
                  </div>
                  <h4 className="font-semibold text-center mb-2">Custom (One Host)</h4>
                  <p className="text-sm text-gray-600 text-center">Single host with custom instructions</p>
                </div>

                {/* Custom (Two Hosts) */}
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    podcastMode === 'custom-two' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setPodcastMode('custom-two')}
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      👥⚙️
                    </div>
                  </div>
                  <h4 className="font-semibold text-center mb-2">Custom (Two Hosts)</h4>
                  <p className="text-sm text-gray-600 text-center">Two hosts with custom instructions</p>
                </div>
              </div>
            </div>

            {/* Custom Instructions (if custom mode selected) */}
            {(podcastMode === 'custom-one' || podcastMode === 'custom-two') && (
              <div>
                <Label htmlFor="podcast-instructions">Custom Instructions</Label>
                <Textarea
                  id="podcast-instructions"
                  placeholder="Describe how you want the podcast to be structured, the tone, specific topics to focus on, etc."
                  value={podcastInstructions}
                  onChange={(e) => setPodcastInstructions(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>
            )}

            {/* Audio Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-audio"
                  checked={includeAudio}
                  onChange={(e) => setIncludeAudio(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="include-audio">Generate audio version</Label>
              </div>

              {includeAudio && (
                <div className="space-y-4">
                  {/* First Voice Selection */}
                  <div>
                    <Label htmlFor="voice-selection">
                      {(podcastMode === 'normal-two' || podcastMode === 'custom-two') ? 'Alex Voice (Host 1)' : 'Voice Selection'}
                    </Label>
                    <Select value={voiceSelection} onValueChange={setVoiceSelection}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                        <SelectItem value="echo">Echo (Male)</SelectItem>
                        <SelectItem value="fable">Fable (British Accent)</SelectItem>
                        <SelectItem value="onyx">Onyx (Deep Male)</SelectItem>
                        <SelectItem value="nova">Nova (Young Female)</SelectItem>
                        <SelectItem value="shimmer">Shimmer (Female)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Second Voice Selection - Only show for two-host modes */}
                  {(podcastMode === 'normal-two' || podcastMode === 'custom-two') && (
                    <div>
                      <Label htmlFor="second-voice-selection">Sam Voice (Host 2)</Label>
                      <Select value={secondVoiceSelection} onValueChange={setSecondVoiceSelection}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                          <SelectItem value="echo">Echo (Male)</SelectItem>
                          <SelectItem value="fable">Fable (British Accent)</SelectItem>
                          <SelectItem value="onyx">Onyx (Deep Male)</SelectItem>
                          <SelectItem value="nova">Nova (Young Female)</SelectItem>
                          <SelectItem value="shimmer">Shimmer (Female)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content Source Selection */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-3">Content Source</h4>
              <div className="space-y-3">
                <div 
                  className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                    !useEntireArticle ? 'border-blue-500 bg-white' : 'border-gray-200 bg-gray-50'
                  }`}
                  onClick={() => setUseEntireArticle(false)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-500 mt-0.5 flex items-center justify-center">
                      {!useEntireArticle && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                    </div>
                    <div>
                      <div className="font-medium">Selected Text</div>
                      <div className="text-sm text-gray-600">
                        "{selectedText.substring(0, 150)}{selectedText.length > 150 ? '...' : ''}"
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedText.length} characters selected
                      </div>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                    useEntireArticle ? 'border-blue-500 bg-white' : 'border-gray-200 bg-gray-50'
                  }`}
                  onClick={() => setUseEntireArticle(true)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-500 mt-0.5 flex items-center justify-center">
                      {useEntireArticle && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                    </div>
                    <div>
                      <div className="font-medium">Entire Article</div>
                      <div className="text-sm text-gray-600">"{title}"</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {content.length} characters total
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Script Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Generated Script</h4>
              <div className="text-sm text-gray-600 space-y-2">
                <div>
                  Mode: <span className="font-medium">
                    {podcastMode === 'normal-one' && 'Single narrator discussing the content'}
                    {podcastMode === 'normal-two' && 'Two hosts having a conversation'}
                    {podcastMode === 'custom-one' && 'Single host with custom instructions'}
                    {podcastMode === 'custom-two' && 'Two hosts with custom instructions'}
                  </span>
                </div>
              </div>
              
              {/* Show full script content if available */}
              {modalContent?.script && (
                <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                  <div className="border-t pt-3">
                    <h5 className="font-medium text-sm mb-2">Full Script Content:</h5>
                    <div className="bg-white rounded p-3 text-sm space-y-2">
                      {modalContent.script.introduction && (
                        <div>
                          <strong>Introduction:</strong>
                          <p className="mt-1">{modalContent.script.introduction}</p>
                        </div>
                      )}
                      {modalContent.script.mainContent && (
                        <div>
                          <strong>Main Content:</strong>
                          <div className="mt-1 whitespace-pre-wrap">{modalContent.script.mainContent}</div>
                        </div>
                      )}
                      {modalContent.script.conclusion && (
                        <div>
                          <strong>Conclusion:</strong>
                          <p className="mt-1">{modalContent.script.conclusion}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const fullScript = `${modalContent.script.introduction || ''}\n\n${modalContent.script.mainContent || ''}\n\n${modalContent.script.conclusion || ''}`;
                          copyToClipboard(fullScript, 'podcast-script');
                        }}
                        className="flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy Script
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const fullScript = `${modalContent.script.title || 'Podcast Script'}\n\n${modalContent.script.introduction || ''}\n\n${modalContent.script.mainContent || ''}\n\n${modalContent.script.conclusion || ''}`;
                          const blob = new Blob([fullScript], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `podcast-script-${Date.now()}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Download Script
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => processWithAI('podcast', useEntireArticle)} 
                disabled={isProcessing || (podcastMode.includes('custom') && !podcastInstructions.trim())}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Generate Podcast
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="relative">
      {/* AI Functions Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 mb-6 p-4 -mx-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Analysis</h3>
          <div className="flex gap-2">
            <Button
              onClick={runFullArticleAnalysis}
              disabled={isRunningFullAnalysis}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
              size="sm"
            >
              {isRunningFullAnalysis ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              {isRunningFullAnalysis ? 'Generating...' : 'Complete AI Analysis'}
            </Button>
            <Button
              onClick={() => {
                setUseEntireArticle(true);
                setCurrentAction('podcast');
                setShowModal(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
              size="sm"
            >
              <Podcast className="w-4 h-4" />
              Create Full Article Podcast
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Select any text below to access 8 AI functions, or use the buttons above to run comprehensive AI analysis or create a podcast from the entire article.
        </p>
      </div>

      <div
        ref={contentRef}
        className="prose max-w-none cursor-text"
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
        dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}
      />
      
      {renderToolbar()}
      {renderRewriteModal()}
      {renderPodcastModal()}
      
      <Dialog open={showModal && currentAction !== 'rewrite' && currentAction !== 'podcast'} onOpenChange={(open) => {
        setShowModal(open);
        if (!open) {
          setCurrentAction(null);
          setModalContent(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="modal-description">
          <DialogHeader>
            <DialogTitle>
              {(() => {
                if (!modalContent) return 'AI Result';
                
                // Determine title from modal content structure
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
          <div id="modal-description" className="sr-only">
            AI-generated content based on your selected text
          </div>
          {renderModalContent()}
        </DialogContent>
      </Dialog>

      {/* Full Analysis Results Modal */}
      <Dialog open={showFullAnalysisModal} onOpenChange={setShowFullAnalysisModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="full-analysis-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Complete AI Analysis
            </DialogTitle>
          </DialogHeader>
          <div id="full-analysis-description" className="sr-only">
            Comprehensive AI analysis results for the entire article
          </div>
          
          {fullAnalysisResults && (
            <div className="space-y-6">
              
              {/* Rewrite */}
              {fullAnalysisResults.rewrite && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">Rewritten Article</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(fullAnalysisResults.rewrite.result);
                        toast({ title: "Copied to clipboard!" });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="prose max-w-none text-sm bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                    {fullAnalysisResults.rewrite.result}
                  </div>
                </div>
              )}

              {/* Study Guide */}
              {fullAnalysisResults['study-guide'] && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold">Study Guide</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(fullAnalysisResults['study-guide'].result);
                        toast({ title: "Copied to clipboard!" });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="prose max-w-none text-sm bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: fullAnalysisResults['study-guide'].result.replace(/\n/g, '<br>') }} />
                  </div>
                </div>
              )}

              {/* Test Questions */}
              {fullAnalysisResults['test-me'] && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TestTube className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold">Test Questions</h3>
                  </div>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {fullAnalysisResults['test-me'].questions?.map((question: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p className="font-medium text-sm mb-2">{question.question}</p>
                        <div className="space-y-1">
                          {question.options.map((option: string, optIndex: number) => (
                            <label key={optIndex} className="flex items-center text-sm">
                              <input type="radio" name={`question-${index}`} className="mr-2" />
                              {option}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cognitive Map */}
              {fullAnalysisResults['cognitive-map'] && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">Cognitive Map</h3>
                  </div>
                  <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {fullAnalysisResults['cognitive-map'].map?.nodes?.map((node: any, index: number) => (
                        <div key={index} className="bg-white p-2 rounded border text-sm">
                          <div className="font-medium">{node.label}</div>
                          {node.description && <div className="text-gray-600 text-xs">{node.description}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Summary + Thesis */}
              {fullAnalysisResults['summary-thesis'] && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold">Summary + Thesis</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const content = `Summary: ${fullAnalysisResults['summary-thesis'].result.summary}\n\nThesis: ${fullAnalysisResults['summary-thesis'].result.thesis}`;
                        navigator.clipboard.writeText(content);
                        toast({ title: "Copied to clipboard!" });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-sm mb-1">Summary:</div>
                      <div className="text-sm">{fullAnalysisResults['summary-thesis'].result.summary}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-sm mb-1">Thesis:</div>
                      <div className="text-sm">{fullAnalysisResults['summary-thesis'].result.thesis}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Thesis Deep Dive */}
              {fullAnalysisResults['thesis-deep-dive'] && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold">Thesis Deep Dive</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(fullAnalysisResults['thesis-deep-dive'].result);
                        toast({ title: "Copied to clipboard!" });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="prose max-w-none text-sm bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: fullAnalysisResults['thesis-deep-dive'].result.replace(/\n/g, '<br>') }} />
                  </div>
                </div>
              )}

              {/* Suggested Readings */}
              {fullAnalysisResults['suggested-readings'] && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpenCheck className="w-5 h-5 text-teal-600" />
                    <h3 className="font-semibold">Suggested Readings</h3>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {fullAnalysisResults['suggested-readings'].readings?.map((reading: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <div className="font-medium text-sm">{reading.title}</div>
                        <div className="text-sm text-gray-600">{reading.author}</div>
                        {reading.relevance && <div className="text-xs text-gray-500 mt-1">{reading.relevance}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Podcast */}
              {fullAnalysisResults.podcast && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Podcast className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold">AI Generated Podcast</h3>
                  </div>
                  <div className="space-y-3">
                    {fullAnalysisResults.podcast.audioUrl && (
                      <div className="bg-gray-50 p-3 rounded">
                        <audio controls className="w-full">
                          <source src={fullAnalysisResults.podcast.audioUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadAudio(fullAnalysisResults.podcast.audioUrl, 'full-analysis-podcast.mp3')}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Generated: {fullAnalysisResults.podcast.script?.words} words, ~{fullAnalysisResults.podcast.script?.estimatedDuration} minutes
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
          
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setShowFullAnalysisModal(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                const allText = Object.entries(fullAnalysisResults || {})
                  .map(([type, data]: [string, any]) => {
                    let content = `\n=== ${type.toUpperCase().replace('-', ' ')} ===\n`;
                    if (data.result) content += data.result;
                    else if (data.questions) content += data.questions.map((q: any) => `Q: ${q.question}\nOptions: ${q.options.join(', ')}`).join('\n\n');
                    else if (data.readings) content += data.readings.map((r: any) => `${r.title} by ${r.author}`).join('\n');
                    return content;
                  })
                  .join('\n\n');
                
                navigator.clipboard.writeText(allText);
                toast({ title: "All results copied to clipboard!" });
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy All Results
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}