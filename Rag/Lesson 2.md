Let's move to the **next concept: Tokens**. This is important because embeddings, LLM inference, context windows, cost, latency, and truncation all depend on understanding tokens.

# Lesson 2 — Tokens: The Fundamental Unit of LLMs

## 1. Today's Objective

Understand:

* What tokens are
* Why LLMs use tokens instead of raw words
* Tokens vs words vs characters
* Tokenization
* Input vs output tokens
* Context windows
* Why token count affects performance
* How tokens relate to embeddings and LLM generation

---

## 2. Why It Matters

When you send:

```text
"What technologies did I use in SyncTask?"
```

the LLM doesn't literally process the sentence as human-readable words.

It first goes through:

```text
Text
 ↓
Tokenizer
 ↓
Token IDs
 ↓
Neural network
 ↓
Next-token prediction
 ↓
Token IDs
 ↓
Text
```

This is the foundation of how an LLM processes language.

---

# 3. What Is a Token?

A token is a unit of text selected by a tokenizer.

A token might be:

```text
word
part of a word
punctuation
space-related fragment
special symbol
```

For example, conceptually:

```text
"unbelievable"
```

might be split into something like:

```text
"un"
"believ"
"able"
```

The exact tokenization depends on the model/tokenizer.

Therefore:

> **Token ≠ word**

One word can become multiple tokens.

---

# 4. Tokenization Pipeline

Consider:

```text
I love building AI systems.
```

Conceptually:

```text
"I love building AI systems."
             ↓
        Tokenizer
             ↓
┌─────────────────────────┐
│ I                       │
│ love                    │
│ building                │
│ AI                      │
│ systems                 │
│ .                       │
└─────────────────────────┘
```

The tokenizer then maps these pieces to numerical IDs:

```text
Text
 ↓
Tokens
 ↓
Token IDs
 ↓
[ ... numerical IDs ... ]
```

The neural network operates on numerical representations, not strings.

---

# 5. Token vs Embedding

This distinction is extremely important.

You previously learned:

```text
Text
 ↓
Embedding model
 ↓
Vector
```

But there's another step internally.

Conceptually:

```text
Text
 ↓
Tokenizer
 ↓
Token IDs
 ↓
Model
 ↓
Vector representations
```

For an embedding model:

```text
"What is SyncTask?"
        ↓
     Tokenizer
        ↓
   Token IDs
        ↓
Embedding model
        ↓
Embedding vector
```

For an LLM:

```text
"What is SyncTask?"
        ↓
     Tokenizer
        ↓
   Token IDs
        ↓
Transformer
        ↓
Next-token probabilities
        ↓
Generated tokens
        ↓
Text
```

---

# 6. LLM Generation

This is one of the most important concepts you'll learn.

Suppose you ask:

```text
What is SyncTask?
```

The model doesn't generate the entire answer simultaneously.

Conceptually:

```text
"What is SyncTask?"
        ↓
predict next token
        ↓
"SyncTask"
        ↓
predict next token
        ↓
"is"
        ↓
predict next token
        ↓
"a"
        ↓
predict next token
        ↓
"productivity"
        ↓
...
```

So:

> **Autoregressive LLMs generate output token by token.**

Each newly generated token becomes part of the context used to predict the next token.

---

# 7. Context Window

Now we connect tokens to something you'll encounter constantly in RAG.

Suppose a model has a context window of:

```text
32,768 tokens
```

That means the model can process a bounded amount of tokenized information in a single context.

Conceptually:

```text
┌─────────────────────────────┐
│        Context Window       │
│                             │
│ System Prompt               │
│ User Question               │
│ Conversation History        │
│ Retrieved RAG Chunks         │
│ Tool Results                │
│ Generated Output            │
│                             │
│       Token Limit           │
└─────────────────────────────┘
```

This is why RAG systems need good retrieval.

If you retrieve:

```text
Top 5 chunks
```

and each chunk is huge, you may waste a large portion of the context window.

Later we'll learn:

**Context engineering**

rather than simply:

**"Put everything into the prompt."**

---

# 8. RAG Connection

Your RAG pipeline is becoming:

```text
User Question
      │
      ▼
   Tokenize
      │
      ▼
Embedding Model
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
   Tokenization
      │
      ▼
      LLM
      │
      ▼
Generated Tokens
      │
      ▼
    Answer
```

Notice there are **different model operations** happening.

Don't collapse everything into "embedding".

---

# 9. Important Correction to Your Earlier Mental Model

Earlier you said:

> embedding model → convert text to token

The better model is:

```text
                 TOKENIZATION
Text ─────────────────────────► Token IDs
                                   │
                                   ▼
                              Model processing
                                   │
                         ┌─────────┴─────────┐
                         ▼                   ▼
                  Embedding Model           LLM
                         │                   │
                         ▼                   ▼
                      Vector          Generated tokens
```

Tokenization and embeddings are **not the same thing**.

---

# 10. Local Experiment

Since you're using Ollama, inspect your model:

```bash
ollama list
```

You have been using:

```text
qwen2.5:1.5b
nomic-embed-text
```

For this lesson, think about them as:

```text
nomic-embed-text
        ↓
   Text → embedding

qwen2.5:1.5b
        ↓
   Text → generated text
```

We'll later inspect tokenization and context behavior more directly.

---

# 11. Engineering Challenge

Suppose you have this RAG prompt:

```text
System:
You are an AI assistant.

Context:
[10 large document chunks]

Question:
What technologies did I use in SyncTask?
```

The answer becomes poor even though the correct information exists in the documents.

Give me **three possible reasons** related to today's concepts.

Think about:

```text
tokens
context window
retrieved context
```

Don't look for the answer yet.

---

# 12. Interview Questions

Answer these next:

**Q1. What is a token?**

**Q2. Is one token always equal to one word?**

**Q3. Why does token count matter for an LLM application?**

**Q4. What is a context window?**

**Q5. Why does a RAG system need to care about context size?**

---

# 13. System Design

Consider:

> You are building a resume RAG assistant. A user's resume is only 2 pages, but the knowledge base eventually contains 10,000 documents.

Design the context flow:

```text
10,000 documents
       ↓
      ???
       ↓
   LLM context
       ↓
    Answer
```

Your goal is to explain **why we cannot simply send all 10,000 documents to the LLM**.

---

## Your task now

Don't move to code yet.

Answer these five:

```text
Q1. What is a token?

Q2. Token vs embedding — what is the difference?

Q3. What is a context window?

Q4. Why can't we send 10,000 documents directly to the LLM?

Q5. What happens when an LLM generates an answer?
```

Once you can explain these clearly, we'll move to **Lesson 3: Transformers → Attention → Why LLMs actually work**.
