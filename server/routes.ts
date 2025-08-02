import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJournalIssueSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import type { TextProcessingRequest, TestResult } from "@shared/ai-services";
import { 
  rewriteText, 
  generateStudyGuide, 
  generateTest, 
  generatePodcast, 
  generateCognitiveMap, 
  generateSummaryThesis, 
  generateThesisDeepDive, 
  generateSuggestedReadings 
} from "./ai-services";
import { generateAudio, VOICE_OPTIONS } from "./speech-services";

export async function registerRoutes(app: Express): Promise<Server> {
  // Journal routes
  app.get("/api/journal", async (req, res) => {
    try {
      const issues = await storage.getAllJournalIssues();
      res.json(issues);
    } catch (error) {
      console.error("Error fetching journal issues:", error);
      res.status(500).json({ error: "Failed to fetch journal issues" });
    }
  });

  app.get("/api/journal/:volume/:issue", async (req, res) => {
    try {
      const volume = parseInt(req.params.volume);
      const issue = parseInt(req.params.issue);
      
      if (isNaN(volume) || isNaN(issue)) {
        return res.status(400).json({ error: "Invalid volume or issue number" });
      }
      
      const journalIssue = await storage.getJournalIssue(volume, issue);
      if (!journalIssue) {
        return res.status(404).json({ error: "Journal issue not found" });
      }
      
      res.json(journalIssue);
    } catch (error) {
      console.error("Error fetching journal issue:", error);
      res.status(500).json({ error: "Failed to fetch journal issue" });
    }
  });

  app.post("/api/journal", async (req, res) => {
    try {
      const result = insertJournalIssueSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: fromZodError(result.error).toString() 
        });
      }
      
      const newIssue = await storage.createJournalIssue(result.data);
      res.status(201).json(newIssue);
    } catch (error) {
      console.error("Error creating journal issue:", error);
      res.status(500).json({ error: "Failed to create journal issue" });
    }
  });

  app.put("/api/journal/:id", async (req, res) => {
    try {
      const result = insertJournalIssueSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: fromZodError(result.error).toString() 
        });
      }
      
      const updatedIssue = await storage.updateJournalIssue(req.params.id, result.data);
      res.json(updatedIssue);
    } catch (error) {
      console.error("Error updating journal issue:", error);
      res.status(500).json({ error: "Failed to update journal issue" });
    }
  });

  app.delete("/api/journal/:id", async (req, res) => {
    try {
      await storage.deleteJournalIssue(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting journal issue:", error);
      res.status(500).json({ error: "Failed to delete journal issue" });
    }
  });

  // AI Processing Routes
  app.post("/api/ai/rewrite", async (req, res) => {
    try {
      const request: TextProcessingRequest = req.body;
      const result = await rewriteText(request);
      res.json({ result });
    } catch (error) {
      console.error("Error rewriting text:", error);
      res.status(500).json({ error: "Failed to rewrite text" });
    }
  });

  app.post("/api/ai/study-guide", async (req, res) => {
    try {
      const request: TextProcessingRequest = req.body;
      const result = await generateStudyGuide(request);
      res.json({ result });
    } catch (error) {
      console.error("Error generating study guide:", error);
      res.status(500).json({ error: "Failed to generate study guide" });
    }
  });

  app.post("/api/ai/test", async (req, res) => {
    try {
      const request: TextProcessingRequest = req.body;
      const questions = await generateTest(request);
      res.json({ questions });
    } catch (error) {
      console.error("Error generating test:", error);
      res.status(500).json({ error: "Failed to generate test" });
    }
  });

  app.post("/api/ai/test/submit", async (req, res) => {
    try {
      const { questions, userAnswers } = req.body;
      
      let correctCount = 0;
      const feedback: string[] = [];
      
      questions.forEach((question: any, index: number) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        
        if (isCorrect) correctCount++;
        
        feedback.push({
          question: question.question,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          explanation: question.explanation
        } as any);
      });

      const score = Math.round((correctCount / questions.length) * 100);
      const result: TestResult = {
        questions,
        userAnswers,
        score,
        totalQuestions: questions.length,
        feedback: `You scored ${score}% (${correctCount}/${questions.length} correct)`
      };

      res.json(result);
    } catch (error) {
      console.error("Error grading test:", error);
      res.status(500).json({ error: "Failed to grade test" });
    }
  });

  app.post("/api/ai/podcast", async (req, res) => {
    try {
      const request: TextProcessingRequest = req.body;
      const script = await generatePodcast(request);
      
      // Generate audio if requested
      if (request.includeAudio && request.voiceSelection) {
        try {
          const fullScript = `${script.introduction}\n\n${script.mainContent}\n\n${script.conclusion}`;
          const audioUrl = await generateAudio(fullScript, {
            provider: 'azure',
            voice: request.voiceSelection,
            speed: 1.0,
            pitch: 0
          });
          script.audioUrl = audioUrl;
        } catch (audioError) {
          console.error("Error generating audio:", audioError);
          // Continue without audio
        }
      }
      
      res.json({ script });
    } catch (error) {
      console.error("Error generating podcast:", error);
      res.status(500).json({ error: "Failed to generate podcast" });
    }
  });

  app.post("/api/ai/cognitive-map", async (req, res) => {
    try {
      const request: TextProcessingRequest = req.body;
      const map = await generateCognitiveMap(request);
      res.json({ map });
    } catch (error) {
      console.error("Error generating cognitive map:", error);
      res.status(500).json({ error: "Failed to generate cognitive map" });
    }
  });

  app.post("/api/ai/summary-thesis", async (req, res) => {
    try {
      const request: TextProcessingRequest = req.body;
      const result = await generateSummaryThesis(request);
      res.json({ result });
    } catch (error) {
      console.error("Error generating summary thesis:", error);
      res.status(500).json({ error: "Failed to generate summary thesis" });
    }
  });

  app.post("/api/ai/thesis-deep-dive", async (req, res) => {
    try {
      const request: TextProcessingRequest = req.body;
      const result = await generateThesisDeepDive(request);
      res.json({ result });
    } catch (error) {
      console.error("Error generating thesis deep dive:", error);
      res.status(500).json({ error: "Failed to generate thesis deep dive" });
    }
  });

  app.post("/api/ai/suggested-readings", async (req, res) => {
    try {
      const request: TextProcessingRequest = req.body;
      const readings = await generateSuggestedReadings(request);
      res.json({ readings });
    } catch (error) {
      console.error("Error generating suggested readings:", error);
      res.status(500).json({ error: "Failed to generate suggested readings" });
    }
  });

  app.get("/api/voice-options", (req, res) => {
    res.json(VOICE_OPTIONS);
  });

  const httpServer = createServer(app);

  return httpServer;
}
