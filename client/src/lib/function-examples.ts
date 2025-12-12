// Example axiom sets for each function - perfectly formatted for easy loading

export interface FunctionExample {
  id: string;
  name: string;
  functionId: number;
  input?: string;
  inputA?: string;
  inputB?: string;
}

export const FUNCTION_EXAMPLES: FunctionExample[] = [
  // Function 1: Axiom-Set / Theory Transformation (One Argument)
  {
    id: "f1-strict-order",
    name: "Strict Order",
    functionId: 1,
    input: `LANGUAGE: {<(x,y)}

AXIOMS:
1. ∀x ¬(x < x)
2. ∀x∀y∀z ((x < y ∧ y < z) → x < z)`
  },
  {
    id: "f1-group",
    name: "Group Theory",
    functionId: 1,
    input: `LANGUAGE: {·(x,y), e, inv(x)}

AXIOMS:
1. ∀x∀y∀z ((x · y) · z = x · (y · z))
2. ∀x (e · x = x)
3. ∀x (inv(x) · x = e)`
  },
  {
    id: "f1-equivalence",
    name: "Equivalence Relation",
    functionId: 1,
    input: `LANGUAGE: {∼(x,y)}

AXIOMS:
1. ∀x (x ∼ x)
2. ∀x∀y (x ∼ y → y ∼ x)
3. ∀x∀y∀z ((x ∼ y ∧ y ∼ z) → x ∼ z)`
  },

  // Function 2: Schema Equivalence (Two Arguments)
  {
    id: "f2-lattice-forms",
    name: "Lattice Formulations",
    functionId: 2,
    inputA: `LANGUAGE: {∨(x,y), ∧(x,y)}

AXIOMS:
1. a ∨ b = b ∨ a
2. a ∧ b = b ∧ a
3. a ∨ (b ∨ c) = (a ∨ b) ∨ c
4. a ∧ (b ∧ c) = (a ∧ b) ∧ c
5. a ∨ (a ∧ b) = a
6. a ∧ (a ∨ b) = a`,
    inputB: `LANGUAGE: {≤(x,y)}

AXIOMS:
1. ∀x (x ≤ x)
2. ∀x∀y ((x ≤ y ∧ y ≤ x) → x = y)
3. ∀x∀y∀z ((x ≤ y ∧ y ≤ z) → x ≤ z)
4. ∀x∀y ∃z (z = sup{x,y})
5. ∀x∀y ∃z (z = inf{x,y})`
  },
  {
    id: "f2-group-axioms",
    name: "Group Axiomatizations",
    functionId: 2,
    inputA: `LANGUAGE: {·(x,y), e, inv(x)}

AXIOMS:
1. ∀x∀y∀z ((x · y) · z = x · (y · z))
2. ∀x (e · x = x ∧ x · e = x)
3. ∀x (inv(x) · x = e ∧ x · inv(x) = e)`,
    inputB: `LANGUAGE: {·(x,y), inv(x)}

AXIOM:
1. (inv(a) · a) · (b · ((inv(c) · c) · d)) = b · d`
  },

  // Function 3: Definitional Equivalence (Two Arguments)
  {
    id: "f3-order-strict",
    name: "≤ vs <",
    functionId: 3,
    inputA: `LANGUAGE: {≤(x,y)}

AXIOMS:
1. ∀x (x ≤ x)
2. ∀x∀y ((x ≤ y ∧ y ≤ x) → x = y)
3. ∀x∀y∀z ((x ≤ y ∧ y ≤ z) → x ≤ z)`,
    inputB: `LANGUAGE: {<(x,y)}

AXIOMS:
1. ∀x ¬(x < x)
2. ∀x∀y∀z ((x < y ∧ y < z) → x < z)`
  },
  {
    id: "f3-boolean-sheffer",
    name: "Boolean vs Sheffer",
    functionId: 3,
    inputA: `LANGUAGE: {∧, ∨, ¬, 0, 1}

AXIOMS:
1. a ∨ b = b ∨ a
2. a ∧ b = b ∧ a
3. a ∨ (a ∧ b) = a
4. a ∧ (a ∨ b) = a
5. a ∨ ¬a = 1
6. a ∧ ¬a = 0`,
    inputB: `LANGUAGE: {|(x,y)}

AXIOMS:
1. (a | a) | (a | a) = a
2. a | (b | (b | b)) = a | a
3. (a | (b | c)) | (a | (b | c)) = ((b | b) | a) | ((c | c) | a)`
  },

  // Function 4: Model-Preserving Rewrite (One Argument)
  {
    id: "f4-peano",
    name: "Peano Arithmetic",
    functionId: 4,
    input: `LANGUAGE: {0, S, +, ·}

AXIOMS:
1. ∀x(Sx ≠ 0)
2. ∀x∀y(Sx = Sy → x = y)
3. ∀x(x + 0 = x)
4. ∀x∀y(x + Sy = S(x + y))
5. ∀x(x · 0 = 0)
6. ∀x∀y(x · Sy = x · y + x)
7. [φ(0) ∧ ∀x(φ(x) → φ(Sx))] → ∀x φ(x)`
  },
  {
    id: "f4-mereology",
    name: "Mereology",
    functionId: 4,
    input: `LANGUAGE: {P(x,y), O(x,y)}

AXIOMS:
1. ∀x P(x,x)
2. ∀x∀y ((P(x,y) ∧ P(y,x)) → x = y)
3. ∀x∀y∀z ((P(x,y) ∧ P(y,z)) → P(x,z))
4. ∀x∀y (O(x,y) ↔ ∃z(P(z,x) ∧ P(z,y)))`
  },

  // Function 5: Conservative Extension Analysis (Two Arguments)
  {
    id: "f5-pa-q",
    name: "PA over Q",
    functionId: 5,
    inputA: `LANGUAGE: {0, S, +, ·}

AXIOMS:
1. ∀x(Sx ≠ 0)
2. ∀x∀y(Sx = Sy → x = y)
3. ∀x(x ≠ 0 → ∃y(x = Sy))
4. ∀x(x + 0 = x)
5. ∀x∀y(x + Sy = S(x + y))
6. ∀x(x · 0 = 0)
7. ∀x∀y(x · Sy = x · y + x)`,
    inputB: `LANGUAGE: {0, S, +, ·}

AXIOMS:
1. ∀x(Sx ≠ 0)
2. ∀x∀y(Sx = Sy → x = y)
3. ∀x(x ≠ 0 → ∃y(x = Sy))
4. ∀x(x + 0 = x)
5. ∀x∀y(x + Sy = S(x + y))
6. ∀x(x · 0 = 0)
7. ∀x∀y(x · Sy = x · y + x)
8. [φ(0) ∧ ∀x(φ(x) → φ(Sx))] → ∀x φ(x)`
  },
  {
    id: "f5-zf-zfc",
    name: "ZF → ZFC",
    functionId: 5,
    inputA: `LANGUAGE: {∈(x,y)}

AXIOMS:
1. Extensionality
2. Empty Set
3. Pairing
4. Union
5. Power Set
6. Infinity
7. Separation
8. Replacement
9. Foundation`,
    inputB: `LANGUAGE: {∈(x,y)}

AXIOMS:
1. Extensionality
2. Empty Set
3. Pairing
4. Union
5. Power Set
6. Infinity
7. Separation
8. Replacement
9. Foundation
10. Axiom of Choice`
  },

  // Function 6: Compare Conceptual Schemes (Two Arguments)
  {
    id: "f6-modal-systems",
    name: "Modal K vs S5",
    functionId: 6,
    inputA: `LANGUAGE: {□, ◇, →, ¬}

AXIOMS:
1. All propositional tautologies
2. □(A → B) → (□A → □B)

RULES: MP, Necessitation`,
    inputB: `LANGUAGE: {□, ◇, →, ¬}

AXIOMS:
1. All propositional tautologies
2. □(A → B) → (□A → □B)
3. □A → A
4. □A → □□A
5. ◇A → □◇A

RULES: MP, Necessitation`
  },
  {
    id: "f6-mereology-compare",
    name: "CEM vs GEM",
    functionId: 6,
    inputA: `LANGUAGE: {≤(x,y), O(x,y)}

AXIOMS:
1. x ≤ x
2. x ≤ y ∧ y ≤ x → x = y
3. x ≤ y ∧ y ≤ z → x ≤ z
4. ¬(y ≤ x) → ∃z(z ≤ y ∧ ¬O(z,x))
5. ∃x φ(x) → ∃y∀z(O(z,y) ↔ ∃x(φ(x) ∧ O(z,x)))`,
    inputB: `LANGUAGE: {P(x,y), O(x,y), Fus(y,φ)}

AXIOMS:
1. P(x,y) ∧ P(y,z) → P(x,z)
2. P(x,y) ∧ x ≠ y → ∃z(P(z,y) ∧ ¬O(z,x))
3. ∃x φ(x) → ∃y Fus(y,φ)
4. O(x,y) → ∃z∀w(P(w,z) ↔ P(w,x) ∧ P(w,y))
5. ∀z(P(z,x) ↔ P(z,y)) → x = y`
  },

  // Function 7: Ontological Dependence (One Argument)
  {
    id: "f7-set-theory",
    name: "Set Theory",
    functionId: 7,
    input: `LANGUAGE: {∈(x,y)}

AXIOMS:
1. ∀x∀y[∀z(z ∈ x ↔ z ∈ y) → x = y]
2. ∃x∀y(y ∉ x)
3. ∀x∀y∃z∀w(w ∈ z ↔ w = x ∨ w = y)
4. ∀x∃y∀z(z ∈ y ↔ ∃w(z ∈ w ∧ w ∈ x))
5. ∀x∃y∀z(z ∈ y ↔ z ⊆ x)`
  },
  {
    id: "f7-geometry",
    name: "Euclidean Geometry",
    functionId: 7,
    input: `LANGUAGE: {B(x,y,z), ≡(xy,zw)}

AXIOMS:
1. xy ≡ yx
2. xy ≡ zu ∧ xy ≡ vw → zu ≡ vw
3. xy ≡ zz → x = y
4. ∃y(B(x,y,z) ∧ yz ≡ ab)
5. B(x,y,x) → x = y
6. B(x,u,z) ∧ B(y,v,z) → ∃a(B(u,a,y) ∧ B(v,a,x))`
  },

  // Function 8: Generate Alternative Conceptualizations (One Argument)
  {
    id: "f8-boolean",
    name: "Boolean Algebra",
    functionId: 8,
    input: `LANGUAGE: {+, ·, ', 0, 1}

AXIOMS:
1. a + b = b + a
2. a · b = b · a
3. a + (b · c) = (a + b) · (a + c)
4. a · (b + c) = (a · b) + (a · c)
5. a + 0 = a
6. a · 1 = a
7. a + a' = 1
8. a · a' = 0`
  },
  {
    id: "f8-lattice",
    name: "Lattice",
    functionId: 8,
    input: `LANGUAGE: {∨(x,y), ∧(x,y)}

AXIOMS:
1. a ∨ b = b ∨ a
2. a ∧ b = b ∧ a
3. a ∨ (b ∨ c) = (a ∨ b) ∨ c
4. a ∧ (b ∧ c) = (a ∧ b) ∧ c
5. a ∨ (a ∧ b) = a
6. a ∧ (a ∨ b) = a`
  },

  // Function 9: Interpret Canonical Meaning (One Argument)
  {
    id: "f9-modal",
    name: "Modal S5",
    functionId: 9,
    input: `LANGUAGE: {□, ◇, →, ¬}

AXIOMS:
1. □(A → B) → (□A → □B)
2. □A → A
3. □A → □□A
4. ◇A → □◇A`
  },
  {
    id: "f9-dense-order",
    name: "Dense Linear Order",
    functionId: 9,
    input: `LANGUAGE: {<(x,y)}

AXIOMS:
1. ∀x ¬(x < x)
2. ∀x∀y∀z ((x < y ∧ y < z) → x < z)
3. ∀x∀y (x < y ∨ x = y ∨ y < x)
4. ∀x∀y (x < y → ∃z (x < z ∧ z < y))
5. ∀x ∃y (y < x)
6. ∀x ∃y (x < y)`
  },

  // Function 10: Find an Interpretation (One Argument)
  {
    id: "f10-partial-order",
    name: "Partial Order",
    functionId: 10,
    input: `LANGUAGE: {≤(x,y)}

AXIOMS:
1. ∀x (x ≤ x)
2. ∀x∀y ((x ≤ y ∧ y ≤ x) → x = y)
3. ∀x∀y∀z ((x ≤ y ∧ y ≤ z) → x ≤ z)`
  },
  {
    id: "f10-total-order",
    name: "Total Order",
    functionId: 10,
    input: `LANGUAGE: {<(x,y)}

AXIOMS:
1. ∀x ¬(x < x)
2. ∀x∀y∀z ((x < y ∧ y < z) → x < z)
3. ∀x∀y (x < y ∨ x = y ∨ y < x)`
  },
  {
    id: "f10-abelian-group",
    name: "Abelian Group",
    functionId: 10,
    input: `LANGUAGE: {+(x,y), 0, -(x)}

AXIOMS:
1. ∀x∀y∀z ((x + y) + z = x + (y + z))
2. ∀x (0 + x = x)
3. ∀x ((-x) + x = 0)
4. ∀x∀y (x + y = y + x)`
  },
];

export function getExamplesForFunction(functionId: number): FunctionExample[] {
  return FUNCTION_EXAMPLES.filter(e => e.functionId === functionId);
}
