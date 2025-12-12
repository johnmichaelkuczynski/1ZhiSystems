import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, BookOpen } from "lucide-react";

interface AxiomSet {
  id: string;
  name: string;
  category: string;
  content: string;
  description: string;
}

const AXIOM_LIBRARY: AxiomSet[] = [
  {
    id: "strict-partial-order",
    name: "Strict Partial Order",
    category: "Order Theory",
    description: "Irreflexive, transitive relation",
    content: `LANGUAGE: {<(x,y)}

AXIOMS:
1. ∀x ¬(x < x)                           [Irreflexivity]
2. ∀x∀y∀z ((x < y ∧ y < z) → x < z)     [Transitivity]`
  },
  {
    id: "strict-total-order",
    name: "Strict Total Order",
    category: "Order Theory",
    description: "Trichotomous strict order",
    content: `LANGUAGE: {<(x,y)}

AXIOMS:
1. ∀x ¬(x < x)                           [Irreflexivity]
2. ∀x∀y∀z ((x < y ∧ y < z) → x < z)     [Transitivity]
3. ∀x∀y (x < y ∨ x = y ∨ y < x)         [Trichotomy]`
  },
  {
    id: "partial-order",
    name: "Partial Order (Non-Strict)",
    category: "Order Theory",
    description: "Reflexive, antisymmetric, transitive",
    content: `LANGUAGE: {≤(x,y)}

AXIOMS:
1. ∀x (x ≤ x)                            [Reflexivity]
2. ∀x∀y ((x ≤ y ∧ y ≤ x) → x = y)       [Antisymmetry]
3. ∀x∀y∀z ((x ≤ y ∧ y ≤ z) → x ≤ z)     [Transitivity]`
  },
  {
    id: "equivalence-relation",
    name: "Equivalence Relation",
    category: "Relations",
    description: "Reflexive, symmetric, transitive",
    content: `LANGUAGE: {∼(x,y)}

AXIOMS:
1. ∀x (x ∼ x)                            [Reflexivity]
2. ∀x∀y (x ∼ y → y ∼ x)                 [Symmetry]
3. ∀x∀y∀z ((x ∼ y ∧ y ∼ z) → x ∼ z)     [Transitivity]`
  },
  {
    id: "group-theory",
    name: "Group Theory",
    category: "Algebra",
    description: "Associative operation with identity and inverses",
    content: `LANGUAGE: {·(x,y), e, inv(x)}

AXIOMS:
1. ∀x∀y∀z ((x · y) · z = x · (y · z))   [Associativity]
2. ∀x (e · x = x)                        [Left Identity]
3. ∀x (x · e = x)                        [Right Identity]
4. ∀x (inv(x) · x = e)                   [Left Inverse]
5. ∀x (x · inv(x) = e)                   [Right Inverse]`
  },
  {
    id: "abelian-group",
    name: "Abelian Group",
    category: "Algebra",
    description: "Commutative group",
    content: `LANGUAGE: {+(x,y), 0, −(x)}

AXIOMS:
1. ∀x∀y∀z ((x + y) + z = x + (y + z))   [Associativity]
2. ∀x (0 + x = x)                        [Identity]
3. ∀x (−x + x = 0)                       [Inverse]
4. ∀x∀y (x + y = y + x)                  [Commutativity]`
  },
  {
    id: "ring-theory",
    name: "Ring Theory",
    category: "Algebra",
    description: "Two operations: addition (abelian group) and multiplication",
    content: `LANGUAGE: {+(x,y), ·(x,y), 0, −(x)}

AXIOMS:
1. ∀x∀y∀z ((x + y) + z = x + (y + z))   [Add Associativity]
2. ∀x (0 + x = x)                        [Add Identity]
3. ∀x (−x + x = 0)                       [Add Inverse]
4. ∀x∀y (x + y = y + x)                  [Add Commutativity]
5. ∀x∀y∀z ((x · y) · z = x · (y · z))   [Mult Associativity]
6. ∀x∀y∀z (x · (y + z) = x·y + x·z)     [Left Distributivity]
7. ∀x∀y∀z ((x + y) · z = x·z + y·z)     [Right Distributivity]`
  },
  {
    id: "boolean-algebra",
    name: "Boolean Algebra",
    category: "Algebra",
    description: "Complemented distributive lattice",
    content: `LANGUAGE: {∨(x,y), ∧(x,y), ¬(x), 0, 1}

AXIOMS:
1. ∀x∀y (x ∨ y = y ∨ x)                  [∨ Commutativity]
2. ∀x∀y (x ∧ y = y ∧ x)                  [∧ Commutativity]
3. ∀x∀y∀z ((x ∨ y) ∨ z = x ∨ (y ∨ z))   [∨ Associativity]
4. ∀x∀y∀z ((x ∧ y) ∧ z = x ∧ (y ∧ z))   [∧ Associativity]
5. ∀x (x ∨ 0 = x)                        [∨ Identity]
6. ∀x (x ∧ 1 = x)                        [∧ Identity]
7. ∀x (x ∨ ¬x = 1)                       [Complement]
8. ∀x (x ∧ ¬x = 0)                       [Complement]
9. ∀x∀y∀z (x ∧ (y ∨ z) = (x ∧ y) ∨ (x ∧ z))  [Distributivity]`
  },
  {
    id: "lattice",
    name: "Lattice",
    category: "Order Theory",
    description: "Partial order with meets and joins",
    content: `LANGUAGE: {≤(x,y), ∧(x,y), ∨(x,y)}

AXIOMS:
1. ∀x (x ≤ x)                            [Reflexivity]
2. ∀x∀y ((x ≤ y ∧ y ≤ x) → x = y)       [Antisymmetry]
3. ∀x∀y∀z ((x ≤ y ∧ y ≤ z) → x ≤ z)     [Transitivity]
4. ∀x∀y (x ∧ y ≤ x)                      [Meet Lower Bound]
5. ∀x∀y (x ∧ y ≤ y)                      [Meet Lower Bound]
6. ∀x∀y∀z ((z ≤ x ∧ z ≤ y) → z ≤ x ∧ y) [Meet Greatest Lower Bound]
7. ∀x∀y (x ≤ x ∨ y)                      [Join Upper Bound]
8. ∀x∀y (y ≤ x ∨ y)                      [Join Upper Bound]
9. ∀x∀y∀z ((x ≤ z ∧ y ≤ z) → x ∨ y ≤ z) [Join Least Upper Bound]`
  },
  {
    id: "set-membership",
    name: "Set Membership",
    category: "Set Theory",
    description: "Basic membership and subset relations",
    content: `LANGUAGE: {∈(x,y), ⊆(x,y)}

AXIOMS:
1. ∀x∀y (x ⊆ y ↔ ∀z (z ∈ x → z ∈ y))   [Subset Definition]
2. ∀x (x ⊆ x)                            [Reflexivity of ⊆]
3. ∀x∀y ((x ⊆ y ∧ y ⊆ x) → x = y)       [Extensionality]`
  },
  {
    id: "zfc-basic",
    name: "ZFC (Core Axioms)",
    category: "Set Theory",
    description: "Basic ZFC axioms",
    content: `LANGUAGE: {∈(x,y)}

AXIOMS:
1. ∀x∀y (∀z (z ∈ x ↔ z ∈ y) → x = y)   [Extensionality]
2. ∃x ∀y ¬(y ∈ x)                        [Empty Set]
3. ∀x∀y ∃z ∀w (w ∈ z ↔ (w = x ∨ w = y)) [Pairing]
4. ∀x ∃y ∀z (z ∈ y ↔ ∃w (w ∈ x ∧ z ∈ w)) [Union]`
  },
  {
    id: "preorder",
    name: "Preorder",
    category: "Order Theory",
    description: "Reflexive and transitive",
    content: `LANGUAGE: {≼(x,y)}

AXIOMS:
1. ∀x (x ≼ x)                            [Reflexivity]
2. ∀x∀y∀z ((x ≼ y ∧ y ≼ z) → x ≼ z)     [Transitivity]`
  },
  {
    id: "dense-order",
    name: "Dense Linear Order",
    category: "Order Theory",
    description: "No endpoints, dense, linear",
    content: `LANGUAGE: {<(x,y)}

AXIOMS:
1. ∀x ¬(x < x)                           [Irreflexivity]
2. ∀x∀y∀z ((x < y ∧ y < z) → x < z)     [Transitivity]
3. ∀x∀y (x < y ∨ x = y ∨ y < x)         [Trichotomy]
4. ∀x∀y (x < y → ∃z (x < z ∧ z < y))    [Density]
5. ∀x ∃y (y < x)                         [No Minimum]
6. ∀x ∃y (x < y)                         [No Maximum]`
  },
  {
    id: "monoid",
    name: "Monoid",
    category: "Algebra",
    description: "Associative operation with identity",
    content: `LANGUAGE: {·(x,y), e}

AXIOMS:
1. ∀x∀y∀z ((x · y) · z = x · (y · z))   [Associativity]
2. ∀x (e · x = x)                        [Left Identity]
3. ∀x (x · e = x)                        [Right Identity]`
  },
  {
    id: "semigroup",
    name: "Semigroup",
    category: "Algebra",
    description: "Just associativity",
    content: `LANGUAGE: {·(x,y)}

AXIOMS:
1. ∀x∀y∀z ((x · y) · z = x · (y · z))   [Associativity]`
  },
  {
    id: "field-theory",
    name: "Field Theory",
    category: "Algebra",
    description: "Ring with multiplicative inverses for non-zero elements",
    content: `LANGUAGE: {+(x,y), ·(x,y), 0, 1, −(x), inv(x)}

AXIOMS:
1. ∀x∀y∀z ((x + y) + z = x + (y + z))   [Add Associativity]
2. ∀x (0 + x = x)                        [Add Identity]
3. ∀x (−x + x = 0)                       [Add Inverse]
4. ∀x∀y (x + y = y + x)                  [Add Commutativity]
5. ∀x∀y∀z ((x · y) · z = x · (y · z))   [Mult Associativity]
6. ∀x (1 · x = x)                        [Mult Identity]
7. ∀x (x ≠ 0 → inv(x) · x = 1)          [Mult Inverse]
8. ∀x∀y (x · y = y · x)                  [Mult Commutativity]
9. ∀x∀y∀z (x · (y + z) = x·y + x·z)     [Distributivity]
10. 0 ≠ 1                                [Non-triviality]`
  },
];

