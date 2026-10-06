# Lesson 13 — Build an Advanced RAG Retrieval Service

Today we turn the architecture into a cleaner **production-style TypeScript service**.

The goal is not to add every RAG technique at once. We will build a strong baseline that is:

* modular
* observable
* testable
* metadata-aware
* easy to extend with reranking later

---

# 1. Today's Objective

By the end, your pipeline will look like:

```text
User Question
     │
     ▼
Query Processor
     │
     ▼
Embedding Model
     │
     ▼
ChromaDB
     │
     ├── metadata filter
     │
     └── top-K candidates
              │
              ▼
        Context Builder
              │
              ▼
             Qwen
              │
              ▼
            Answer
```

We'll also measure:

```text
retrieval latency
number of chunks retrieved
context size
generation latency
total latency
```

---

# 2. Why This Architecture Matters

Your earlier implementation probably had something conceptually similar to:

```typescript
const results = await retrieve(question);
const answer = await generateAnswer(question, results);
```

That's fine for learning.

But as the system grows, retrieval should become its own component:

```text
src/
├── config.ts
├── embeddings.ts
├── vectorStore.ts
├── retrieval/
│   ├── types.ts
│   └── retrieve.ts
├── generation/
│   └── generate.ts
├── evaluation/
│   └── evaluate.ts
└── index.ts
```

This gives you separation of concerns.

---

# 3. Retrieval Contract

First define what retrieval returns.

```typescript
export type RetrievedChunk = {
  id: string;
  content: string;
  score?: number;
  metadata: {
    source?: string;
    project?: string;
    section?: string;
    documentType?: string;
  };
};
```

And the retrieval request:

```typescript
export type RetrievalOptions = {
  query: string;
  topK?: number;
  project?: string;
};
```

This is important.

Your LLM shouldn't know anything about ChromaDB.

The LLM should receive:

```text
relevant evidence
```

not:

```text
ChromaDB implementation details
```

---

# 4. Embedding Service

Create:

```text
src/embeddings.ts
```

Conceptually:

```typescript
import { OllamaEmbeddings } from "@langchain/ollama";

export const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
});
```

Architecture:

```text
Question
   ↓
OllamaEmbeddings
   ↓
1536-dimensional vector
```

Remember:

```text
embedding model
      ≠
LLM
```

Your architecture has two different models:

```text
nomic-embed-text
       │
       └── representation/search


qwen2.5:1.5b
       │
       └── reasoning/generation
```

---

# 5. Vector Store Service

Create:

```text
src/vectorStore.ts
```

Conceptually:

```typescript
import { ChromaClient } from "chromadb";

export const chroma = new ChromaClient({
  path: "http://localhost:8000",
});
```

Then:

```typescript
export async function getCollection() {
  return chroma.getOrCreateCollection({
    name: "synctask",
  });
}
```

Now your application doesn't need to repeatedly know how Chroma is initialized.

---

# 6. Retrieval Service

Create:

```text
src/retrieval/retrieve.ts
```

The core flow:

```text
query
 ↓
embed query
 ↓
Chroma query
 ↓
metadata filter
 ↓
top-K results
 ↓
normalize response
```

Conceptually:

```typescript
export async function retrieve({
  query,
  topK = 5,
  project,
}: RetrievalOptions): Promise<RetrievedChunk[]> {

  const queryVector = await embeddings.embedQuery(query);

  const collection = await getCollection();

  const where = project
    ? { project }
    : undefined;

  const results = await collection.query({
    queryEmbeddings: [queryVector],
    nResults: topK,
    where,
  });

  // normalize Chroma response
}
```

The exact Chroma API can vary with your installed client version, so treat the structure above as the architecture rather than blindly replacing your currently working code.

---

# 7. Why `where` Matters

Without metadata filtering:

```text
Question
   ↓
Entire collection
   ↓
Similarity search
```

With filtering:

```text
Question
   ↓
project = SyncTask
   ↓
Relevant subset
   ↓
Similarity search
```

This is especially useful when your knowledge base grows:

```text
SyncTask
Career Edge
RAG project
System Design notes
DSA notes
Resume
```

A query about SyncTask shouldn't necessarily search every project.

---

# 8. Metadata Design

During ingestion, use primitive metadata values.

Good:

```typescript
{
  source: "synctask.md",
  project: "SyncTask",
  section: "backend",
  documentType: "technical"
}
```

Avoid:

```typescript
{
  tags: ["backend", "node", "microservices"]
}
```

if your Chroma version rejects array metadata.

You previously encountered exactly this class of Chroma metadata issue.

Safer:

```typescript
{
  tags: "backend,node,microservices"
}
```

or separate fields:

```typescript
{
  technology: "Node.js",
  category: "backend"
}
```

