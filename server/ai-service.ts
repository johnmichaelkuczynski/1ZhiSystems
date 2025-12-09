import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export type LLMProvider = "Zhi 1" | "Zhi 2" | "Zhi 3" | "Zhi 4";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured.");
  }
  return new OpenAI({ apiKey });
}

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Anthropic API key not configured.");
  }
  return new Anthropic({ apiKey });
}

function getXAIClient(): OpenAI {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("xAI API key not configured.");
  }
  return new OpenAI({ apiKey, baseURL: "https://api.x.ai/v1" });
}

function getDeepSeekClient(): OpenAI {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DeepSeek API key not configured.");
  }
  return new OpenAI({ apiKey, baseURL: "https://api.deepseek.com" });
}

export interface AIRequest {
  input: string;
  instructions: string;
  functionName: string;
  model: LLMProvider;
  explain?: boolean;
}

export interface AIResponse {
  result: string;
  model: string;
  provider: string;
}

const FUNCTION_1_PROMPT = `You are a theory transformation engine. Transform the given axiomatic theory according to the user's custom instructions. The output must be a new theory that is logically equivalent (same models up to isomorphism, same theorems) to the original, unless impossible. Eliminate, introduce, or restructure primitives and axioms as instructed. Do not keep eliminated primitives in definitions or anywhere else. If impossible, explain why.

User's Input Theory:
[USER_INPUT]

User's Custom Instructions:
[USER_INSTRUCTIONS]

Paradigms (Use these as examples to guide your transformation; do not copy them verbatim unless the user input matches exactly):

Paradigm 1: Geometry Betweenness to Line
Input:
Primitives:
  Point(x)
  Between(x,y,z)

Axioms:
1. ∀x∀y∀z [Between(x,y,z) → Point(x) ∧ Point(y) ∧ Point(z)]
2. ∀x∀y [x ≠ y → ∃z Between(x,z,y)]
3. ∀x∀y∀z∀w [(Between(x,y,z) ∧ Between(y,z,w)) → Between(x,y,w)]

Custom Instructions: Rewrite using "Line(x,y)" as the sole primitive. Eliminate both Point and Between. Preserve the same models if possible.

Output:
NEW PRIMITIVE:
  Line(x,y)   // x and y determine a unique line

REWRITTEN AXIOMS:
1. ∀x∀y [Line(x,y) → x ≠ y]
2. ∀x∀y∀z [Line(x,y) ∧ Line(y,z) → Line(x,z)]
3. ∀x∀y [x ≠ y → ∃z (Line(x,z) ∧ Line(z,y))]

Paradigm 2: Set Membership to Subset (Ackermann Encoding)
Input:
Primitives:
  Set(x)
  ElementOf(a,x)   // a ∈ x

Axioms:
1. ∀x ∃y (Set(y) ∧ ¬∃z (ElementOf(z,y)))                               // empty set
2. ∀x ∀y (Set(x) ∧ Set(y) → ∃z (Set(z) ∧ ∀w (ElementOf(w,z) ↔ ElementOf(w,x) ∨ w=x ∨ w=y)))  // pair
3. ∀x (Set(x) → ∃y (Set(y) ∧ ∀z (ElementOf(z,y) ↔ ∃w (ElementOf(z,w) ∧ ElementOf(w,x))))) // union
4. ∀x (Set(x) → ∃y (Set(y) ∧ ∀z (ElementOf(z,y) ↔ Set(z) ∧ ∀w (ElementOf(w,z) → ElementOf(w,x))))) // power set

Custom Instructions: Completely eliminate ElementOf(a,x). Use only the single primitive Subset(A,B) meaning "A is a subset of B". Do not use ElementOf anywhere in the output. Produce a theory with the same models (up to isomorphism).

Output:
Primitive:
  Subset(A,B)   // A ⊆ B

Axioms:
1. ∀A ∀B ∀C [Subset(A,B) ∧ Subset(B,C) → Subset(A,C)]  // transitivity
2. ∀A ∀B [Subset(A,B) ∧ Subset(B,A) → A = B]            // antisymmetry
3. ∃E ∀X ¬Subset(X,E)                                   // empty set
4. ∀A ∀B ∃C ∀X [Subset(X,C) ↔ Subset(X,A) ∨ X=A ∨ X=B]  // pair
5. ∀A ∃U ∀X [Subset(X,U) ↔ ∃Y (Subset(Y,A) ∧ Subset(X,Y))]  // union
6. ∀A ∃P ∀X [Subset(X,P) ↔ ∀Y (Subset(Y,A) → Subset(Y,X))]  // power set

Paradigm 3: Peano Arithmetic to Successor-Only
Input:
Primitives:
  NaturalNumber(n)
  Zero(0)
  Successor(s,n)   // s = successor of n

Axioms:
1. ∃z NaturalNumber(z) ∧ ∀n ¬Successor(n,z)  // zero exists, no predecessor
2. ∀n (NaturalNumber(n) → ∃s NaturalNumber(s) ∧ Successor(n,s))  // every n has successor
3. ∀n ∀m ∀s (Successor(n,s) ∧ Successor(m,s) → n = m)  // successors unique
4. ∀P [(P(z) ∧ ∀n (P(n) → P(s(n)))) → ∀n P(n)]  // induction (second-order)

Custom Instructions: Eliminate Zero(0) and NaturalNumber(n). Use only the single primitive Successor(x,y) meaning "y is the successor of x". Produce an equivalent theory without zero as a primitive.

Output:
Primitive:
  Successor(x,y)   // y = x + 1

Axioms:
1. ∀x ∃!y Successor(x,y)  // every x has unique successor
2. ∀x ¬Successor(x,x)  // no self-successor
3. ∀x ∀y ∀z [Successor(x,y) ∧ Successor(y,z) → ¬Successor(z,x)]  // no cycles of 3
4. ¬∃x ∀y Successor(y,x) ∨ Successor(x,y)  // no universal predecessor/successor
5. ∀P [∃x (P(x) ∧ ∀y ¬Successor(y,x)) ∧ ∀x (P(x) → P(s(x))) → ∀x P(x)]  // induction starting from minimal elements

Now perform the transformation on the user's input. Output only the transformed theory or impossibility explanation.`;

