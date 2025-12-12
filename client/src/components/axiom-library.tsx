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

interface AxiomPair {
  id: string;
  name: string;
  category: string;
  description: string;
  systemA: string;
  systemB: string;
}

const AXIOM_LIBRARY: AxiomSet[] = [
  {
    id: "zf-set-theory",
    name: "Zermelo-Fraenkel Set Theory (ZF)",
    category: "Set Theory",
    description: "Standard foundations of mathematics",
    content: `LANGUAGE: {∈(x,y)}

AXIOMS:
1. ∀x∀y[∀z(z ∈ x ↔ z ∈ y) → x = y]                    [Extensionality]
2. ∃x∀y(y ∉ x)                                          [Empty Set]
3. ∀x∀y∃z∀w(w ∈ z ↔ w = x ∨ w = y)                    [Pairing]
4. ∀x∃y∀z(z ∈ y ↔ ∃w(z ∈ w ∧ w ∈ x))                  [Union]
5. ∀x∃y∀z(z ∈ y ↔ z ⊆ x)                               [Power Set]
6. ∃x(∅ ∈ x ∧ ∀y(y ∈ x → y ∪ {y} ∈ x))                [Infinity]
7. ∀x∃y∀z(z ∈ y ↔ z ∈ x ∧ φ(z))                        [Separation]
8. ∀x[∀y∈x ∃!z φ(y,z) → ∃w∀z(z ∈ w ↔ ∃y∈x φ(y,z))]   [Replacement]
9. ∀x(x ≠ ∅ → ∃y∈x(y ∩ x = ∅))                         [Foundation]`
  },
  {
    id: "nbg-set-theory",
    name: "Von Neumann-Bernays-Gödel (NBG)",
    category: "Set Theory",
    description: "Conservative extension of ZF with classes",
    content: `LANGUAGE: {∈(x,y), Set(x), Class(X)}

AXIOMS:
1. ∀X∀Y[∀z(z ∈ X ↔ z ∈ Y) → X = Y]                    [Extensionality]
2. ∀x∀y∃z∀w(w ∈ z ↔ w = x ∨ w = y)                    [Pairing]
3. ∃X∀y(y ∈ X ↔ φ(y))                                  [Class Comprehension]
4. ∀x∃y∀z(z ∈ y ↔ ∃w(z ∈ w ∧ w ∈ x))                  [Union]
5. ∀x∃y∀z(z ∈ y ↔ z ⊆ x)                               [Power Set]
6. ∃x(∅ ∈ x ∧ ∀y(y ∈ x → y ∪ {y} ∈ x))                [Infinity]
7. F class function → ∀x(F[x] is a set)                [Replacement]
8. ∀x(x ≠ ∅ → ∃y∈x(y ∩ x = ∅))                         [Foundation]
9. Class proper ↔ equinumerous with V                  [Limitation of Size]`
  },
  {
    id: "classical-propositional",
    name: "Classical Propositional Logic",
    category: "Propositional Logic",
    description: "Hilbert-Ackermann axiomatization",
    content: `LANGUAGE: {→, ¬}

AXIOMS:
1. A → (B → A)
2. (A → (B → C)) → ((A → B) → (A → C))
3. (¬A → ¬B) → (B → A)

RULE: Modus Ponens`
  },
  {
    id: "lukasiewicz-propositional",
    name: "Łukasiewicz Propositional Logic",
    category: "Propositional Logic",
    description: "Alternative axiomatization",
    content: `LANGUAGE: {→, ¬}

AXIOMS:
1. (A → B) → ((B → C) → (A → C))
2. (¬A → A) → A
3. A → (¬A → B)

RULES: Modus Ponens, Substitution`
  },
  {
    id: "fol-hilbert",
    name: "First-Order Logic (Hilbert)",
    category: "Predicate Logic",
    description: "Standard Hilbert system for FOL",
    content: `LANGUAGE: {∀, ∃, =, →, ¬}

AXIOMS:
1. All propositional tautologies
2. ∀x φ(x) → φ(t)                     [Universal Instantiation]
3. ∀x(φ → ψ) → (φ → ∀x ψ)            [x not free in φ]
4. x = x                               [Reflexivity]
5. x = y → (φ(x) → φ(y))              [Leibniz]

RULES: Modus Ponens, Universal Generalization`
  },
  {
    id: "fol-natural-deduction",
    name: "First-Order Logic (Natural Deduction)",
    category: "Predicate Logic",
    description: "Natural deduction rules for FOL",
    content: `LANGUAGE: {∀, ∃, =}

RULES:
1. ∀-Intro: Γ ⊢ φ ⟹ Γ ⊢ ∀x φ         [x not free in Γ]
2. ∀-Elim: ∀x φ ⟹ φ[t/x]
3. ∃-Intro: φ[t/x] ⟹ ∃x φ
4. ∃-Elim: ∃x φ, φ → ψ ⟹ ψ           [x not free in ψ]
5. =-Intro: t = t
6. =-Elim: t = s, φ[t/x] ⟹ φ[s/x]`
  },
  {
    id: "modal-k",
    name: "Modal Logic K",
    category: "Modal Logic",
    description: "Basic modal logic",
    content: `LANGUAGE: {□, ◇, →, ¬}

AXIOMS:
1. All propositional tautologies
2. □(A → B) → (□A → □B)               [Distribution]

RULES: Modus Ponens, Necessitation (⊢A ⟹ ⊢□A)`
  },
  {
    id: "modal-s5",
    name: "Modal Logic S5",
    category: "Modal Logic",
    description: "Strongest normal modal logic",
    content: `LANGUAGE: {□, ◇, →, ¬}

AXIOMS:
1. All propositional tautologies
2. □(A → B) → (□A → □B)               [Distribution]
3. □A → A                              [Reflexivity/T]
4. □A → □□A                            [Positive Introspection/4]
5. ◇A → □◇A                            [Negative Introspection/5]

RULES: Modus Ponens, Necessitation`
  },
  {
    id: "peano-arithmetic",
    name: "Peano Arithmetic (PA)",
    category: "Arithmetic",
    description: "Standard axiomatization of natural numbers",
    content: `LANGUAGE: {0, S, +, ·}

AXIOMS:
1. ∀x(Sx ≠ 0)                                          [Zero not successor]
2. ∀x∀y(Sx = Sy → x = y)                              [Successor injective]
3. ∀x(x + 0 = x)                                       [Addition base]
4. ∀x∀y(x + Sy = S(x + y))                            [Addition step]
5. ∀x(x · 0 = 0)                                       [Multiplication base]
6. ∀x∀y(x · Sy = x · y + x)                           [Multiplication step]
7. [φ(0) ∧ ∀x(φ(x) → φ(Sx))] → ∀x φ(x)               [Induction Schema]`
  },
  {
    id: "robinson-arithmetic",
    name: "Robinson Arithmetic (Q)",
    category: "Arithmetic",
    description: "Finitely axiomatized fragment of PA",
    content: `LANGUAGE: {0, S, +, ·}

AXIOMS:
1. ∀x(Sx ≠ 0)
2. ∀x∀y(Sx = Sy → x = y)
3. ∀x(x ≠ 0 → ∃y(x = Sy))
4. ∀x(x + 0 = x)
5. ∀x∀y(x + Sy = S(x + y))
6. ∀x(x · 0 = 0)
7. ∀x∀y(x · Sy = x · y + x)`
  },
  {
    id: "hilbert-geometry",
    name: "Hilbert's Euclidean Geometry",
    category: "Geometry",
    description: "Hilbert's axiom system",
    content: `LANGUAGE: {Point, Line, Plane, On, Between, Congruent}

AXIOMS:
I. INCIDENCE:
1. Two distinct points determine a unique line
2. Every line contains at least two points
3. There exist three non-collinear points

II. ORDER:
4-7. Betweenness axioms (4 axioms)

III. CONGRUENCE:
8-12. Segment congruence axioms (5 axioms)

IV. PARALLELS:
13. Given line and point not on it, exactly one parallel exists

V. CONTINUITY:
14. Archimedes' Axiom
15. Completeness Axiom`
  },
  {
    id: "tarski-geometry",
    name: "Tarski's Euclidean Geometry",
    category: "Geometry",
    description: "First-order axiomatization",
    content: `LANGUAGE: {B(x,y,z), ≡(xy,zw)}

AXIOMS:
1. xy ≡ yx                                             [Reflexivity]
2. xy ≡ zu ∧ xy ≡ vw → zu ≡ vw                        [Transitivity]
3. xy ≡ zz → x = y                                     [Identity]
4. ∃y(B(x,y,z) ∧ yz ≡ ab)                             [Segment Construction]
5. Five-Segment Axiom                                  [Congruence preservation]
6. B(x,y,x) → x = y                                    [Identity of Betweenness]
7. B(x,u,z) ∧ B(y,v,z) → ∃a(B(u,a,y) ∧ B(v,a,x))     [Pasch]
8. ∃a∃b∃c(¬B(a,b,c) ∧ ¬B(b,c,a) ∧ ¬B(c,a,b))         [Lower Dimension]
9. Upper Dimension Axiom
10. Euclid's Parallel Postulate
11. Continuity Schema`
  },
  {
    id: "huntington-boolean",
    name: "Huntington Boolean Algebra",
    category: "Boolean Algebra",
    description: "Standard Boolean algebra axioms",
    content: `LANGUAGE: {+, ·, ', 0, 1}

AXIOMS:
1. a + b = b + a                       [+ Commutativity]
2. a · b = b · a                       [· Commutativity]
3. a + (b · c) = (a + b) · (a + c)    [+ Distributivity]
4. a · (b + c) = (a · b) + (a · c)    [· Distributivity]
5. a + 0 = a                           [+ Identity]
6. a · 1 = a                           [· Identity]
7. a + a' = 1                          [Complement]
8. a · a' = 0                          [Complement]`
  },
  {
    id: "sheffer-boolean",
    name: "Sheffer Stroke Boolean Algebra",
    category: "Boolean Algebra",
    description: "Single-connective axiomatization",
    content: `LANGUAGE: {|(x,y)}

AXIOMS:
1. (a | a) | (a | a) = a
2. a | (b | (b | b)) = a | a
3. (a | (b | c)) | (a | (b | c)) = ((b | b) | a) | ((c | c) | a)`
  },
  {
    id: "group-standard",
    name: "Group Theory (Standard)",
    category: "Group Theory",
    description: "Standard group axioms",
    content: `LANGUAGE: {·(x,y), e, inv(x)}

AXIOMS:
1. ∀a∀b(a · b ∈ G)                     [Closure]
2. ∀a∀b∀c((a · b) · c = a · (b · c))  [Associativity]
3. ∃e∀a(e · a = a · e = a)            [Identity]
4. ∀a∃b(a · b = b · a = e)            [Inverse]`
  },
  {
    id: "group-single-axiom",
    name: "Group Theory (Single Axiom)",
    category: "Group Theory",
    description: "Higman-Neumann single axiom",
    content: `LANGUAGE: {·(x,y), inv(x)}

AXIOM:
1. (inv(a) · a) · (b · ((inv(c) · c) · d)) = b · d

[All group axioms derivable from this single axiom]`
  },
  {
    id: "lattice-meet-join",
    name: "Lattice (Meet-Join)",
    category: "Lattice Theory",
    description: "Algebraic formulation",
    content: `LANGUAGE: {∨(x,y), ∧(x,y)}

AXIOMS:
1. a ∨ b = b ∨ a                       [∨ Commutativity]
2. a ∧ b = b ∧ a                       [∧ Commutativity]
3. a ∨ (b ∨ c) = (a ∨ b) ∨ c          [∨ Associativity]
4. a ∧ (b ∧ c) = (a ∧ b) ∧ c          [∧ Associativity]
5. a ∨ (a ∧ b) = a                     [Absorption]
6. a ∧ (a ∨ b) = a                     [Absorption]`
  },
  {
    id: "lattice-partial-order",
    name: "Lattice (Partial Order)",
    category: "Lattice Theory",
    description: "Order-theoretic formulation",
    content: `LANGUAGE: {≤(x,y), sup(x,y), inf(x,y)}

AXIOMS:
1. a ≤ a                               [Reflexivity]
2. a ≤ b ∧ b ≤ a → a = b              [Antisymmetry]
3. a ≤ b ∧ b ≤ c → a ≤ c              [Transitivity]
4. ∀a∀b∃c(c = sup{a,b})               [Join exists]
5. ∀a∀b∃c(c = inf{a,b})               [Meet exists]`
  },
  {
    id: "mereology-cem",
    name: "Classical Extensional Mereology",
    category: "Mereology",
    description: "Standard part-whole theory",
    content: `LANGUAGE: {≤(x,y), O(x,y)}

AXIOMS:
1. x ≤ x                                               [Reflexivity]
2. x ≤ y ∧ y ≤ x → x = y                              [Antisymmetry]
3. x ≤ y ∧ y ≤ z → x ≤ z                              [Transitivity]
4. ¬(y ≤ x) → ∃z(z ≤ y ∧ ¬O(z,x))                    [Strong Supplementation]
5. ∃x φ(x) → ∃y∀z(O(z,y) ↔ ∃x(φ(x) ∧ O(z,x)))        [Unrestricted Fusion]`
  },
  {
    id: "mereology-gem",
    name: "General Extensional Mereology",
    category: "Mereology",
    description: "Leśniewski's mereology",
    content: `LANGUAGE: {P(x,y), O(x,y), Fus(y,φ)}

AXIOMS:
1. P(x,y) ∧ P(y,z) → P(x,z)                           [Transitivity]
2. P(x,y) ∧ x ≠ y → ∃z(P(z,y) ∧ ¬O(z,x))             [Supplementation]
3. ∃x φ(x) → ∃y Fus(y,φ)                              [Sum]
4. O(x,y) → ∃z∀w(P(w,z) ↔ P(w,x) ∧ P(w,y))           [Product]
5. ∀z(P(z,x) ↔ P(z,y)) → x = y                        [Extensionality]`
  },
  {
    id: "strict-partial-order",
    name: "Strict Partial Order",
    category: "Order Theory",
    description: "Irreflexive, transitive relation",
    content: `LANGUAGE: {<(x,y)}

AXIOMS:
1. ∀x ¬(x < x)                         [Irreflexivity]
2. ∀x∀y∀z ((x < y ∧ y < z) → x < z)   [Transitivity]`
  },
  {
    id: "equivalence-relation",
    name: "Equivalence Relation",
    category: "Relations",
    description: "Reflexive, symmetric, transitive",
    content: `LANGUAGE: {∼(x,y)}

AXIOMS:
1. ∀x (x ∼ x)                          [Reflexivity]
2. ∀x∀y (x ∼ y → y ∼ x)               [Symmetry]
3. ∀x∀y∀z ((x ∼ y ∧ y ∼ z) → x ∼ z)   [Transitivity]`
  },
  {
    id: "preorder",
    name: "Preorder",
    category: "Order Theory",
    description: "Reflexive and transitive",
    content: `LANGUAGE: {≼(x,y)}

AXIOMS:
1. ∀x (x ≼ x)                          [Reflexivity]
2. ∀x∀y∀z ((x ≼ y ∧ y ≼ z) → x ≼ z)   [Transitivity]`
  },
  {
    id: "dense-linear-order",
    name: "Dense Linear Order",
    category: "Order Theory",
    description: "No endpoints, dense, linear",
    content: `LANGUAGE: {<(x,y)}

AXIOMS:
1. ∀x ¬(x < x)                         [Irreflexivity]
2. ∀x∀y∀z ((x < y ∧ y < z) → x < z)   [Transitivity]
3. ∀x∀y (x < y ∨ x = y ∨ y < x)       [Trichotomy]
4. ∀x∀y (x < y → ∃z (x < z ∧ z < y))  [Density]
5. ∀x ∃y (y < x)                       [No Minimum]
6. ∀x ∃y (x < y)                       [No Maximum]`
  },
  {
    id: "quick-identity",
    name: "Identity",
    category: "Quick Examples",
    description: "Self-identity axiom",
    content: `1. ∀x(x = x)`
  },
  {
    id: "quick-symmetry",
    name: "Symmetric Relation",
    category: "Quick Examples",
    description: "Symmetry axiom for R",
    content: `1. ∀x∀y(Rxy → Ryx)`
  },
  {
    id: "quick-transitivity-chain",
    name: "Transitivity Chain",
    category: "Quick Examples",
    description: "F→G→H chain",
    content: `1. ∀x(Fx → Gx)
2. ∀x(Gx → Hx)`
  },
  {
    id: "quick-existence",
    name: "Existence Claim",
    category: "Quick Examples",
    description: "Something has property P",
    content: `1. ∃x(Px)`
  },
  {
    id: "quick-transitivity",
    name: "Transitive Relation",
    category: "Quick Examples",
    description: "Transitivity axiom for R",
    content: `1. ∀x∀y∀z((Rxy ∧ Ryz) → Rxz)`
  },
  {
    id: "quick-commutativity",
    name: "Commutativity",
    category: "Quick Examples",
    description: "Addition is commutative",
    content: `1. a + b = b + a`
  },
  {
    id: "quick-successor",
    name: "Successor Ordering",
    category: "Quick Examples",
    description: "x < x+1 always",
    content: `1. ∀x(x < x + 1)`
  },
  {
    id: "quick-unbounded",
    name: "Unbounded Above",
    category: "Quick Examples",
    description: "No maximum element",
    content: `1. ∀x∃y(y > x)`
  },
  {
    id: "quick-lem",
    name: "Law of Excluded Middle",
    category: "Quick Examples",
    description: "Everything is F or not F",
    content: `1. ∀x(Fx ∨ ¬Fx)`
  },
  {
    id: "quick-two-distinct",
    name: "Two Distinct Objects",
    category: "Quick Examples",
    description: "At least two things exist",
    content: `1. ∃x∃y(x ≠ y)`
  },
  {
    id: "quick-comm-monoid",
    name: "Commutative Monoid",
    category: "Quick Examples",
    description: "Comm. operation with identity",
    content: `1. ∀x∀y(x · y = y · x)
2. ∀x(x · 1 = x)`
  },
  {
    id: "quick-relational",
    name: "Relational Dependence",
    category: "Quick Examples",
    description: "P implies related Q exists",
    content: `1. ∀x(Px → ∃y(Qy ∧ Rxy))`
  },
  {
    id: "quick-disjoint",
    name: "Disjoint Properties",
    category: "Quick Examples",
    description: "F and G are disjoint but both exist",
    content: `1. ¬∃x(Fx ∧ Gx)
2. ∃xFx
3. ∃xGx`
  },
  {
    id: "quick-total-order",
    name: "Totality",
    category: "Quick Examples",
    description: "Linear/total ordering",
    content: `1. ∀x∀y(x ≤ y ∨ y ≤ x)`
  },
  {
    id: "quick-unique-existence",
    name: "Unique Existence",
    category: "Quick Examples",
    description: "Exactly one F exists",
    content: `1. ∃!x(Fx)`
  },
  {
    id: "quick-subset-chain",
    name: "Subset Chain",
    category: "Quick Examples",
    description: "A ⊆ B ⊆ C",
    content: `1. ∀x(x ∈ A → x ∈ B)
2. ∀x(x ∈ B → x ∈ C)`
  },
  {
    id: "quick-asymmetry",
    name: "Asymmetric Relation",
    category: "Quick Examples",
    description: "L is asymmetric",
    content: `1. ∀x∀y(Lxy → ¬Lyx)`
  },
  {
    id: "quick-modal-t",
    name: "Modal T Axiom",
    category: "Quick Examples",
    description: "Necessary implies actual",
    content: `1. □P → P`
  },
  {
    id: "quick-successor-exists",
    name: "Successor Existence",
    category: "Quick Examples",
    description: "Every N has a successor",
    content: `1. ∀x(Nx → ∃y(Ny ∧ Syx))`
  },
  {
    id: "quick-identity-element",
    name: "Identity Element",
    category: "Quick Examples",
    description: "e is two-sided identity",
    content: `1. ∀x(x ○ e = x)
2. ∀x(e ○ x = x)`
  },
  {
    id: "quick-closure",
    name: "Closure Operation",
    category: "Quick Examples",
    description: "⊕ is closed",
    content: `1. ∀x∀y∃z(z = x ⊕ y)`
  },
  {
    id: "quick-part-reflexive",
    name: "Part Reflexivity",
    category: "Quick Examples",
    description: "Everything is part of itself",
    content: `1. ∀x(Part(x,x))`
  },
  {
    id: "quick-modal-possibility",
    name: "Actuality → Possibility",
    category: "Quick Examples",
    description: "What is actual is possible",
    content: `1. P → ◇P`
  },
  {
    id: "quick-chain-inference",
    name: "Chain Inference",
    category: "Quick Examples",
    description: "B→C∧D, C→E chain",
    content: `1. ∀x(Bx → ∃y(Cy ∧ Dxy))
2. ∀y(Cy → Ey)`
  },
  {
    id: "quick-equiv-full",
    name: "Full Equivalence Relation",
    category: "Quick Examples",
    description: "~ is reflexive, symmetric, transitive",
    content: `1. ∀x∀y((x ~ y ∧ y ~ z) → x ~ z)
2. ∀x(x ~ x)
3. ∀x∀y(x ~ y → y ~ x)`
  },
  {
    id: "differential-structure",
    name: "Differential Structure Without Limits",
    category: "Advanced Mathematics",
    description: "Abstract differential operator without topology",
    content: `LANGUAGE: {+, ·, 0, 1, D(x,y)}

D(x,y) = "y is the derivative of x"

AXIOMS:
1. ∀x ∃!y D(x,y)
2. ∀x∀y∀z ((D(x,y) ∧ D(x,z)) → y = z)
3. ∀x∀y∀z ((D(x,y) ∧ D(y,z)) → D(x,z))
4. D(0,0)
5. ∀x (D(x,0) ↔ x = c) for constant c
6. ∀x∀y (D(x,y) → D(x + c, y))
7. ∀x∀y∀z ((D(x,y) ∧ D(z,y)) → ∃w (x = z + w ∧ D(w,0)))`
  },
  {
    id: "primitive-flow-calculus",
    name: "Primitive Flow Calculus",
    category: "Advanced Mathematics",
    description: "Time-free dynamics with directed flow",
    content: `LANGUAGE: {State(x), Flow(x,y), Compose(x,y,z)}

AXIOMS:
1. ∀x State(x)
2. ∀x ∃y Flow(x,y)
3. ∀x Flow(x,x)
4. ∀x∀y∀z ((Flow(x,y) ∧ Flow(y,z)) → Flow(x,z))
5. ∀x∀y (Flow(x,y) → ∃z (Flow(x,z) ∧ Flow(z,y)))
6. ∀x∀y ((Flow(x,y) ∧ Flow(y,x)) → x = y)`
  },
  {
    id: "minimal-market",
    name: "Minimal Market Without Prices",
    category: "Economics",
    description: "Pure exchange without utilities or prices",
    content: `LANGUAGE: {Agent(x), Good(g), Has(x,g), CanTrade(x,y)}

AXIOMS:
1. ∀x ∃g Has(x,g)
2. ∀x∀y (CanTrade(x,y) → CanTrade(y,x))
3. ∀x ¬CanTrade(x,x)
4. ∀x∀y ((Has(x,g) ∧ ¬Has(y,g)) → CanTrade(x,y))
5. ∀x∀y∀z ((CanTrade(x,y) ∧ CanTrade(y,z)) → CanTrade(x,z))
6. ∀x ∃y CanTrade(x,y)`
  },
  {
    id: "preference-endogenous",
    name: "Preference with Endogenous Comparison",
    category: "Economics",
    description: "Non-utility preference theory",
    content: `LANGUAGE: {Pref(x,y), Compare(x,y,z)}

Compare(x,y,z) = "z prefers x to y"

AXIOMS:
1. ∀x∀y∀z (Compare(x,y,z) → Pref(x,y))
2. ∀x∀y (Pref(x,y) → ¬Pref(y,x))
3. ∀x∀y∀z ((Pref(x,y) ∧ Pref(y,z)) → Pref(x,z))
4. ∀x∀y ∃z Compare(x,y,z)
5. ∃x∃y∃z∃z' (Compare(x,y,z) ∧ Compare(y,x,z'))`
  },
  {
    id: "proto-probability",
    name: "Proto-Probability Without Numbers",
    category: "Advanced Mathematics",
    description: "Pre-numerical comparative probability",
    content: `LANGUAGE: {MoreLikely(x,y), Event(x), Incomparable(x,y)}

AXIOMS:
1. ∀x ¬MoreLikely(x,x)
2. ∀x∀y (MoreLikely(x,y) → ¬MoreLikely(y,x))
3. ∀x∀y∀z ((MoreLikely(x,y) ∧ MoreLikely(y,z)) → MoreLikely(x,z))
4. ∀x∀y (x ≠ y → (MoreLikely(x,y) ∨ MoreLikely(y,x) ∨ Incomparable(x,y)))
5. ∃x∃y Incomparable(x,y)`
  },
  {
    id: "discrete-geometry",
    name: "Discrete Geometry via Adjacency",
    category: "Geometry",
    description: "Incidence-free geometry with adjacency",
    content: `LANGUAGE: {Point(x), Adj(x,y)}

AXIOMS:
1. ∀x ¬Adj(x,x)
2. ∀x∀y (Adj(x,y) → Adj(y,x))
3. ∀x ∃y Adj(x,y)
4. ∀x∀y∀z ((Adj(x,y) ∧ Adj(y,z) ∧ x ≠ z) → ¬Adj(x,z))
5. ∃x∃y∃z (Adj(x,y) ∧ Adj(y,z) ∧ Adj(z,x))`
  },
  {
    id: "causal-asymmetry",
    name: "Causal Asymmetry with Interventions",
    category: "Philosophy",
    description: "Pearl-style causal structure without probability",
    content: `LANGUAGE: {Causes(x,y), Intervene(x,y)}

AXIOMS:
1. ∀x ¬Causes(x,x)
2. ∀x∀y ((Causes(x,y) ∧ Causes(y,x)) → ⊥)
3. ∀x∀y∀z ((Causes(x,y) ∧ Causes(y,z)) → Causes(x,z))
4. ∀x∀y (Intervene(x,y) → Causes(x,y))
5. ∃x∃y (Causes(x,y) ∧ ¬Intervene(x,y))`
  },
];

