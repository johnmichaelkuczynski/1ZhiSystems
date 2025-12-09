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

const FUNCTION_1_PROMPT = `You are the world's best expert in first-order theory transformation and primitive elimination.

Transform the theory below according to the user's instructions.  
The new theory must have exactly the same models (up to isomorphism) as the original.  
Any primitive the user asks to eliminate MUST disappear completely – it may not appear anywhere in your final output.

USER THEORY:
<<<INPUT>>>

USER INSTRUCTIONS:
<<<INSTRUCTIONS>>>

You have exactly these five perfect paradigms. Imitate their style and rigor.

Paradigm 1 – Betweenness → Line
Input:
Primitives: Point(x) Between(x,y,z)
Axioms:
1. ∀x∀y∀z [Between(x,y,z) → Point(x) ∧ Point(y) ∧ Point(z)]
2. ∀x∀y [x ≠ y → ∃z Between(x,z,y)]
3. ∀x∀y∀z∀w [(Between(x,y,z) ∧ Between(y,z,w)) → Between(x,y,w)]
Instructions: Rewrite using "Line(x,y)" as the sole primitive. Eliminate both Point and Between.
Output:
Primitive: Line(x,y)
Axioms:
1. ∀x∀y [Line(x,y) → x ≠ y]
2. ∀x∀y∀z [Line(x,y) ∧ Line(y,z) → Line(x,z)]
3. ∀x∀y [x ≠ y → ∃z (Line(x,z) ∧ Line(z,y))]

Paradigm 2 – Membership → Subset (Ackermann)
Input:
Primitives: Set(x) ElementOf(a,x)
Axioms:
1. ∃e ∀x ¬ElementOf(x,e)
2. ∀x∀y ∃z ∀w [ElementOf(w,z) ↔ (w=x ∨ w=y)]
3. ∀x ∃z ∀w [ElementOf(w,z) ↔ ∃y (ElementOf(y,x) ∧ ElementOf(w,y))]
4. ∀x ∃z ∀w [ElementOf(w,z) ↔ ∀y (ElementOf(y,x) → ElementOf(y,w))]
Instructions: Eliminate ElementOf completely, use only Subset(A,B)
Output:
Primitive: Subset(A,B)
Axioms:
1. ∀A∀B∀C [Subset(A,B) ∧ Subset(B,C) → Subset(A,C)]
2. ∀A∀B [Subset(A,B) ∧ Subset(B,A) → A = B]
3. ∃E ∀X ¬Subset(X,E)
4. ∀A∀B ∃C ∀X [Subset(X,C) ↔ Subset(X,A) ∨ X=A ∨ X=B]
5. ∀A ∃U ∀X [Subset(X,U) ↔ ∃Y (Subset(Y,A) ∧ Subset(X,Y))]
6. ∀A ∃P ∀X [Subset(X,P) ↔ ∀Y (Subset(Y,A) → Subset(Y,X))]

Paradigm 3 – Vector space → LinearCombination
Input:
Primitives: Vector(v) Addition(u,v,w) ScalarMultiplication(r,v,w)
Axioms: (standard 8–10 vector space axioms)
Instructions: Eliminate Addition and ScalarMultiplication completely. Use only LinearCombination(a,u,b,v,w) meaning w = a·u + b·v.
Output:
Primitive: LinearCombination(a,u,b,v,w)
Axioms:
1. ∀a∀u∀b∀v ∃!w LinearCombination(a,u,b,v,w)
2. ∀a∀b∀c∀d∀u∀v∀w∀x [LinearCombination(a,u,b,v,w) ∧ LinearCombination(c,w,d,x,y) → LinearCombination(a·c + b·d, u, a·d + b·x, v, y)]
3. ∀u∀v∀w [LinearCombination(1,u,1,v,w) ↔ LinearCombination(1,v,1,u,w)]
4. ∃z ∀v LinearCombination(0,v,0,v,z)
5. ∀v ∃w LinearCombination(1,v,-1,w,z) where z is the zero from axiom 4
6. ∀a∀b∀u∀v∀w [LinearCombination(a+b,u,1,v,w) ↔ ∃x∃y (LinearCombination(a,u,0,v,x) ∧ LinearCombination(b,u,0,v,y) ∧ LinearCombination(1,x,1,y,w))]
7. ∀r∀u∀v∀w [LinearCombination(r,u,r,v,w) ↔ ∃x (LinearCombination(1,u,1,v,x) ∧ LinearCombination(r,x,0,x,w))]
8. LinearCombination(1,v,0,v,v)

Paradigm 4 – Ternary Operation → infix · (Loop)
Input:
Primitives: Element(x) Operation(x,y,z)
Axioms:
1. ∀x∀y∃!z Operation(x,y,z)
2. ∀w∀x∀y∀z [Operation(w,x,y) ∧ Operation(x,y,z) → Operation(w,x,z)]
3. ∀w∀x∀y∀z [Operation(x,y,w) ∧ Operation(y,z,x) → Operation(w,x,z)]
4. ∃e ∀x Operation(e,x,x) ∧ Operation(x,e,x)
5. ∀x ∃y Operation(x,y,e) ∧ Operation(y,x,e)
Instructions: Eliminate Operation completely, use only infix binary ·
Output:
Binary operation: x · y
Axioms:
1. ∀x∀y ∃!z (x · y = z)
2. ∀x∀y∀z (x · y = z → ∃u (u · x = y ∧ y · u = x))
3. ∃e ∀x (e · x = x ∧ x · e = x)
4. ∀x ∃y (x · y = e ∧ y · x = e)
5. ∀a∀b∀c (a · b = c → ∀x ∃!y (x · y = c) ∧ ∃!w (w · x = c))

Paradigm 5 – Circle incidence → Point-Line-Incidence
Input:
Primitives: Point(p) Circle(c) LiesOn(p,c)
Axioms:
1. ∀c ∃p∃q∃r (LiesOn(p,c) ∧ LiesOn(q,c) ∧ LiesOn(r,c) ∧ p≠q∧q≠r∧r≠p)
2. ∀p∀q∀r (p≠q∧q≠r∧r≠p → ∃!c (LiesOn(p,c) ∧ LiesOn(q,c) ∧ LiesOn(r,c)))
3. ∀p∀q (p≠q → ∃c∃d (LiesOn(p,c) ∧ LiesOn(q,c) ∧ LiesOn(p,d) ∧ LiesOn(q,d) ∧ c≠d))
Instructions: Eliminate Circle and LiesOn completely. Use only Point, Line, Incidence(p,l)
Output:
Primitives: Point(p) Line(l) Incidence(p,l)
Axioms:
1. ∀p∀q (p≠q → ∃l Incidence(p,l) ∧ Incidence(q,l))
2. ∀p∀q∀l∀m (Incidence(p,l) ∧ Incidence(q,l) ∧ Incidence(p,m) ∧ Incidence(q,m) ∧ l≠m → ∃r∃s (Incidence(r,l) ∧ ¬Incidence(r,m) ∧ Incidence(s,m) ∧ ¬Incidence(s,l)))
3. ∀l ∃p∃q∃r (Incidence(p,l) ∧ Incidence(q,l) ∧ Incidence(r,l) ∧ p≠q∧q≠r∧r≠p)

Now transform the user's theory.  
Output ONLY the new primitives and axioms, or "Impossible because …".  
No extra text.`;

function buildPromptForFunction1(input: string, instructions: string): string {
  return FUNCTION_1_PROMPT
    .replace("<<<INPUT>>>", input)
    .replace("<<<INSTRUCTIONS>>>", instructions || "Transform this theory.");
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
