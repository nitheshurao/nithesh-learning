# Lesson 10 — RAG Evaluation: Stop Guessing, Start Measuring

You've now built the basic pipeline:

```text
Question
   ↓
Embedding
   ↓
ChromaDB
   ↓
Retrieved chunks
   ↓
Prompt
   ↓
Qwen
   ↓
Answer
```

The next problem is critical:

> **How do we know whether our RAG system is actually good?**

A demo that answers five questions correctly proves very little.

We need an **evaluation framework**.

---

# 1. Today's Objective

You'll learn:

* Golden datasets
* Ground-truth answers
* Retrieval evaluation
* Precision
* Recall
* Hit Rate
* MRR
* Context relevance
* Answer relevance
* Faithfulness
* Hallucination
* Regression testing

And we'll turn your SyncTask RAG into an experiment we can measure.

---

# 2. Why Evaluation Matters

Imagine two RAG systems.

### System A

```text
100 questions
72 correct
```

### System B

```text
100 questions
91 correct
```

Now you have evidence.

Without evaluation, you might say:

> "System B feels better."

That's not engineering.

Instead:

```text
Experiment
   ↓
Dataset
   ↓
Metrics
   ↓
Results
   ↓
Change
   ↓
Re-run
```

This is how we'll approach AI systems.

---

# 3. Golden Dataset

A **golden dataset** is a collection of questions with expected answers and/or expected relevant documents.

For SyncTask:

```json
[
  {
    "question": "What frontend technologies does SyncTask use?",
    "expectedSources": ["synctask.md"]
  },
  {
    "question": "What backend technologies does SyncTask use?",
    "expectedSources": ["synctask.md"]
  },
  {
    "question": "What database does SyncTask use?",
    "expectedSources": ["synctask.md"]
  }
]
```

A stronger dataset also stores expected answers:

```json
{
  "question": "What database does SyncTask use?",
  "expectedAnswer": "MongoDB",
  "expectedSources": ["synctask.md"]
}
```

---

# 4. Why Ground Truth Matters

Suppose your system produces:

```text
"SyncTask uses MongoDB."
```

Looks correct.

But your retrieval system actually retrieved:

```text
architecture.md
```

and the model already knew MongoDB from its pretrained knowledge.

That's a problem.

The answer may be correct while **retrieval failed**.

This is why we evaluate retrieval separately from generation.

---

# 5. Evaluate Retrieval First

Our retrieval pipeline:

```text
Question
   ↓
Embedding
   ↓
ChromaDB
   ↓
Top-K
```

We ask:

> Did the correct chunk appear in the retrieved results?

That's a retrieval evaluation.

---

# 6. Hit Rate

Suppose we have:

```text
100 questions
```

For 85 questions, the correct document appeared somewhere in the retrieved results.

Then:

```text
Hit Rate = 85 / 100
        = 85%
```

Formula:

```text
Hit Rate =
questions with at least one relevant result
/
total questions
```

This is useful for RAG because we first need to know:

> **Can retrieval find the required information at all?**

---

# 7. Precision

Suppose:

```text
Top-K = 5
```

Retrieved:

```text
A ✓ relevant
B ✓ relevant
C ✗ irrelevant
D ✗ irrelevant
E ✗ irrelevant
```

Relevant retrieved documents:

```text
2
```

Total retrieved:

```text
5
```

Precision:

```text
2 / 5 = 0.40
```

So:

```text
Precision = 40%
```

Meaning:

> Of what we retrieved, how much was relevant?

---

# 8. Recall

Recall asks a different question:

> **Of all the relevant information available, how much did we retrieve?**

Suppose there are:

```text
4 relevant chunks
```

but we retrieved:

```text
3
```

Then:

```text
Recall = 3 / 4
       = 75%
```

This distinction is important:

```text
Precision
→ Are retrieved results relevant?

Recall
→ Did we retrieve the relevant information that exists?
```

---

# 9. Why Precision and Recall Can Conflict

Suppose:

```text
Top-K = 1
```

You retrieve one highly relevant chunk.

Potentially:

```text
Precision ↑
Recall ↓
```

Increase:

```text
Top-K = 10
```

You might retrieve more relevant information:

```text
Recall ↑
```

but also many irrelevant chunks:

```text
Precision ↓
```

This is why:

> **Top-K is an engineering trade-off, not a magic number.**

---

# 10. MRR — Mean Reciprocal Rank

Now suppose the correct document appears at different positions.

### Query 1

```text
1st result = correct
```

Reciprocal rank:

```text
1 / 1 = 1
```

### Query 2

```text
3rd result = correct
```

```text
1 / 3 = 0.333
```

### Query 3

```text
5th result = correct
```

```text
1 / 5 = 0.2
```

MRR averages these values across queries.

Why useful?

Because in RAG:

> **Finding the correct document at rank 1 is generally more useful than finding it at rank 10.**

---

# 11. Example

Suppose:

```text
Query 1 → correct at #1
Query 2 → correct at #2
Query 3 → correct at #4
```

MRR:

```text
(1/1 + 1/2 + 1/4) / 3

= (1 + 0.5 + 0.25) / 3

= 0.583
```

---

# 12. Context Relevance

Retrieval metrics aren't enough.

Suppose the retrieved chunk is technically related but doesn't contain the information needed to answer the question.

Example:

Question:

```text
"What database does SyncTask use?"
```

Retrieved:

```text
"SyncTask is a productivity application
designed for task management."
```

It's about SyncTask.

But it doesn't answer the question.

So we need to evaluate:

> **Is the retrieved context actually useful for answering the question?**

---

# 13. Answer Relevance

Now evaluate the generated answer.

Question:

```text
"What database does SyncTask use?"
```

Answer:

```text
"SyncTask is a productivity application
for managing tasks."
```

This may be factually true.

But it doesn't answer the question.

Therefore:

```text
Answer relevance = poor
```

---

# 14. Faithfulness

This is one of the most important RAG metrics.

Suppose retrieved context says:

```text
"SyncTask uses MongoDB."
```

LLM answers:

```text
"SyncTask uses MongoDB and PostgreSQL."
```

The second claim isn't supported by the retrieved context.

Therefore:

```text
Faithfulness ↓
```

Faithfulness asks:

> **Is the generated answer supported by the supplied context?**

---

# 15. Hallucination

A hallucination occurs when the model generates unsupported information as if it were factual.

Example:

```text
Context:
SyncTask uses MongoDB.

Answer:
SyncTask uses MongoDB and PostgreSQL
and is deployed on Kubernetes.
```

If the context doesn't support those additional claims:

```text
MongoDB → grounded
PostgreSQL → unsupported
Kubernetes → unsupported
```

That's a grounding/hallucination problem.

---

# 16. Complete RAG Evaluation

Now we have:

```text
                     RAG EVALUATION
                           │
          ┌────────────────┴────────────────┐
          │                                 │
      RETRIEVAL                         GENERATION
          │                                 │
    ┌─────┼─────┐                     ┌─────┼─────┐
    ▼     ▼     ▼                     ▼     ▼     ▼
 Hit    Recall Precision          Relevance Faithfulness
 Rate
    │                                     │
    ▼                                     ▼
  MRR                              Hallucination
```

This gives us a much better view of system quality.

---

# 17. Build Your Golden Dataset

Create:

```text
evaluation/
└── questions.json
```

Start with:

