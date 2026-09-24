# Lesson 14 — Reranking: Making Retrieval More Precise

You've now reached an important transition point.

So far:

```text
Question
   ↓
Embedding
   ↓
Vector Search
   ↓
Top-K
   ↓
LLM
```

Today we'll turn this into:

```text
Question
   ↓
Embedding
   ↓
Candidate Retrieval
   ↓
Reranker
   ↓
Best Chunks
   ↓
LLM
```

The key principle:

> **Vector search finds candidates; reranking decides which candidates are actually most relevant.**

---

# 1. Today's Objective

You'll understand:

* Why vector similarity isn't enough
* Bi-encoder vs cross-encoder
* What a reranker actually does
* Two-stage retrieval
* Candidate count vs final K
* Reranking latency
* Reranking scores
* Where reranking belongs in RAG
* How to evaluate whether reranking helps

---

# 2. The Problem

Suppose your question is:

> **"What database does SyncTask use?"**

Vector search returns:

```text
Candidate 1
Redis is used for caching.

Candidate 2
MongoDB stores application data.

Candidate 3
Docker is used for containerization.

Candidate 4
The backend uses Node.js.

Candidate 5
Next.js is used for the frontend.
```

All five might have reasonably high semantic similarity because they're all about SyncTask architecture.

But:

```text
MongoDB
```

is the answer.

Vector search doesn't necessarily understand the **exact relationship between the question and candidate**.

That's where reranking enters.

---

# 3. First Understand Bi-Encoder Retrieval

Your current embedding architecture is approximately:

```text
                    Question
                       │
                       ▼
                Embedding Model
                       │
                       ▼
                 Query Vector
                       │
                       │
                       ▼
                  Vector DB
                       ▲
                       │
                Document Vectors
```

Documents were embedded during ingestion:

```text
Document
   ↓
Embedding Model
   ↓
Vector
   ↓
ChromaDB
```

Question:

```text
Question
   ↓
Embedding Model
   ↓
Vector
```

Then compare vectors.

This is extremely efficient because document embeddings can be calculated **once** and reused.

---

# 4. What Is a Bi-Encoder?

A bi-encoder independently encodes:

```text
Question → Vector A

Document → Vector B
```

Then:

```text
similarity(Vector A, Vector B)
```

For example:

```text
Question vector
      │
      └─────────────┐
                    ▼
                 similarity
                    ▲
      ┌─────────────┘
      │
Document vector
```

This is why vector databases can search huge collections efficiently.

---

# 5. The Limitation

The question and document are encoded independently.

The model doesn't directly process:

```text
Question + Document
```

together.

A reranker can do exactly that.

---

# 6. Cross-Encoder Reranking

A cross-encoder receives:

```text
Question + Candidate
```

together.

Example:

```text
Question:
"What database does SyncTask use?"

Candidate:
"MongoDB stores application data."
```

The model evaluates:

```text
(question, candidate)
```

and produces a relevance score.

Conceptually:

```text
Question ─────┐
              ├──► Cross Encoder ──► 0.97
Candidate ────┘
```

Another:

```text
Question:
"What database does SyncTask use?"

Candidate:
"Redis is used for caching."
```

Could receive:

```text
0.31
```

So we get:

```text
MongoDB → 0.97
Redis   → 0.31
Docker  → 0.12
```

Then sort.

---

# 7. Bi-Encoder vs Cross-Encoder

This distinction is extremely important for interviews.


|                    | Bi-Encoder                | Cross-Encoder                       |
| ------------------ | ------------------------- | ----------------------------------- |
| Input              | Query/document separately | Query + document together           |
| Speed              | Fast                      | Slower                              |
| Large-scale search | Excellent                 | Expensive                           |
| Precision          | Good                      | Usually stronger relevance modeling |
| Precompute docs    | Yes                       | Generally no                        |
| Typical use        | Candidate retrieval       | Reranking                           |

Mental model:

