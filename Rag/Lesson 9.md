# Lesson 9 — Complete Local RAG: Retrieval → Prompt → Qwen

We've built and isolated retrieval. Now we connect the second half:

```text
Question
   ↓
Embedding
   ↓
ChromaDB
   ↓
Relevant chunks
   ↓
Context builder
   ↓
Qwen
   ↓
Answer
```

The key engineering principle today:

> **Retrieval and generation are separate components.**

If the final answer is wrong, we should be able to determine whether **retrieval** or **generation** failed.

---

# 1. Today's Objective

Build a complete local RAG pipeline using:

```text
Node.js
TypeScript
Ollama
 ├── nomic-embed-text
 └── qwen2.5:1.5b
ChromaDB
```

We'll implement:

* Retrieval
* Context construction
* Prompt design
* LLM generation
* Source attribution
* Basic hallucination control
* Debugging

---

# 2. Architecture

Our complete system:

```text
                         USER
                          │
                          ▼
                    User Question
                          │
                          ▼
                 ┌─────────────────┐
                 │ Embedding Model │
                 │nomic-embed-text │
                 └────────┬────────┘
                          │
                          ▼
                     Query Vector
                          │
                          ▼
                    ┌───────────┐
                    │ ChromaDB  │
                    └─────┬─────┘
                          │
                          ▼
                   Top-K Documents
                          │
                          ▼
                 Context Construction
                          │
                          ▼
                ┌──────────────────┐
                │      Qwen        │
                │   qwen2.5:1.5b   │
                └────────┬─────────┘
                         │
                         ▼
                       Answer
```

---

# 3. Important Design Decision

Don't do this:

```text
id="bad1"
Question
   ↓
ChromaDB
   ↓
LLM
```

The LLM needs an explicit context:

```text
id="good1"
Question
+
Retrieved Evidence
+
Instructions
       ↓
      LLM
```

The application is responsible for constructing that context.

---

# 4. Create the Generator

Create:

```text
src/generate.ts
```

```typescript
import { ChatOllama } from "@langchain/ollama";

const llm = new ChatOllama({
  model: "qwen2.5:1.5b",
  temperature: 0.1,
});

export async function generateAnswer(
  question: string,
  context: string
) {
  const prompt = `
You are a technical assistant answering questions
about the SyncTask project.

Rules:
- Answer using only the provided context.
- Do not invent technologies or project details.
- If the answer is not present in the context,
  say that the information is not available.
- Keep the answer concise.
- Mention the source when possible.

CONTEXT:
${context}

QUESTION:
${question}

ANSWER:
`;

  const response = await llm.invoke(prompt);

  return response.content;
}
```

---

# 5. Why Temperature Is Low

We're using:

```typescript
temperature: 0.1
```

because this is a factual RAG application.

We want:

```text
Consistency
+
Grounded answers
```

rather than creative variation.

Remember:

> Low temperature doesn't guarantee truth.

If retrieval is wrong, the model can still confidently produce a wrong answer.

---

# 6. Build the Context

Modify `src/index.ts`:

```typescript
import { retrieve } from "./retrieve";
import { generateAnswer } from "./generate";

async function main() {
  const question =
    "What backend technologies does SyncTask use?";

  const results = await retrieve(question);

  const documents = results.documents?.[0] ?? [];
  const metadatas = results.metadatas?.[0] ?? [];

  const context = documents
    .map((document, index) => {
      const source = metadatas[index]?.source ?? "unknown";

      return `
SOURCE: ${source}

${document}
`;
    })
    .join("\n---\n");

  console.log("\nRETRIEVED CONTEXT:\n");
  console.log(context);

  const answer = await generateAnswer(
    question,
    context
  );

  console.log("\nANSWER:\n");
  console.log(answer);
}

main().catch(console.error);
```

---

# 7. Now Your Pipeline Is Complete

Run:

```bash
npx tsx src/index.ts
```

The flow becomes:

```text
"What backend technologies does SyncTask use?"
                    │
                    ▼
             nomic-embed-text
                    │
                    ▼
                Vector
                    │
                    ▼
                ChromaDB
                    │
                    ▼
        ┌─────────────────────┐
        │ Node.js / Express   │
        │ Node.js / Express   │
        │ MongoDB             │
        └──────────┬──────────┘
                   │
                   ▼
                Prompt
                   │
                   ▼
              Qwen 1.5B
                   │
                   ▼
          Generated Answer
```

---

# 8. The Most Important Debugging Technique

Print the retrieved context.

Always.

During development:

```text
RETRIEVED CONTEXT
────────────────────────────

SOURCE: synctask.md

The backend uses Node.js and Express.js.

SOURCE: synctask.md

MongoDB is used as the primary application database.
```

Then:

```text
ANSWER
────────────────────────────

SyncTask uses Node.js, Express.js and MongoDB...
```

Why?

Because if the answer is wrong, you can immediately ask:

### Was retrieval correct?

```text
YES
```

Then investigate:

```text
Prompt
LLM
```

Or:

```text
NO
```

Then investigate:

```text
Chunking
Embedding
Retrieval
```

This gives you a powerful debugging tree:

```text
                 Wrong Answer
                      │
             ┌────────┴────────┐
             ▼                 ▼
       Wrong Retrieval     Correct Retrieval
             │                 │
             ▼                 ▼
        Fix RAG layer      Inspect Generation
```

