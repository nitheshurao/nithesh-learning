# Lesson 15 — Hybrid Search: Combining Semantic + Keyword Retrieval

You've now learned:

```text
Vector Search → semantic similarity
Reranking     → relevance ordering
```

But there's still a major weakness.

If someone asks:

> **"Where is `ChatOllama` initialized?"**

Semantic search is useful, but **exact lexical matching** is extremely important for identifiers like:

```text
ChatOllama
Q4_K_M
nomic-embed-text
/api/tasks
MongoClient
AuthService
```

That's where **hybrid search** comes in.

---

# 1. Today's Objective

You'll learn:

* Dense retrieval
* Sparse/keyword retrieval
* BM25
* Why exact matching matters
* Dense vs sparse search
* Reciprocal Rank Fusion (RRF)
* Hybrid retrieval architecture
* Where reranking fits
* How this applies to code search
* How to evaluate hybrid search

---

# 2. The Problem With Pure Vector Search

Suppose your document contains:

```typescript
const llm = new ChatOllama({
  model: "qwen2.5:1.5b",
});
```

User asks:

> "Where is ChatOllama initialized?"

Vector search might return:

```text
1. Ollama configuration
2. LLM configuration
3. Local model setup
4. ChatOllama initialization
5. Model service
```

But an exact keyword search for:

```text
ChatOllama
```

can immediately identify the relevant document.

This gives us:

```text
Semantic understanding
+
Exact lexical matching
```

---

# 3. Dense Retrieval

Your current embedding pipeline is:

```text
Text
 ↓
Embedding Model
 ↓
Dense Vector
 ↓
Vector DB
```

Example conceptually:

```text
"MongoDB database"

→ [0.12, -0.84, 0.31, ...]
```

The vector captures semantic relationships.

For example:

```text
"database"
"data storage"
"persistence layer"
```

may be semantically related even if the exact words differ.

That's the strength of dense retrieval.

---

# 4. Sparse Retrieval

Keyword retrieval works differently.

Instead of representing a document primarily as a dense semantic vector, it considers the importance of terms.

For example:

```text
Document:

SyncTask uses MongoDB for persistence.
```

Query:

```text
MongoDB persistence
```

The system asks:

```text
Does the document contain important query terms?
```

This is **lexical retrieval**.

One classic algorithm is:

> **BM25**

---

# 5. BM25

BM25 is a ranking algorithm used in information retrieval.

It considers factors such as:

```text
term frequency
+
inverse document frequency
+
document length
```

Conceptually:

```text
Query
 ↓
Tokenize
 ↓
Find matching terms
 ↓
Calculate BM25 score
 ↓
Rank documents
```

You don't need to memorize the entire formula yet.

The important intuition:

> **Rare query terms that appear in a document can strongly influence its ranking.**

---

# 6. Why Rare Terms Matter

Suppose your knowledge base contains:

```text
500,000 chunks
```

and only one chunk contains:

```text
Q4_K_M
```

A lexical search for:

```text
Q4_K_M
```

is extremely powerful.

Semantic search might understand:

```text
quantized model
4-bit model
GGUF model
```

but exact lexical matching knows:

```text
Q4_K_M
```

appears here.

---

# 7. Dense vs Sparse


| Dense                      | Sparse                        |
| -------------------------- | ----------------------------- |
| Semantic                   | Lexical                       |
| Meaning-oriented           | Term-oriented                 |
| Handles synonyms well      | Handles exact terms well      |
| Embeddings                 | BM25/inverted index           |
| Great for natural language | Great for identifiers         |
| Can miss exact terms       | Can miss semantic equivalents |

Example:

### Query

```text
"Where does the application store persistent data?"
```

Dense retrieval may find:

```text
MongoDB stores application data.
```

Great.

### Query

```text
"Where is ChatOllama initialized?"
```

Sparse retrieval can strongly benefit from exact:

```text
ChatOllama
```

---

# 8. Hybrid Search

