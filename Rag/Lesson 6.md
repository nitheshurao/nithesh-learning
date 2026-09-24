# Lesson 6 — LLM Inference: Prefill, Decode, KV Cache & Latency

Now we move from **what the model contains** to **how the model actually generates an answer at runtime**.

This is an important step toward production AI engineering because you'll start thinking about **latency, throughput, memory, and observability**, not just prompts.

---

## 1. Today's Objective

Understand:

* What inference means
* Prefill
* Decode
* KV cache
* TTFT
* Tokens/second
* End-to-end latency
* Why long prompts can be expensive
* Why streaming feels faster
* How RAG affects inference performance

---

# 2. What Is Inference?

Training:

```text
Huge dataset
     ↓
Neural network
     ↓
Learn parameters
     ↓
Model weights
```

Inference:

```text
Trained model
     +
Input
     ↓
Prediction
```

Your local Qwen model is already trained.

When you run:

```bash
ollama run qwen2.5:1.5b
```

and ask:

```text
"What is SyncTask?"
```

the model is performing **inference**.

---

# 3. The Two Major Phases

LLM inference can be understood as two major phases:

```text
Prompt
  │
  ▼
┌─────────────┐
│   PREFILL   │
└──────┬──────┘
       │
       ▼
   KV Cache
       │
       ▼
┌─────────────┐
│    DECODE   │
└──────┬──────┘
       │
       ▼
Generated tokens
```

This distinction is extremely important.

---

# 4. Prefill

Suppose your RAG prompt contains:

```text
System instructions
+
5 retrieved chunks
+
User question
```

Maybe:

```text
5,000 tokens
```

The model first processes this existing context.

That's the **prefill phase**.

```text
5,000 input tokens
       │
       ▼
Transformer
       │
       ▼
Attention computation
       │
       ▼
KV Cache
```

The model processes the prompt before generating the answer.

---

# 5. Decode

After prefill, the model starts generating.

Suppose it generates:

```text
"SyncTask"
```

Then:

```text
"uses"
```

Then:

```text
"Next.js"
```

Then:

```text
"and"
```

and so on.

Conceptually:

```text
Prompt
  ↓
Prefill
  ↓
First generated token
  ↓
Decode
  ↓
Next token
  ↓
Decode
  ↓
Next token
  ↓
...
```

Each generated token depends on the previous context.

---

# 6. Why KV Cache Exists

Without caching, the model would repeatedly recompute attention over all previous tokens.

That would be wasteful.

Instead:

```text
Previous tokens
      │
      ▼
Key + Value states
      │
      ▼
   KV Cache
```

When generating the next token:

```text
New token
    │
    ▼
Query
    │
    ▼
Existing KV Cache
    │
    ▼
Attention
    │
    ▼
Next token
```

So:

> **KV cache stores attention-related Key/Value states from previous tokens so they don't have to be recomputed from scratch.**

---

# 7. Prefill vs Decode

This distinction is worth memorizing.


| Phase   | Main work                          |
| ------- | ---------------------------------- |
| Prefill | Process the existing input/context |
| Decode  | Generate output tokens one by one  |

For RAG:

```text
User question
+
Retrieved documents
+
System prompt
        │
        ▼
      Prefill
        │
        ▼
   Generate answer
        │
        ▼
      Decode
```

---

# 8. TTFT — Time to First Token

Suppose you send a request:

```text
14:00:00.000
```

The first token appears:

```text
14:00:01.200
```

Then:

```text
TTFT = 1.2 seconds
```

**TTFT = Time To First Token.**

It includes things such as:

```text
Request processing
+
Prompt processing / prefill
+
Model scheduling
+
First-token generation
```

A user perceives this as:

> "How long did I wait before the AI started responding?"

---

# 9. Tokens Per Second

Suppose the model generates:

```text
100 tokens
```

in:

```text
5 seconds
```

Then:

```text
tokens/sec = 100 / 5
           = 20 tokens/sec
```

This measures generation speed.

You may see metrics such as:

```text
TTFT: 0.8 s
Generation: 25 tokens/s
```

These are different dimensions of performance.

---

# 10. End-to-End Latency

Suppose:

```text
Embedding retrieval       100 ms
ChromaDB search            20 ms
LLM TTFT                  800 ms
LLM generation           2000 ms
```

Approximate total:

```text
100 + 20 + 800 + 2000
= 2920 ms
≈ 2.92 seconds
```

So:

> **LLM latency is only one part of total AI application latency.**

This is a major production engineering insight.

---

# 11. RAG Performance

Your RAG system:

```text
User
 │
 ▼
Embedding
 │
 ▼
Vector Search
 │
 ▼
Context Construction
 │
 ▼
LLM Prefill
 │
 ▼
LLM Decode
 │
 ▼
Answer
```

Now imagine you retrieve:

```text
20 chunks × 1,000 tokens
```