---

# 9. Test These Questions

Run at least these:

```text
1. What frontend technologies does SyncTask use?

2. What backend technologies does SyncTask use?

3. What database does SyncTask use?

4. How does SyncTask handle caching?

5. Does SyncTask use Docker?

6. What cloud platform is mentioned?

7. Does SyncTask use Kubernetes?

8. What programming language is used for the backend?
```

The last two are particularly interesting.

Your documents may **not contain Kubernetes**.

The system should ideally say:

```text
"The provided knowledge base does not mention Kubernetes."
```

rather than:

```text
"SyncTask uses Kubernetes."
```

---

# 10. Hallucination Test

Ask:

```text
Does SyncTask use PostgreSQL?
```

But your documents say:

```text
MongoDB
```

and don't mention PostgreSQL.

Observe what Qwen does.

This is an important experiment.

You may discover:

```text
Retrieved context:
MongoDB

LLM:
SyncTask uses MongoDB and PostgreSQL...
```

If that happens, you have demonstrated a **grounding failure**.

Don't hide it.

Record it.

That's exactly the type of failure an AI engineer needs to understand.

---

# 11. Why Prompt Instructions Aren't Enough

You might think:

```text
"Don't hallucinate."
```

will solve the problem.

It doesn't.

A reliable system requires multiple layers:

```text
Good retrieval
      +
Good context construction
      +
Strong instructions
      +
Appropriate model
      +
Output validation
      +
Evaluation
```

This is why:

> **Prompt engineering alone isn't AI engineering.**

---

# 12. Source Attribution

Our context currently includes:

```text
SOURCE: synctask.md
```

This allows the model to mention sources.

But eventually we should make citations more structured:

```text
Answer:

SyncTask uses Node.js and Express.js for the backend.

Sources:
[1] synctask.md — Backend
```

A production RAG system should ideally preserve:

```text
document ID
chunk ID
source
section
retrieval score
```

throughout the pipeline.

---

# 13. Metadata Should Become Richer

Instead of:

```typescript
{
  source: "synctask.md"
}
```

eventually use something like:

```typescript
{
  source: "synctask.md",
  project: "SyncTask",
  section: "backend",
  type: "technical-document",
}
```

Then you can perform queries like:

```text
project = "SyncTask"
```

before semantic retrieval or as part of retrieval filtering, depending on your vector-store capabilities.

This is called **metadata filtering**.

---

# 14. A More Production-Oriented Pipeline

Your simple implementation:

```text
Question
 ↓
Embedding
 ↓
ChromaDB
 ↓
Top-K
 ↓
LLM
```

A more mature RAG architecture becomes:

```text
                    Question
                       │
                       ▼
                 Query Processing
                       │
                       ▼
                  Embedding
                       │
                       ▼
              Metadata Filtering
                       │
                       ▼
                Vector Retrieval
                       │
                       ▼
                    Top-K
                       │
                       ▼
                   Reranking
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
               Output Validation
                       │
                       ▼
                    Answer
```

We're going to build toward this.

---

# 15. Engineering Challenge

Now deliberately break your system.

Change:

```typescript
nResults: 3
```

to:

```typescript
nResults: 1
```

Then ask:

```text
What technologies does SyncTask use?
```

Observe what happens.

Then change it to:

```typescript
nResults: 5
```

Compare the retrieved context.

Record:

```text
Top-K
Retrieved chunks
Answer
Latency
```

You're beginning your first real **RAG experiment**.

---

# 16. Interview Questions

Answer these:

### Q1

What is the difference between:

```text
Retrieval failure
```

and:

```text
Generation failure
```

### Q2

Why should we inspect retrieved chunks before debugging the LLM?

### Q3

Why doesn't:

```text
"Don't hallucinate"
```

guarantee a hallucination-free system?

### Q4

Why should RAG systems preserve source metadata?

### Q5

What happens when `top-k` is too high?

---

# 17. System Design Challenge

Design a **Personal Knowledge AI** for your own technical knowledge.

Sources:

```text
resume
projects
AI notes
system design notes
DSA notes
technical documentation
```

A user asks:

```text
"What did I use Redis for?"
```

Design the full pipeline:

```text
                    Question
                       │
                       ▼
                      ???
                       │
                       ▼
                      ???
                       │
                       ▼
                      ???
                       │
                       ▼
                    Answer
```

Specify:

* embedding model
* vector DB
* metadata
* top-k
* context construction
* LLM
* hallucination handling
* source citation

---

# 18. Your First Real AI Engineering Principle

At this point, remember:

```text
                 AI Application
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
     Retrieval      Context       Generation
        │          Engineering         │
        ▼              │              ▼
    Embeddings          │             LLM
        │               │              │
        ▼               ▼              ▼
    ChromaDB        Prompting       Qwen
```

**Don't blame the LLM for every bad answer.**

An AI application is a pipeline.

When something fails, locate the failing stage.

---

## Next Lesson — RAG Evaluation

We're going to stop asking:

> "Does my RAG seem to work?"

and start measuring:

```text
Retrieval Precision
Retrieval Recall
Hit Rate
MRR
Context Relevance
Faithfulness
Answer Relevance
Hallucination
```

We'll create a small **golden dataset** for SyncTask and evaluate your local RAG system systematically.

That is the point where this moves from a **demo** toward **real AI engineering**.
