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
