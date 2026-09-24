# Lesson 8 — Build Your First Local RAG Pipeline

We have enough fundamentals. Now we start **building**.

Our first target is intentionally small:

> **A CLI-based local RAG system that answers questions about your SyncTask documentation.**

We'll build the architecture ourselves before introducing more LangChain abstractions.

---

## 1. Today's Objective

Build:

```text
Documents
   ↓
Chunking
   ↓
Ollama Embeddings
   ↓
ChromaDB
   ↓
Similarity Search
   ↓
Retrieved Context
   ↓
Qwen
   ↓
Answer
```

You'll understand each stage instead of hiding everything behind a framework.

---

# 2. Architecture

We'll create two separate flows.

### Ingestion

```text
                    INGESTION

 documents/
     │
     ▼
 Read files
     │
     ▼
 Chunk documents
     │
     ▼
 nomic-embed-text
     │
     ▼
 Embedding vectors
     │
     ▼
 ChromaDB
```

### Query

```text
                      QUERY

User question
     │
     ▼
nomic-embed-text
     │
     ▼
Query vector
     │
     ▼
ChromaDB similarity search
     │
     ▼
Relevant chunks
     │
     ▼
Context builder
     │
     ▼
qwen2.5:1.5b
     │
     ▼
Answer
```

---

# 3. Project Structure

Create:

```text
local-rag/
│
├── src/
│   ├── config.ts
│   ├── ingest.ts
│   ├── retrieve.ts
│   ├── generate.ts
│   └── index.ts
│
├── documents/
│   ├── synctask.md
│   ├── architecture.md
│   └── notes.md
│
├── package.json
├── tsconfig.json
└── .env
```

Notice we're separating:

```text
ingestion
retrieval
generation
```

This separation will become very useful when we start evaluating each component independently.

---

# 4. Create the Project

```bash
mkdir local-rag
cd local-rag

npm init -y
```

Install:

```bash
npm install @langchain/ollama chromadb dotenv
```

Development dependencies:

```bash
npm install -D typescript tsx @types/node
```

Initialize TypeScript:

```bash
npx tsc --init
```

---

# 5. Verify Ollama

Before writing application code:

```bash
ollama list
```

You should have something like:

```text
qwen2.5:1.5b
nomic-embed-text
```

Test the LLM:

```bash
ollama run qwen2.5:1.5b
```

Ask:

```text
Explain what RAG is in one sentence.
```

Exit with:

```text
/bye
```

Test the embedding model:

```bash
ollama run nomic-embed-text
```

The exact CLI behavior can vary by Ollama version, so don't worry if it doesn't behave like a conversational model—the embedding model's purpose is vector generation, not chat.

---

# 6. Create Your Knowledge Base

### `documents/synctask.md`

```markdown
# SyncTask

SyncTask is a productivity application designed to manage
tasks and synchronize them with Google Calendar.

The frontend is built using React and Next.js.

The backend uses Node.js and Express.js.

MongoDB is used as the primary application database.

Redis is used for caching and task coordination.

The application follows a microservices architecture.
```

### `documents/architecture.md`

```markdown
# SyncTask Architecture

SyncTask uses an API Gateway to handle incoming requests.

The backend consists of multiple Node.js services.

Services communicate through internal APIs.

Docker is used for local containerization.

The system is designed to be deployed to AWS.
```

### `documents/notes.md`

```markdown
# SyncTask Notes

Users can create tasks and synchronize them with Google Calendar.

The application is intended to improve personal productivity.

Authentication and authorization are handled by the backend.
```

---

# 7. Why Chunking?

We don't want:

```text
Entire document
       ↓
One giant embedding
```

Instead:

```text
Document
   ↓
Chunks
   ↓
Embedding per chunk
```

For example:

```text
Chunk 1:
SyncTask is a productivity application...

Chunk 2:
The frontend is built using React and Next.js.

Chunk 3:
The backend uses Node.js and Express.js.

Chunk 4:
MongoDB is used...
```

