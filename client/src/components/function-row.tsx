import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Play, ArrowRight } from "lucide-react";
import { type LLM, mockProcess } from "@/lib/mock-ai";
import { Badge } from "@/components/ui/badge";

interface FunctionRowProps {
  id: number;
  title: string;
  description?: string;
  selectedModel: LLM;
}

export function FunctionRow({ id, title, description, selectedModel }: FunctionRowProps) {
  const [input, setInput] = useState("");
  const [instructions, setInstructions] = useState("");
  const [output, setOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRun = async () => {
    if (!input) return;
    setIsProcessing(true);
    try {
      const response = await mockProcess(input, instructions, title, selectedModel);
      setOutput(response.result + (response.notes ? `\n\nNOTES:\n${response.notes}` : ""));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full border-b border-border py-8 last:border-0">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-xs rounded-sm">FUNC {id}</Badge>
          <h3 className="text-lg font-medium tracking-tight text-foreground">{title}</h3>
        </div>
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleRun} 
          disabled={isProcessing || !input}
          className="rounded-sm font-mono text-xs"
        >
          {isProcessing ? (
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          ) : (
            <Play className="mr-2 h-3 w-3" />
          )}
          RUN WITH {selectedModel}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="space-y-3">
          <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Input</label>
          <Textarea 
            placeholder="// Enter formal axioms or plain English theory here..."
            className="min-h-[500px] font-mono text-sm bg-secondary/30 resize-none border-border rounded-sm focus-visible:ring-1 focus-visible:ring-ring"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* Output Column */}
        <div className="space-y-3">
          <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Output</label>
          <div className="relative">
            <Textarea 
              readOnly
              placeholder="// Output will appear here..."
              className="min-h-[500px] font-mono text-sm bg-muted/50 resize-none border-border rounded-sm focus-visible:ring-0 text-muted-foreground"
              value={output}
            />
            {output && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-[10px] font-mono rounded-sm">
                  GENERATED
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions Row */}
      <div className="mt-4">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">Custom Instructions</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
             <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
             </div>
            <Input 
              placeholder="E.g., Rewrite using 'Line(x,y)' as sole primitive..."
              className="pl-9 font-mono text-sm border-border rounded-sm bg-background"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
