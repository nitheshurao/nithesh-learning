# Lesson 12 — Advanced Retrieval: From Vector Search to High-Quality RAG

Your current RAG pipeline is:

```text
Question
   ↓
Embedding
   ↓
ChromaDB
   ↓
Top-K chunks
   ↓
Prompt
   ↓
Qwen
```

This works.

But production RAG systems usually don't stop at simple vector similarity.

The key idea for today:

> **Retrieval quality is not just about finding similar text. It's about finding the right evidence for the question.**

---

# 1. Today's Objective

You'll learn:

* Metadata filtering
* Query rewriting
* Multi-query retrieval
* Hybrid search
* Reranking
* Context compression
* Retrieval pipelines
* Why top-K alone is insufficient
* How to debug retrieval failures

---

# 2. The Problem With Basic Vector Search

Suppose your knowledge base contains:

```text
project-a.md
project-b.md
project-c.md
resume.md
notes.md
architecture.md
```

User asks:

> "What database does SyncTask use?"

Basic vector search might return:

```text
1. MongoDB — SyncTask
2. PostgreSQL — another project
3. Redis — SyncTask
```

All three may be semantically related to:

```text
database
```

But only one is directly relevant.

So:

```text
semantic similarity ≠ relevance
```

This distinction is fundamental.

---

# 3. Retrieval Should Become a Pipeline

Instead of:

```text
Question
   ↓
Vector Search
   ↓
Top 5
```

we want:

```text
Question
   ↓
Query Understanding
   ↓
Query Rewrite
   ↓
Metadata Filtering
   ↓
Candidate Retrieval
   ↓
Reranking
   ↓
Context Compression
   ↓
Final Context
   ↓
LLM
```

This is the architecture we're building toward.

---

# 4. Metadata Filtering

Suppose your chunk metadata is:

```json
{
  "project": "SyncTask",
  "section": "database",
  "source": "architecture.md"
}
```

We can constrain retrieval:

```text
project = SyncTask
```

Now instead of searching:

```text
1000 chunks
```

we search:

```text
SyncTask chunks
```

This can improve both:

```text
precision
latency
```

---

# 5. Semantic Search + Metadata

Think of retrieval as:

```text
                    ┌───────────────┐
Question ──────────►│ Vector Search │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Metadata    │
                    │    Filter     │
                    └───────┬───────┘
                            │
                            ▼
                       Candidates
```

But there's an important design question:

### When should you filter before vector search vs after?

If you know:

```text
project = SyncTask
```

and your database supports efficient metadata filtering:

```text
filter first
```

can dramatically reduce the search space.

---

# 6. Query Rewriting

Users rarely ask questions in perfect retrieval language.

Suppose the user asks:

> "What did I use for storing stuff in SyncTask?"

A query rewrite could produce:

```text
"What database does SyncTask use?"
```

The system transforms:

```text
User Query
    ↓
Query Rewriter
    ↓
Search Query
```

This can improve retrieval.

---

# 7. But Query Rewriting Has a Risk

Suppose the original question is:

> "Why did I choose MongoDB instead of PostgreSQL?"

A bad rewrite:

```text
"What database does SyncTask use?"
```

Now we've lost:

```text
WHY
```

The retrieval system may find:

```text
MongoDB
```

but miss the architectural reasoning.

Therefore:

> **Never blindly replace the original question.**

A safer architecture is:

```text
Original Query
      │
      ├──────────────┐
      │              │
      ▼              ▼
Original Search   Rewritten Search
      │              │
      └──────┬───────┘
             ▼
         Candidates
```

---

# 8. Multi-Query Retrieval

One query can have multiple semantic interpretations.

Question:

> "How does SyncTask handle tasks?"

Possible search queries:

```text
1. SyncTask task management
2. SyncTask task service
3. SyncTask task storage
4. SyncTask task execution
5. SyncTask task scheduling
```

Retrieve for each:

```text
Q1 → chunks
Q2 → chunks
Q3 → chunks
Q4 → chunks
```

Then combine:

```text
                 ┌── Q1 → results
Original Query ──┼── Q2 → results
                 ├── Q3 → results
                 └── Q4 → results
                         │
                         ▼
                    Deduplicate
                         │
                         ▼
                    Reranking
```

This improves **recall**.

But it increases:

```text
embedding calls
vector searches
latency
```

So again:

> Better retrieval isn't automatically better engineering.

---

# 9. Hybrid Search

Vector search is excellent for semantic similarity.

But keyword search is excellent for exact terms.

Consider:

```text
"Redis"
```

or:

```text
"Q4_K_M"
```

or:

```text
"ChatOllama"
```

These exact technical identifiers may benefit from lexical search.

So production retrieval can combine:

```text
Semantic Search
       +
Keyword Search
       ↓
Combined Candidates
```

