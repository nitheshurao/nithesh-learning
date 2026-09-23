Good. We’ll move forward, but keep the distinction clear:

```text
nomic-embed-text
       ↓
Text → Vector
       ↓
   ChromaDB
       ↓
Relevant chunks
       ↓
qwen2.5:1.5b
       ↓
Generated answer
```

That separation is fundamental to RAG.

# Lesson 1 — Embeddings → Vector Search → RAG

## 1. Today's Objective

By the end of this lesson, you should understand:

* What an embedding is
* Why text becomes vectors
* What semantic similarity means
* What ChromaDB actually does
* Why embedding models and LLMs have different jobs
* The complete RAG pipeline

---

## 2. Why It Matters

As an AI Engineer, you will frequently need to answer:

> "How does my application find the right information before asking the LLM to answer?"

If you understand this deeply, you can reason about:

* RAG
* semantic search
* vector databases
* chunking
* retrieval quality
* hallucinations
* reranking
* RAG evaluation

without depending on a framework.

---

# 3. Core Concept

Imagine your document:

```text
SyncTask is a productivity application.

The frontend uses Next.js and React.

The backend uses Node.js and Express.

MongoDB stores application data.

Redis is used for caching.
```

We don't want to send the entire document to the LLM for every question.

Instead:

```text
Document
   ↓
Split into chunks
   ↓
Create embeddings
   ↓
Store vectors
```

Then when the user asks:

```text
"What backend technology does SyncTask use?"
```

we perform:

```text
Question
   ↓
Embedding
   ↓
Query Vector
   ↓
Similarity Search
   ↓
Relevant Chunk
```

Then:

```text
Question + Relevant Chunk
          ↓
         LLM
          ↓
       Answer
```

---

# 4. Architecture

Your local RAG system:

```text
                  INGESTION
                     │
                     ▼
              ┌──────────────┐
              │   Documents  │
              └──────┬───────┘
                     │
                     ▼
                Chunking
                     │
                     ▼
            ┌─────────────────┐
            │ nomic-embed-text│
            └────────┬────────┘
                     │
                     ▼
                  Vectors
                     │
                     ▼
                ┌─────────┐
                │ ChromaDB│
                └─────────┘


                  QUERY
                     │
                     ▼
              User Question
                     │
                     ▼
            nomic-embed-text
                     │
                     ▼
                Query Vector
                     │
                     ▼
                ChromaDB
                     │
                     ▼
             Relevant Chunks
                     │
                     ▼
          Question + Context
                     │
                     ▼
             qwen2.5:1.5b
                     │
                     ▼
                Final Answer
```

Notice something important:

**The ingestion embedding and query embedding must use the same embedding space/model family.**

---

# 5. Local Implementation

Let's inspect your local environment conceptually.

You have:

```text
Ollama
 ├── qwen2.5:1.5b
 └── nomic-embed-text

ChromaDB
```

Check your models:

```bash
ollama list
```

You should see something similar to:

```text
NAME
qwen2.5:1.5b
nomic-embed-text
```

Check Ollama:

```bash
curl http://localhost:11434/api/tags
```

---

# 6. Important Architecture Decision

Don't do this:

```text
Question
   ↓
qwen2.5
   ↓
"Find relevant documents"
```

That's asking your generation model to perform a job that a vector retrieval system is designed to perform.

Instead:

```text
Question
   ↓
Embedding model
   ↓
Vector
   ↓
Vector DB
   ↓
Relevant context
   ↓
LLM
```

---

# 7. The Three Most Important Components

### Embedding model

```text
Text → Vector
```

Example:

```text
"Next.js frontend"
        ↓
[0.12, -0.42, 0.73, ...]
```

### ChromaDB

```text
Vector → Similarity Search → Relevant Documents
```

### LLM

```text
Context + Question → Generated Answer
```

Remember:

> **Embedding retrieves. LLM generates.**

Strictly speaking, the embedding model doesn't itself retrieve; it produces the representation used by the retrieval system.

---

