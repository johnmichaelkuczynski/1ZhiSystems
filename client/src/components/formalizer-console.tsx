import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Loader2, Copy, Check, Sparkles } from "lucide-react";
import { type LLM, sendChatMessage } from "@/lib/api";

interface FormalizerConsoleProps {
  selectedModel: LLM;
}

export function FormalizerConsole({ selectedModel }: FormalizerConsoleProps) {
  const [inputText, setInputText] = useState("");
  const [output, setOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [explainMode, setExplainMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100000) {
      alert("File too large. Please use files under 100KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
    };
    reader.readAsText(file);
  };

  const handleFormalize = async () => {
    if (!inputText.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setOutput("");

    const explainInstructions = explainMode 
      ? `After each section, add a brief explanation paragraph (2-3 sentences) describing what that section represents and why.`
      : `Output ONLY the formal notation. NO explanations, NO commentary, NO prose except section headers.`;

    const prompt = `YOU ARE A FORMAL LOGIC EXTRACTION ENGINE.

TASK: Analyze the natural language text below. Find arguments, claims, or reasoning that can be formalized. Then produce:

1. A PURE UNINTERPRETED AXIOM SYSTEM - abstract symbols with no meaning attached
2. A FORMAL INTERPRETATION - mapping those abstract symbols to the concepts in the text

${explainInstructions}

STRICT OUTPUT FORMAT:

═══════════════════════════════════════
EXTRACTED ARGUMENT
═══════════════════════════════════════
[Quote or paraphrase the specific argument/reasoning you found in the text]

═══════════════════════════════════════
UNINTERPRETED AXIOM SYSTEM
═══════════════════════════════════════
LANGUAGE: {list abstract symbols: predicates, functions, constants}

AXIOMS:
1. [First axiom in pure formal notation]
2. [Second axiom...]
... (continue as needed)

═══════════════════════════════════════
INTERPRETATION
═══════════════════════════════════════
DOMAIN: [What the variables range over]

SYMBOL MAPPING:
- P(x) ↦ [what P means in the text]
- Q(x,y) ↦ [what Q means]
- a ↦ [what constant a refers to]
... (map all symbols)

═══════════════════════════════════════
INTERPRETED SYSTEM
═══════════════════════════════════════
[Restate axioms with interpreted meanings]

RULES:
- Use standard logic symbols: ∀ ∃ → ∧ ∨ ¬ ↔ = ≠
- Keep the pure axiom system completely abstract (use P, Q, R, S, T... or F, G, H...)
- The interpretation section connects abstract to concrete
- If NO formalizable argument exists, say "NO FORMALIZABLE ARGUMENT FOUND" and explain why
- NO markdown formatting (no **, ##, \`\`\`)

═══════════════════════════════════════
INPUT TEXT TO ANALYZE:
═══════════════════════════════════════
${inputText}

═══════════════════════════════════════

Begin analysis. Start with "EXTRACTED ARGUMENT":`;

    try {
      const response = await sendChatMessage(prompt, selectedModel, []);
      let result = response.result;
      
      result = result.replace(/^#{1,6}\s+/gm, '');
      result = result.replace(/\*\*([^*]+)\*\*/g, '$1');
      result = result.replace(/\*([^*]+)\*/g, '$1');
      result = result.replace(/```[\s\S]*?```/g, '');
      
      setOutput(result.trim());
    } catch (err: any) {
      setOutput(`Error: ${err.message || "Processing failed"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollArea className="h-full">
      <div className="border border-border rounded-sm bg-card min-h-[600px] flex flex-col">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <h3 className="font-medium text-base flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Argument Formalizer
          </h3>
          <div className="flex items-center gap-2">
            <Switch
              id="explain-mode"
              checked={explainMode}
              onCheckedChange={setExplainMode}
            />
            <Label htmlFor="explain-mode" className="text-xs font-mono cursor-pointer">
              EXPLAIN
            </Label>
          </div>
        </div>
        
        <div className="p-4 space-y-4 border-b border-border">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-muted-foreground uppercase">
                Natural Language Input
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.md"
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-7 text-xs gap-1"
                data-testid="button-upload-file"
              >
                <Upload className="h-3 w-3" />
                Upload .txt
              </Button>
            </div>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type natural language text here (e.g., a philosophy essay, argument, or reasoning passage). The AI will find formalizable arguments and convert them to axiom systems with interpretations..."
              className="min-h-[180px] text-sm resize-y"
              data-testid="input-natural-language"
            />
            <div className="text-[10px] text-muted-foreground text-right">
              {inputText.length} characters
            </div>
          </div>
          
          <Button
            onClick={handleFormalize}
            disabled={isProcessing || !inputText.trim()}
            className="w-full h-10 text-sm font-mono"
            data-testid="button-formalize"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ANALYZING & FORMALIZING...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                EXTRACT & FORMALIZE ARGUMENT
              </>
            )}
          </Button>
        </div>
        
        <div className="flex flex-col">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground uppercase">Formalized Output</span>
            {output && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 text-xs px-2"
                data-testid="copy-formalized"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-green-500" />
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
          <ScrollArea className="h-[400px]">
            <div className="p-4">
              {output ? (
                <pre className="text-sm font-mono whitespace-pre-wrap text-foreground leading-relaxed">
                  {output}
                </pre>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-12 space-y-2">
                  <FileText className="h-8 w-8 mx-auto opacity-50" />
                  <div>Paste natural language text and click EXTRACT & FORMALIZE</div>
                  <div className="text-xs">The AI will find arguments and convert them to formal axiom systems</div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </ScrollArea>
  );
}
