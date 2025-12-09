import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, FileText } from "lucide-react";
import { useState } from "react";

export interface Preset {
  id: string;
  name: string;
  functionId: number;
  input: string;
  instructions: string;
}

const PRESETS: Preset[] = [
  // FUNCTION 1: Axiom-Set / Theory Transformation
  {
    id: "f1-primitive-swap",
    name: "Primitive Swap",
    functionId: 1,
    input: ``,
    instructions: `Rewrite the theory so that a selected primitive becomes defined and another selected symbol becomes primitive. Keep all theorems equivalent.`
  },
  {
    id: "f1-signature-change",
    name: "Signature Change",
    functionId: 1,
    input: ``,
    instructions: `Rewrite the theory using new primitives with different arities or types. Replace each old primitive with its new signature while preserving meaning.`
  },
  {
    id: "f1-vocab-compression",
    name: "Vocabulary Compression",
    functionId: 1,
    input: ``,
    instructions: `Rewrite the theory using the smallest possible set of primitives that can express all the original axioms. Remove redundant primitives.`
  },
  {
    id: "f1-vocab-expansion",
    name: "Vocabulary Expansion",
    functionId: 1,
    input: ``,
    instructions: `Introduce new helper primitives and rewrite the axioms so that they become simpler while preserving all models and theorems.`
  },
  {
    id: "f1-non-iso-equivalent",
    name: "Non-Isomorphic Equivalent",
    functionId: 1,
    input: ``,
    instructions: `Generate a theory that is not structurally isomorphic but yields the same set of theorems under translation. Preserve truth conditions, not structure.`
  },
  // FUNCTION 2: Schema Equivalence
  {
    id: "f2-direct-vocab",
    name: "Direct Vocabulary Mapping",
    functionId: 2,
    input: ``,
    instructions: `Attempt a direct symbol-by-symbol mapping between the vocabularies of the two theories.`
  },
  {
    id: "f2-arity-preserving",
    name: "Arity-Preserving Mapping",
    functionId: 2,
    input: ``,
    instructions: `Only consider mappings between primitives with the same arity.`
  },
  {
    id: "f2-structural-role",
    name: "Structural Role Mapping",
    functionId: 2,
    input: ``,
    instructions: `Attempt to map primitives based on their structural roles in the axioms, not symbol identity.`
  },
  {
    id: "f2-obstruction",
    name: "Minimal Obstruction Report",
    functionId: 2,
    input: ``,
    instructions: `If no schema equivalence is possible, return the smallest structural obstruction.`
  },
  // FUNCTION 3: Definitional Equivalence
  {
    id: "f3-mutual-explicit",
    name: "Mutual Explicit Definitions",
    functionId: 3,
    input: ``,
    instructions: `Attempt to explicitly define each primitive of Theory A using Theory B, and each primitive of Theory B using Theory A.`
  },
  {
    id: "f3-one-direction",
    name: "One-Direction Definability",
    functionId: 3,
    input: ``,
    instructions: `Test definability only in the direction the user specifies (A→B or B→A).`
  },
  {
    id: "f3-minimization",
    name: "Definition Minimization",
    functionId: 3,
    input: ``,
    instructions: `Search for the shortest explicit definitions possible.`
  },
  {
    id: "f3-conservative",
    name: "Conservative Definability",
    functionId: 3,
    input: ``,
    instructions: `Only return definitions that preserve the original provability relations without introducing new theorems.`
  },
  // FUNCTION 4: Model-Preserving Rewrite
  {
    id: "f4-reduced-primitive",
    name: "Reduced Primitive Set",
    functionId: 4,
    input: ``,
    instructions: `Rewrite the theory using the minimal set of primitives that preserves the same models.`
  },
  {
    id: "f4-expanded-primitive",
    name: "Expanded Primitive Set",
    functionId: 4,
    input: ``,
    instructions: `Add new primitives and rewrite axioms so they become shorter or simpler while preserving all models.`
  },
  {
    id: "f4-algebraic",
    name: "Algebraic Reconstruction",
    functionId: 4,
    input: ``,
    instructions: `Rewrite the theory in algebraic form using functions and operations instead of relations.`
  },
  {
    id: "f4-pure-relational",
    name: "Pure Relational Reconstruction",
    functionId: 4,
    input: ``,
    instructions: `Rewrite the theory using relations only, eliminating functions and constants.`
  },
  // FUNCTION 5: Conservative Extension Analysis
  {
    id: "f5-new-primitives",
    name: "New Primitives Test",
    functionId: 5,
    input: ``,
    instructions: `Determine whether adding a new primitive preserves all original theorems.`
  },
  {
    id: "f5-new-axioms",
    name: "New Axioms Test",
    functionId: 5,
    input: ``,
    instructions: `Determine whether adding new axioms changes any theorems expressible in the original vocabulary.`
  },
  {
    id: "f5-weak-extension",
    name: "Weak Extension Test",
    functionId: 5,
    input: ``,
    instructions: `Check whether the extension is conservative under definitional abbreviations only.`
  },
  {
    id: "f5-independence",
    name: "Independence Check",
    functionId: 5,
    input: ``,
    instructions: `Detect whether the added axiom is independent of the base theory.`
  },
  // FUNCTION 6: Compare Conceptual Schemes
  {
    id: "f6-primitive-derived",
    name: "Primitive vs. Derived Classification",
    functionId: 6,
    input: ``,
    instructions: `Classify all concepts into primitive and derived categories and return a dependency graph.`
  },
  {
    id: "f6-depth-map",
    name: "Conceptual Depth Map",
    functionId: 6,
    input: ``,
    instructions: `Compute the conceptual depth of each notion (number of definitional layers).`
  },
  {
    id: "f6-bottleneck",
    name: "Bottleneck Detection",
    functionId: 6,
    input: ``,
    instructions: `Identify which primitives all other concepts ultimately depend on.`
  },
  {
    id: "f6-rebalancing",
    name: "Conceptual Rebalancing",
    functionId: 6,
    input: ``,
    instructions: `Suggest alternative choices of primitives that distribute conceptual load more evenly.`
  },
  // FUNCTION 7: Ontological Dependence
  {
    id: "f7-remove-one",
    name: "Remove One Primitive",
    functionId: 7,
    input: ``,
    instructions: `Remove a selected primitive and evaluate the structural collapse.`
  },
  {
    id: "f7-minimal-set",
    name: "Minimal Primitive Set",
    functionId: 7,
    input: ``,
    instructions: `Find the smallest subset of primitives that allows the theory to remain functional.`
  },
  {
    id: "f7-replacement",
    name: "Replacement Test",
    functionId: 7,
    input: ``,
    instructions: `Attempt to replace a primitive with a definable surrogate.`
  },
  {
    id: "f7-load-bearing",
    name: "Load-Bearing Ranking",
    functionId: 7,
    input: ``,
    instructions: `Rank all primitives in order of ontological importance.`
  },
  // FUNCTION 8: Generate Alternative Conceptualizations
  {
    id: "f8-invert-ontology",
    name: "Invert Ontology",
    functionId: 8,
    input: ``,
    instructions: `Make derived notions primitive and rewrite the old primitives as definitions.`
  },
  {
    id: "f8-behavioral",
    name: "Behavioral Reconstruction",
    functionId: 8,
    input: ``,
    instructions: `Rewrite the theory using observable behavioral primitives only.`
  },
  {
    id: "f8-structural",
    name: "Structural Reconstruction",
    functionId: 8,
    input: ``,
    instructions: `Rewrite the theory using structural or relational primitives only.`
  },
  {
    id: "f8-physicalization",
    name: "Physicalization",
    functionId: 8,
    input: ``,
    instructions: `Rewrite the theory using physical, geometric, or metric primitives.`
  },
  // FUNCTION 9: Identify Representational Biases
  {
    id: "f9-privilege",
    name: "Privilege Detection",
    functionId: 9,
    input: ``,
    instructions: `Identify what the theory makes easy to express.`
  },
  {
    id: "f9-blind-spot",
    name: "Blind-Spot Detection",
    functionId: 9,
    input: ``,
    instructions: `Identify what the theory makes hard or impossible to express.`
  },
  {
    id: "f9-worldview",
    name: "Worldview Extraction",
    functionId: 9,
    input: ``,
    instructions: `Extract the implicit worldview embedded in the choice of primitives.`
  },
  {
    id: "f9-bias-ranking",
    name: "Bias Severity Ranking",
    functionId: 9,
    input: ``,
    instructions: `Rank representational biases from strongest to weakest.`
  }
];

