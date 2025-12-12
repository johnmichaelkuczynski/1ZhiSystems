import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Play, Loader2, Square, CheckSquare } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

export interface SubFunction {
  id: string;
  name: string;
  instructions: string;
}

interface BatchExecutionPanelProps {
  functionId: number;
  functionTitle: string;
  subFunctions: SubFunction[];
  onExecute: (selectedIds: string[]) => void;
  isExecuting: boolean;
  executingIds: string[];
}

export function BatchExecutionPanel({
  functionId,
  functionTitle,
  subFunctions,
  onExecute,
  isExecuting,
  executingIds
}: BatchExecutionPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["main"]));

  const allIds = ["main", ...subFunctions.map(sf => sf.id)];
  const allSelected = allIds.every(id => selectedIds.has(id));
  const noneSelected = selectedIds.size === 0;

  const handleToggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(allIds));
  };

  const handleSelectNone = () => {
    setSelectedIds(new Set());
  };

  const handleExecute = () => {
    if (selectedIds.size > 0) {
      onExecute(Array.from(selectedIds));
    }
  };

  if (subFunctions.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-sm font-mono text-xs gap-2"
            data-testid={`batch-toggle-${functionId}`}
          >
            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            BATCH RUN ({subFunctions.length} sub-functions)
          </Button>
        </CollapsibleTrigger>
        {selectedIds.size > 1 && (
          <Badge variant="secondary" className="text-[10px] font-mono">
            {selectedIds.size} selected
          </Badge>
        )}
      </div>

      <CollapsibleContent className="mt-3">
        <div className="border border-border rounded-sm p-4 bg-muted/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-7 px-2 text-xs font-mono"
                disabled={allSelected}
                data-testid={`batch-select-all-${functionId}`}
              >
                <CheckSquare className="h-3 w-3 mr-1" />
                ALL
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectNone}
                className="h-7 px-2 text-xs font-mono"
                disabled={noneSelected}
                data-testid={`batch-select-none-${functionId}`}
              >
                <Square className="h-3 w-3 mr-1" />
                NONE
              </Button>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={handleExecute}
              disabled={isExecuting || selectedIds.size === 0}
              className="rounded-sm font-mono text-xs"
              data-testid={`batch-run-${functionId}`}
            >
              {isExecuting ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <Play className="mr-2 h-3 w-3" />
              )}
              RUN {selectedIds.size} SELECTED
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div 
              className={`flex items-center gap-2 p-2 rounded-sm border transition-colors ${
                selectedIds.has("main") 
                  ? "border-primary bg-primary/5" 
                  : "border-border bg-background"
              }`}
            >
              <Checkbox
                id={`batch-main-${functionId}`}
                checked={selectedIds.has("main")}
                onCheckedChange={() => handleToggle("main")}
                data-testid={`batch-check-main-${functionId}`}
              />
              <label 
                htmlFor={`batch-main-${functionId}`}
                className="text-xs font-mono cursor-pointer flex-1 flex items-center gap-2"
              >
                <Badge variant="outline" className="text-[9px] px-1">PRIMARY</Badge>
                Main Function
                {executingIds.includes("main") && (
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                )}
              </label>
            </div>

            {subFunctions.map((sf) => (
              <div 
                key={sf.id}
                className={`flex items-center gap-2 p-2 rounded-sm border transition-colors ${
                  selectedIds.has(sf.id) 
                    ? "border-primary bg-primary/5" 
                    : "border-border bg-background"
                }`}
              >
                <Checkbox
                  id={`batch-${sf.id}`}
                  checked={selectedIds.has(sf.id)}
                  onCheckedChange={() => handleToggle(sf.id)}
                  data-testid={`batch-check-${sf.id}`}
                />
                <label 
                  htmlFor={`batch-${sf.id}`}
                  className="text-xs font-mono cursor-pointer flex-1 truncate flex items-center gap-2"
                  title={sf.name}
                >
                  {sf.name}
                  {executingIds.includes(sf.id) && (
                    <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
