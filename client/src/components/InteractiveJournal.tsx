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
  const [voiceOptions, setVoiceOptions] = useState<any>({ azure: [], google: [] });
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
  const [podcastMode, setPodcastMode] = useState<'normal-one' | 'normal-two' | 'custom-one' | 'custom-two'>('normal-two');
  const [podcastInstructions, setPodcastInstructions] = useState('');

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

  const processWithAI = async (action: ActionType) => {
    if (!selectedText) {
      toast({
        title: "No text selected",
        description: "Please select some text first.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const request: TextProcessingRequest = {
        selectedText,
        action,
        provider: selectedProvider,
        customInstructions: action === 'rewrite' ? customInstructions : undefined,
        includeAudio: action === 'podcast' ? true : false, // Always generate audio for podcasts
        voiceSelection: action === 'podcast' ? voiceSelection : undefined,
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
      
      // For rewrite action, we need to transition from the rewrite modal to results modal
      if (action === 'rewrite') {
        // Set currentAction to null to close the rewrite modal
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
                <audio controls className="w-full">
                  <source src={modalContent.audioUrl} type="audio/mpeg" />
                  Your browser does not support audio playback.
                </audio>
                <p className="text-sm text-blue-600 mt-2">
                  Generated using Azure Speech Services with "{voiceSelection}" voice
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
                <div>
                  <Label htmlFor="voice-selection">Voice Selection</Label>
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
              )}
            </div>

            {/* Generated Script Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Generated Script</h4>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="font-medium">
                  Selected Text Preview: "{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"
                </div>
                <div>
                  Mode: <span className="font-medium">
                    {podcastMode === 'normal-one' && 'Single narrator discussing the content'}
                    {podcastMode === 'normal-two' && 'Two hosts having a conversation'}
                    {podcastMode === 'custom-one' && 'Single host with custom instructions'}
                    {podcastMode === 'custom-two' && 'Two hosts with custom instructions'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => processWithAI('podcast')} 
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
    </div>
  );
}