# 8. Debugging Scenario

Suppose your RAG system returns:

```text
User:
"What technologies did I use in SyncTask?"

AI:
"SyncTask uses Python, Django and PostgreSQL."
```

But your actual documentation says:

```text
Next.js
Node.js
Express
MongoDB
Redis
Docker
```

Where could the problem be?

There are several possibilities:

```text
Document
   ↓
Chunking       ← Problem?
   ↓
Embedding      ← Problem?
   ↓
ChromaDB       ← Retrieval problem?
   ↓
Top-K          ← Too few results?
   ↓
Prompt         ← Context problem?
   ↓
LLM            ← Generation/hallucination?
```

This is why AI Engineering isn't simply:

> "Call an LLM."

You need to diagnose the **entire pipeline**.

---

# 9. Engineering Challenge

Don't look for the answer yet.

Create three documents:

### `synctask.md`

```text
SyncTask is a productivity application.
The frontend uses Next.js and React.
The backend uses Node.js and Express.
MongoDB stores application data.
Redis provides caching.
```

### `architecture.md`

```text
SyncTask follows a microservices architecture.
The system uses Docker for containerization.
An API Gateway handles incoming requests.
```

### `notes.md`

```text
SyncTask integrates with Google Calendar.
Users can create and synchronize tasks.
```

Then create embeddings and store them in ChromaDB.

Test these queries:

```text
1. What frontend technologies does SyncTask use?

2. What backend technologies does SyncTask use?

3. How does SyncTask handle caching?

4. Does SyncTask use containers?

5. What external service does SyncTask integrate with?
```

Record:

```text
Question
Retrieved chunks
Similarity score
Final answer
```

This becomes your **first retrieval experiment**.

---

# 10. Interview Questions

Answer these yourself before I explain them:

### Q1

What is an embedding?

### Q2

Why can't we simply use keyword search for RAG?

### Q3

What is cosine similarity?

### Q4

What is the difference between an embedding model and an LLM?

### Q5

What happens if the correct document exists in ChromaDB but isn't retrieved?

---

# 11. System Design Challenge

Design this:

> **Build a local AI assistant that answers questions about your resume.**

Requirements:

```text
Resume PDF
     ↓
???
     ↓
ChromaDB
     ↓
Ollama
     ↓
Answer
```

You need to decide:

* How will you extract the PDF?
* How will you chunk it?
* Which embedding model?
* What metadata will you store?
* What `top-k` will you use?
* Which LLM?
* How will you prevent the model from inventing experience?
* How will you evaluate retrieval quality?

Don't implement it yet.

**Draw the architecture first.**

---

# 12. LinkedIn Documentation

Don't post anything yet.

First, actually build the experiment.

Your eventual post should be based on your real results, for example:

> I built a completely local semantic-search pipeline using Ollama + ChromaDB and tested whether vector retrieval could find relevant information even when the query didn't use the same words as the source document.

Then include your **actual experiment results**, including failures.

No fabricated performance numbers.

---

# 13. GitHub Documentation

Your project should eventually look like:

```text
local-rag/
│
├── src/
│   ├── ingestion/
│   ├── embeddings/
│   ├── retrieval/
│   ├── generation/
│   └── evaluation/
│
├── documents/
│
├── tests/
│
├── docker-compose.yml
├── package.json
├── .env.example
└── README.md
```

The README should explain:

```text
Problem
Architecture
Data flow
Embedding model
Vector database
LLM
Retrieval strategy
Configuration
How to run
Known limitations
Evaluation
Future improvements
```

---

## Your next step

Before we write any code, answer these **5 interview questions**:

```text
Q1. What is an embedding?

Q2. Why is semantic search useful for RAG?

Q3. What does ChromaDB do?

Q4. Why do we use nomic-embed-text and qwen2.5 separately?

Q5. What happens if ChromaDB retrieves the wrong chunks?
```

I'll evaluate your answers like an **AI Engineering interviewer**, identify the gaps, and then we'll implement the retrieval pipeline locally.