function buildPromptForFunction1(input: string, instructions: string): string {
  return FUNCTION_1_PROMPT
    .replace("[USER_INPUT]", input)
    .replace("[USER_INSTRUCTIONS]", instructions || "Transform this theory.");
}

function buildPromptGeneric(input: string, instructions: string): string {
  let prompt = input;
  if (instructions && instructions.trim()) {
    prompt += "\n\n" + instructions;
  }
  return prompt;
}

export async function processWithAI(request: AIRequest): Promise<AIResponse> {
  let prompt: string;
  
  if (request.functionName === "Axiom-Set / Theory Transformation") {
    prompt = buildPromptForFunction1(request.input, request.instructions);
  } else {
    prompt = buildPromptGeneric(request.input, request.instructions);
  }

  const messages = [{ role: "user" as const, content: prompt }];

  switch (request.model) {
    case "Zhi 1": {
      const client = getXAIClient();
      const response = await client.chat.completions.create({
        model: "grok-3-mini-beta",
        messages,
        max_tokens: 4096
      });
      return {
        result: response.choices[0]?.message?.content || "",
        model: "grok-3-mini-beta",
        provider: "xAI (Grok)"
      };
    }
    case "Zhi 2": {
      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages
      });
      const text = response.content.find(c => c.type === 'text');
      return {
        result: text?.text || "",
        model: "claude-sonnet-4-20250514",
        provider: "Anthropic"
      };
    }
    case "Zhi 3": {
      const client = getOpenAIClient();
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 4096
      });
      return {
        result: response.choices[0]?.message?.content || "",
        model: "gpt-4o",
        provider: "OpenAI"
      };
    }
    case "Zhi 4": {
      const client = getDeepSeekClient();
      const response = await client.chat.completions.create({
        model: "deepseek-chat",
        messages,
        max_tokens: 4096
      });
      return {
        result: response.choices[0]?.message?.content || "",
        model: "deepseek-chat",
        provider: "DeepSeek"
      };
    }
    default: {
      const client = getXAIClient();
      const response = await client.chat.completions.create({
        model: "grok-3-mini-beta",
        messages,
        max_tokens: 4096
      });
      return {
        result: response.choices[0]?.message?.content || "",
        model: "grok-3-mini-beta",
        provider: "xAI (Grok)"
      };
    }
  }
}

export async function chatWithAI(message: string, model: LLMProvider, history: Array<{role: string, content: string}>): Promise<AIResponse> {
  const messages = [
    ...history.map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
    { role: "user" as const, content: message }
  ];

  switch (model) {
    case "Zhi 1": {
      const client = getXAIClient();
      const response = await client.chat.completions.create({
        model: "grok-3-mini-beta",
        messages,
        max_tokens: 2048
      });
      return {
        result: response.choices[0]?.message?.content || "",
        model: "grok-3-mini-beta",
        provider: "xAI (Grok)"
      };
    }
    case "Zhi 2": {
      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages
      });
      const text = response.content.find(c => c.type === 'text');
      return {
        result: text?.text || "",
        model: "claude-sonnet-4-20250514",
        provider: "Anthropic"
      };
    }
    case "Zhi 3": {
      const client = getOpenAIClient();
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 2048
      });
      return {
        result: response.choices[0]?.message?.content || "",
        model: "gpt-4o",
        provider: "OpenAI"
      };
    }
    case "Zhi 4": {
      const client = getDeepSeekClient();
      const response = await client.chat.completions.create({
        model: "deepseek-chat",
        messages,
        max_tokens: 2048
      });
      return {
        result: response.choices[0]?.message?.content || "",
        model: "deepseek-chat",
        provider: "DeepSeek"
      };
    }
    default: {
      const client = getXAIClient();
      const response = await client.chat.completions.create({
        model: "grok-3-mini-beta",
        messages,
        max_tokens: 2048
      });
      return {
        result: response.choices[0]?.message?.content || "",
        model: "grok-3-mini-beta",
        provider: "xAI (Grok)"
      };
    }
  }
}