```text
Bi-encoder:
FAST + BROAD

Cross-encoder:
SLOWER + PRECISE
```

---

# 8. Two-Stage Retrieval

This gives us the standard architecture:

```text
                 500,000 chunks
                       │
                       ▼
                 Vector Search
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
                     LLM
```

Why not rerank all 500,000?

Because the reranker needs to process:

```text
Question + Candidate
```

for every candidate.

That's expensive.

Instead:

```text
500,000
   ↓
Vector Search
   ↓
50
   ↓
Reranker
   ↓
5
```

This is a classic **candidate generation → ranking** architecture.

---

# 9. Candidate K vs Final K

These are different.

Suppose:

```text
candidateK = 50
finalK = 5
```

Then:

```text
Vector DB
    ↓
50 candidates
    ↓
Reranker
    ↓
5 final chunks
```

You might experiment with:

```text
candidateK = 10
candidateK = 25
candidateK = 50
candidateK = 100
```

and:

```text
finalK = 3
finalK = 5
```

This creates a tuning problem.

---

# 10. Why Candidate Count Matters

Suppose the correct answer is ranked:

```text
Vector ranking:

1. Redis
2. Docker
3. Node.js
4. Next.js
5. MongoDB  ← correct
```

If:

```text
candidateK = 3
```

MongoDB never reaches the reranker.

The reranker cannot recover it.

This is a critical principle:

> **A reranker can reorder candidates, but it cannot rerank documents that retrieval never retrieved.**

Therefore:

```text
Recall problem
      ↓
Candidate retrieval
```

while:

```text
Ordering problem
      ↓
Reranking
```

---

# 11. Retrieval Failure vs Ranking Failure

This gives you a powerful debugging framework.

### Case A

Correct chunk isn't in candidates:

```text
Vector Search
   ↓
❌ correct chunk missing
```

That's a **retrieval failure**.

### Case B

Correct chunk is present:

```text
Vector Search
   ↓
MongoDB = #5
```

but reranker places it:

```text
MongoDB = #1
```

Great.

If reranker instead puts it:

```text
MongoDB = #8
```

that's a **ranking failure**.

---

# 12. Reranking Pipeline

Your retrieval service becomes:

```text
User Query
    │
    ▼
Query Embedding
    │
    ▼
ChromaDB
    │
    ▼
Top 50 Candidates
    │
    ▼
┌────────────────────────┐
│       RERANKER         │
│                        │
│ Q + Candidate 1 → 0.2 │
│ Q + Candidate 2 → 0.9 │
│ Q + Candidate 3 → 0.4 │
│ Q + Candidate 4 → 0.8 │
└────────────┬───────────┘
             │
             ▼
          Sort
             │
             ▼
          Top 5
             │
             ▼
          Context
             │
             ▼
            Qwen
```

---

# 13. Where Reranking Happens

Not here:

```text
Question
 ↓
Reranker
 ↓
Vector DB
```

And not after generation.

Correct:

```text
Question
 ↓
Candidate Retrieval
 ↓
Reranking
 ↓
Context Construction
 ↓
LLM
```

---

# 14. Reranker Score ≠ Vector Similarity

Very important.

You might have:

```text
Vector distance:
0.18

Reranker score:
0.94
```

These numbers represent different things.

Don't combine them blindly.

For example:

```text
0.18 + 0.94
```

doesn't automatically mean anything.

They come from different scoring mechanisms.

---

# 15. Example

Question:

```text
What is Redis used for in SyncTask?
```

Vector search:


| Chunk                 | Vector rank |
| --------------------- | ----------: |
| MongoDB stores data   |           1 |
| Redis handles caching |           2 |
| Node.js backend       |           3 |
| Docker deployment     |           4 |
| Next.js frontend      |           5 |

Reranker:


| Chunk                 | Reranker score |
| --------------------- | -------------: |
| Redis handles caching |           0.96 |
| MongoDB stores data   |           0.21 |
| Node.js backend       |           0.15 |
| Docker deployment     |           0.08 |
| Next.js frontend      |           0.04 |