```json
[
  {
    "id": "q1",
    "question": "What frontend technologies does SyncTask use?",
    "expectedAnswer": "React and Next.js",
    "expectedSources": ["synctask.md"]
  },
  {
    "id": "q2",
    "question": "What backend technologies does SyncTask use?",
    "expectedAnswer": "Node.js and Express.js",
    "expectedSources": ["synctask.md"]
  },
  {
    "id": "q3",
    "question": "What database does SyncTask use?",
    "expectedAnswer": "MongoDB",
    "expectedSources": ["synctask.md"]
  },
  {
    "id": "q4",
    "question": "What is Redis used for?",
    "expectedAnswer": "Caching and task coordination",
    "expectedSources": ["synctask.md"]
  },
  {
    "id": "q5",
    "question": "What containerization technology does SyncTask use?",
    "expectedAnswer": "Docker",
    "expectedSources": ["architecture.md"]
  },
  {
    "id": "q6",
    "question": "What cloud platform is mentioned for deployment?",
    "expectedAnswer": "AWS",
    "expectedSources": ["architecture.md"]
  }
]
```

This is your first **evaluation dataset**.

---

# 18. Your First Automated Metric

Let's start simple.

For each question:

```text
Retrieve top-K
      ↓
Check expected source
      ↓
Found?
 YES / NO
```

Pseudo-code:

```typescript
function hitRate(results, expectedSources) {
  const found = results.some(
    result => expectedSources.includes(result.source)
  );

  return found ? 1 : 0;
}
```

Then:

```text
Total hits
───────────
Total queries
```

gives:

```text
Hit Rate
```

Don't build every metric at once.

Start with:

```text
Hit Rate
```

Then add:

```text
Precision
Recall
MRR
```

Then evaluate generation.

---

# 19. Evaluation Architecture

Your project now evolves:

```text
local-rag/
│
├── src/
│   ├── ingestion/
│   ├── retrieval/
│   ├── generation/
│   └── evaluation/
│
├── documents/
│
├── evaluation/
│   └── questions.json
│
├── tests/
│
└── README.md
```

Evaluation becomes a **first-class component**, not an afterthought.

---

# 20. Experiment Design

Run:

```text
Experiment A
top-k = 1

Experiment B
top-k = 3

Experiment C
top-k = 5
```

Measure:


| Configuration | Hit Rate | Precision | MRR | Avg Latency |
| ------------- | -------: | --------: | --: | ----------: |
| K=1           |        ? |         ? |   ? |           ? |
| K=3           |        ? |         ? |   ? |           ? |
| K=5           |        ? |         ? |   ? |           ? |

Don't invent values.

Run the experiment and populate them with actual measurements.

This is exactly the kind of experiment you can later document on LinkedIn.

---

# 21. Engineering Challenge

Here's your assignment.

Run:

```text
K = 1
K = 3
K = 5
```

against your golden dataset.

Record:

```text
question
retrieved sources
rank
hit/miss
latency
```

Then calculate:

```text
Hit Rate
MRR
```

Don't optimize anything yet.

First establish a **baseline**.

---

# 22. Interview Questions

Answer these:

### Q1

What is the difference between precision and recall in RAG?

### Q2

What does Hit Rate measure?

### Q3

Why is MRR useful?

### Q4

What is faithfulness?

### Q5

Can an answer be correct even if retrieval was poor?

This last question is particularly important.

---

# 23. System Design Challenge

Imagine your production RAG system has:

```text
Retrieval Hit Rate: 92%
Answer Accuracy: 71%
```

What does this suggest?

Don't immediately blame ChromaDB.

Think about:

```text
Retrieval
   ↓
Context
   ↓
Prompt
   ↓
LLM
   ↓
Generation
```

The retrieval system is finding relevant information frequently, but something later in the pipeline may be failing.

---

# 24. The AI Engineering Mindset

You're moving from:

```text
"Does my chatbot work?"
```

to:

```text
"What component is failing,
how frequently,
under which conditions,
and can I reproduce it?"
```

That is a major shift from **AI demo development → AI engineering**.

---

## Next Lesson

We'll improve the retrieval system itself:

# **Lesson 11 — Chunking Strategies**

We'll compare:

```text
Fixed-size chunking
        ↓
Paragraph chunking
        ↓
Recursive chunking
        ↓
Markdown-aware chunking
        ↓
Semantic chunking
        ↓
Parent-child retrieval
```

And you'll see why **bad chunking can destroy an otherwise good RAG system**.
