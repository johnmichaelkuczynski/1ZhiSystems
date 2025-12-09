export type LLM = "Zhi 1" | "Zhi 2" | "Zhi 3" | "Zhi 4";

export interface ProcessingResponse {
  result: string;
  model: string;
  provider: string;
  error?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function processTheory(
  input: string,
  instructions: string,
  functionName: string,
  model: LLM,
  explain: boolean = false
): Promise<ProcessingResponse> {
  const response = await fetch("/api/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, instructions, functionName, model, explain })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Processing failed");
  }

  return response.json();
}

export async function sendChatMessage(
  message: string,
  model: LLM,
  history: ChatMessage[]
): Promise<ProcessingResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, model, history })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Chat failed");
  }

  return response.json();
}
