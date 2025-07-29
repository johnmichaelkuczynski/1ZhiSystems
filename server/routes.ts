import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJournalIssueSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

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

  const httpServer = createServer(app);

  return httpServer;
}