---

# 9. Context Builder

Retrieval shouldn't directly create your final prompt.

Create another layer:

```text
src/contextBuilder.ts
```

Input:

```text
RetrievedChunk[]
```

Output:

```text
formatted context
```

Example:

```typescript
export function buildContext(chunks: RetrievedChunk[]) {
  return chunks
    .map((chunk, index) => {
      return `
SOURCE ${index + 1}
File: ${chunk.metadata.source ?? "unknown"}
Section: ${chunk.metadata.section ?? "unknown"}

${chunk.content}
`;
    })
    .join("\n---\n");
}
```

Now the LLM gets explicit source boundaries.

---

# 10. Why Source Boundaries Matter

Don't create:

```text
MongoDB is used...
Docker is used...
Redis is used...
Next.js is used...
```

with no indication where information came from.

Instead:

```text
SOURCE 1
File: architecture.md
Section: Database

MongoDB is used...

---

SOURCE 2
File: architecture.md
Section: Infrastructure

Docker is used...
```

This makes citations and debugging easier.

---

# 11. Generation Layer

Your generation service should remain independent.

```typescript
export async function generateAnswer(
  question: string,
  context: string
) {
  const prompt = `
You are a technical assistant.

Use only the provided context.

If the answer is not present,
say that the information is not available.

CONTEXT:
${context}

QUESTION:
${question}

ANSWER:
`;

  return llm.invoke(prompt);
}
```

Notice the separation:

```text
Retriever
   ↓
Context Builder
   ↓
Generator
```

The generator doesn't retrieve anything.

---

# 12. Complete Request Flow

Your application now becomes:

```typescript
const chunks = await retrieve({
  query: question,
  topK: 5,
  project: "SyncTask",
});

const context = buildContext(chunks);

const answer = await generateAnswer(
  question,
  context
);
```

That's a much cleaner architecture.

---

# 13. Add Observability

Now comes an important engineering improvement.

Don't just return the answer.

Record:

```text
retrievalStart
retrievalEnd
generationStart
generationEnd
```

For example:

```typescript
const retrievalStart = performance.now();

const chunks = await retrieve({
  query: question,
  topK: 5,
});

const retrievalLatency =
  performance.now() - retrievalStart;
```

Then:

```typescript
const generationStart = performance.now();

const answer = await generateAnswer(
  question,
  context
);

const generationLatency =
  performance.now() - generationStart;
```

Finally:

```text
Retrieval latency: 42 ms
Generation latency: 1,840 ms
Total latency: 1,882 ms
Chunks: 5
Context characters: 4,821
```

---

# 14. Why This Is Important

Suppose your application takes:

```text
2.4 seconds
```

You shouldn't say:

> "The LLM is slow."

Maybe:

```text
Embedding:       80ms
Chroma:           35ms
Reranking:       600ms
Prompt building:  10ms
LLM:           1,675ms
```

Now you know exactly where the problem is.

This is the beginning of **AI observability**.

---

# 15. Retrieval Debug Output

During development, print:

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUESTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What database does SyncTask use?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RETRIEVAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Top K: 5
Project: SyncTask

1. synctask.md
   Section: Database

2. architecture.md
   Section: Storage

3. synctask.md
   Section: Backend

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LATENCY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Retrieval: 43ms
```

Then:

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANSWER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SyncTask uses MongoDB.
```

This makes debugging dramatically easier.

---

# 16. The Most Important Debugging Rule

When the answer is wrong:

### Step 1

Look at retrieved chunks.

```text
Are the correct chunks present?
```

If **NO**:

```text
retrieval problem
```

Investigate:

```text
chunking
embedding
query
metadata
topK
hybrid search
reranking
```

If **YES**:

```text
generation problem
```

Investigate:

```text
prompt
context formatting
LLM
temperature
output validation
```

This simple distinction will save you enormous debugging time.

---

# 17. Add Retrieval Scores

If your Chroma response provides distances:

```text
chunk A → 0.18
chunk B → 0.31
chunk C → 0.76
```

be careful.

Depending on the distance metric:

```text
smaller distance
```

may mean:

```text
more similar
```

Don't automatically call a Chroma distance a "similarity score."

Instead, define your terminology precisely:

```text
distance = distance
similarity = transformed/derived similarity
```

This matters when you build evaluation dashboards.

---

# 18. Top-K Is a Retrieval Parameter

Suppose:

```text
K = 1
```

You retrieve:

```text
MongoDB
```

Very precise.

But maybe you miss an important architecture explanation.

With:

```text
K = 10
```

you increase recall.

But now:

```text
irrelevant chunks
       ↓
more context
       ↓
more noise
       ↓
potentially worse generation
```

So the goal isn't:

> Maximum K.

It's:

> **Enough candidates to achieve strong retrieval recall without overwhelming downstream processing.**

---

# 19. Experiment

Use your evaluation dataset.

Run:

```text
K = 1
K = 3
K = 5
K = 10
```

Measure:

```text
Hit Rate
MRR
Answer relevance
Faithfulness
Retrieval latency
Context size
```

Create:


|  K | Hit Rate | MRR | Context | Latency |
| -: | -------: | --: | ------: | ------: |
|  1 |        ? |   ? |       ? |       ? |
|  3 |        ? |   ? |       ? |       ? |
|  5 |        ? |   ? |       ? |       ? |
| 10 |        ? |   ? |       ? |       ? |

**Do not assume K=5 is optimal.**

Your evaluation data should tell you.

---

# 20. Query Processing Layer

Now introduce:

```text
src/retrieval/queryProcessor.ts
```

For now, keep it simple.

```typescript
export function normalizeQuery(query: string) {
  return query
    .trim()
    .replace(/\s+/g, " ");
}
```

You might think:

> "That's too simple."

That's intentional.

We're establishing a pipeline before adding LLM-powered rewriting.

Later:

```text
normalize
    ↓
classify
    ↓
rewrite
    ↓
expand
    ↓
retrieve
```

Don't add complexity until you can measure the baseline.

---

# 21. Production Architecture

Your local system is now approaching:

```text
                    ┌──────────────┐
                    │   Next.js    │
                    │     UI       │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Node API     │
                    └──────┬───────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
        Query Service  Retrieval      Generation
                           │             │
                           ▼             ▼
                       ChromaDB       Ollama
                           │
                           │
                    nomic-embed-text
```

Later:

```text
Node API
   ↓
Redis
   ↓
Retrieval Service
   ↓
Vector DB
   ↓
Reranker
   ↓
LLM Gateway
   ↓
Model Server
```

That is where AI system design starts becoming interesting.

---

# 22. Engineering Challenge

Your current retrieval returns:

```text
1. Redis caching
2. Docker deployment
3. MongoDB database
4. Next.js frontend
5. Node.js backend
```

Question:

> "What database does SyncTask use?"

The correct evidence is #3.

Now imagine:

```text
topK = 2
```

You receive:

```text
Redis
Docker
```

and the LLM answers:

> "The database information isn't available."

### Diagnose this.

Is this primarily:

```text
A. LLM problem
B. Retrieval problem
C. Prompt problem
D. Tokenization problem
```

And what metric would expose it?

---

# 23. Interview Questions

### 1.

Why should retrieval and generation be separate services/components?

### 2.

Why is top-K a trade-off rather than simply "higher is better"?

### 3.

What metrics would you log for a production RAG request?

### 4.

How would you distinguish a retrieval failure from a generation failure?

### 5.

Why should metadata be stored alongside embeddings?

---

# 24. System Design Challenge

Imagine your Personal Knowledge AI grows to:

```text
10,000 documents
500,000 chunks
```

A request currently takes:

```text
2.5 seconds
```

You measure:

```text
Embedding:       80ms
Chroma search:   40ms
Context building: 5ms
LLM generation: 2375ms
```

Your goal is:

```text
P95 < 1 second
```

Where would you investigate first?

Consider:

```text
model size
quantization
output tokens
streaming
prompt size
context size
caching
retrieval
parallelism
```

Don't just say "use a faster LLM."

Think in terms of the latency budget.

---

# 25. Today's Mental Model

You started with:

```text
RAG = Embeddings + Vector DB + LLM
```

That's too simplistic.

A better model is:

```text
RAG
│
├── Ingestion
│   ├── Parsing
│   ├── Chunking
│   ├── Metadata
│   └── Embeddings
│
├── Retrieval
│   ├── Query processing
│   ├── Metadata filtering
│   ├── Vector search
│   ├── Hybrid search
│   └── Reranking
│
├── Context
│   ├── Selection
│   ├── Compression
│   └── Prompt construction
│
├── Generation
│   ├── LLM
│   ├── Streaming
│   └── Validation
│
└── Evaluation
    ├── Retrieval metrics
    ├── Generation metrics
    ├── Latency
    └── Regression testing
```

That is the foundation of a serious RAG system.

---

# Next — Lesson 14: Reranking

We'll tackle one of the most important retrieval improvements:

```text
                 500,000 chunks
                       │
                       ▼
                Vector Retrieval
                       │
                       ▼
                  50 candidates
                       │
                       ▼
                   Reranker
                       │
                       ▼
                    Top 5
                       │
                       ▼
                     Qwen
```

We'll cover **cross-encoders, bi-encoders, reranking scores, candidate size, latency trade-offs, and how reranking changes Hit Rate/MRR**—then implement the first reranking stage locally.
