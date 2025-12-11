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
    instructions: `Identify the first two primitives in the theory. Make the first primitive defined in terms of the second. Rewrite all axioms accordingly while preserving all models.`
  },
  {
    id: "f1-signature-change",
    name: "Signature Change",
    functionId: 1,
    input: ``,
    instructions: `Replace all binary relations with ternary relations by adding a context parameter. Rewrite all axioms to use the new signatures while preserving meaning.`
  },
  {
    id: "f1-vocab-compression",
    name: "Vocabulary Compression",
    functionId: 1,
    input: ``,
    instructions: `Find and eliminate all redundant primitives. Keep only the minimal set needed to express all axioms. Define eliminated primitives in terms of the survivors.`
  },
  {
    id: "f1-vocab-expansion",
    name: "Vocabulary Expansion",
    functionId: 1,
    input: ``,
    instructions: `Introduce a new helper primitive that captures the most common pattern in the axioms. Rewrite the axioms to use this new primitive, making them shorter and clearer.`
  },
  {
    id: "f1-non-iso-equivalent",
    name: "Non-Isomorphic Equivalent",
    functionId: 1,
    input: ``,
    instructions: `Create a structurally different theory with the same theorems. Use completely different primitives with different arities. Provide the translation between the two theories.`
  },
  // FUNCTION 2: Schema Equivalence
  {
    id: "f2-direct-vocab",
    name: "Direct Vocabulary Mapping",
    functionId: 2,
    input: ``,
    instructions: `Build a one-to-one symbol mapping between the two theories. Match each primitive to exactly one primitive in the other theory. Report if such a mapping exists.`
  },
  {
    id: "f2-arity-preserving",
    name: "Arity-Preserving Mapping",
    functionId: 2,
    input: ``,
    instructions: `Only consider mappings where primitives have the same arity. Binary maps to binary, unary to unary. Report all valid arity-preserving maps.`
  },
  {
    id: "f2-structural-role",
    name: "Structural Role Mapping",
    functionId: 2,
    input: ``,
    instructions: `Map primitives based on their structural role in the axioms (e.g., reflexive relations to reflexive relations). Ignore symbol names entirely.`
  },
  {
    id: "f2-obstruction",
    name: "Minimal Obstruction Report",
    functionId: 2,
    input: ``,
    instructions: `If the theories are not schema-equivalent, identify the smallest structural difference that prevents equivalence. Report the specific axiom or property that blocks the mapping.`
  },
  // FUNCTION 3: Definitional Equivalence
  {
    id: "f3-mutual-explicit",
    name: "Mutual Explicit Definitions",
    functionId: 3,
    input: ``,
    instructions: `For each primitive in Theory A, write an explicit definition using Theory B's vocabulary. Then do the reverse. Show the complete bi-directional translation.`
  },
  {
    id: "f3-one-direction",
    name: "One-Direction Definability",
    functionId: 3,
    input: ``,
    instructions: `Define all primitives of Theory A using only Theory B's vocabulary. Show each definition and verify it preserves the intended meaning.`
  },
  {
    id: "f3-minimization",
    name: "Definition Minimization",
    functionId: 3,
    input: ``,
    instructions: `Find the shortest possible explicit definitions. Minimize the total number of quantifiers and logical connectives in the definitions.`
  },
  {
    id: "f3-conservative",
    name: "Conservative Definability",
    functionId: 3,
    input: ``,
    instructions: `Provide only conservative definitions that do not introduce any new theorems. Verify that each definition is eliminable without changing provability.`
  },
  // FUNCTION 4: Model-Preserving Rewrite
  {
    id: "f4-reduced-primitive",
    name: "Reduced Primitive Set",
    functionId: 4,
    input: ``,
    instructions: `Eliminate as many primitives as possible while keeping exactly the same models. Report the minimal primitive set and how eliminated primitives are defined.`
  },
  {
    id: "f4-expanded-primitive",
    name: "Expanded Primitive Set",
    functionId: 4,
    input: ``,
    instructions: `Add new convenient primitives that make the axioms simpler. Each new primitive should abbreviate a common pattern. Verify model-equivalence.`
  },
  {
    id: "f4-algebraic",
    name: "Algebraic Reconstruction",
    functionId: 4,
    input: ``,
    instructions: `Rewrite the theory using only function symbols and equations. Convert all relations to functions. Produce an equational/algebraic formulation.`
  },
  {
    id: "f4-pure-relational",
    name: "Pure Relational Reconstruction",
    functionId: 4,
    input: ``,
    instructions: `Eliminate all function symbols and constants. Rewrite using only relations and predicates. Every term becomes a relational assertion.`
  },
  // FUNCTION 5: Conservative Extension Analysis
  {
    id: "f5-new-primitives",
    name: "New Primitives Test",
    functionId: 5,
    input: ``,
    instructions: `Analyze whether adding the specified new primitives changes any theorems in the original vocabulary. Report conservative or non-conservative with justification.`
  },
  {
    id: "f5-new-axioms",
    name: "New Axioms Test",
    functionId: 5,
    input: ``,
    instructions: `Determine whether adding the new axioms proves any new facts expressible in the original vocabulary. Provide proof or countermodel.`
  },
  {
    id: "f5-weak-extension",
    name: "Weak Extension Test",
    functionId: 5,
    input: ``,
    instructions: `Check if the extension is conservative when allowing only definitional abbreviations. Stricter than full conservativity.`
  },
  {
    id: "f5-independence",
    name: "Independence Check",
    functionId: 5,
    input: ``,
    instructions: `Determine whether the added axiom is independent of the base theory (neither provable nor refutable). Provide model evidence for independence.`
  },
  // FUNCTION 6: Compare Conceptual Schemes
  {
    id: "f6-primitive-derived",
    name: "Primitive vs. Derived Classification",
    functionId: 6,
    input: ``,
    instructions: `List all concepts. Classify each as primitive or derived. Draw the dependency graph showing which concepts depend on which.`
  },
  {
    id: "f6-depth-map",
    name: "Conceptual Depth Map",
    functionId: 6,
    input: ``,
    instructions: `For each concept, compute its definitional depth (how many layers of definitions separate it from primitives). Rank concepts by depth.`
  },
  {
    id: "f6-bottleneck",
    name: "Bottleneck Detection",
    functionId: 6,
    input: ``,
    instructions: `Identify which primitives all other concepts ultimately depend on. Find conceptual bottlenecks that everything flows through.`
  },
  {
    id: "f6-rebalancing",
    name: "Conceptual Rebalancing",
    functionId: 6,
    input: ``,
    instructions: `Suggest alternative primitive choices that distribute conceptual load more evenly. Reduce bottlenecks by changing what counts as primitive.`
  },
  // FUNCTION 7: Ontological Dependence
  {
    id: "f7-remove-one",
    name: "Remove One Primitive",
    functionId: 7,
    input: ``,
    instructions: `Remove the first/main primitive and analyze what collapses. Report which axioms become unstatable and which theorems are lost.`
  },
  {
    id: "f7-minimal-set",
    name: "Minimal Primitive Set",
    functionId: 7,
    input: ``,
    instructions: `Find the smallest subset of primitives that keeps the theory functional. All other primitives must be definable from this set.`
  },
  {
    id: "f7-replacement",
    name: "Replacement Test",
    functionId: 7,
    input: ``,
    instructions: `For the main/first primitive, attempt to replace it with a definable surrogate constructed from other primitives. Show the replacement or prove it impossible.`
  },
  {
    id: "f7-load-bearing",
    name: "Load-Bearing Ranking",
    functionId: 7,
    input: ``,
    instructions: `Rank all primitives from most to least ontologically important. Score by how many axioms and theorems depend on each.`
  },
  // FUNCTION 8: Generate Alternative Conceptualizations
  {
    id: "f8-invert-ontology",
    name: "Invert Ontology",
    functionId: 8,
    input: ``,
    instructions: `Make the most commonly derived concept into a primitive. Redefine the original primitives using this new base. Produce the inverted theory.`
  },
  {
    id: "f8-behavioral",
    name: "Behavioral Reconstruction",
    functionId: 8,
    input: ``,
    instructions: `Rewrite the theory using only observable/behavioral predicates. Eliminate any primitives that refer to intrinsic properties. Keep only what can be tested.`
  },
  {
    id: "f8-structural",
    name: "Structural Reconstruction",
    functionId: 8,
    input: ``,
    instructions: `Rewrite the theory using only structural/relational primitives. Eliminate any primitives about intrinsic properties. Focus on relations between things.`
  },
  {
    id: "f8-physicalization",
    name: "Physicalization",
    functionId: 8,
    input: ``,
    instructions: `Rewrite the theory using physical, spatial, or metric primitives. Ground abstract concepts in physical terms where possible.`
  },
  // FUNCTION 9: Identify Representational Biases
  {
    id: "f9-privilege",
    name: "Privilege Detection",
    functionId: 9,
    input: ``,
    instructions: `Analyze what the theory's primitives make easy to express. List concepts and relations that can be stated simply. These are the privileged structures.`
  },
  {
    id: "f9-blind-spot",
    name: "Blind-Spot Detection",
    functionId: 9,
    input: ``,
    instructions: `Analyze what the theory's primitives make hard or impossible to express. List concepts that require complex circumlocutions or cannot be stated at all.`
  },
  {
    id: "f9-worldview",
    name: "Worldview Extraction",
    functionId: 9,
    input: ``,
    instructions: `Extract the implicit worldview embedded in the primitive choices. What ontological commitments do these primitives encode? What kind of reality do they presuppose?`
  },
  {
    id: "f9-bias-ranking",
    name: "Bias Severity Ranking",
    functionId: 9,
    input: ``,
    instructions: `List all representational biases from strongest to weakest. For each bias, explain what it privileges, what it suppresses, and how severe the distortion is.`
  },
  // FUNCTION 10: Find an Interpretation
  {
    id: "f10-mathematics",
    name: "Mathematical Interpretation",
    functionId: 10,
    input: ``,
    instructions: `Find an interpretation from pure mathematics. Map primitives to set-theoretic, algebraic, or geometric structures. Verify each axiom holds in the model.`
  },
  {
    id: "f10-physics",
    name: "Physical Interpretation",
    functionId: 10,
    input: ``,
    instructions: `Find an interpretation from physics. Map primitives to physical entities (spacetime, particles, fields, forces). Show how each axiom becomes a true physical statement.`
  },
  {
    id: "f10-economics",
    name: "Economic Interpretation",
    functionId: 10,
    input: ``,
    instructions: `Find an interpretation from economics. Map primitives to economic entities (agents, goods, preferences, markets). Verify each axiom as an economic principle.`
  },
  {
    id: "f10-computer-science",
    name: "Computational Interpretation",
    functionId: 10,
    input: ``,
    instructions: `Find an interpretation from computer science. Map primitives to computational structures (types, programs, data structures, processes). Verify each axiom computationally.`
  },
  {
    id: "f10-philosophy",
    name: "Philosophical Interpretation",
    functionId: 10,
    input: ``,
    instructions: `Find an interpretation from philosophy or metaphysics. Map primitives to philosophical concepts (substances, properties, events, minds). Explain the philosophical significance.`
  },
  // FUNCTION 11: Determine Equivalence
  {
    id: "f11-theorem-comparison",
    name: "Full Theorem Comparison",
    functionId: 11,
    input: ``,
    instructions: `Compare all theorems provable in each system. Determine if they generate exactly the same theorems. Provide examples of shared and unique theorems.`
  },
  {
    id: "f11-strength-analysis",
    name: "Relative Strength Analysis",
    functionId: 11,
    input: ``,
    instructions: `Determine which system is stronger (proves more theorems). If one is strictly stronger, show a theorem provable only in the stronger system.`
  },
  {
    id: "f11-translation-check",
    name: "Mutual Translation Check",
    functionId: 11,
    input: ``,
    instructions: `Check if there exists a translation between the two systems that preserves all theorems. If so, provide the translation. If not, explain the obstruction.`
  },
  {
    id: "f11-conservativity",
    name: "Conservativity Check",
    functionId: 11,
    input: ``,
    instructions: `Determine if one system is a conservative extension of the other (proves the same theorems in the shared language). Identify any new theorems if not conservative.`
  }
];

interface PresetsSidebarProps {
  onSelectPreset: (preset: Preset) => void;
}

export function PresetsSidebar({ onSelectPreset }: PresetsSidebarProps) {
  const [openSections, setOpenSections] = useState<number[]>([1, 2, 3]);

  const functionNames = [
    "Axiom-Set / Theory Transformation (1 Arg)",
    "Schema Equivalence (2 Args)",
    "Definitional Equivalence (2 Args)",
    "Model-Preserving Rewrite (1 Arg)",
    "Conservative Extension Analysis (2 Args)",
    "Compare Conceptual Schemes (2 Args)",
    "Ontological Dependence (1 Arg)",
    "Generate Alt. Conceptualizations (1 Arg)",
    "Identify Representational Biases (1 Arg)",
    "Find an Interpretation (1 Arg)",
    "Determine Equivalence (2 Args)"
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
          Click to run transformation instantly
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