Instead of choosing one:

```text
Dense
OR
Sparse
```

use:

```text
Dense
+
Sparse
```

Architecture:

```text
                       Query
                         │
                ┌────────┴────────┐
                ▼                 ▼
          Dense Search       Keyword Search
                │                 │
                ▼                 ▼
          Vector Results       BM25 Results
                │                 │
                └────────┬────────┘
                         ▼
                    Result Fusion
                         │
                         ▼
                      Reranker
                         │
                         ▼
                       Qwen
```

This is **hybrid retrieval**.

---

# 9. The Problem: Scores Are Different

Suppose vector search produces:

```text
MongoDB     → 0.91
Redis       → 0.83
Docker      → 0.71
```

BM25 produces:

```text
ChatOllama  → 14.2
MongoDB     → 11.7
Redis       → 5.2
```

Can you simply do:

```text
0.91 + 14.2
```

?

No.

The score distributions are different.

We need a way to combine rankings without assuming the raw scores are directly comparable.

---

# 10. Reciprocal Rank Fusion

A common solution is:

> **RRF — Reciprocal Rank Fusion**

Instead of combining raw scores, we combine rankings.

The basic idea:

```text
RRF(d) = Σ 1 / (k + rank(d))
```

where `k` is a constant used to reduce the effect of very high rankings.

You don't need to memorize the formula yet.

Understand the behavior.

---

# 11. RRF Example

Suppose vector search gives:

```text
Dense:

1. MongoDB
2. Redis
3. Docker
4. Node.js
5. Next.js
```

Keyword search gives:

```text
Sparse:

1. Redis
2. MongoDB
3. ChatOllama
4. Docker
5. Node.js
```

Now:

```text
MongoDB
Dense rank = 1
Sparse rank = 2

Redis
Dense rank = 2
Sparse rank = 1
```

Both appear near the top in **both retrieval systems**.

RRF rewards that.

---

# 12. Why RRF Is Useful

Imagine:

```text
Dense:
MongoDB #1

Sparse:
MongoDB #2
```

MongoDB is consistently strong.

But:

```text
Dense:
MongoDB #50

Sparse:
MongoDB #1
```

It still has a chance to survive because lexical retrieval found it strongly.

That's exactly what we want.

---

# 13. Hybrid Retrieval Pipeline

A robust architecture becomes:

```text
                       USER QUERY
                           │
                           ▼
                  Query Processing
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
        Dense Retrieval           Sparse Retrieval
              │                         │
              ▼                         ▼
          Vector DB                    BM25
              │                         │
              └────────────┬────────────┘
                           ▼
                     RRF Fusion
                           │
                           ▼
                     Candidates
                           │
                           ▼
                       Reranker
                           │
                           ▼
                       Top-K
                           │
                           ▼
                         Qwen
```

This is a very strong general architecture.

---

# 14. Hybrid Search for Your AI Developer Agent

This becomes especially important when searching code.

Suppose your repository contains:

```text
src/auth/AuthService.ts
src/auth/AuthController.ts
src/tasks/TaskService.ts
src/calendar/GoogleCalendarService.ts
```

Question:

> "Where is `GoogleCalendarService` used?"

Dense retrieval might find:

```text
calendar integration
Google Calendar
calendar service
OAuth
sync
```

Sparse retrieval can directly match:

```text
GoogleCalendarService
```

Combining both is much stronger.

---

# 15. Natural Language + Exact Identifiers

Consider:

> "How does the authentication service refresh JWT tokens?"

Dense search can understand:

```text
authentication
JWT
refresh
tokens
```

Sparse search can find exact:

```text
refreshToken()
AuthService
JWT_SECRET
```

Hybrid search combines these signals.

---

# 16. Implementing Hybrid Retrieval

Don't immediately replace your entire RAG system.

Create an abstraction:

```typescript
type SearchResult = {
  id: string;
  content: string;
  rank: number;
  metadata: Record<string, unknown>;
};
```

Dense search:

```typescript
async function denseSearch(
  query: string
): Promise<SearchResult[]> {
  // Embed query
  // Search ChromaDB
  // Return ranked results
}
```

Sparse search:

```typescript
async function sparseSearch(
  query: string
): Promise<SearchResult[]> {
  // BM25 / lexical index
  // Return ranked results
}
```

Then:

```typescript
async function hybridSearch(query: string) {

  const [dense, sparse] = await Promise.all([
    denseSearch(query),
    sparseSearch(query),
  ]);

  return fuseWithRRF(dense, sparse);
}
```

Notice the use of:

```typescript
Promise.all(...)
```

Dense and sparse retrieval are independent.

So they can execute in parallel.

---

# 17. Why Parallel Retrieval Matters

Sequential:

```text
Dense: 40ms
   ↓
Sparse: 20ms
   ↓
Total = 60ms
```

Parallel:

```text
Dense ────── 40ms ──────┐
                        ├──→ 40ms
Sparse ─── 20ms ────────┘
```

Potential retrieval latency:

```text
≈ max(40,20)
≈ 40ms
```

rather than:

```text
40 + 20 = 60ms
```

This is an important systems-design pattern.

---

# 18. RRF Implementation

A simplified implementation:

```typescript
function rrf(
  resultLists: SearchResult[][],
  k = 60
): SearchResult[] {

  const scores = new Map<string, number>();
  const documents = new Map<string, SearchResult>();

  for (const results of resultLists) {
    results.forEach((result, index) => {
      const rank = index + 1;

      const score =
        1 / (k + rank);

      scores.set(
        result.id,
        (scores.get(result.id) ?? 0) + score
      );

      documents.set(result.id, result);
    });
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => documents.get(id)!);
}
```

The important idea isn't the code.

It's:

```text
Dense ranking
     +
Sparse ranking
     ↓
RRF
     ↓
Unified ranking
```

---

# 19. Then Reranking

Don't confuse:

```text
RRF
```

with:

```text
Reranker
```

RRF is a **fusion algorithm**.

Reranking is a **relevance model**.

The full pipeline:

```text
Dense Search ───────┐
                    │
Sparse Search ──────┤
                    ▼
                   RRF
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

---

# 20. Why Not Just Use Hybrid Search?

Because hybrid retrieval can still produce:

```text
20–100 candidates
```

You may still have ranking noise.

So:

```text
Hybrid Search
      ↓
Candidate recall
      ↓
Reranker
      ↓
Precision
```

is often a stronger architecture.

---

# 21. Evaluation

Now your experiments become much more interesting.

### Experiment A

```text
Dense only
```

### Experiment B

```text
Sparse only
```

### Experiment C

```text
Dense + Sparse + RRF
```

### Experiment D

```text
Dense + Sparse + RRF + Reranker
```

Measure:


| Pipeline        | Hit Rate | MRR | Precision | Latency |
| --------------- | -------: | --: | --------: | ------: |
| Dense           |        ? |   ? |         ? |       ? |
| Sparse          |        ? |   ? |         ? |       ? |
| Hybrid          |        ? |   ? |         ? |       ? |
| Hybrid + Rerank |        ? |   ? |         ? |       ? |

This is how you'll know whether complexity is justified.

---

# 22. Important Evaluation Insight

Imagine:

```text
Dense:
Hit Rate = 92%

Hybrid:
Hit Rate = 97%

Hybrid + Reranker:
Hit Rate = 97%
MRR = significantly higher
```

Interpretation:

```text
Hybrid improved recall.