Conceptually:

```text
                 Question
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
    Vector Search        Keyword Search
          │                   │
          └─────────┬─────────┘
                    ▼
              Merge Results
                    │
                    ▼
                 Rerank
```

This is **hybrid retrieval**.

---

# 10. Why Hybrid Search Matters for Your AI Engineer Agent

Imagine asking:

> "Where is `ChatOllama` initialized?"

Semantic search may find:

```text
Ollama configuration
LLM initialization
model configuration
```

But exact keyword search can immediately find:

```typescript
new ChatOllama(...)
```

For codebases, identifiers matter enormously.

---

# 11. Reranking

Now suppose retrieval gives:

```text
Candidate 1
Candidate 2
Candidate 3
Candidate 4
Candidate 5
Candidate 6
Candidate 7
Candidate 8
```

Vector similarity isn't always enough to determine which candidate best answers the question.

A **reranker** evaluates:

```text
(question, chunk)
```

rather than independently comparing:

```text
embedding(question)
embedding(chunk)
```

Conceptually:

```text
Question
   │
   ├── Candidate 1 → relevance score
   ├── Candidate 2 → relevance score
   ├── Candidate 3 → relevance score
   ├── Candidate 4 → relevance score
   └── Candidate 5 → relevance score
                    │
                    ▼
                 Sort
                    │
                    ▼
               Top Results
```

---

# 12. Two-Stage Retrieval

This gives us a very important architecture:

```text
Stage 1
───────

Fast retrieval

Question
   ↓
Vector / Hybrid Search
   ↓
Top 20 candidates


Stage 2
───────

Precise retrieval

Question + 20 candidates
   ↓
Reranker
   ↓
Top 5
```

Why not rerank 10,000 documents?

Because reranking is more expensive.

So:

```text
Cheap + broad
      ↓
Expensive + precise
```

is the general pattern.

---

# 13. Context Compression

Suppose retrieved chunk contains:

```text
SyncTask uses MongoDB as the primary database.

The frontend uses Next.js.

The backend uses Node.js.

Redis is used for caching.

Docker is used for deployment.

The application supports Google Calendar synchronization.
```

Question:

> "What database does SyncTask use?"

Only this is necessary:

```text
MongoDB is the primary database.
```

Context compression attempts to remove irrelevant information before sending context to the LLM.

Architecture:

```text
Retrieved Chunks
      ↓
Compression
      ↓
Relevant Evidence
      ↓
LLM
```

Benefits:

```text
↓ tokens
↓ latency
↓ context noise
↓ cost
```

---

# 14. Retrieval vs Reranking vs Compression

Don't confuse these.

### Retrieval

> Find potentially relevant documents.

### Reranking

> Determine which retrieved documents are most relevant.

### Compression

> Remove irrelevant information from selected context.

Think:

```text
1000 documents
      ↓
Retrieval
      ↓
50 candidates
      ↓
Reranking
      ↓
5 chunks
      ↓
Compression
      ↓
Relevant evidence
      ↓
LLM
```

---

# 15. Advanced RAG Architecture

Your system is now evolving into:

```text
                         USER
                           │
                           ▼
                    Query Processing
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
       Original Query              Query Rewrite
             │                           │
             └─────────────┬─────────────┘
                           ▼
                    Metadata Filter
                           │
                           ▼
                  ┌─────────────────┐
                  │ Candidate Search│
                  │                 │
                  │ Vector / Hybrid │
                  └────────┬────────┘
                           │
                           ▼
                      Candidates
                           │
                           ▼
                       Reranker
                           │
                           ▼
                    Top Relevant
                           │
                           ▼
                 Context Compression
                           │
                           ▼
                    Prompt Builder
                           │
                           ▼
                         Qwen
                           │
                           ▼
                        Answer
```

This is much closer to production RAG.

---

# 16. Important: Don't Add Everything

A common beginner mistake is:

```text
"I need better RAG."

→ Add query rewriting
→ Add multi-query
→ Add hybrid search
→ Add reranker
→ Add agent
→ Add 10 tools
```

Now you don't know what improved the system.

Instead:

```text
Baseline
   ↓
Measure
   ↓
Change ONE component
   ↓
Measure
   ↓
Compare
```

This is proper engineering.

---

# 17. Your Evaluation Framework Becomes Critical

You already built the beginning of:

```text
questions.json
```

Now run experiments.

### Baseline

```text
Vector Search
Top-K = 3
```

Record:

```text
Hit Rate
MRR
Latency
```

### Experiment 2

```text
Vector Search
Top-K = 5
```

Measure again.

### Experiment 3

```text
Vector Search
+
Metadata Filter
```

Measure again.

### Experiment 4

```text
Vector Search
+
Reranking
```

Measure again.

Now you have evidence.

---

# 18. A Better Retrieval Function

