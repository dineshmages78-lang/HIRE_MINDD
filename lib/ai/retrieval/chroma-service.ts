import fs from "fs";
import path from "path";
import { generateEmbedding, cosineSimilarity } from "../embeddings/embedding-service";

export const CHROMA_COLLECTIONS = {
  RESUME_EMBEDDINGS: "resume_embeddings",
  JOB_EMBEDDINGS: "job_embeddings",
  SKILL_EMBEDDINGS: "skill_embeddings",
  ASSESSMENT_EMBEDDINGS: "assessment_embeddings",
  INTERVIEW_EMBEDDINGS: "interview_embeddings",
} as const;

export type ChromaCollectionName = (typeof CHROMA_COLLECTIONS)[keyof typeof CHROMA_COLLECTIONS];

export interface VectorDocument {
  id: string;
  document: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

export interface QueryResult {
  id: string;
  document: string;
  metadata: Record<string, any>;
  similarity: number; // 0.0 - 1.0
  distance: number;
}

const CHROMA_FALLBACK_DIR = path.join(process.cwd(), ".chroma_local_store");
if (!fs.existsSync(CHROMA_FALLBACK_DIR)) {
  try {
    fs.mkdirSync(CHROMA_FALLBACK_DIR, { recursive: true });
  } catch {}
}

class LocalVectorCollection {
  private collectionName: string;
  private filePath: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.filePath = path.join(CHROMA_FALLBACK_DIR, `${collectionName}.json`);
    if (!fs.existsSync(this.filePath)) {
      try {
        fs.writeFileSync(this.filePath, JSON.stringify([]), "utf-8");
      } catch {}
    }
  }

  private readAll(): VectorDocument[] {
    try {
      if (fs.existsSync(this.filePath)) {
        return JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
      }
    } catch {}
    return [];
  }

  private writeAll(docs: VectorDocument[]): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(docs, null, 2), "utf-8");
    } catch (e) {
      console.error(`Error saving chroma fallback ${this.collectionName}:`, e);
    }
  }

  async add(doc: VectorDocument): Promise<void> {
    const docs = this.readAll();
    const existingIdx = docs.findIndex((d) => d.id === doc.id);
    const embedding = doc.embedding || (await generateEmbedding(doc.document));
    const entry: VectorDocument = {
      id: doc.id,
      document: doc.document,
      metadata: doc.metadata || {},
      embedding,
    };

    if (existingIdx >= 0) {
      docs[existingIdx] = entry;
    } else {
      docs.push(entry);
    }
    this.writeAll(docs);
  }

  async update(doc: VectorDocument): Promise<void> {
    return this.add(doc);
  }

  async delete(id: string): Promise<void> {
    const docs = this.readAll();
    const remaining = docs.filter((d) => d.id !== id);
    this.writeAll(remaining);
  }

  async query(queryText: string, topK: number = 5, filter?: Record<string, any>): Promise<QueryResult[]> {
    const docs = this.readAll();
    if (docs.length === 0) return [];

    const queryEmbedding = await generateEmbedding(queryText);

    let candidates = docs;
    if (filter) {
      candidates = candidates.filter((d) => {
        return Object.entries(filter).every(([k, v]) => d.metadata?.[k] === v);
      });
    }

    const scored: QueryResult[] = candidates.map((d) => {
      const sim = d.embedding ? cosineSimilarity(queryEmbedding, d.embedding) : 0;
      return {
        id: d.id,
        document: d.document,
        metadata: d.metadata,
        similarity: sim,
        distance: 1 - sim,
      };
    });

    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, topK);
  }

  async count(): Promise<number> {
    return this.readAll().length;
  }
}

// Global cache of collections
const collectionCache = new Map<string, LocalVectorCollection>();

export async function getCollection(name: ChromaCollectionName): Promise<LocalVectorCollection> {
  if (!collectionCache.has(name)) {
    collectionCache.set(name, new LocalVectorCollection(name));
  }
  return collectionCache.get(name)!;
}

export async function createCollection(name: ChromaCollectionName): Promise<LocalVectorCollection> {
  return getCollection(name);
}

export async function addDocument(
  collectionName: ChromaCollectionName,
  doc: { id: string; document: string; metadata: Record<string, any> }
): Promise<void> {
  const collection = await getCollection(collectionName);
  await collection.add(doc);
}

export async function updateDocument(
  collectionName: ChromaCollectionName,
  doc: { id: string; document: string; metadata: Record<string, any> }
): Promise<void> {
  const collection = await getCollection(collectionName);
  await collection.update(doc);
}

export async function deleteDocument(
  collectionName: ChromaCollectionName,
  id: string
): Promise<void> {
  const collection = await getCollection(collectionName);
  await collection.delete(id);
}

export async function querySimilarDocuments(
  collectionName: ChromaCollectionName,
  queryText: string,
  topK: number = 5,
  filter?: Record<string, any>
): Promise<QueryResult[]> {
  const collection = await getCollection(collectionName);
  return collection.query(queryText, topK, filter);
}
