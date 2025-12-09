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
import { Send, Trash2, Bot, User } from "lucide-react";
import { type LLM } from "@/lib/mock-ai";

interface Message {
  role: "user" | "assistant";
  content: string;
  model?: LLM;
}

interface ChatInterfaceProps {
  selectedModel: LLM;
  onModelChange: (model: LLM) => void;
}

export function ChatInterface({ selectedModel, onModelChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Ready to assist with formal theory analysis. Select a model and begin.", model: selectedModel }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Mock response
    setTimeout(() => {
      const modelMap = {
        "Zhi 1": "Grok",
        "Zhi 2": "Anthropic",
        "Zhi 3": "OpenAI",
        "Zhi 4": "DeepSeek"
      };
      
      const assistantMsg: Message = {
        role: "assistant",
        content: `[${modelMap[selectedModel]}] Analysis of "${userMsg.content}" completed. The formal structure suggests consistency with second-order logic constraints.`,
        model: selectedModel
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: "Chat cleared. Ready for new input.", model: selectedModel }]);
  };

  return (
    <div className="flex flex-col h-[600px] border border-border bg-card rounded-sm shadow-sm overflow-hidden sticky top-6">
      <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <Bot className="h-4 w-4" />
          AI Analysis Chat
        </h3>
        <Button variant="ghost" size="icon" onClick={clearChat} className="h-6 w-6">
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`
                w-8 h-8 rounded-sm flex items-center justify-center shrink-0
                ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}
              `}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`
                max-w-[85%] rounded-sm p-3 text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'}
              `}>
                {msg.role === 'assistant' && msg.model && (
                  <div className="text-[10px] font-mono opacity-50 mb-1 uppercase tracking-wider">
                    {msg.model}
                  </div>
                )}
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-sm bg-secondary flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-secondary p-3 rounded-sm flex items-center">
                <span className="animate-pulse text-xs">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border bg-background space-y-3">
        <Select value={selectedModel} onValueChange={(val) => onModelChange(val as LLM)}>
          <SelectTrigger className="w-full h-8 text-xs font-mono bg-secondary/50 border-border">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Zhi 1">Zhi 1 (Grok) - Default</SelectItem>
            <SelectItem value="Zhi 2">Zhi 2 (Anthropic)</SelectItem>
            <SelectItem value="Zhi 3">Zhi 3 (OpenAI)</SelectItem>
            <SelectItem value="Zhi 4">Zhi 4 (DeepSeek)</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about the theory..."
            className="flex-1 h-9 text-sm font-sans border-border rounded-sm"
          />
          <Button onClick={handleSend} size="icon" className="h-9 w-9 rounded-sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