Reranking improved ordering.
```

That's a very useful distinction.

---

# 23. When Dense Search Wins

Dense retrieval is particularly useful when users use different terminology.

Document:

```text
"MongoDB is the persistence layer."
```

Question:

```text
"Where is application data stored?"
```

Exact keyword overlap is weak.

Semantic retrieval can understand the relationship.

---

# 24. When Sparse Search Wins

Question:

```text
"What does Q4_K_M mean?"
```

or:

```text
"Where is ChatOllama instantiated?"
```

or:

```text
"What is `/api/tasks/:id`?"
```

Exact identifiers are extremely valuable.

---

# 25. When Hybrid Search Wins

A realistic developer question:

> "How does the `TaskService` persist scheduled tasks in MongoDB?"

This contains:

```text
TaskService
MongoDB
scheduled tasks
persist
```

Some terms are exact identifiers.

Others are semantic concepts.

Hybrid retrieval can exploit both.

---

# 26. Production Architecture

Your RAG architecture is now:

```text
                         USER
                           │
                           ▼
                    Query Processor
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
        Dense Retrieval          Sparse Retrieval
              │                         │
          ChromaDB                    BM25
              │                         │
              └────────────┬────────────┘
                           ▼
                         RRF
                           │
                           ▼
                    Candidate Set
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
                       Prompt
                           │
                           ▼
                         Qwen
                           │
                           ▼
                        Answer
```

At this point you're no longer building a toy:

```text
"embedding → vector DB → LLM"
```

You're designing an actual information retrieval pipeline.

---

# 27. Engineering Challenge

Suppose:

### Dense search

```text
1. MongoDB
2. Redis
3. Node.js
4. Docker
5. ChatOllama
```

### Sparse search

```text
1. ChatOllama
2. MongoDB
3. Docker
4. AuthService
5. Redis
```

Question:

> **"Where is ChatOllama configured?"**

Without calculating the exact RRF numbers:

**Which documents do you expect RRF to push upward, and why?**

Think about:

```text
rank agreement
```

between the two retrieval systems.

---

# 28. Interview Questions

### Q1

What is hybrid search?

### Q2

Why does BM25 complement vector search?

### Q3

What is RRF?

### Q4

Why shouldn't raw dense and BM25 scores necessarily be added directly?

### Q5

Why is hybrid retrieval particularly useful for code search?

---

# 29. System Design Challenge

You are building an AI coding assistant.

Repository:

```text
5 million code chunks
```

User asks:

> "Where is `AuthService.refreshToken()` called?"

Requirements:

```text
exact identifier matching
+
semantic understanding
+
P95 retrieval < 200ms
```

Design:

```text
                    Query
                      │
             ┌────────┴────────┐
             ▼                 ▼
        BM25 / Lexical     Vector Search
             │                 │
             └────────┬────────┘
                      ▼
                     RRF
                      │
                      ▼
                 Candidates
                      │
                      ▼
                   Rerank
                      │
                      ▼
                    Top-K
```

Now answer:

1. Why do you need both retrieval systems?
2. Where would you cache?
3. How would you keep retrieval under 200ms?
4. Would you rerank 1,000 candidates?
5. What metadata would you store for code chunks?

---

# 30. Mental Model

Remember these three layers:

```text
DENSE
"Does this mean something similar?"

SPARSE
"Does this contain the important words?"

RERANKER
"Given the question and candidate together,
how relevant is this candidate?"
```

And the complete retrieval strategy:

```text
Dense + Sparse
      ↓
     RRF
      ↓
Candidate Recall
      ↓
   Reranking
      ↓
Precision
```

---

## Next — Lesson 16: Query Rewriting & Query Expansion

We'll make retrieval understand difficult user queries:

```text
"What did I use to make the thing
that syncs my tasks with Google?"

                    ↓

Original Query
                    ↓
Query Understanding
                    ↓
Rewritten Queries
                    ↓
┌─────────────────────────────┐
│ Google Calendar integration │
│ SyncTask calendar sync      │
│ Task synchronization        │
│ Google Calendar API         │
└─────────────────────────────┘
                    ↓
              Hybrid Search
                    ↓
                 Reranker
                    ↓
                   Qwen
```

We'll cover **query rewriting, multi-query retrieval, query decomposition, HyDE, when query expansion improves recall, and when it actually makes retrieval worse.**
