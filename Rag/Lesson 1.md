Lesson 1 — How an LLM Application Actually Works

We’ll establish the mental model:

```text
                    USER
                     │
                     ▼
              ┌──────────────┐
              │ Application  │
              │ Next.js/Node │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │    Prompt    │
              │ + Context    │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │     LLM      │
              │   Ollama     │
              └──────┬───────┘
                     │
             token generation
                     │
                     ▼
              ┌──────────────┐
              │   Response   │
              └──────────────┘
```

Then we'll progressively add the pieces that turn this into an actual AI system:

```text
                    ┌───────────────┐
                    │     User      │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  AI Backend   │
                    └───────┬───────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
          Prompt         Retrieval        Tools
             │              │              │
             │              ▼              │
             │          Embeddings         │
             │              │              │
             │              ▼              │
             │          ChromaDB            │
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                         Ollama
                            │
                            ▼
                          LLM
                            │
                            ▼
                       Evaluation
```

### Your first engineering principle

Don't think:

> **"I am learning LangChain."**

Think:

> **"I am learning how to construct reliable systems around probabilistic language models."**

LangChain, LangGraph, ChromaDB, Ollama, MCP, etc. are tools. The underlying architecture is what you need to master.

---

### Your first challenge

Before I teach the answer, explain these three things in your own words:

**1. What happens when a user sends:**

```text
"What technologies did I use in SyncTask?"
```

to your local AI application?

**2. What is the difference between:**

```text
Embedding Model
vs
LLM
```

**3. What exactly does ChromaDB do?**

Don't worry about being perfect. I'll evaluate your mental model, correct the gaps, and then we'll start **Lesson 1 properly**.
