import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { processWithAI, chatWithAI, type LLMProvider } from "./ai-service";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/process", async (req, res) => {
    try {
      const { input, instructions, functionName, model, explain } = req.body;

      if (!input || !functionName || !model) {
        return res.status(400).json({ 
          error: "Missing required fields: input, functionName, model" 
        });
      }

      const result = await processWithAI({
        input,
        instructions: instructions || "",
        functionName,
        model: model as LLMProvider,
        explain: explain || false
      });

      res.json(result);
    } catch (error: any) {
      console.error("Process error:", error);
      res.status(500).json({ 
        error: "AI processing failed",
        message: error.message 
      });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, model, history } = req.body;

      if (!message || !model) {
        return res.status(400).json({ 
          error: "Missing required fields: message, model" 
        });
      }

      const result = await chatWithAI(
        message, 
        model as LLMProvider, 
        history || []
      );

      res.json(result);
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        error: "AI chat failed",
        message: error.message 
      });
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "ok",
      models: {
        "Zhi 1": "Grok (xAI)",
        "Zhi 2": "Anthropic Claude", 
        "Zhi 3": "OpenAI GPT-4o",
        "Zhi 4": "DeepSeek"
      }
    });
  });

  return httpServer;
}