const AXIOM_PAIRS: AxiomPair[] = [
  {
    id: "pair-zf-vs-nbg",
    name: "ZF vs NBG Set Theory",
    category: "Set Theory Comparisons",
    description: "Compare standard set theory with class extension",
    systemA: `LANGUAGE: {∈(x,y)}

AXIOMS:
1. ∀x∀y[∀z(z ∈ x ↔ z ∈ y) → x = y]
2. ∃x∀y(y ∉ x)
3. ∀x∀y∃z∀w(w ∈ z ↔ w = x ∨ w = y)
4. ∀x∃y∀z(z ∈ y ↔ ∃w(z ∈ w ∧ w ∈ x))
5. ∀x∃y∀z(z ∈ y ↔ z ⊆ x)
6. ∃x(∅ ∈ x ∧ ∀y(y ∈ x → y ∪ {y} ∈ x))
7. ∀x∃y∀z(z ∈ y ↔ z ∈ x ∧ φ(z))
8. ∀x(x ≠ ∅ → ∃y∈x(y ∩ x = ∅))`,
    systemB: `LANGUAGE: {∈(x,y), Class(X)}

AXIOMS:
1. ∀X∀Y[∀z(z ∈ X ↔ z ∈ Y) → X = Y]
2. ∀x∀y∃z∀w(w ∈ z ↔ w = x ∨ w = y)
3. ∃X∀y(y ∈ X ↔ φ(y))
4. ∀x∃y∀z(z ∈ y ↔ ∃w(z ∈ w ∧ w ∈ x))
5. ∀x∃y∀z(z ∈ y ↔ z ⊆ x)
6. ∃x(∅ ∈ x ∧ ∀y(y ∈ x → y ∪ {y} ∈ x))
7. F class function → F[x] is a set
8. ∀x(x ≠ ∅ → ∃y∈x(y ∩ x = ∅))`
  },
  {
    id: "pair-pa-vs-q",
    name: "Peano Arithmetic vs Robinson Q",
    category: "Arithmetic Comparisons",
    description: "Compare PA with its finitely axiomatized fragment",
    systemA: `LANGUAGE: {0, S, +, ·}

AXIOMS:
1. ∀x(Sx ≠ 0)
2. ∀x∀y(Sx = Sy → x = y)
3. ∀x(x + 0 = x)
4. ∀x∀y(x + Sy = S(x + y))
5. ∀x(x · 0 = 0)
6. ∀x∀y(x · Sy = x · y + x)
7. [φ(0) ∧ ∀x(φ(x) → φ(Sx))] → ∀x φ(x)`,
    systemB: `LANGUAGE: {0, S, +, ·}

AXIOMS:
1. ∀x(Sx ≠ 0)
2. ∀x∀y(Sx = Sy → x = y)
3. ∀x(x ≠ 0 → ∃y(x = Sy))
4. ∀x(x + 0 = x)
5. ∀x∀y(x + Sy = S(x + y))
6. ∀x(x · 0 = 0)
7. ∀x∀y(x · Sy = x · y + x)`
  },
  {
    id: "pair-modal-k-vs-s5",
    name: "Modal K vs S5",
    category: "Modal Logic Comparisons",
    description: "Compare basic modal logic with S5",
    systemA: `LANGUAGE: {□, ◇, →, ¬}

AXIOMS:
1. All propositional tautologies
2. □(A → B) → (□A → □B)

RULES: Modus Ponens, Necessitation`,
    systemB: `LANGUAGE: {□, ◇, →, ¬}

AXIOMS:
1. All propositional tautologies
2. □(A → B) → (□A → □B)
3. □A → A
4. □A → □□A
5. ◇A → □◇A

RULES: Modus Ponens, Necessitation`
  },
  {
    id: "pair-lattice-formulations",
    name: "Lattice: Algebraic vs Order",
    category: "Lattice Comparisons",
    description: "Compare meet-join vs partial order formulations",
    systemA: `LANGUAGE: {∨(x,y), ∧(x,y)}

AXIOMS:
1. a ∨ b = b ∨ a
2. a ∧ b = b ∧ a
3. a ∨ (b ∨ c) = (a ∨ b) ∨ c
4. a ∧ (b ∧ c) = (a ∧ b) ∧ c
5. a ∨ (a ∧ b) = a
6. a ∧ (a ∨ b) = a`,
    systemB: `LANGUAGE: {≤(x,y), sup(x,y), inf(x,y)}

AXIOMS:
1. a ≤ a
2. a ≤ b ∧ b ≤ a → a = b
3. a ≤ b ∧ b ≤ c → a ≤ c
4. ∀a∀b∃c(c = sup{a,b})
5. ∀a∀b∃c(c = inf{a,b})`
  },
  {
    id: "pair-hilbert-vs-tarski-geometry",
    name: "Hilbert vs Tarski Geometry",
    category: "Geometry Comparisons",
    description: "Compare two axiomatizations of Euclidean geometry",
    systemA: `LANGUAGE: {Point, Line, On, Between, Congruent}

AXIOMS:
1. Two points determine unique line
2. Every line has at least two points
3. Three non-collinear points exist
4-7. Betweenness axioms
8-12. Congruence axioms
13. Parallel postulate
14. Archimedes
15. Completeness`,
    systemB: `LANGUAGE: {B(x,y,z), ≡(xy,zw)}

AXIOMS:
1. xy ≡ yx
2. xy ≡ zu ∧ xy ≡ vw → zu ≡ vw
3. xy ≡ zz → x = y
4. ∃y(B(x,y,z) ∧ yz ≡ ab)
5. Five-Segment
6. B(x,y,x) → x = y
7. Pasch axiom
8-11. Dimension and continuity`
  },
  {
    id: "pair-huntington-vs-sheffer",
    name: "Huntington vs Sheffer Boolean",
    category: "Boolean Algebra Comparisons",
    description: "Compare standard vs single-connective axiomatization",
    systemA: `LANGUAGE: {+, ·, ', 0, 1}

AXIOMS:
1. a + b = b + a
2. a · b = b · a
3. a + (b · c) = (a + b) · (a + c)
4. a · (b + c) = (a · b) + (a · c)
5. a + 0 = a
6. a · 1 = a
7. a + a' = 1
8. a · a' = 0`,
    systemB: `LANGUAGE: {|(x,y)}

AXIOMS:
1. (a | a) | (a | a) = a
2. a | (b | (b | b)) = a | a
3. (a | (b | c)) | (a | (b | c)) = ((b | b) | a) | ((c | c) | a)`
  },
  {
    id: "pair-group-standard-vs-single",
    name: "Group: Standard vs Single Axiom",
    category: "Group Theory Comparisons",
    description: "Compare standard axioms with Higman-Neumann",
    systemA: `LANGUAGE: {·(x,y), e, inv(x)}

AXIOMS:
1. ∀a∀b(a · b ∈ G)
2. ∀a∀b∀c((a · b) · c = a · (b · c))
3. ∃e∀a(e · a = a · e = a)
4. ∀a∃b(a · b = b · a = e)`,
    systemB: `LANGUAGE: {·(x,y), inv(x)}

AXIOM:
1. (inv(a) · a) · (b · ((inv(c) · c) · d)) = b · d`
  },
  {
    id: "pair-mereology-cem-vs-gem",
    name: "CEM vs GEM Mereology",
    category: "Mereology Comparisons",
    description: "Compare classical vs general extensional mereology",
    systemA: `LANGUAGE: {≤(x,y), O(x,y)}

AXIOMS:
1. x ≤ x
2. x ≤ y ∧ y ≤ x → x = y
3. x ≤ y ∧ y ≤ z → x ≤ z
4. ¬(y ≤ x) → ∃z(z ≤ y ∧ ¬O(z,x))
5. ∃x φ(x) → ∃y∀z(O(z,y) ↔ ∃x(φ(x) ∧ O(z,x)))`,
    systemB: `LANGUAGE: {P(x,y), O(x,y), Fus(y,φ)}

AXIOMS:
1. P(x,y) ∧ P(y,z) → P(x,z)
2. P(x,y) ∧ x ≠ y → ∃z(P(z,y) ∧ ¬O(z,x))
3. ∃x φ(x) → ∃y Fus(y,φ)
4. O(x,y) → ∃z∀w(P(w,z) ↔ P(w,x) ∧ P(w,y))
5. ∀z(P(z,x) ↔ P(z,y)) → x = y`
  },
  {
    id: "pair-propositional-hilbert-vs-lukasiewicz",
    name: "Hilbert vs Łukasiewicz Propositional",
    category: "Logic Comparisons",
    description: "Compare two axiomatizations of classical propositional logic",
    systemA: `LANGUAGE: {→, ¬}

AXIOMS:
1. A → (B → A)
2. (A → (B → C)) → ((A → B) → (A → C))
3. (¬A → ¬B) → (B → A)

RULE: Modus Ponens`,
    systemB: `LANGUAGE: {→, ¬}

AXIOMS:
1. (A → B) → ((B → C) → (A → C))
2. (¬A → A) → A
3. A → (¬A → B)

RULES: Modus Ponens, Substitution`
  },
  {
    id: "pair-fol-hilbert-vs-nd",
    name: "FOL: Hilbert vs Natural Deduction",
    category: "Logic Comparisons",
    description: "Compare Hilbert system with natural deduction",
    systemA: `LANGUAGE: {∀, ∃, =, →, ¬}

AXIOMS:
1. All propositional tautologies
2. ∀x φ(x) → φ(t)
3. ∀x(φ → ψ) → (φ → ∀x ψ)
4. x = x
5. x = y → (φ(x) → φ(y))

RULES: MP, UG`,
    systemB: `LANGUAGE: {∀, ∃, =}

RULES:
1. ∀-Intro: Γ ⊢ φ ⟹ Γ ⊢ ∀x φ
2. ∀-Elim: ∀x φ ⟹ φ[t/x]
3. ∃-Intro: φ[t/x] ⟹ ∃x φ
4. ∃-Elim: ∃x φ, φ → ψ ⟹ ψ
5. =-Intro: t = t
6. =-Elim: t = s, φ[t/x] ⟹ φ[s/x]`
  },
  {
    id: "pair-1-identity-vs-chain",
    name: "Identity vs Implication Chain",
    category: "Mixed Pairs",
    description: "Equality axioms vs predicate chain",
    systemA: `1. ∀x(x = x)
2. ∀x∀y(x = y → y = x)
3. ∀x∀y∀z((x = y ∧ y = z) → x = z)`,
    systemB: `1. ∀x(Fx → Gx)
2. ∀x(Gx → Hx)
3. ∀x(Hx → Jx)
4. ∃x(Fx)`
  },
  {
    id: "pair-2-semiring-vs-equiv",
    name: "Semiring vs Equivalence",
    category: "Mixed Pairs",
    description: "Arithmetic properties vs equivalence relation",
    systemA: `1. ∀x(x + 0 = x)
2. ∀x(x · 1 = x)
3. ∀x(x · 0 = 0)
4. ∀x∀y(x + y = y + x)
5. ∀x∀y(x · y = y · x)`,
    systemB: `1. ∀x(Rxx)
2. ∀x∀y(Rxy → Ryx)
3. ∀x∀y∀z((Rxy ∧ Ryz) → Rxz)`
  },
  {
    id: "pair-3-dlo-vs-predicates",
    name: "Dense Order vs Predicates",
    category: "Mixed Pairs",
    description: "Dense linear order vs predicate logic",
    systemA: `1. ∀x¬(x < x)
2. ∀x∀y∀z((x < y ∧ y < z) → x < z)
3. ∀x∀y(x < y ∨ x = y ∨ y < x)
4. ∀x∃y(x < y)
5. ∀x∃y(y < x)`,
    systemB: `1. ∃x(Px)
2. ∃x(Qx)
3. ∀x(Px → ¬Qx)
4. ∀x((Px ∨ Qx) → Rx)
5. ∃x(Rx ∧ Sx)`
  },
  {
    id: "pair-4-s5-vs-mereology",
    name: "S5 Modal vs Mereology",
    category: "Mixed Pairs",
    description: "Modal logic S5 vs part-whole",
    systemA: `1. □(P → P)
2. □P → P
3. □P → □□P
4. ◇P → □◇P
5. □(P → Q) → (□P → □Q)`,
    systemB: `1. ∀x(Part(x,x))
2. ∀x∀y((Part(x,y) ∧ Part(y,x)) → x = y)
3. ∀x∀y∀z((Part(x,y) ∧ Part(y,z)) → Part(x,z))
4. ∀x∀y(Overlap(x,y) ↔ ∃z(Part(z,x) ∧ Part(z,y)))`
  },
  {
    id: "pair-5-group-vs-chain",
    name: "Abelian Group vs Predicate Chain",
    category: "Mixed Pairs",
    description: "Group axioms vs implication chain",
    systemA: `1. ∀x∀y∃z(z = x ⊕ y)
2. ∀x∀y(x ⊕ y = y ⊕ x)
3. ∀x∀y∀z((x ⊕ y) ⊕ z = x ⊕ (y ⊕ z))
4. ∃e∀x(x ⊕ e = x)
5. ∀x∃y(x ⊕ y = e)`,
    systemB: `1. ∀x(Ax → Bx)
2. ∀x(Bx → (Cx ∨ Dx))
3. ∀x(Cx → Ex)
4. ∀x(Dx → Ex)
5. ∃x(Ax)
6. ∀x(Ex → Fx)`
  },
  {
    id: "pair-6-bounded-order-vs-chain",
    name: "Bounded Order vs Chain",
    category: "Mixed Pairs",
    description: "Total order with 0 vs implications",
    systemA: `1. ∀x(0 ≤ x)
2. ∀x(x ≤ x)
3. ∀x∀y((x ≤ y ∧ y ≤ x) → x = y)
4. ∀x∀y∀z((x ≤ y ∧ y ≤ z) → x ≤ z)
5. ∀x∀y(x ≤ y ∨ y ≤ x)
6. ∀x∀y∃z(z = max(x,y))`,
    systemB: `1. ∀x(Kx → Lx)
2. ∀x(Lx → Mx)
3. ∀x(Mx → ¬Nx)
4. ∃x(Kx ∧ Ox)
5. ∀x(Ox → Px)`
  },
  {
    id: "pair-7-metric-vs-relations",
    name: "Metric Space vs Relations",
    category: "Mixed Pairs",
    description: "Distance function vs relational",
    systemA: `1. ∀x∀y(d(x,y) ≥ 0)
2. ∀x∀y(d(x,y) = 0 ↔ x = y)
3. ∀x∀y(d(x,y) = d(y,x))
4. ∀x∀y∀z(d(x,z) ≤ d(x,y) + d(y,z))`,
    systemB: `1. ∀x(Sx → ∃y(Ty ∧ Rxy))
2. ∀x(Tx → ∃y(Uy ∧ Rxy))
3. ∀x∀y(Rxy → Ryx)
4. ∃x(Sx)
5. ∀x(Ux → Vx)`
  },
  {
    id: "pair-8-boolean-vs-graph",
    name: "Boolean Algebra vs Graph",
    category: "Mixed Pairs",
    description: "Boolean with De Morgan vs graph coloring",
    systemA: `1. ∀x(x ∧ ⊤ = x)
2. ∀x(x ∨ ⊥ = x)
3. ∀x(x ∧ x′ = ⊥)
4. ∀x(x ∨ x′ = ⊤)
5. ∀x(x′′ = x)
6. ∀x∀y((x ∧ y)′ = x′ ∨ y′)
7. ∀x∀y((x ∨ y)′ = x′ ∧ y′)`,
    systemB: `1. ∃x∃y∃z(x ≠ y ∧ y ≠ z ∧ x ≠ z)
2. ∀x∀y(Cxy ∨ ¬Cxy)
3. ∀x¬Cxx
4. ∀x∃y(Cxy)`
  },
  {
    id: "pair-9-robinson-vs-chain",
    name: "Robinson Arithmetic vs Chain",
    category: "Mixed Pairs",
    description: "Weak arithmetic vs predicate chain",
    systemA: `1. ∀x(S0 ≠ x + x)
2. ∀x(x + 0 = x)
3. ∀x∀y(x + Sy = S(x + y))
4. ∀x(x · 0 = 0)
5. ∀x∀y(x · Sy = (x · y) + x)`,
    systemB: `1. ∀x(Hx → Ix)
2. ∀x(Ix → (Jx ∧ Kx))
3. ∀x(Jx → Lx)
4. ∀x(Kx → Mx)
5. ∃x(Hx ∧ Nx)
6. ∀x(Nx → Ox)`
  },
  {
    id: "pair-10-bijection-vs-equiv",
    name: "Bijection vs Equivalence",
    category: "Mixed Pairs",
    description: "Involutive bijection vs equivalence with witnesses",
    systemA: `1. ∀x(f(x) ∈ D)
2. ∀x∀y(f(x) = f(y) → x = y)
3. ∀y∃x(f(x) = y)
4. f(f(x)) = x
5. ∀x(f(x) ≠ x)`,
    systemB: `1. ∀x(Wx → ∃y(Wy ∧ Exy ∧ y ≠ x))
2. ∀x∀y(Exy → Eyx)
3. ∀x∀y∀z((Exy ∧ Eyz) → Exz)
4. ∀x(Exx)
5. ∃x(Wx)`
  },
  {
    id: "pair-11-lattice-vs-chain",
    name: "Lattice vs Predicate Chain",
    category: "Mixed Pairs",
    description: "Set-theoretic lattice vs implications",
    systemA: `1. ∀x∀y(x ∩ y = y ∩ x)
2. ∀x∀y(x ∪ y = y ∪ x)
3. ∀x∀y∀z(x ∩ (y ∩ z) = (x ∩ y) ∩ z)
4. ∀x∀y∀z(x ∪ (y ∪ z) = (x ∪ y) ∪ z)
5. ∀x∀y(x ∩ (x ∪ y) = x)
6. ∀x∀y(x ∪ (x ∩ y) = x)`,
    systemB: `1. ∀x(Gx → Hx)
2. ∀x(Hx → (Ix ∨ Jx))
3. ∀x(Ix → Kx)
4. ∀x(Jx → Kx)
5. ∀x(Kx → ¬Lx)
6. ∃x(Gx ∧ Mx)
7. ∃x(Lx)`
  },
  {
    id: "pair-12-abelian-vs-modal",
    name: "Abelian Group vs Modal",
    category: "Mixed Pairs",
    description: "Commutative group vs modal distribution",
    systemA: `1. ∀x∀y∃z(z = x * y)
2. ∀x∀y∀z((x * y) * z = x * (y * z))
3. ∃e∀x(e * x = x ∧ x * e = x)
4. ∀x∃y(x * y = e ∧ y * x = e)
5. ∀x∀y(x * y = y * x)`,
    systemB: `1. □P → ◇P
2. □(P → Q) → (□P → □Q)
3. ◇(P ∧ Q) → (◇P ∧ ◇Q)
4. □(P ∧ Q) ↔ (□P ∧ □Q)`
  },
  {
    id: "pair-13-norm-vs-strict-order",
    name: "Norm vs Strict Order",
    category: "Mixed Pairs",
    description: "Absolute value vs strict ordering",
    systemA: `1. ∀x(|x| ≥ 0)
2. ∀x(|x| = 0 ↔ x = 0)
3. ∀x∀y(|x · y| = |x| · |y|)
4. ∀x∀y(|x + y| ≤ |x| + |y|)
5. ∀x(|−x| = |x|)`,
    systemB: `1. ∀x∀y(Axy → ¬Ayx)
2. ∀x∀y∀z((Axy ∧ Ayz) → Axz)
3. ∀x¬Axx
4. ∀x∃y(Axy)
5. ∀x∃y(Ayx)`
  },
  {
    id: "pair-14-hilbert-vs-chain",
    name: "Hilbert Axioms vs Chain",
    category: "Mixed Pairs",
    description: "Propositional calculus vs predicate chain",
    systemA: `1. ∀p(p → p)
2. ∀p∀q(p → (q → p))
3. ∀p∀q∀r((p → (q → r)) → ((p → q) → (p → r)))
4. ∀p∀q((¬p → ¬q) → (q → p))`,
    systemB: `1. ∀x(Bx → Cx)
2. ∀x(Cx → (Dx ∧ Ex))
3. ∀x(Dx → Fx)
4. ∀x(Ex → Gx)
5. ∀x((Fx ∧ Gx) → Hx)
6. ∃x(Bx)`
  },
  {
    id: "pair-15-tree-vs-successor",
    name: "Tree Order vs Successor",
    category: "Mixed Pairs",
    description: "Tree structure vs successor function",
    systemA: `1. ∀x∀y(x ⊑ y ∨ y ⊑ x ∨ x ⊥ y)
2. ∀x(x ⊑ x)
3. ∀x∀y((x ⊑ y ∧ y ⊑ x) → x = y)
4. ∀x∀y∀z((x ⊑ y ∧ y ⊑ z) → x ⊑ z)
5. ∃r∀x(x ⊑ r)`,
    systemB: `1. ∀x(Nx → ∃y(Ny ∧ Sxy))
2. ∀x∀y((Sxy ∧ Sxz) → y = z)
3. ∃x(Nx ∧ ∀y¬Syx)
4. ∀x∀y(Sxy → (Nx ∧ Ny))`
  },
  {
    id: "pair-16-semilattice-vs-trans",
    name: "Semilattice vs Transitive",
    category: "Mixed Pairs",
    description: "Idempotent semilattice vs transitivity",
    systemA: `1. ∀x∀y(x ⊔ y = y ⊔ x)
2. ∀x∀y(x ⊓ y = y ⊓ x)
3. ∀x∀y∀z(x ⊔ (y ⊔ z) = (x ⊔ y) ⊔ z)
4. ∀x∀y∀z(x ⊓ (y ⊓ z) = (x ⊓ y) ⊓ z)
5. ∀x(x ⊔ x = x)
6. ∀x(x ⊓ x = x)
7. ∀x∀y(x ⊓ (x ⊔ y) = x)`,
    systemB: `1. ∀x∀y(Txy → ∃z(Tzx ∧ Tzy))
2. ∀x(Txx)
3. ∀x∀y∀z((Txy ∧ Tyz) → Txz)
4. ∃a∃b(Tab ∧ a ≠ b)`
  },
  {
    id: "pair-17-vector-vs-chain",
    name: "Vector Space vs Chain",
    category: "Mixed Pairs",
    description: "Vector space axioms vs implications",
    systemA: `1. ∀v(v + 0⃗ = v)
2. ∀v(v + (−v) = 0⃗)
3. ∀v∀w(v + w = w + v)
4. ∀u∀v∀w((u + v) + w = u + (v + w))
5. ∀v(1 · v = v)
6. ∀a∀b∀v((ab) · v = a · (b · v))`,
    systemB: `1. ∀x(Jx → (Kx ∨ Lx))
2. ∀x(Kx → Mx)
3. ∀x(Lx → Mx)
4. ∀x(Mx → Nx)
5. ∃x(Jx ∧ Ox)
6. ∀x(Ox → Px)
7. ∀x(Px → ¬Qx)`
  },
  {
    id: "pair-18-measure-vs-connectivity",
    name: "Measure vs Connectivity",
    category: "Mixed Pairs",
    description: "Probability measure vs graph connectivity",
    systemA: `1. ∀x(0 ≤ μ(x) ≤ 1)
2. μ(∅) = 0
3. μ(U) = 1
4. ∀x∀y(x ∩ y = ∅ → μ(x ∪ y) = μ(x) + μ(y))
5. ∀x(μ(xᶜ) = 1 − μ(x))`,
    systemB: `1. ∀x∀y(Cxy → Cyx)
2. ∀x∃y(Cxy ∧ x ≠ y)
3. ∀x∀y∀z((Cxy ∧ Cyz ∧ x ≠ z) → Cxz)
4. ∃x∃y(¬Cxy)`
  },
  {
    id: "pair-19-equiv-with-diff-vs-biconditional",
    name: "Rich Equivalence vs Biconditional",
    category: "Mixed Pairs",
    description: "Equivalence with distinct classes vs biconditional",
    systemA: `1. ∀x(x ≡ x)
2. ∀x∀y(x ≡ y → y ≡ x)
3. ∀x∀y∀z((x ≡ y ∧ y ≡ z) → x ≡ z)
4. ∀x∃y(y ≡ x ∧ y ≠ x)
5. ∃a∃b∃c(a ≢ b ∧ b ≢ c ∧ a ≢ c)`,
    systemB: `1. ∀x(Ax → Bx)
2. ∀x(Bx → Cx)
3. ∀x(Cx → (Dx ↔ Ex))
4. ∃x(Ax ∧ Dx)
5. ∃x(Ax ∧ ¬Dx)`
  },
  {
    id: "pair-20-ordered-pair-vs-chain",
    name: "Ordered Pairs vs Chain",
    category: "Mixed Pairs",
    description: "Pair axioms vs predicate chain",
    systemA: `1. ∀x∀y(⟨x,y⟩ = ⟨y,x⟩ → x = y)
2. ∀x∀y∀z∀w(⟨x,y⟩ = ⟨z,w⟩ → (x = z ∧ y = w))
3. ∀x∀y∃z(z = ⟨x,y⟩)
4. ∀x∃y∃z(x = ⟨y,z⟩ → (π₁(x) = y ∧ π₂(x) = z))`,
    systemB: `1. ∀x(Wx → Xx)
2. ∀x(Xx → Yx)
3. ∀x(Yx → Zx)
4. ∀x(Zx → ¬Wx)
5. ∃x¬Wx
6. ∃x(Xx ∧ ¬Yx)`
  },
  {
    id: "pair-21-linear-logic-vs-time",
    name: "Linear Logic vs Time",
    category: "Mixed Pairs",
    description: "Linear logic tensor vs temporal order",
    systemA: `1. ∀x(x → x = ⊤)
2. ∀x(x ⊗ ⊤ = x)
3. ∀x∀y(x ⊗ y = y ⊗ x)
4. ∀x∀y∀z((x ⊗ y) ⊗ z = x ⊗ (y ⊗ z))
5. ∀x∀y((x ⊗ y) → z ↔ x → (y → z))`,
    systemB: `1. ∀t(t < t′)
2. ∀t∀s(t < s ∨ t = s ∨ s < t)
3. ∀t∀s∀r((t < s ∧ s < r) → t < r)
4. ∀t¬(t < t)
5. ∀t∃s(s < t)`
  },
  {
    id: "pair-22-set-ops-vs-chain",
    name: "Set Operations vs Chain",
    category: "Mixed Pairs",
    description: "Set membership vs predicate chain",
    systemA: `1. ∀x(in(x, ∅) → ⊥)
2. ∀x∀y∀z(in(x, {y,z}) ↔ (x = y ∨ x = z))
3. ∀x∀A∀B(in(x, A ∪ B) ↔ (in(x,A) ∨ in(x,B)))
4. ∀x∀A∀B(in(x, A ∩ B) ↔ (in(x,A) ∧ in(x,B)))
5. ∀A∀B(A = B ↔ ∀x(in(x,A) ↔ in(x,B)))`,
    systemB: `1. ∀x(Px → Qx)
2. ∀x(Qx → (Rx ∨ Sx))
3. ∀x(Rx → Tx)
4. ∀x(Sx → Tx)
5. ∀x(Tx → Ux)
6. ∀x(Ux → ¬Vx)
7. ∃x(Px ∧ Wx)
8. ∃x(Vx)`
  },
  {
    id: "pair-23-composition-vs-branching",
    name: "Function Composition vs Branching",
    category: "Mixed Pairs",
    description: "Category-like composition vs branching relation",
    systemA: `1. ∀f∀g∀x((f ∘ g)(x) = f(g(x)))
2. ∀f(f ∘ id = f)
3. ∀f(id ∘ f = f)
4. ∀f∀g∀h((f ∘ g) ∘ h = f ∘ (g ∘ h))
5. ∀x(id(x) = x)`,
    systemB: `1. ∀x∀y(Bxy → ∃z(Bxz ∧ Bzy))
2. ∀x∃y(Bxy)
3. ∀x∀y∀z((Bxy ∧ Bxz) → (y = z ∨ Byz ∨ Bzy))
4. ∀x¬Bxx`
  },
  {
    id: "pair-24-boolean-full-vs-chain",
    name: "Full Boolean vs Chain",
    category: "Mixed Pairs",
    description: "Complete Boolean algebra vs predicate chain",
    systemA: `1. ∀a(a ∨ ¬a = 1)
2. ∀a(a ∧ ¬a = 0)
3. ∀a(a ∨ 0 = a)
4. ∀a(a ∧ 1 = a)
5. ∀a∀b(a ∨ (a ∧ b) = a)
6. ∀a∀b(a ∧ (a ∨ b) = a)
7. ∀a∀b∀c(a ∨ (b ∧ c) = (a ∨ b) ∧ (a ∨ c))
8. ∀a∀b∀c(a ∧ (b ∨ c) = (a ∧ b) ∨ (a ∧ c))`,
    systemB: `1. ∀x(Dx → Ex)
2. ∀x(Ex → (Fx ∧ Gx))
3. ∀x(Fx → Hx)
4. ∀x(Gx → Ix)
5. ∀x((Hx ∧ Ix) → Jx)
6. ∃x(Dx ∧ Kx)
7. ∀x(Kx → Lx)`
  },
  {
    id: "pair-25-closure-op-vs-chain",
    name: "Closure Operator vs Long Chain",
    category: "Mixed Pairs",
    description: "Closure on poset vs extended predicate chain",
    systemA: `1. ∀x∀y(x ≼ y → f(x) ≼ f(y))
2. ∀x(x ≼ f(x))
3. ∀x(f(f(x)) = f(x))
4. ∀x(x ≼ x)
5. ∀x∀y((x ≼ y ∧ y ≼ x) → x = y)
6. ∀x∀y∀z((x ≼ y ∧ y ≼ z) → x ≼ z)`,
    systemB: `1. ∀x(Mx → Nx)
2. ∀x(Nx → Ox)
3. ∀x(Ox → (Px ⊕ Qx))
4. ∀x(Px → Rx)
5. ∀x(Qx → Rx)
6. ∀x(Rx → Sx)
7. ∃x(Mx ∧ Tx)
8. ∀x(Tx → Ux)
9. ∀x(Ux → ¬Vx)`
  },
];

