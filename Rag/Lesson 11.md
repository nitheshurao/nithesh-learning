# Lesson 11 — Chunking Strategies: The Foundation of Good RAG

You now have:

```text
Documents
   ↓
Chunking
   ↓
Embeddings
   ↓
ChromaDB
   ↓
Retrieval
   ↓
LLM
```

Today we'll focus on the first transformation:

> **How should a document be divided before embedding?**

This is one of the most underestimated parts of RAG.

---

# 1. Today's Objective

You'll learn:

* Why chunking is necessary
* Fixed-size chunking
* Paragraph chunking
* Recursive chunking
* Overlap
* Markdown-aware chunking
* Semantic chunking
* Parent-child retrieval
* Chunk size trade-offs
* How to evaluate chunking

---

# 2. Why Chunking Matters

Imagine this document:

```text
# SyncTask

SyncTask is a productivity application.

## Frontend

The frontend uses React and Next.js.

## Backend

The backend uses Node.js and Express.

## Database

MongoDB stores application data.

## Infrastructure

Docker is used for containerization.
```

Suppose we create one embedding for the entire document:

```text
Entire document
      ↓
One vector
```

Question:

```text
"What database does SyncTask use?"
```

The embedding represents a mixture of:

```text
frontend
backend
database
infrastructure
```

That can reduce retrieval precision.

Instead:

```text
Document
   ↓
┌──────────────┐
│ Frontend     │
├──────────────┤
│ Backend      │
├──────────────┤
│ Database     │
├──────────────┤
│ Infrastructure│
└──────────────┘
```

Now each piece can be retrieved independently.

---

# 3. What Makes a Good Chunk?

A good chunk should ideally be:

```text
self-contained
+
semantically coherent
+
small enough for precise retrieval
+
large enough to preserve necessary context
```

That's the trade-off.

---

# 4. Chunk Too Small

Suppose we split:

```text
"The backend"
```

and:

```text
"uses Node.js and Express."
```

into separate chunks.

Question:

```text
"What backend technologies does SyncTask use?"
```

Retrieval might return:

```text
"The backend"
```

but miss:

```text
"uses Node.js and Express."
```

The information has been fragmented.

So:

> **Chunks that are too small can lose semantic context.**

---

# 5. Chunk Too Large

Suppose one chunk contains:

```text
Frontend
Backend
Database
Infrastructure
Deployment
Authentication
Monitoring
...
```

Question:

```text
"What database does SyncTask use?"
```

The chunk is relevant to SyncTask but contains lots of unrelated information.

Problems:

```text
large chunk
   ↓
less precise retrieval
   ↓
more tokens
   ↓
more context
   ↓
higher latency
```

So:

> **Chunks that are too large can reduce retrieval precision and waste context.**

---

# 6. Fixed-Size Chunking

The simplest strategy:

```text
Document
   ↓
Every N characters/tokens
```

For example:

```text
Chunk size = 500 tokens
Overlap = 50 tokens
```

Conceptually:

```text
Document:

AAAAAAAAAAAAAAAAAAAA
BBBBBBBBBBBBBBBBBBBB
CCCCCCCCCCCCCCCCCCCC
DDDDDDDDDDDDDDDDDDDD

       ↓

Chunk 1
AAAAAAAAAAAAAAAA
BBBB

Chunk 2
          BBBB
          CCCC
          DDDD
```

The overlap preserves information around boundaries.

---

# 7. Why Overlap?

Imagine:

```text
Chunk 1:
"Redis is used for caching and task"

Chunk 2:
"coordination between services."
```

The concept was split.

With overlap:

```text
Chunk 1:
"Redis is used for caching and task coordination"

Chunk 2:
"task coordination between services..."
```

Now both chunks preserve some surrounding context.

---

# 8. Chunk Size vs Overlap

Two parameters you'll constantly tune:

```text
chunkSize
chunkOverlap
```

Example:

```typescript
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 800,
  chunkOverlap: 100,
});
```

This is only an example.

Don't assume:

```text
800 / 100
```

is universally optimal.

Your documents determine the appropriate strategy.

---

# 9. Recursive Chunking

A more intelligent approach is to split using a hierarchy of separators.

Conceptually:

```text
Paragraph
   ↓
Sentence
   ↓
Word
   ↓
Character
```

The splitter tries to preserve larger semantic units before falling back to smaller ones.

For example:

```text
Document
   ↓
Sections
   ↓
Paragraphs
   ↓
Sentences
   ↓
Characters
```

This usually produces more natural chunks than blindly cutting every N characters.

---

# 10. Markdown-Aware Chunking

Your AI knowledge base contains:

```text
README.md
architecture.md
system-design.md
notes.md
```

Markdown contains useful structure:

```text
# Architecture

## Frontend

...

## Backend

...

## Database

...
```

A Markdown-aware chunker can preserve that structure.

Instead of:

```text
chunk:
"Node.js and Express..."
```

you can retain:

```text
# SyncTask

## Backend

Node.js and Express are used...
```

This gives the embedding additional context.

---

# 11. Metadata Becomes Powerful

Instead of storing:

```json
{
  "source": "synctask.md"
}
```

store:

```json
{
  "source": "synctask.md",
  "project": "SyncTask",
  "section": "Backend",
  "documentType": "architecture"
}
```

Now retrieval can reason using:

```text
semantic similarity
+
metadata
```

For example:

```text
Question:
"What database does SyncTask use?"

Filter:
project = SyncTask
```

This prevents unrelated projects from polluting retrieval.

---

# 12. Contextual Chunking

Consider:

```text
## Database

MongoDB is used as the primary database.
```

If you embed only:

```text
"MongoDB is used as the primary database."
```

you lose:

```text
Database
```

A better representation might be:

```text
Project: SyncTask
Section: Database

MongoDB is used as the primary database.
```

This is called **contextual enrichment**.

The chunk becomes more self-contained.

---

# 13. Semantic Chunking

Instead of splitting based purely on characters, semantic chunking attempts to identify changes in meaning.

Conceptually:

```text
Paragraph A
Paragraph B
Paragraph C
Paragraph D
```

If:

```text
A + B
```

are semantically similar:

```text
A
B
```

may remain together.

If:

```text
B → C
```

represents a major topic shift:

```text
A
B

---

C
D
```

may be a better boundary.

This can improve semantic coherence but is more computationally expensive.

---

# 14. Parent-Child Retrieval

Here's an advanced strategy.

Suppose:

```text
Parent document
        │
        ├── Child chunk 1
        ├── Child chunk 2
        ├── Child chunk 3
        └── Child chunk 4
```

We embed the smaller child chunks.

Search:

```text
Question
   ↓
Child chunk retrieval
```

But after finding the child chunk, we return:

```text
Parent context
```

Example:

```text
Parent:
"SyncTask Backend Architecture"

Child:
"Redis handles caching."

      ↓

Retrieve child
      ↓
Return relevant parent section
```

This gives us:

```text
precise retrieval
+
richer context
```

This becomes useful for complex technical documents.

---

# 15. Chunking for Code Is Different

This is particularly important for your future **AI Software Engineer Agent**.

Don't chunk code like normal prose.

Bad:

```text
every 500 characters
```

You could split:

```typescript
function authenticateUser(...) {
   ...
```

in the middle of the function.

Instead, code-aware chunking should consider:

```text
file
class
function
method
imports
dependencies
symbol relationships
```

For example:

```text
src/auth/service.ts

Class: AuthService

Methods:
- login()
- logout()
- refreshToken()
```

We'll build this later.

---

# 16. Chunking Strategy Comparison


| Strategy       | Strength                      | Weakness                    |
| -------------- | ----------------------------- | --------------------------- |
| Fixed-size     | Simple                        | Can split meaning           |
| Paragraph      | Natural                       | Paragraphs can vary greatly |
| Recursive      | Good general-purpose approach | Still heuristic             |
| Markdown-aware | Preserves document structure  | Format-specific             |
| Semantic       | Meaning-aware                 | More expensive              |
| Parent-child   | Precision + context           | More complex                |
| Code-aware     | Good for repositories         | Requires code parsing       |

---

# 17. The Most Important Trade-off

Think of chunk size as:

```text
Too small
   ↓
Lost context
   ↓
Poor retrieval

Optimal
   ↓
Coherent information
   ↓
Good retrieval

Too large
   ↓
Mixed topics
   ↓
Poor precision
   ↓
Large context
```

There is no universal chunk size.

---

# 18. Your Current Implementation

Currently you have:

```typescript
const chunks = content
  .split(/\n\s*\n/)
  .map((chunk) => chunk.trim())
  .filter(Boolean);
```

That's **paragraph-based chunking**.

This is okay for our first experiment.

But now we're going to improve it.

---

# 19. Upgrade to Recursive Chunking

Install/use LangChain's text splitter:

```bash
npm install @langchain/textsplitters
```

Then:

```typescript
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 800,
  chunkOverlap: 100,
});

const chunks = await splitter.splitText(content);
```

Now:

```text
Document
   ↓
Recursive splitter
   ↓
Coherent chunks
```

Again, `800/100` is a **baseline experiment**, not a magic configuration.

