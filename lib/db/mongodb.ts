import { MongoClient, Db, Collection } from "mongodb";
import fs from "fs";
import path from "path";

// Collection names required by the Polyglot recruitment specification
export const COLLECTIONS = {
  JOB_DESCRIPTIONS: "job_descriptions",
  RESUME_DOCUMENTS: "resume_documents",
  RESUME_ANALYSIS: "resume_analysis",
  JD_ANALYSIS: "jd_analysis",
  AI_GENERATED_QUESTIONS: "ai_generated_questions",
  INTERVIEW_TRANSCRIPTS: "interview_transcripts",
  AI_ANALYSIS_DOCUMENTS: "ai_analysis_documents",
  SKILL_ANALYSIS: "skill_analysis",
  AGENT_RUNS: "agent_runs",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let isConnected = false;
let connectionAttempted = false;

// Fallback in-process storage directory for development when MongoDB service is not started
const FALLBACK_DATA_DIR = path.join(process.cwd(), ".mongo_local_store");
if (!fs.existsSync(FALLBACK_DATA_DIR)) {
  try {
    fs.mkdirSync(FALLBACK_DATA_DIR, { recursive: true });
  } catch {}
}

class LocalCollectionFallback {
  private name: string;
  private filePath: string;

  constructor(name: string) {
    this.name = name;
    this.filePath = path.join(FALLBACK_DATA_DIR, `${name}.json`);
    if (!fs.existsSync(this.filePath)) {
      try {
        fs.writeFileSync(this.filePath, JSON.stringify([]), "utf-8");
      } catch {}
    }
  }

  private readAll(): any[] {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        return JSON.parse(raw);
      }
    } catch {}
    return [];
  }

  private writeAll(data: any[]): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error(`Error saving fallback mongo collection ${this.name}:`, e);
    }
  }

  async findOne(query: Record<string, any>): Promise<any | null> {
    const list = this.readAll();
    const item = list.find((doc) => {
      return Object.entries(query).every(([k, v]) => doc[k] === v);
    });
    return item || null;
  }

  find(query: Record<string, any> = {}) {
    const list = this.readAll();
    const filtered = Object.keys(query).length === 0
      ? list
      : list.filter((doc) => {
          return Object.entries(query).every(([k, v]) => doc[k] === v);
        });

    return {
      toArray: async () => filtered,
      sort: (sortObj: Record<string, number>) => {
        const sorted = [...filtered].sort((a, b) => {
          for (const [key, dir] of Object.entries(sortObj)) {
            const valA = a[key] ?? 0;
            const valB = b[key] ?? 0;
            if (valA < valB) return -1 * dir;
            if (valA > valB) return 1 * dir;
          }
          return 0;
        });
        return {
          toArray: async () => sorted,
          limit: (n: number) => ({
            toArray: async () => sorted.slice(0, n),
          }),
        };
      },
      limit: (n: number) => ({
        toArray: async () => filtered.slice(0, n),
      }),
    };
  }

  async insertOne(doc: any): Promise<{ insertedId: string; acknowledged: boolean }> {
    const list = this.readAll();
    const docToSave = {
      _id: doc._id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      ...doc,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(docToSave);
    this.writeAll(list);
    return { insertedId: docToSave._id, acknowledged: true };
  }

  async updateOne(
    query: Record<string, any>,
    update: { $set?: Record<string, any> },
    options?: { upsert?: boolean }
  ): Promise<any> {
    const list = this.readAll();
    const index = list.findIndex((doc) => {
      return Object.entries(query).every(([k, v]) => doc[k] === v);
    });
    if (index !== -1) {
      if (update.$set) {
        list[index] = { ...list[index], ...update.$set, updatedAt: new Date().toISOString() };
      }
      this.writeAll(list);
      return { matchedCount: 1, modifiedCount: 1 };
    }
    if (options?.upsert) {
      const docToSave = {
        _id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        ...query,
        ...(update.$set || {}),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.push(docToSave);
      this.writeAll(list);
      return { matchedCount: 0, modifiedCount: 0, upsertedCount: 1, upsertedId: docToSave._id };
    }
    return { matchedCount: 0, modifiedCount: 0 };
  }

  async deleteOne(query: Record<string, any>): Promise<any> {
    const list = this.readAll();
    const index = list.findIndex((doc) => {
      return Object.entries(query).every(([k, v]) => doc[k] === v);
    });
    if (index !== -1) {
      list.splice(index, 1);
      this.writeAll(list);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  async deleteMany(query: Record<string, any> = {}): Promise<any> {
    if (Object.keys(query).length === 0) {
      const count = this.readAll().length;
      this.writeAll([]);
      return { deletedCount: count };
    }
    const list = this.readAll();
    const remaining = list.filter((doc) => !Object.entries(query).every(([k, v]) => doc[k] === v));
    const deletedCount = list.length - remaining.length;
    this.writeAll(remaining);
    return { deletedCount };
  }

  async countDocuments(query: Record<string, any> = {}): Promise<number> {
    const items = await this.find(query).toArray();
    return items.length;
  }
}

export async function getMongoDb(): Promise<Db | null> {
  if (dbInstance && isConnected) {
    return dbInstance;
  }

  if (!connectionAttempted) {
    connectionAttempted = true;
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/placement_docs";
    try {
      client = new MongoClient(uri, { serverSelectionTimeoutMS: 2000 });
      await client.connect();
      dbInstance = client.db();
      isConnected = true;
      console.log("Connected to MongoDB at:", uri);
      return dbInstance;
    } catch (err) {
      console.warn("MongoDB service unavailable at URI; using file-backed persistent local fallback store.");
      isConnected = false;
      return null;
    }
  }

  return null;
}

export async function getMongoCollection(collectionName: CollectionName): Promise<any> {
  const db = await getMongoDb();
  if (db && isConnected) {
    return db.collection(collectionName);
  }
  return new LocalCollectionFallback(collectionName);
}