Your current conceptual function is:

```typescript
retrieve(question)
```

Eventually it should become something closer to:

```typescript
retrieve({
  query,
  project,
  topK,
  useHybridSearch,
  useReranking,
});
```

For example:

```typescript
type RetrievalOptions = {
  query: string;
  project?: string;
  topK?: number;
  useReranking?: boolean;
};
```

Then:

```typescript
async function retrieve(options: RetrievalOptions) {
  const {
    query,
    project,
    topK = 5,
    useReranking = false,
  } = options;

  // 1. Generate query embedding
  // 2. Apply metadata filter
  // 3. Retrieve candidates
  // 4. Optionally rerank
  // 5. Return final chunks
}
```

This separation becomes important when you start evaluating different strategies.

---

# 19. Retrieval Debugging

When the final answer is wrong, don't immediately blame the LLM.

Inspect:

```text
Question
   ↓
Rewritten query
   ↓
Metadata filter
   ↓
Retrieved candidates
   ↓
Reranked candidates
   ↓
Final context
   ↓
Prompt
   ↓
LLM answer
```

You should be able to inspect each stage.

For example:

```text
QUESTION:
What database does SyncTask use?

REWRITTEN:
SyncTask database technology

FILTER:
project = SyncTask

RETRIEVED:
1. MongoDB — score 0.91
2. Redis — score 0.83
3. PostgreSQL — score 0.79

RERANKED:
1. MongoDB — 0.97
2. Redis — 0.31

CONTEXT:
MongoDB is the primary database...

ANSWER:
SyncTask uses MongoDB.
```

This is **observability for RAG**.

---

# 20. Engineering Challenge

Your system returns:

```text
Question:
"What database does SyncTask use?"

Retrieved:

1. Redis is used for caching.
2. MongoDB stores application data.
3. Docker is used for containerization.
```

The answer is correct.

But your evaluation shows:

```text
Hit Rate: 100%
Answer accuracy: 72%
```

What would you investigate?

Think about:

```text
retrieval?
reranking?
context construction?
prompt?
LLM?
```

Don't just say:

> "Use a bigger model."

That's not diagnosis.

---

# 21. Interview Questions

Try answering these yourself:

### Q1

Why can semantic search return an irrelevant document?

### Q2

What is the difference between retrieval and reranking?

### Q3

Why would you use hybrid search?

### Q4

Why shouldn't you rerank your entire vector database?

### Q5

What is query rewriting, and what risk does it introduce?

---

# 22. System Design Question

Design retrieval for:

```text
10 million documents
500 million chunks
```

Requirements:

```text
P95 retrieval < 300ms
high relevance
metadata filtering
exact keyword matching
semantic matching
```

Your architecture should consider:

```text
                 Query
                   │
             Query Processing
                   │
          ┌────────┴────────┐
          ▼                 ▼
    Keyword Search     Vector Search
          │                 │
          └────────┬────────┘
                   ▼
              Candidates
                   │
                   ▼
               Reranker
                   │
                   ▼
               Top-K
```

Then ask:

* Where would indexing happen?
* Where would caching happen?
* How would you partition data?
* How would you handle hot queries?
* How would you measure P95 latency?
* What happens if the reranker becomes the bottleneck?

These are the questions that move you from **RAG developer** toward **AI systems engineer**.

---

# 23. Your Current AI Engineering Mental Model

You've now learned:

```text
                    RAG
                     │
      ┌──────────────┴──────────────┐
      │                             │
 Ingestion                       Retrieval
      │                             │
 Parsing                           Query
      ↓                             ↓
 Chunking                    Query Processing
      ↓                             ↓
 Metadata                   Metadata Filtering
      ↓                             ↓
 Embeddings                  Vector / Hybrid
      ↓                             ↓
 ChromaDB                    Candidate Results
                                    ↓
                                 Rerank
                                    ↓
                              Compression
                                    ↓
                                 Context
                                    ↓
                                  LLM
                                    ↓
                                Answer
                                    │
                                    ▼
                               Evaluation
```

The important shift is:

> **RAG is not “vector database + LLM.” RAG is an information retrieval system connected to a generation system.**

---

## Next: Lesson 13 — Advanced RAG Implementation

We'll stop discussing the architecture abstractly and implement the next version of your local system:

```text
                    User Query
                        │
                        ▼
                Retrieval Service
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
       Metadata Filter       Query Processing
             │                     │
             └──────────┬──────────┘
                        ▼
                    ChromaDB
                        │
                        ▼
                   Top-K Results
                        │
                        ▼
                 Context Builder
                        │
                        ▼
                    Qwen 1.5B
                        │
                        ▼
                     Answer
```

Then we'll add **reranking**, followed by **hybrid retrieval**, and finally compare every improvement against your evaluation dataset rather than assuming it works.