interface PresetsSidebarProps {
  onSelectPreset: (preset: Preset) => void;
}

export function PresetsSidebar({ onSelectPreset }: PresetsSidebarProps) {
  const [openSections, setOpenSections] = useState<number[]>([1, 2, 3]);

  const functionNames = [
    "Axiom-Set / Theory Transformation",
    "Schema Equivalence",
    "Definitional Equivalence",
    "Model-Preserving Rewrite",
    "Conservative Extension Analysis",
    "Compare Conceptual Schemes",
    "Ontological Dependence",
    "Generate Alternative Conceptualizations",
    "Identify Representational Biases"
  ];

  const toggleSection = (id: number) => {
    setOpenSections(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const groupedPresets = functionNames.map((name, idx) => ({
    id: idx + 1,
    name,
    presets: PRESETS.filter(p => p.functionId === idx + 1)
  }));

  return (
    <div className="h-full border-r border-border bg-muted/20 flex flex-col">
      <div className="p-4 border-b border-border bg-background/50">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Presets
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Load example inputs for each function
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {groupedPresets.map((group) => (
            <Collapsible 
              key={group.id} 
              open={openSections.includes(group.id)}
              onOpenChange={() => toggleSection(group.id)}
            >
              <CollapsibleTrigger className="w-full flex items-center justify-between p-2 rounded-sm hover:bg-muted/50 transition-colors text-left">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="outline" className="font-mono text-[10px] shrink-0 rounded-sm">
                    {group.id}
                  </Badge>
                  <span className="text-xs font-medium truncate">{group.name}</span>
                </div>
                <ChevronDown className={`h-3 w-3 shrink-0 text-muted-foreground transition-transform ${openSections.includes(group.id) ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pl-4 pr-2 pb-2 space-y-1">
                  {group.presets.length > 0 ? (
                    group.presets.map((preset) => (
                      <Button
                        key={preset.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-8 font-normal text-muted-foreground hover:text-foreground"
                        onClick={() => onSelectPreset(preset)}
                        data-testid={`preset-${preset.id}`}
                      >
                        {preset.name}
                      </Button>
                    ))
                  ) : (
                    <p className="text-[10px] text-muted-foreground/50 py-1 pl-2">No presets</p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
