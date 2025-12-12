import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

export interface BatchResult {
  id: string;
  name: string;
  status: "pending" | "running" | "success" | "error";
  output?: string;
  error?: string;
  model?: string;
}

interface BatchResultsAccordionProps {
  results: BatchResult[];
  functionId: number;
}

export function BatchResultsAccordion({ results, functionId }: BatchResultsAccordionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (results.length === 0) {
    return null;
  }

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const successCount = results.filter(r => r.status === "success").length;
  const errorCount = results.filter(r => r.status === "error").length;
  const runningCount = results.filter(r => r.status === "running" || r.status === "pending").length;

  return (
    <div className="mt-6 border border-border rounded-sm overflow-hidden">
      <div className="bg-muted/50 px-4 py-2 flex items-center justify-between border-b border-border">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Batch Results ({results.length})
        </span>
        <div className="flex items-center gap-2">
          {runningCount > 0 && (
            <Badge variant="secondary" className="text-[10px] font-mono gap-1">
              <Loader2 className="h-2 w-2 animate-spin" />
              {runningCount} running
            </Badge>
          )}
          {successCount > 0 && (
            <Badge variant="default" className="text-[10px] font-mono bg-green-600">
              {successCount} complete
            </Badge>
          )}
          {errorCount > 0 && (
            <Badge variant="destructive" className="text-[10px] font-mono">
              {errorCount} failed
            </Badge>
          )}
        </div>
      </div>

      <Accordion type="multiple" defaultValue={results.filter(r => r.status === "success").slice(0, 1).map(r => r.id)}>
        {results.map((result) => (
          <AccordionItem key={result.id} value={result.id} className="border-b last:border-0">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
              <div className="flex items-center gap-3 flex-1">
                {result.status === "pending" && (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                {result.status === "running" && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
                {result.status === "success" && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {result.status === "error" && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <span className="text-sm font-mono">{result.name}</span>
                {result.model && (
                  <Badge variant="secondary" className="text-[9px] font-mono ml-auto mr-2">
                    {result.model}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {result.status === "pending" && (
                <div className="text-sm text-muted-foreground italic">Waiting to execute...</div>
              )}
              {result.status === "running" && (
                <div className="text-sm text-muted-foreground italic flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              )}
              {result.status === "error" && (
                <div className="bg-destructive/10 border border-destructive/50 rounded-sm p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <span className="text-sm text-destructive">{result.error}</span>
                </div>
              )}
              {result.status === "success" && result.output && (
                <div className="space-y-2">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(result.id, result.output!)}
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                      data-testid={`batch-copy-${result.id}`}
                    >
                      {copiedId === result.id ? (
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
                  </div>
                  <Textarea
                    readOnly
                    value={result.output}
                    className="min-h-[200px] font-mono text-sm bg-muted/50 resize-none border-border rounded-sm focus-visible:ring-0"
                    data-testid={`batch-output-${result.id}`}
                  />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
