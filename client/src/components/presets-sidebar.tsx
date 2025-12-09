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
  {
    id: "transform-primitive-swap",
    name: "Primitive Swap",
    functionId: 1,
    input: `Primitives:
  Point(x)
  Between(x, y, z)

Axioms:
1. ∀x∀y∀z [Between(x, y, z) → Point(x) ∧ Point(y) ∧ Point(z)]
2. ∀x∀y [x ≠ y → ∃z Between(x, z, y)]
3. ∀x∀y∀z∀w [(Between(x, y, z) ∧ Between(y, z, w)) → Between(x, y, w)]`,
    instructions: `Swap primitives: Make "Line(x, y)" primitive instead of "Point". Define Point in terms of Line. Preserve all theorems.`
  },
  {
    id: "transform-signature-change",
    name: "Signature Change",
    functionId: 1,
    input: `Primitives:
  Connected(x, y)   // 2-place relation: x is connected to y

Axioms:
1. ∀x∀y [Connected(x, y) → Connected(y, x)]     (Symmetry)
2. ∀x [Connected(x, x)]                          (Reflexivity)
3. ∀x∀y∀z [(Connected(x, y) ∧ Connected(y, z)) → Connected(x, z)]  (Transitivity)`,
    instructions: `Change the signature: Replace the 2-place relation Connected(x, y) with a 1-place predicate Component(x) and a function component(x) that returns the component ID. Preserve equivalence.`
  },
  {
    id: "transform-vocab-compress",
    name: "Vocabulary Compression",
    functionId: 1,
    input: `Primitives:
  Red(x)
  Blue(x)
  Green(x)
  Yellow(x)
  Colored(x)
  Primary(x)
  Secondary(x)

Axioms:
1. ∀x [Red(x) → Colored(x)]
2. ∀x [Blue(x) → Colored(x)]
3. ∀x [Green(x) → Colored(x)]
4. ∀x [Yellow(x) → Colored(x)]
5. ∀x [Red(x) → Primary(x)]
6. ∀x [Blue(x) → Primary(x)]
7. ∀x [Yellow(x) → Primary(x)]
8. ∀x [Green(x) → Secondary(x)]
9. ∀x [Colored(x) → (Red(x) ∨ Blue(x) ∨ Green(x) ∨ Yellow(x))]`,
    instructions: `Compress vocabulary: Reduce to the minimal set of primitives that can express this entire theory. Eliminate redundant predicates.`
  },
  {
    id: "transform-vocab-expand",
    name: "Vocabulary Expansion",
    functionId: 1,
    input: `Primitives:
  < (less-than on natural numbers)

Axioms:
1. ∀x ¬(x < x)                           (Irreflexivity)
2. ∀x∀y∀z [(x < y ∧ y < z) → x < z]      (Transitivity)
3. ∀x∀y [x < y ∨ x = y ∨ y < x]          (Trichotomy)
4. ∀x ∃y [x < y]                          (No maximum)
5. ∃x ∀y [x < y ∨ x = y]                  (Minimum exists)`,
    instructions: `Expand vocabulary: Introduce additional primitives like Successor(x, y), Zero(x), and ≤ that simplify or shorten the axioms while preserving all theorems.`
  },
  {
    id: "transform-non-iso",
    name: "Non-Isomorphic Equivalent",
    functionId: 1,
    input: `Primitives:
  Person(x)
  Parent(x, y)   // x is a parent of y

Axioms:
1. ∀x∀y [Parent(x, y) → Person(x) ∧ Person(y)]
2. ∀x∀y [Parent(x, y) → x ≠ y]
3. ∀x∀y∀z [(Parent(x, z) ∧ Parent(y, z)) → (x = y ∨ Spouse(x, y))]
4. ∀x [Person(x) → ∃y∃z (Parent(y, x) ∧ Parent(z, x) ∧ y ≠ z)]`,
    instructions: `Generate a non-isomorphic equivalent theory: Create a structurally different theory using different primitives (e.g., Child(x,y), Ancestor(x,y)) that produces the same models up to interpretation.`
  },
  {
    id: "schema-2a",
    name: "Parent vs Ancestor",
    functionId: 2,
    input: `Schema A — Using "Parent(x, y)"

Primitives:
  Parent(x, y)

Axioms:
1. ∀x∀y [Parent(x, y) → x ≠ y]
2. ∀x∀y∀z [(Parent(x, y) ∧ Parent(y, z)) → Parent(x, z)]

---

Schema B — Using "Ancestor(x, y)"

Primitives:
  Ancestor(x, y)

Axioms:
1. ∀x∀y [Ancestor(x, y) → x ≠ y]
2. ∀x∀y∀z [(Ancestor(x, y) ∧ Ancestor(y, z)) → Ancestor(x, z)]
3. ∀x∀y [Parent(x, y) → Ancestor(x, y)]`,
    instructions: `Determine whether Schema A and Schema B are schema-equivalent.`
  },
  {
    id: "schema-2b",
    name: "Employment Schemas",
    functionId: 2,
    input: `Schema A:
A company employs a person if that person works for it full-time or part-time.
A contractor is someone who performs paid labor for a company but is not employed by it.

---

Schema B:
A worker is anyone who performs labor for a company.
Workers divide into employees (full-time or part-time) and contractors (not employees).`,
    instructions: `Are these two schemas equivalent? Produce the mapping if they are.`
  },
  {
    id: "defn-3a",
    name: "Less-Than vs Greater",
    functionId: 3,
    input: `Theory A:
Primitives: < (less-than relation)
Axioms:
1. ∀x ∀y ¬(x < x)
2. ∀x ∀y ∀z [(x < y ∧ y < z) → x < z]

---

Theory B:
Primitives: Greater(x, y)
Axioms:
1. ∀x ∀y [Greater(x, y) → ¬Greater(y, x)]
2. ∀x ∀y ∀z [(Greater(x, y) ∧ Greater(y, z)) → Greater(x, z)]`,
    instructions: `Determine whether Theory A and Theory B are definitionally equivalent. If they are, give the explicit definitions in both directions.`
  },
  {
    id: "defn-3b",
    name: "Eligibility vs Qualification",
    functionId: 3,
    input: `Text A:
A person is "eligible" if they satisfy all job requirements.
A requirement is "met" if the person's profile contains the corresponding skill.

---

Text B:
A person is "qualified" if every required skill appears in their skill list.
A skill is "required" for a job if the job description lists it.`,
    instructions: `Are these definitional equivalents? Provide the definitions if so.`
  },
  {
    id: "model-4",
    name: "Group Theory Model",
    functionId: 4,
    input: `Axioms:
1. ∀x∀y∀z [(x * y) * z = x * (y * z)]  (Associativity)
2. ∃e ∀x [e * x = x ∧ x * e = x]       (Identity)
3. ∀x ∃y [x * y = e ∧ y * x = e]       (Inverse)`,
    instructions: `Find a finite model (group) with exactly 3 elements. Provide the multiplication table.`
  },
  {
    id: "consistency-5",
    name: "Set Theory Subset",
    functionId: 5,
    input: `Axioms:
1. ∀x [x ∈ A → x ∈ B]      (A ⊆ B)
2. ∃x [x ∈ A]              (A is non-empty)
3. ∀x [x ∈ B → x ∉ A]      (B and A are disjoint)`,
    instructions: `Check whether this axiom set is consistent. If not, identify the contradiction.`
  },
  {
    id: "independence-6",
    name: "Parallel Postulate",
    functionId: 6,
    input: `Base Axioms (Neutral Geometry):
1. Two points determine a unique line
2. A line segment can be extended indefinitely
3. A circle can be drawn with any center and radius
4. All right angles are equal

Target Axiom (Parallel Postulate):
Given a line and a point not on it, exactly one line through the point is parallel to the given line.`,
    instructions: `Prove that the parallel postulate is independent of the other axioms by constructing a model.`
  },
  {
    id: "complete-7",
    name: "Dense Linear Order",
    functionId: 7,
    input: `Theory of Dense Linear Orders without endpoints:
1. ∀x ¬(x < x)                           (Irreflexivity)
2. ∀x∀y∀z [(x < y ∧ y < z) → x < z]      (Transitivity)  
3. ∀x∀y [x < y ∨ x = y ∨ y < x]          (Trichotomy)
4. ∀x∀y [x < y → ∃z (x < z ∧ z < y)]     (Density)
5. ∀x ∃y∃z [y < x ∧ x < z]               (No endpoints)`,
    instructions: `Analyze whether this theory is complete. If not, provide an example of an undecidable sentence.`
  },
  {
    id: "reduction-8",
    name: "Natural Numbers",
    functionId: 8,
    input: `Current ontology:
- Natural numbers as primitive objects: 0, 1, 2, 3, ...
- Successor function: S(n)
- Addition: n + m
- Multiplication: n × m

Peano Axioms:
1. 0 is a natural number
2. For every natural number n, S(n) is a natural number
3. For no natural number n does S(n) = 0
4. S is injective
5. Induction axiom schema`,
    instructions: `Reduce the ontological commitment by showing how natural numbers can be constructed from sets alone (Frege-Russell or von Neumann construction).`
  },
  {
    id: "theorem-9",
    name: "Propositional Logic",
    functionId: 9,
    input: `Axioms:
1. P → (Q → P)
2. (P → (Q → R)) → ((P → Q) → (P → R))
3. (¬P → ¬Q) → (Q → P)

Rule: Modus Ponens - from P and P → Q, infer Q`,
    instructions: `Derive the theorem: P → P (identity/reflexivity of implication)`
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
    "Model Finding & Counter-Examples",
    "Consistency Check",
    "Independence Proofs",
    "Completeness Analysis",
    "Ontological Reduction",
    "Theorem Derivation"
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