Now retrieval can find the specific information relevant to the question.

---

# 8. Start With Simple Chunking

For this first implementation, don't introduce sophisticated recursive splitting yet.

Use a simple paragraph-based splitter.

### `src/ingest.ts`

```typescript
import fs from "node:fs/promises";
import path from "node:path";
import { OllamaEmbeddings } from "@langchain/ollama";
import { ChromaClient } from "chromadb";

const documentsDir = path.join(process.cwd(), "documents");

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
});

const chroma = new ChromaClient({
  path: "http://localhost:8000",
});

async function ingest() {
  const files = await fs.readdir(documentsDir);

  const collection = await chroma.getOrCreateCollection({
    name: "synctask",
  });

  for (const file of files) {
    if (!file.endsWith(".md")) continue;

    const filePath = path.join(documentsDir, file);
    const content = await fs.readFile(filePath, "utf-8");

    const chunks = content
      .split(/\n\s*\n/)
      .map((chunk) => chunk.trim())
      .filter(Boolean);

    const vectors = await embeddings.embedDocuments(chunks);

    const ids = chunks.map(
      (_, index) => `${file}-${index}`
    );

    await collection.upsert({
      ids,
      documents: chunks,
      embeddings: vectors,
      metadatas: chunks.map(() => ({
        source: file,
      })),
    });

    console.log(`Ingested ${file}: ${chunks.length} chunks`);
  }
}

ingest().catch(console.error);
```

---

# 9. Important Architecture Detail

Notice:

```typescript
const vectors = await embeddings.embedDocuments(chunks);
```

We're doing:

```text
chunks
   ↓
nomic-embed-text
   ↓
vectors
```

Then:

```typescript
await collection.upsert({
  ids,
  documents: chunks,
  embeddings: vectors,
  metadatas: ...
});
```

ChromaDB receives:

```text
ID
+
Document
+
Embedding
+
Metadata
```

This is the core vector-store operation.

---

# 10. Start ChromaDB

If you're running Chroma through Docker:

```bash
docker run -d \
  --name chromadb \
  -p 8000:8000 \
  chromadb/chroma
```

Check:

```bash
docker ps
```

You should see:

```text
chromadb
```

Now your architecture is:

```text
Node.js
   │
   ├──────────────► Ollama :11434
   │
   └──────────────► ChromaDB :8000
```

---

# 11. Run Ingestion

```bash
npx tsx src/ingest.ts
```

Expected output should look approximately like:

```text
Ingested architecture.md: 4 chunks
Ingested notes.md: 3 chunks
Ingested synctask.md: 6 chunks
```

The exact numbers depend on your markdown formatting.

---

# 12. Retrieval

Now create:

### `src/retrieve.ts`

```typescript
import { OllamaEmbeddings } from "@langchain/ollama";
import { ChromaClient } from "chromadb";

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
});

const chroma = new ChromaClient({
  path: "http://localhost:8000",
});

export async function retrieve(question: string) {
  const collection = await chroma.getCollection({
    name: "synctask",
  });

  const [queryVector] =
    await embeddings.embedDocuments([question]);

  const results = await collection.query({
    queryEmbeddings: [queryVector],
    nResults: 3,
  });

  return results;
}
```

---

# 13. What Is Happening?

This line:

```typescript
await embeddings.embedDocuments([question]);
```

does:

```text
Question
   ↓
nomic-embed-text
   ↓
Query Vector
```

Then:

```typescript
collection.query(...)
```

does:

```text
Query Vector
     ↓
ChromaDB
     ↓
Similarity search
     ↓
Top 3 chunks
```

---

# 14. Test Retrieval

Create:

### `src/index.ts`

```typescript
import { retrieve } from "./retrieve";

async function main() {
  const question =
    "What backend technologies does SyncTask use?";

  const results = await retrieve(question);

  console.dir(results, { depth: null });
}

main().catch(console.error);
```

Run:

```bash
npx tsx src/index.ts
```

You should see chunks related to:

