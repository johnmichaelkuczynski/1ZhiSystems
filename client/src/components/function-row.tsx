import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Play, ArrowRight, AlertCircle } from "lucide-react";
import { type LLM, processTheory } from "@/lib/api";
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
  const [error, setError] = useState<string | null>(null);
  const [usedModel, setUsedModel] = useState<string | null>(null);

  const handleRun = async () => {
    if (!input) return;
    setIsProcessing(true);
    setError(null);
    setUsedModel(null);
    
    try {
      const response = await processTheory(input, instructions, title, selectedModel);
      setOutput(response.result);
      setUsedModel(`${response.provider} - ${response.model}`);
    } catch (err: any) {
      setError(err.message || "Processing failed");
      setOutput("");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full border-b border-border py-8 px-6 last:border-0" data-testid={`function-row-${id}`}>
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
          data-testid={`run-button-${id}`}
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
        <div className="space-y-3">
          <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Input</label>
          <Textarea 
            placeholder="// Enter formal axioms or plain English theory here..."
            className="min-h-[500px] font-mono text-sm bg-secondary/30 resize-none border-border rounded-sm focus-visible:ring-1 focus-visible:ring-ring"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            data-testid={`input-${id}`}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Output</label>
            {usedModel && (
              <Badge variant="secondary" className="text-[10px] font-mono rounded-sm">
                {usedModel}
              </Badge>
            )}
          </div>
          <div className="relative">
            {error ? (
              <div className="min-h-[500px] font-mono text-sm bg-destructive/10 border border-destructive/50 rounded-sm p-4 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span className="text-destructive">{error}</span>
              </div>
            ) : (
              <Textarea 
                readOnly
                placeholder="// Output will appear here..."
                className="min-h-[500px] font-mono text-sm bg-muted/50 resize-none border-border rounded-sm focus-visible:ring-0"
                value={output}
                data-testid={`output-${id}`}
              />
            )}
          </div>
        </div>
      </div>

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
              data-testid={`instructions-${id}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