Final:

```text
Redis handles caching
```

This is the value of reranking.

---

# 16. Local Reranking

Because you're following a **local-first AI engineering path**, we don't want to immediately depend on a hosted reranking API.

The architecture should support:

```text
ChromaDB
    ↓
Candidate chunks
    ↓
Local reranker
    ↓
Qwen
```

Possible local approaches include reranking models from the open-source ecosystem.

The exact model and runtime should be selected based on:

```text
model quality
CPU/GPU availability
Apple Silicon compatibility
memory
latency
license
```

Don't blindly choose a model because someone says it is "the best."

---

# 17. Reranker Interface

A good engineering design is to hide the actual model behind an interface.

```typescript
export interface Reranker {
  rerank(
    query: string,
    documents: string[]
  ): Promise<number[]>;
}
```

Then:

```text
Reranker
   │
   ├── LocalReranker
   │
   ├── HostedReranker
   │
   └── MockReranker
```

This gives you flexibility.

Your retrieval pipeline doesn't care which implementation is underneath.

---

# 18. Better Type Design

```typescript
export type RerankCandidate = {
  id: string;
  content: string;
  metadata: Record<string, string | number | boolean>;
};

export type RerankedCandidate =
  RerankCandidate & {
    rerankScore: number;
  };
```

Then:

```typescript
async function rerank(
  query: string,
  candidates: RerankCandidate[]
): Promise<RerankedCandidate[]> {
  // score candidates
}
```

---

# 19. The Complete Retrieval Service

Conceptually:

```typescript
async function retrieveAdvanced(query: string) {

  // Stage 1
  const candidates = await vectorSearch({
    query,
    topK: 50,
  });

  // Stage 2
  const ranked = await rerank(
    query,
    candidates
  );

  // Stage 3
  return ranked.slice(0, 5);
}
```

This simple separation is extremely valuable.

---

# 20. Add Timing

Measure both stages:

```typescript
const retrievalStart = performance.now();

const candidates = await vectorSearch({
  query,
  topK: 50,
});

const retrievalMs =
  performance.now() - retrievalStart;
```

Then:

```typescript
const rerankStart = performance.now();

const ranked = await rerank(
  query,
  candidates
);

const rerankMs =
  performance.now() - rerankStart;
```

Log:

```text
Vector retrieval: 42 ms
Candidates: 50

Reranking: 183 ms
Final chunks: 5
```

Now you can make engineering decisions based on measurements.

---

# 21. Latency Trade-off

Suppose:

```text
Vector search = 30ms
Reranking 10 = 40ms
Reranking 50 = 170ms
Reranking 100 = 350ms
```

Increasing candidate count may improve recall:

```text
10 → 50 → 100
```

but also increases latency.

You need to find a useful operating point.

This is why AI engineering is not simply:

> "Add more intelligence."

It's:

> **Optimize quality under latency, memory, and compute constraints.**

---

# 22. Evaluation

You already have your golden dataset.

Now compare:

### Baseline

```text
Vector Search
K = 5
```

versus:

### Reranked

```text
Vector Search
Candidate K = 50
       ↓
Reranker
       ↓
Final K = 5
```

Measure:

```text
Hit Rate
MRR
Precision@K
Answer relevance
Faithfulness
Retrieval latency
Reranking latency
Total latency
```

---

# 23. The Experiment That Matters

Create:


| Pipeline        | Candidate K | Final K | MRR | Hit Rate | Latency |
| --------------- | ----------: | ------: | --: | -------: | ------: |
| Vector          |           5 |       5 |   ? |        ? |       ? |
| Vector          |          20 |       5 |   ? |        ? |       ? |
| Vector + Rerank |          20 |       5 |   ? |        ? |       ? |
| Vector + Rerank |          50 |       5 |   ? |        ? |       ? |

The important part isn't producing impressive numbers.

It's discovering:

```text
Does reranking actually improve YOUR dataset?
```

