import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Send, Trash2, Bot, User, Copy, Check } from "lucide-react";
import { type LLM, sendChatMessage, type ChatMessage } from "@/lib/api";
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface Message {
  role: "user" | "assistant";
  content: string;
  model?: LLM;
  provider?: string;
}

interface ChatInterfaceProps {
  selectedModel: LLM;
  onModelChange: (model: LLM) => void;
}

function stripMarkdown(text: string): string {
  let result = text;
  
  result = result.replace(/^#{1,6}\s+/gm, '');
  
  result = result.replace(/\*\*([^*]+)\*\*/g, '$1');
  result = result.replace(/\*([^*]+)\*/g, '$1');
  result = result.replace(/__([^_]+)__/g, '$1');
  result = result.replace(/_([^_]+)_/g, '$1');
  
  result = result.replace(/`([^`]+)`/g, '$1');
  result = result.replace(/```[\s\S]*?```/g, '');
  
  result = result.replace(/^\s*[-*+]\s+/gm, '');
  
  result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  const logicSymbols: [RegExp, string][] = [
    [/\\forall/g, '∀'],
    [/\\exists/g, '∃'],
    [/\\neg/g, '¬'],
    [/\\land/g, '∧'],
    [/\\lor/g, '∨'],
    [/\\to/g, '→'],
    [/\\rightarrow/g, '→'],
    [/\\leftrightarrow/g, '↔'],
    [/\\iff/g, '↔'],
    [/\\in/g, '∈'],
    [/\\notin/g, '∉'],
    [/\\subset/g, '⊂'],
    [/\\subseteq/g, '⊆'],
    [/\\cup/g, '∪'],
    [/\\cap/g, '∩'],
    [/\\emptyset/g, '∅'],
    [/\\infty/g, '∞'],
    [/\\neq/g, '≠'],
    [/\\leq/g, '≤'],
    [/\\geq/g, '≥'],
    [/\\equiv/g, '≡'],
    [/\\times/g, '×'],
    [/\\cdot/g, '·'],
  ];
  
  for (const [pattern, symbol] of logicSymbols) {
    result = result.replace(pattern, symbol);
  }
  
  return result.trim();
}

function renderMathContent(text: string): string {
  let result = stripMarkdown(text);
  
  result = result.replace(/\$\$([^$]+)\$\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return `$$${math}$$`;
    }
  });
  
  result = result.replace(/\$([^$]+)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `$${math}$`;
    }
  });
  
  result = result.replace(/\\\[([^\]]+)\\\]/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return `\\[${math}\\]`;
    }
  });
  
  result = result.replace(/\\\(([^)]+)\\\)/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `\\(${math}\\)`;
    }
  });
  
  return result;
}

export function ChatInterface({ selectedModel, onModelChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Ready to assist with formal theory analysis. You can ask me to generate axiom systems, explain logical concepts, or help with theory transformations.", model: selectedModel }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCopy = async (content: string, index: number) => {
    const cleanContent = stripMarkdown(content);
    await navigator.clipboard.writeText(cleanContent);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setError(null);

    try {
      const history: ChatMessage[] = messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(m => ({ role: m.role, content: m.content }));

      const response = await sendChatMessage(input, selectedModel, history);
      
      const assistantMsg: Message = {
        role: "assistant",
        content: response.result,
        model: selectedModel,
        provider: response.provider
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message || "Failed to get response");
      const errorMsg: Message = {
        role: "assistant",
        content: `Error: ${err.message || "Failed to get response"}`,
        model: selectedModel
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: "Chat cleared. Ready for new input.", model: selectedModel }]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-[600px] border border-border bg-card rounded-sm shadow-sm overflow-hidden sticky top-6" data-testid="chat-interface">
      <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <Bot className="h-4 w-4" />
          AI Analysis Chat
        </h3>
        <Button variant="ghost" size="icon" onClick={clearChat} className="h-6 w-6" data-testid="clear-chat">
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              data-testid={`chat-message-${i}`}
            >
              <div className={`
                w-8 h-8 rounded-sm flex items-center justify-center shrink-0
                ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}
              `}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`
                max-w-[85%] rounded-sm p-3 text-sm leading-relaxed relative group
                ${msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'}
              `}>
                {msg.role === 'assistant' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(msg.content, i)}
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background"
                    data-testid={`copy-message-${i}`}
                  >
                    {copiedIndex === i ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                )}
                {msg.role === 'assistant' && msg.model && (
                  <div className="text-[10px] font-mono opacity-50 mb-1 uppercase tracking-wider pr-6">
                    {msg.model}
                  </div>
                )}
                <div 
                  className="whitespace-pre-wrap math-content"
                  dangerouslySetInnerHTML={{ __html: renderMathContent(msg.content) }}
                />
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-sm bg-secondary flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-secondary p-3 rounded-sm flex items-center">
                <span className="animate-pulse text-xs">Thinking with {selectedModel}...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border bg-background space-y-3">
        <Select value={selectedModel} onValueChange={(val) => {
          onModelChange(val as LLM);
          setMessages(prev => [...prev, { 
            role: "assistant", 
            content: `SYSTEM UPDATE: Switched reasoning engine to ${val}.`, 
            model: val as LLM 
          }]);
        }}>
          <SelectTrigger className="w-full h-8 text-xs font-mono bg-secondary/50 border-border" data-testid="model-selector">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Zhi 1">Zhi 1 - Default</SelectItem>
            <SelectItem value="Zhi 2">Zhi 2</SelectItem>
            <SelectItem value="Zhi 3">Zhi 3</SelectItem>
            <SelectItem value="Zhi 4">Zhi 4</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about theory or request axiom generation..."
            className="flex-1 h-9 text-sm font-sans border-border rounded-sm"
            disabled={isTyping}
            data-testid="chat-input"
          />
          <Button onClick={handleSend} size="icon" className="h-9 w-9 rounded-sm" disabled={isTyping} data-testid="send-button">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
