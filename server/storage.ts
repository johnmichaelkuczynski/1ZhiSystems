import { type User, type InsertUser, type JournalIssue, type InsertJournalIssue, users, journalIssues } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Journal methods
  getAllJournalIssues(): Promise<JournalIssue[]>;
  getJournalIssue(volume: number, issue: number): Promise<JournalIssue | undefined>;
  createJournalIssue(issue: InsertJournalIssue): Promise<JournalIssue>;
  updateJournalIssue(id: string, issue: Partial<InsertJournalIssue>): Promise<JournalIssue>;
  deleteJournalIssue(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Journal methods
  async getAllJournalIssues(): Promise<JournalIssue[]> {
    return await db.select().from(journalIssues).orderBy(desc(journalIssues.createdAt));
  }

  async getJournalIssue(volume: number, issue: number): Promise<JournalIssue | undefined> {
    const [journalIssue] = await db
      .select()
      .from(journalIssues)
      .where(sql`${journalIssues.volume} = ${volume} AND ${journalIssues.issue} = ${issue}`);
    return journalIssue || undefined;
  }

  async createJournalIssue(insertIssue: InsertJournalIssue): Promise<JournalIssue> {
    const [issue] = await db
      .insert(journalIssues)
      .values(insertIssue)
      .returning();
    return issue;
  }

  async updateJournalIssue(id: string, updateData: Partial<InsertJournalIssue>): Promise<JournalIssue> {
    const [issue] = await db
      .update(journalIssues)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(journalIssues.id, id))
      .returning();
    return issue;
  }

  async deleteJournalIssue(id: string): Promise<void> {
    await db.delete(journalIssues).where(eq(journalIssues.id, id));
  }
}

export const storage = new DatabaseStorage();