interface AxiomLibraryProps {
  onCopyToInput?: (content: string, functionId: number) => void;
}

export function AxiomLibrary({ onCopyToInput }: AxiomLibraryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (axiomSet: AxiomSet) => {
    await navigator.clipboard.writeText(axiomSet.content);
    setCopiedId(axiomSet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = Array.from(new Set(AXIOM_LIBRARY.map(a => a.category)));

  return (
    <div className="border border-border rounded-sm bg-card">
      <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Axiom Library
        </h3>
        <Badge variant="secondary" className="text-[10px]">
          {AXIOM_LIBRARY.length} sets
        </Badge>
      </div>
      
      <ScrollArea className="h-[550px]">
          <div className="p-3 space-y-4">
            {categories.map(category => (
              <div key={category}>
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 sticky top-0 bg-card py-1">
                  {category}
                </div>
                <div className="space-y-2">
                  {AXIOM_LIBRARY.filter(a => a.category === category).map(axiomSet => (
                    <div 
                      key={axiomSet.id}
                      className="border border-border rounded-sm p-2 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{axiomSet.name}</div>
                          <div className="text-[10px] text-muted-foreground">{axiomSet.description}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(axiomSet)}
                          className="h-7 w-7 shrink-0 opacity-50 group-hover:opacity-100"
                          data-testid={`copy-axiom-${axiomSet.id}`}
                        >
                          {copiedId === axiomSet.id ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                      <pre className="mt-2 text-[10px] font-mono bg-muted/50 p-2 rounded-sm overflow-x-auto whitespace-pre-wrap text-muted-foreground max-h-[100px] overflow-y-auto">
                        {axiomSet.content}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
    </div>
  );
}
