import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Play, ArrowRight, AlertCircle, Copy, Check, Trash2 } from "lucide-react";
import { type LLM, processTheory } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { handlePaste } from "@/lib/normalizer";
import { PRESETS, type Preset } from "@/components/presets-sidebar";
import { BatchExecutionPanel, type SubFunction } from "@/components/batch-execution-panel";
import { BatchResultsAccordion, type BatchResult } from "@/components/batch-results-accordion";

interface FunctionRowProps {
  id: number;
  title: string;
  description?: string;
  selectedModel: LLM;
  presetInput?: string;
  presetInstructions?: string;
  triggerRun?: number;
}

export function FunctionRow({ id, title, description, selectedModel, presetInput, presetInstructions, triggerRun }: FunctionRowProps) {
  const [input, setInput] = useState("");
  const [instructions, setInstructions] = useState("");
  const [output, setOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedModel, setUsedModel] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [explain, setExplain] = useState(false);
  const [pendingRun, setPendingRun] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [isBatchExecuting, setIsBatchExecuting] = useState(false);
  const [executingIds, setExecutingIds] = useState<string[]>([]);

  const subFunctions = useMemo(() => {
    return PRESETS
      .filter(p => p.functionId === id)
      .map(p => ({
        id: p.id,
        name: p.name,
        instructions: p.instructions
      }));
  }, [id]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setInstructions("");
    setOutput("");
    setError(null);
    setUsedModel(null);
    setBatchResults([]);
  };

  useEffect(() => {
    if (presetInput !== undefined && presetInput !== "") {
      setInput(presetInput);
    }
  }, [presetInput]);

  useEffect(() => {
    if (presetInstructions !== undefined && presetInstructions !== "") {
      setInstructions(presetInstructions);
    }
  }, [presetInstructions]);

  useEffect(() => {
    if (triggerRun && triggerRun > 0) {
      setTimeout(() => setPendingRun(true), 50);
    }
  }, [triggerRun]);

  useEffect(() => {
    if (pendingRun && input && !isProcessing) {
      setPendingRun(false);
      runTransformation(input, instructions);
    } else if (pendingRun && !input) {
      setPendingRun(false);
      inputRef.current?.focus();
    }
  }, [pendingRun, input, instructions]);

  const runTransformation = async (inputText: string, instructionsText: string) => {
    setIsProcessing(true);
    setError(null);
    setUsedModel(null);
    
    try {
      const response = await processTheory(inputText, instructionsText, title, selectedModel, explain);
      setOutput(response.result);
      setUsedModel(selectedModel);
    } catch (err: any) {
      setError(err.message || "Processing failed");
      setOutput("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRun = async () => {
    if (!input) return;
    await runTransformation(input, instructions);
  };

  const handleBatchExecute = async (selectedIds: string[]) => {
    if (!input) return;

    setIsBatchExecuting(true);
    setExecutingIds(selectedIds);
    
    const initialResults: BatchResult[] = selectedIds.map(id => {
      if (id === "main") {
        return { id: "main", name: "Main Function", status: "pending" as const };
      }
      const sf = subFunctions.find(s => s.id === id);
      return { id, name: sf?.name || id, status: "pending" as const };
    });
    setBatchResults(initialResults);

    const executeOne = async (execId: string): Promise<BatchResult> => {
      const isMain = execId === "main";
      const sf = subFunctions.find(s => s.id === execId);
      const name = isMain ? "Main Function" : (sf?.name || execId);
      const execInstructions = isMain ? instructions : (sf?.instructions || "");

      setBatchResults(prev => prev.map(r => 
        r.id === execId ? { ...r, status: "running" as const } : r
      ));

      try {
        const response = await processTheory(input, execInstructions, title, selectedModel, explain);
        return { id: execId, name, status: "success", output: response.result, model: selectedModel };
      } catch (err: any) {
        return { id: execId, name, status: "error", error: err.message || "Processing failed" };
      }
    };

    const promises = selectedIds.map(async (execId) => {
      const result = await executeOne(execId);
      setBatchResults(prev => prev.map(r => r.id === execId ? result : r));
      setExecutingIds(prev => prev.filter(id => id !== execId));
      return result;
    });

    await Promise.allSettled(promises);
    setIsBatchExecuting(false);
    setExecutingIds([]);
  };

  return (
    <div className="w-full border-b border-border py-8 px-6 last:border-0" data-testid={`function-row-${id}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono text-xs rounded-sm">FUNC {id}</Badge>
            <h3 className="text-lg font-medium tracking-tight text-foreground">{title}</h3>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground ml-12">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id={`explain-${id}`}
              checked={explain}
              onCheckedChange={setExplain}
              className="data-[state=checked]:bg-primary"
              data-testid={`explain-toggle-${id}`}
            />
            <Label 
              htmlFor={`explain-${id}`} 
              className="text-xs font-mono text-muted-foreground cursor-pointer"
            >
              EXPLAIN
            </Label>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={isProcessing || isBatchExecuting || (!input && !output && !instructions && batchResults.length === 0)}
            className="rounded-sm font-mono text-xs text-muted-foreground hover:text-foreground"
            data-testid={`clear-button-${id}`}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            CLEAR
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleRun} 
            disabled={isProcessing || isBatchExecuting || !input}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Input</label>
          <Textarea 
            ref={inputRef}
            placeholder="// Enter formal axioms or plain English theory here..."
            className="min-h-[500px] font-mono text-sm bg-secondary/30 resize-none border-border rounded-sm focus-visible:ring-1 focus-visible:ring-ring"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={(e) => handlePaste(e, setInput)}
            data-testid={`input-${id}`}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Output</label>
              {output && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  data-testid={`copy-output-${id}`}
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              )}
            </div>
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
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
          </div>
          <Textarea 
            placeholder="E.g., Rewrite using 'Line(x,y)' as sole primitive. Eliminate 'set' as a primitive, make 'element' the only domain type, define 'set' as equivalence class..."
            className="pl-9 min-h-[80px] font-mono text-sm border-border rounded-sm bg-background resize-none"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            data-testid={`instructions-${id}`}
          />
        </div>
      </div>

      {subFunctions.length > 0 && (
        <BatchExecutionPanel
          functionId={id}
          functionTitle={title}
          subFunctions={subFunctions}
          onExecute={handleBatchExecute}
          isExecuting={isBatchExecuting}
          executingIds={executingIds}
        />
      )}

      {batchResults.length > 0 && (
        <BatchResultsAccordion results={batchResults} functionId={id} />
      )}
    </div>
  );
}
