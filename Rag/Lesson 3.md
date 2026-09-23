# Lesson 3 — Transformers & Attention

We’ll now move from **“how to use an LLM”** to **“what is happening inside the LLM.”**

This is a critical foundation for interviews and for understanding why modern LLMs work.

---

## 1. Today's Objective

Understand:

* Transformer architecture
* Encoder vs decoder
* Self-attention
* Query, Key, Value
* Attention scores
* Multi-head attention
* Positional information
* Feed-forward networks
* Why Transformers replaced older sequence architectures for many NLP workloads

---

# 2. Why It Matters

When you use:

```text
Ollama
   ↓
Qwen
   ↓
Answer
```

you shouldn't think of Qwen as a mysterious black box.

At a simplified level:

```text
Text
 ↓
Tokens
 ↓
Embeddings
 ↓
Transformer layers
 ↓
Attention
 ↓
Feed Forward
 ↓
Next-token prediction
 ↓
Text
```

Understanding this helps you reason about:

* context windows
* hallucination
* long-context behavior
* model size
* inference latency
* KV cache
* quantization
* model architecture

---

# 3. What Problem Were Transformers Designed to Solve?

Consider:

```text
"The developer who worked on the project yesterday
said that it was difficult."
```

What does **"it"** refer to?

A language model needs to understand relationships between words that may be far apart.

Older sequence models processed text sequentially.

Conceptually:

```text
Token 1
   ↓
Token 2
   ↓
Token 3
   ↓
Token 4
   ↓
...
```

Transformers introduced a mechanism allowing tokens to directly interact with other relevant tokens through **attention**.

```text
Token 1 ───────► Token 5
   │                ▲
   └──────► Token 3 ┘
```

---

# 4. Transformer Architecture

A simplified decoder-style Transformer used by many modern LLMs looks like:

```text
                 Input Tokens
                      │
                      ▼
                Token Embeddings
                      │
                      ▼
              Positional Information
                      │
                      ▼
          ┌─────────────────────────┐
          │     Transformer Block   │
          │                         │
          │   Self-Attention        │
          │          │              │
          │          ▼              │
          │   Add & Normalize       │
          │          │              │
          │          ▼              │
          │   Feed Forward Network  │
          │          │              │
          │          ▼              │
          │   Add & Normalize       │
          └────────────┬────────────┘
                       │
                    repeated
                       │
                       ▼
                Output Representation
                       │
                       ▼
                 Linear Layer
                       │
                       ▼
                Token Probabilities
                       │
                       ▼
                Next Token
```

A real model contains many Transformer blocks.

---

# 5. Self-Attention

This is the heart of the Transformer.

Suppose:

```text
"JavaScript developer builds applications"
```

When processing:

```text
"developer"
```

the model can determine which other tokens are relevant.

Conceptually:

```text
JavaScript ────────┐
                   │
developer ◄────────┼── attention
                   │
builds ────────────┤
                   │
applications ──────┘
```

The model calculates how strongly tokens should attend to one another.

---

# 6. Query, Key, Value

This is one of the most important interview concepts.

Every token representation is transformed into three vectors:

```text
             Token Representation
                      │
             ┌────────┼────────┐
             ▼        ▼        ▼
            Query     Key     Value
             Q        K        V
```

Think conceptually:

### Query

> What information am I looking for?

### Key

> What information do I contain that might be relevant?

### Value

> What information should I actually provide?

---

# 7. Attention Calculation

The simplified attention formula is:

```text
Attention(Q,K,V)
=
softmax(QKᵀ / √dₖ)V
```

Don't memorize it blindly.

Understand the flow:

```text
Q × Kᵀ
   ↓
Similarity scores
   ↓
Scale
   ↓
Softmax
   ↓
Attention weights
   ↓
Weighted combination of V
```

Example:

```text
             "developer"
                  │
                  ▼
              Query Q
                  │
          compare against
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
 JavaScript    builds    applications
    Key          Key          Key
       │          │          │
       └──────────┼──────────┘
                  ▼
          Attention scores
```

Suppose conceptually:

```text
JavaScript    → 0.50
builds        → 0.20
applications  → 0.30
```

Those values represent how much attention the current token gives to those tokens.

---

# 8. Why Softmax?

The raw attention scores are converted into normalized weights.

For example:

```text
Raw scores:

[2.0, 1.0, 0.5]
```

After softmax:

```text
[0.63, 0.23, 0.14]
```

Now the weights sum approximately to:

```text
1.0
```

This allows the model to construct a weighted representation.

---

# 9. Multi-Head Attention

One attention mechanism isn't enough.

Different relationships may matter simultaneously.

For example:

```text
Head 1 → syntax
Head 2 → semantic relationship
Head 3 → subject/object relationship
Head 4 → positional relationship
...
```

Conceptually:

```text
                 Input
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
     Head 1      Head 2     Head 3
        │          │          │
        ▼          ▼          ▼
   Attention    Attention   Attention
        │          │          │
        └──────────┼──────────┘
                   ▼
               Concatenate
                   │
                   ▼
               Projection
```

This is **Multi-Head Attention**.

---

# 10. Causal Attention

Now we reach an extremely important concept for LLMs.

When generating:

```text
"The developer is"
```

the model shouldn't be allowed to see future tokens:

```text
"The developer is building applications"
                    ↑
              future tokens
```

During autoregressive generation:

```text
Token 1 → can see Token 1
Token 2 → can see Tokens 1-2
Token 3 → can see Tokens 1-3
Token 4 → can see Tokens 1-4
```

Conceptually:

```text
       1   2   3   4
1      ✓   ✗   ✗   ✗
2      ✓   ✓   ✗   ✗
3      ✓   ✓   ✓   ✗
4      ✓   ✓   ✓   ✓
```

This is called a **causal mask**.

It prevents the model from cheating by looking at future tokens.

---

# 11. Feed-Forward Network

After attention, the representation passes through a feed-forward network.

Simplified:

```text
Attention output
       │
       ▼
Linear layer
       │
       ▼
Activation
       │
       ▼
Linear layer
       │
       ▼
Output
```

The attention mechanism determines:

> **Which information should interact?**

The feed-forward network performs transformations on the resulting representations.

---

# 12. Residual Connections

Transformer blocks also use residual connections.

Conceptually:

```text
Input ─────────────────────┐
  │                        │
  ▼                        │
Attention                  │
  │                        │
  ▼                        │
Normalization              │
  │                        │
  └──────────────► + ◄─────┘
                    │
                    ▼
                   Output
```

This helps information and gradients flow through deep networks.

You'll see this architecture repeatedly when studying model internals.

---

# 13. The Complete Picture

Now connect everything we've learned:

```text
User Text
    │
    ▼
Tokenizer
    │
    ▼
Token IDs
    │
    ▼
Token Embeddings
    │
    ▼
Transformer Block
    │
    ├── Self-Attention
    │      │
    │      ├── Query
    │      ├── Key
    │      └── Value
    │
    ├── Residual + Norm
    │
    ├── Feed Forward
    │
    └── Residual + Norm
    │
    ▼
Repeated Transformer Blocks
    │
    ▼
Logits
    │
    ▼
Probability Distribution
    │
    ▼
Sampling / Selection
    │
    ▼
Next Token
```

Then:

```text
Next Token
    ↓
added to context
    ↓
run prediction again
    ↓
next token
    ↓
...
```

That's how an autoregressive LLM generates a response.

---

# 14. RAG Connection

Now your RAG understanding becomes much stronger.

Your RAG system:

```text
                    RAG
                     │
          ┌──────────┴──────────┐
          │                     │
       Retrieval             Generation
          │                     │
          ▼                     ▼
Embedding Model                LLM
          │                     │
          ▼                     ▼
      ChromaDB             Transformer
          │                     │
          ▼                     ▼
    Relevant Context       Generated Answer
```

The embedding model helps retrieve information.

The Transformer-based LLM uses the supplied context to generate the answer.

---

# 15. Engineering Challenge

No code yet.

Consider:

```text
User:
"What technologies did I use in SyncTask?"

Retrieved context:

"SyncTask uses Next.js for the frontend.
The backend uses Node.js and Express.
MongoDB stores application data."
```

Explain:

### Question 1

Why does the LLM need **attention** when processing the question and retrieved context?

### Question 2

What might happen if the context contains:

```text
Next.js
Python
Django
Node.js
Express
```

but the user asks specifically about the **frontend**?

### Question 3

Why is the model's answer not simply copied from ChromaDB?

---

# 16. Interview Questions

Try these without looking anything up:

1. **What is self-attention?**
2. **What are Query, Key and Value?**
3. **Why do Transformers use multiple attention heads?**
4. **What is causal attention?**
5. **Why does an autoregressive LLM generate tokens sequentially?**

---

# 17. System Design Question

You're designing:

> **A local coding assistant using Qwen + RAG.**

Architecture:

```text
Developer
    │
    ▼
Question
    │
    ▼
Code Retrieval
    │
    ▼
Relevant source files
    │
    ▼
Qwen
    │
    ▼
Explanation / Fix
```

Now consider a repository with:

```text
100,000 lines of code
```

You obviously cannot blindly place all of it into the prompt.

Design the retrieval strategy.

Think about:

* chunking
* embeddings
* metadata
* top-k
* file paths
* programming language
* symbols/functions
* context window

---

## Your next task

Answer just these **5 questions**:

```text
1. What problem does self-attention solve?

2. What are Query, Key and Value?

3. What does causal attention prevent?

4. Why does an LLM generate one token at a time?

5. In a RAG system, what is the difference between
   retrieval and generation?
```

After that we'll move into **Temperature → Sampling → Logits → Top-K → Top-P**, which will explain why the same LLM can produce different answers from the same prompt.