---

# 20. Run an Experiment

Create three configurations:

### Experiment A

```text
chunkSize = 400
overlap = 50
```

### Experiment B

```text
chunkSize = 800
overlap = 100
```

### Experiment C

```text
chunkSize = 1200
overlap = 150
```

Run your golden evaluation dataset against each.

Record:


| Configuration | Hit Rate | MRR | Avg Context Tokens | Avg Latency |
| ------------- | -------: | --: | -----------------: | ----------: |
| 400/50        |        ? |   ? |                  ? |           ? |
| 800/100       |        ? |   ? |                  ? |           ? |
| 1200/150      |        ? |   ? |                  ? |           ? |

**Do not invent the numbers.**

The experiment is the result.

---

# 21. Important Ingestion Problem

Suppose you change:

```text
chunkSize = 400
```

and re-run ingestion.

If you use:

```typescript
collection.upsert(...)
```

you can end up with stale chunks if your IDs aren't managed carefully.

For example:

```text
Old:
synctask-0
synctask-1
synctask-2
synctask-3
synctask-4

New:
synctask-0
synctask-1
synctask-2
```

What happens to:

```text
synctask-3
synctask-4
```

?

They may remain in the collection.

This creates **stale-vector contamination**.

---

# 22. Production Ingestion Principle

A robust ingestion pipeline needs:

```text
Document version
       +
Chunk IDs
       +
Source metadata
       +
Deletion/update strategy
```

For example:

```text
documentId
documentVersion
chunkIndex
contentHash
```

This will become important when we build production-style ingestion.

---

# 23. Debugging Challenge

Your retrieval quality suddenly drops after changing chunking.

Possible causes:

```text
chunk too small
chunk too large
overlap too small
overlap too large
bad document structure
stale vectors
wrong metadata
duplicate chunks
embedding mismatch
```

Don't immediately change the embedding model.

First inspect:

```text
Raw document
     ↓
Generated chunks
     ↓
Stored vectors
     ↓
Retrieved chunks
```

---

# 24. Engineering Challenge

Take this:

```text
# SyncTask

## Frontend

SyncTask uses React and Next.js.

## Backend

The backend uses Node.js and Express.

## Database

MongoDB stores application data.

## Cache

Redis is used for caching and task coordination.

## Infrastructure

Docker is used for containerization.
```

Design the chunks you would create.

Don't write code.

Show me something like:

```text
Chunk 1:
...

Chunk 2:
...

Chunk 3:
...
```

Then explain **why you chose those boundaries**.

---

# 25. Interview Questions

Answer these:

1. **Why do we chunk documents in RAG?**
2. **What happens if chunks are too small?**
3. **What happens if chunks are too large?**
4. **Why is chunk overlap useful?**
5. **Why might Markdown-aware chunking outperform naive character splitting?**

---

# 26. System Design Challenge

You're building your **Personal Knowledge AI**.

Your knowledge base contains:

```text
100 Markdown files
20 PDFs
10 project READMEs
50 system-design notes
```

Design the ingestion pipeline:

```text
Documents
    ↓
Parsing
    ↓
Chunking
    ↓
Metadata
    ↓
Embedding
    ↓
ChromaDB
```

Specify:

* chunking strategy per document type
* chunk size
* overlap
* metadata
* document IDs
* update/delete strategy
* duplicate detection

Don't worry about getting the "perfect" answer.

We're designing and then testing.

---

# 27. Mental Model

At this point, your RAG architecture should be:

```text
             KNOWLEDGE BASE
                    │
                    ▼
                Parsing
                    │
                    ▼
                Chunking
                    │
                    ▼
             Metadata + IDs
                    │
                    ▼
              Embeddings
                    │
                    ▼
                ChromaDB
                    │
                    │
              USER QUESTION
                    │
                    ▼
                Embedding
                    │
                    ▼
               Retrieval
                    │
                    ▼
                Reranking
                    │
                    ▼
             Context Builder
                    │
                    ▼
                  Qwen
                    │
                    ▼
                 Answer
                    │
                    ▼
               Evaluation
```

You're now seeing the **full lifecycle of a RAG system**, not just the LLM call.

---

## Next Lesson — Advanced Retrieval

We'll take retrieval beyond basic vector search:

```text
Vector Search
      ↓
Metadata Filtering
      ↓
Hybrid Search
      ↓
Query Rewriting
      ↓
Multi-Query Retrieval
      ↓
Reranking
      ↓
Context Compression
```

Then you'll build an **Advanced RAG pipeline** and measure whether each retrieval improvement actually improves your evaluation metrics.