That's:

```text
20,000 tokens
```

of context.

You might have created a serious latency and memory problem.

More retrieval isn't automatically better.

---

# 12. Retrieval Quality vs Context Size

Consider:

### System A

```text
20 mediocre chunks
= 20,000 tokens
```

### System B

```text
5 highly relevant chunks
= 3,000 tokens
```

System B may provide:

```text
better retrieval precision
+
smaller prompt
+
faster prefill
+
less memory pressure
+
less irrelevant information
```

This is why advanced RAG engineering focuses on:

> **retrieval quality, not retrieval quantity.**

---

# 13. Why Streaming Feels Faster

Without streaming:

```text
Request
  ↓
Wait
  ↓
Wait
  ↓
Wait
  ↓
Complete answer
```

With streaming:

```text
Request
  ↓
"SyncTask"
  ↓
"uses"
  ↓
"Next.js"
  ↓
"and"
  ↓
"Node.js"
```

The user starts seeing the answer immediately after the first token/chunk arrives.

The total generation time may be similar, but:

> **Perceived latency is significantly better.**

This is why production AI applications commonly stream responses.

---

# 14. Your Next.js Architecture

Eventually your application might look like:

```text
                Browser
                   │
                   ▼
              Next.js UI
                   │
                   │ streaming request
                   ▼
              Node.js API
                   │
          ┌────────┼────────┐
          │        │        │
          ▼        ▼        ▼
      Embedding  Chroma   Ollama
       Model       DB       Qwen
          │        │        │
          └────┬───┘        │
               │            │
               ▼            │
          Context ──────────┘
               │
               ▼
            Response
               │
               ▼
             Stream
               │
               ▼
             Browser
```

This is already moving toward a production-style architecture.

---

# 15. Important Performance Metrics

As an AI engineer, start thinking in terms of measurable metrics.

### Retrieval latency

```text
How long does vector search take?
```

### TTFT

```text
How long until the first token?
```

### Generation throughput

```text
tokens / second
```

### End-to-end latency

```text
request → complete response
```

### Context size

```text
input tokens
```

### Output size

```text
generated tokens
```

Later we'll add:

```text
retrieval precision
answer faithfulness
hallucination rate
cost
error rate
```

---

# 16. Debugging Scenario

Your RAG application suddenly becomes slow.

You measure:

```text
Embedding:       50 ms
ChromaDB:        30 ms
Prompt building: 20 ms
TTFT:          4,500 ms
Generation:       25 tokens/sec
```

Where would you investigate first?

The answer isn't:

> "ChromaDB is slow."

Your numbers show:

```text
ChromaDB = 30 ms
```

while:

```text
TTFT = 4.5 seconds
```

That suggests investigating the **LLM/prefill path**, including:

* prompt size
* context length
* model loading
* hardware utilization
* model size
* runtime configuration

This is how production debugging should work:

> **Measure first. Then optimize the actual bottleneck.**

---

# 17. Engineering Challenge

Imagine your RAG pipeline currently retrieves:

```text
Top-K = 10
```

Each chunk averages:

```text
800 tokens
```

So approximately:

```text
10 × 800
= 8,000 tokens
```

You reduce retrieval to:

```text
Top-K = 4
```

with the same average chunk size.

Now estimate:

1. New approximate context size.
2. What happens to prefill workload?
3. What could happen to TTFT?
4. What could happen to answer quality?
5. Why isn't reducing `top-k` automatically the correct solution?

---

# 18. Interview Questions

Answer these:

1. **What is the difference between prefill and decode?**
2. **Why is KV cache needed?**
3. **What is TTFT?**
4. **What is tokens/sec?**
5. **Why can a large RAG context increase latency?**

---

# 19. System Design Challenge

Design a **local RAG assistant optimized for low latency**.

Requirements:

```text
MacBook
Ollama
Qwen
ChromaDB
Next.js
Node.js
```

Target:

```text
Fast first token
+
Relevant answers
+
Streaming UI
```

Your architecture should consider:

```text
Embedding
↓
Retrieval
↓
Top-K
↓
Context size
↓
Prompt
↓
Prefill
↓
Decode
↓
Streaming
```

---

# 20. One Concept to Remember

Your AI application's latency isn't simply:

```text
LLM speed
```

It's closer to:

```text
Total latency
=
Retrieval
+
Prompt construction
+
LLM prefill
+
First-token generation
+
LLM decode
+
Network/UI overhead
```

For your **local-first AI engineering path**, this distinction will become increasingly important.

---

## Next Lesson

We'll now move into **Context Engineering & Prompt Architecture**:

```text
System Prompt
      +
User Query
      +
Retrieved Context
      +
Conversation History
      +
Tool Results
      ↓
   LLM Context
```

You'll learn how to structure this context, why **"more context" can actually make an LLM worse**, and how this connects directly to building your **Personal Knowledge AI**.
