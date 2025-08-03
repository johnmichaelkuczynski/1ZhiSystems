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
  Download
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
  const [includeAudio, setIncludeAudio] = useState(false);
  const [voiceSelection, setVoiceSelection] = useState('en-US-AriaNeural');
  const [voiceOptions, setVoiceOptions] = useState<any>({ azure: [], google: [] });
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

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
        includeAudio: action === 'podcast' ? includeAudio : false,
        voiceSelection: action === 'podcast' ? voiceSelection : undefined
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
                  Generated using OpenAI TTS with "alloy" voice
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
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <h4 className="text-xl font-bold text-blue-800">{map.centralConcept}</h4>
            </div>
            
            <div className="grid gap-4">
              {map.mainBranches.map((branch, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h5 className="font-semibold text-lg mb-2">{branch.title}</h5>
                  <div className="mb-3">
                    <h6 className="font-medium text-sm text-gray-600 mb-1">Concepts:</h6>
                    <div className="flex flex-wrap gap-1">
                      {branch.concepts.map((concept, i) => (
                        <Badge key={i} variant="outline">{concept}</Badge>
                      ))}
                    </div>
                  </div>
                  {branch.connections.length > 0 && (
                    <div>
                      <h6 className="font-medium text-sm text-gray-600 mb-1">Connections:</h6>
                      <ul className="text-sm text-gray-700">
                        {branch.connections.map((connection, i) => (
                          <li key={i} className="mb-1">• {connection}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {map.keyInsights.length > 0 && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold mb-2">Key Insights</h4>
                <ul className="space-y-1">
                  {map.keyInsights.map((insight, index) => (
                    <li key={index} className="text-sm">• {insight}</li>
                  ))}
                </ul>
              </div>
            )}
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

  const renderToolbar = () => {
    if (!showToolbar || !selectedText) return null;

    return (
      <div
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2"
        style={{
          left: `${toolbarPosition.x - 250}px`,
          top: `${toolbarPosition.y}px`,
          minWidth: '500px'
        }}
      >
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">AI Provider:</span>
            <Select value={selectedProvider} onValueChange={(value: AIProvider) => setSelectedProvider(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="perplexity">Perplexity</SelectItem>
                <SelectItem value="deepseek">DeepSeek</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            Selected: "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"
          </p>
        </div>
        
        <div className="mb-2">
          <p className="text-xs text-gray-400 text-center">
            Press number keys 1-8 or click buttons below
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ACTION_BUTTONS.map((button, index) => (
            <Button
              key={button.action}
              size="sm"
              className={`${button.color} text-white text-xs px-3 py-2 h-auto flex items-center justify-center min-h-[40px] relative`}
              onClick={() => {
                if (button.action === 'rewrite') {
                  setCurrentAction(button.action);
                  setShowModal(true);
                } else {
                  setCurrentAction(button.action);
                  processWithAI(button.action);
                }
              }}
              disabled={isProcessing}
            >
              <div className="flex flex-col items-center space-y-1">
                {isProcessing && currentAction === button.action ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  button.icon
                )}
                <span className="text-xs font-medium">{button.label}</span>
              </div>
              <span className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs rounded px-1">
                {index + 1}
              </span>
            </Button>
          ))}
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
                onClick={() => {
                  processWithAI('rewrite');
                  setShowModal(false); // Close the rewrite modal
                }} 
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
      
      <Dialog open={showModal && currentAction !== 'rewrite'} onOpenChange={(open) => {
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