---

# 24. A Common Mistake

Suppose:

```text
Vector:
Hit Rate = 95%
MRR = 0.82
```

After adding reranking:

```text
Hit Rate = 95%
MRR = 0.83
```

You might say:

> "Reranking improved RAG."

Technically, MRR improved slightly.

But now suppose:

```text
Latency:
50ms → 450ms
```

Is the additional complexity justified?

That is an engineering decision based on requirements.

This is why we measure both:

```text
quality
+
latency
```

---

# 25. Reranking and RAG Generation

One subtle point:

Reranking doesn't directly improve the LLM.

It improves the **evidence presented to the LLM**.

Think:

```text
Bad retrieval
     ↓
Bad context
     ↓
LLM struggles

Better retrieval
     ↓
Better context
     ↓
LLM has better evidence
```

So:

> **Many apparent "LLM problems" are actually retrieval problems.**

---

# 26. Engineering Challenge

You have 20 retrieved candidates.

The correct chunk is:

```text
rank #17
```

You use:

```text
candidateK = 10
```

and therefore the reranker never sees it.

### Question:

Can reranking fix the problem?

No.

Why?

Because:

```text
20 candidates
     ↓
take first 10
     ↓
correct chunk discarded
     ↓
reranker
     ↓
cannot recover it
```

This illustrates:

> **Recall comes before ranking.**

---

# 27. Interview Questions

### Q1

What is the difference between a bi-encoder and cross-encoder?

### Q2

Why do we retrieve candidates before reranking?

### Q3

Can a reranker recover a document that vector search didn't retrieve?

### Q4

Why does increasing candidate K increase latency?

### Q5

How would you determine whether reranking actually improves a RAG system?

---

# 28. System Design Challenge

Design retrieval for:

```text
5 million chunks
```

Requirement:

```text
P95 retrieval + reranking < 500ms
```

Architecture:

```text
                    Query
                      │
                      ▼
                 Query Embed
                      │
                      ▼
                 Vector DB
                      │
                      ▼
                100 candidates
                      │
                      ▼
                  Reranker
                      │
                      ▼
                    Top 5
```

Now consider:

```text
Vector DB       40ms
Embedding       20ms
Reranker        350ms
```

Total:

```text
410ms
```

You only have:

```text
90ms
```

left for everything else.

What would you optimize?

Possible directions:

```text
candidate count
reranker model
batching
parallelism
caching
hardware
quantization
```

This is the type of reasoning expected from an AI systems engineer.

---

# 29. Your Updated RAG Architecture

You now have:

```text
                         USER
                           │
                           ▼
                    Query Processing
                           │
                           ▼
                     Query Embedding
                           │
                           ▼
                       ChromaDB
                           │
                           ▼
                   Candidate Retrieval
                           │
                     Top 20–100
                           │
                           ▼
                       Reranker
                           │
                           ▼
                       Final Top-K
                           │
                           ▼
                  Context Construction
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

The crucial separation is:

```text
Candidate Retrieval
        ≠
Reranking
        ≠
Generation
```

Each stage has a different responsibility.

---

# 30. Mental Model to Remember

Memorize this:

```text
Vector Search:
"Find things that might be relevant."

Reranker:
"Among those things, which are actually most relevant?"

LLM:
"Using that evidence, generate the answer."
```

That's the core of modern retrieval pipelines.

---

## Next — Lesson 15: Hybrid Search

We'll add the other half of serious retrieval:

```text
                 Query
                   │
          ┌────────┴────────┐
          ▼                 ▼
    Vector Search       Keyword Search
          │                 │
          │              BM25
          │                 │
          └────────┬────────┘
                   ▼
              Merge/RRF
                   │
                   ▼
               Reranker
                   │
                   ▼
                 Qwen
```

You'll learn **BM25, sparse vs dense retrieval, Reciprocal Rank Fusion (RRF), why exact identifiers matter for code search, and how hybrid retrieval complements embeddings.**
