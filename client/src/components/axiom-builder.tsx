import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hammer, Copy, Check, Loader2 } from "lucide-react";
import { type LLM, sendChatMessage } from "@/lib/api";

interface AxiomBuilderProps {
  selectedModel: LLM;
}

export function AxiomBuilder({ selectedModel }: AxiomBuilderProps) {
  const [numAxioms, setNumAxioms] = useState("5");
  const [axiomType, setAxiomType] = useState("custom");
  const [customRequirements, setCustomRequirements] = useState("");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const axiomTypes = [
    { value: "custom", label: "Custom (describe below)" },
    { value: "order", label: "Order relation (≤, <)" },
    { value: "equivalence", label: "Equivalence relation (∼)" },
    { value: "algebraic", label: "Algebraic structure (·, +)" },
    { value: "set", label: "Set-theoretic (∈, ⊆)" },
    { value: "modal", label: "Modal logic (□, ◇)" },
    { value: "mereological", label: "Part-whole (P, O)" },
    { value: "geometric", label: "Geometric (B, ≡)" },
  ];

  const handleGenerate = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setOutput("");

    const typeDescription = axiomTypes.find(t => t.value === axiomType)?.label || "custom";
    
    const prompt = `YOU ARE AN AXIOM-SET GENERATOR. OUTPUT ONLY THE AXIOM SET.

STRICT OUTPUT RULES:
- Return ONLY the axiom set itself
- NO markdown (no **, ##, *, _, \`\`\`)
- NO commentary, explanations, preamble, or descriptions
- NO "Here is" or "This axiom set" or any prose
- ONLY plain Unicode text with logic symbols

REQUIRED FORMAT:
LANGUAGE: {list of primitive symbols}

AXIOMS:
1. <axiom>
2. <axiom>
... (continue numbering)

USE THESE SYMBOLS:
∀ ∃ → ∧ ∨ ¬ ↔ = ≠ ∈ ∉ ⊆ ≤ < ≥ > · + ′ □ ◇

REQUIREMENTS:
- Number of axioms: ${numAxioms}
- Type: ${typeDescription}
${customRequirements ? `- Additional requirements: ${customRequirements}` : ""}

Generate the axiom set now. Start directly with "LANGUAGE:" - no other text.`;

    try {
      const response = await sendChatMessage(prompt, selectedModel, []);
      let result = response.result;
      
      result = result.replace(/^#{1,6}\s+/gm, '');
      result = result.replace(/\*\*([^*]+)\*\*/g, '$1');
      result = result.replace(/\*([^*]+)\*/g, '$1');
      result = result.replace(/__([^_]+)__/g, '$1');
      result = result.replace(/_([^_]+)_/g, '$1');
      result = result.replace(/`([^`]+)`/g, '$1');
      result = result.replace(/```[\s\S]*?```/g, '');
      
      const languageIndex = result.indexOf('LANGUAGE:');
      if (languageIndex > 0) {
        result = result.substring(languageIndex);
      }
      
      setOutput(result.trim());
    } catch (err: any) {
      setOutput(`Error: ${err.message || "Generation failed"}`);
    } finally {
      setIsGenerating(false);
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
            <Hammer className="h-5 w-5" />
            Axiom-Set Builder
          </h3>
        </div>
        
        <div className="p-4 space-y-4 border-b border-border">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase">Number of Axioms</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={numAxioms}
                onChange={(e) => setNumAxioms(e.target.value)}
                className="h-10 text-sm font-mono"
                data-testid="input-num-axioms"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase">Type</label>
              <Select value={axiomType} onValueChange={setAxiomType}>
                <SelectTrigger className="h-10 text-sm" data-testid="select-axiom-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {axiomTypes.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-sm">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase">
              Requirements (optional)
            </label>
            <Textarea
              value={customRequirements}
              onChange={(e) => setCustomRequirements(e.target.value)}
              placeholder="e.g., reflexive, transitive, includes successor function, dense ordering, at least 3 distinct elements, closed under composition..."
              className="min-h-[120px] text-sm resize-y"
              data-testid="input-requirements"
            />
          </div>
          
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full h-10 text-sm font-mono"
            data-testid="button-generate-axioms"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                GENERATING...
              </>
            ) : (
              <>
                <Hammer className="h-4 w-4 mr-2" />
                BUILD AXIOM SET
              </>
            )}
          </Button>
        </div>
        
        <div className="flex-1 flex flex-col min-h-[250px]">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground uppercase">Output</span>
            {output && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 text-xs px-2"
                data-testid="copy-output"
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
          <div className="flex-1 p-4 overflow-auto">
            {output ? (
              <pre className="text-sm font-mono whitespace-pre-wrap text-foreground leading-relaxed">
                {output}
              </pre>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-12">
                Configure requirements and click BUILD to generate an axiom set
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