interface AxiomLibraryProps {
  onCopyToInput?: (content: string, functionId: number) => void;
}

export function AxiomLibrary({ onCopyToInput }: AxiomLibraryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"single" | "pairs">("single");

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyPair = async (pair: AxiomPair, which: "A" | "B" | "both") => {
    let content = "";
    if (which === "A") content = pair.systemA;
    else if (which === "B") content = pair.systemB;
    else content = `SYSTEM A:\n${pair.systemA}\n\n<<<SEPARATOR>>>\n\nSYSTEM B:\n${pair.systemB}`;
    
    await navigator.clipboard.writeText(content);
    setCopiedId(`${pair.id}-${which}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = Array.from(new Set(AXIOM_LIBRARY.map(a => a.category)));
  const pairCategories = Array.from(new Set(AXIOM_PAIRS.map(p => p.category)));

  return (
    <div className="border border-border rounded-sm bg-card">
      <div className="p-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Axiom Library
          </h3>
          <Badge variant="secondary" className="text-[10px]">
            {AXIOM_LIBRARY.length} single + {AXIOM_PAIRS.length} pairs
          </Badge>
        </div>
        <div className="flex gap-1">
          <Button
            variant={activeTab === "single" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("single")}
            className="flex-1 h-7 text-[10px] font-mono"
          >
            SINGLE SYSTEMS
          </Button>
          <Button
            variant={activeTab === "pairs" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("pairs")}
            className="flex-1 h-7 text-[10px] font-mono"
          >
            PAIRS (2-ARG)
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[500px]">
        {activeTab === "single" ? (
          <div className="p-3 space-y-4">
            {categories.map(category => (
              <div key={category}>
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 sticky top-0 bg-card py-1 border-b border-border">
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
                          onClick={() => handleCopy(axiomSet.content, axiomSet.id)}
                          className="h-7 w-7 shrink-0"
                          data-testid={`copy-axiom-${axiomSet.id}`}
                        >
                          {copiedId === axiomSet.id ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                      <pre className="mt-2 text-[10px] font-mono bg-muted/50 p-2 rounded-sm overflow-x-auto whitespace-pre-wrap text-muted-foreground max-h-[80px] overflow-y-auto">
                        {axiomSet.content}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 space-y-4">
            {pairCategories.map(category => (
              <div key={category}>
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 sticky top-0 bg-card py-1 border-b border-border">
                  {category}
                </div>
                <div className="space-y-3">
                  {AXIOM_PAIRS.filter(p => p.category === category).map(pair => (
                    <div 
                      key={pair.id}
                      className="border border-border rounded-sm p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{pair.name}</div>
                          <div className="text-[10px] text-muted-foreground">{pair.description}</div>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleCopyPair(pair, "both")}
                          className="h-6 text-[10px] px-2"
                          data-testid={`copy-pair-${pair.id}`}
                        >
                          {copiedId === `${pair.id}-both` ? (
                            <><Check className="h-3 w-3 mr-1" /> Copied</>
                          ) : (
                            <><Copy className="h-3 w-3 mr-1" /> Copy Both</>
                          )}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-primary">SYSTEM A</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyPair(pair, "A")}
                              className="h-5 w-5"
                            >
                              {copiedId === `${pair.id}-A` ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <pre className="text-[9px] font-mono bg-muted/50 p-2 rounded-sm overflow-x-auto whitespace-pre-wrap text-muted-foreground max-h-[100px] overflow-y-auto">
                            {pair.systemA}
                          </pre>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-primary">SYSTEM B</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyPair(pair, "B")}
                              className="h-5 w-5"
                            >
                              {copiedId === `${pair.id}-B` ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <pre className="text-[9px] font-mono bg-muted/50 p-2 rounded-sm overflow-x-auto whitespace-pre-wrap text-muted-foreground max-h-[100px] overflow-y-auto">
                            {pair.systemB}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