```text
Node.js
Express
MongoDB
```

along with metadata and similarity-related result information depending on the Chroma client version.

---

# 15. STOP HERE

Don't add the LLM yet.

This is intentional.

We want to test:

```text
Question
   ↓
Embedding
   ↓
ChromaDB
   ↓
Relevant chunks
```

**before** adding:

```text
LLM
```

Why?

Because otherwise when your answer is wrong, you won't know whether:

```text
retrieval failed
```

or:

```text
generation failed
```

This is a fundamental debugging principle:

> **Test each stage independently before composing the full pipeline.**

---

# 16. Your First Retrieval Experiment

Run these questions:

```text
1. What frontend technologies does SyncTask use?

2. What backend technologies does SyncTask use?

3. What database does SyncTask use?

4. How does SyncTask handle caching?

5. What cloud platform is mentioned?

6. How does SyncTask synchronize tasks?

7. What technologies are used for containerization?
```

For each question record:

```text
Question
──────────────
Retrieved Chunk 1
Retrieved Chunk 2
Retrieved Chunk 3
```

Create a small table:


| Question   | Correct chunk retrieved? | Top result |
| ---------- | ------------------------ | ---------- |
| Frontend   | ?                        | ?          |
| Backend    | ?                        | ?          |
| Database   | ?                        | ?          |
| Caching    | ?                        | ?          |
| Cloud      | ?                        | ?          |
| Calendar   | ?                        | ?          |
| Containers | ?                        | ?          |

This is your **first retrieval evaluation dataset**.

---

# 17. Debugging Challenge

Suppose this question:

```text
"What database does SyncTask use?"
```

returns:

```text
Chunk:
"SyncTask is a productivity application..."
```

instead of:

```text
"MongoDB is used as the primary application database."
```

Don't immediately change the LLM.

There is no LLM involved yet.

Investigate:

```text
Question
   ↓
Embedding
   ↓
Query Vector
   ↓
ChromaDB
   ↓
Similarity
   ↓
Wrong chunk
```

Possible causes include:

* poor chunking
* insufficiently informative chunks
* embedding-model behavior
* duplicated/stale vectors
* wrong collection
* wrong query configuration
* too-small `nResults`
* metadata not being used

This is how I want you to debug AI systems.

---

# 18. One Important Issue in Our First Version

Our chunking is deliberately primitive:

```typescript
.split(/\n\s*\n/)
```

That means we're splitting on blank lines.

Production RAG systems usually need better strategies:

```text
Recursive character splitting
Semantic chunking
Markdown-aware chunking
Code-aware chunking
Parent-child retrieval
Structure-aware chunking
```

We'll tackle those later.

For now:

> **Understand the retrieval pipeline before optimizing it.**

---

# 19. Engineering Challenge

Before we add Qwen, make your retrieval pipeline work.

Your task:

```text
documents
    ↓
chunk
    ↓
nomic-embed-text
    ↓
ChromaDB
    ↓
query
    ↓
top-3 chunks
```

Then answer:

### Challenge 1

Why must we use the **same embedding model** for document embeddings and query embeddings?

### Challenge 2

Why are we storing metadata such as:

```typescript
{
  source: file
}
```

?

### Challenge 3

If ChromaDB retrieves the wrong chunk, should we immediately change the LLM?

### Challenge 4

Why are we testing retrieval **before** adding Qwen?

---

## 20. What Comes Next

Once retrieval works, we'll add:

```text
                LOCAL RAG

Question
   │
   ▼
Embedding
   │
   ▼
ChromaDB
   │
   ▼
Top-K Context
   │
   ▼
Prompt Builder
   │
   ▼
Qwen 1.5B
   │
   ▼
Answer
```

Then we'll add **streaming**.

After that, we'll deliberately break the system and diagnose:

* irrelevant retrieval
* hallucination
* prompt injection
* duplicated documents
* bad chunking
* context overflow
* poor answers despite correct retrieval

That is where your **real AI Engineering training** begins.
