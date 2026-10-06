# Lesson 5 — Quantization: How LLMs Fit on Your Mac

You have already used:

```text
qwen2.5:1.5b
Q4_K_M
```

Now we're going to understand what **Q4\_K\_M actually means** and why quantization is fundamental to local AI engineering.

---

## 1. Today's Objective

You will understand:

* Model weights
* FP32, FP16, INT8, INT4
* Quantization
* Why quantization reduces memory
* Accuracy vs memory trade-offs
* What `Q4_K_M` means at a practical level
* Why quantization affects local inference
* Quantization vs model size

---

# 2. Why Quantization Matters

Imagine a model has:

```text
1.5 billion parameters
```

Every parameter needs to be represented numerically.

If we use high-precision numbers:

```text
FP32
```

each parameter requires approximately:

```text
4 bytes
```

So roughly:

```text
1.5B × 4 bytes
≈ 6 GB
```

That's already significant before accounting for additional runtime memory.

But if we represent weights using approximately **4 bits**:

```text
1.5B × 4 bits
```

the weight storage becomes dramatically smaller.

That's the basic motivation behind quantization.

---

# 3. What Are Model Weights?

A neural network contains millions, billions, or more numerical parameters.

Conceptually:

```text
Model
 │
 ├── Weight
 ├── Weight
 ├── Weight
 ├── Weight
 ├── ...
 └── billions of weights
```

These weights encode patterns learned during training.

For example:

```text
Input
  ↓
Weights
  ↓
Neural network computation
  ↓
Output
```

The weights aren't manually written rules like:

```text
if question contains "React":
    answer "React"
```

They're learned numerical values.

---

# 4. What Is FP32?

FP32 means:

> **32-bit floating-point representation**

Each value uses approximately:

```text
32 bits
=
4 bytes
```

Example:

```text
0.12345678
```

FP32 provides relatively high numerical precision.

But for inference, we often don't need every weight represented with 32-bit precision.

That's where quantization comes in.

---

# 5. FP16

FP16 uses:

```text
16 bits
=
2 bytes
```

Compared with FP32:

```text
FP32
4 bytes / parameter

FP16
2 bytes / parameter
```

So approximately:

```text
50% less weight memory
```

with some reduction in numerical precision.

---

# 6. INT8

INT8 uses:

```text
8 bits
=
1 byte
```

So compared with FP32:

```text
FP32 → 4 bytes
INT8 → 1 byte
```

Approximately:

```text
75% reduction
```

in raw weight storage.

---

# 7. INT4

INT4 uses:

```text
4 bits
=
0.5 bytes
```

Compared with FP32:

```text
FP32 → 32 bits
INT4 → 4 bits
```

That's an **8× reduction** in raw representation size.

This is why 4-bit quantized models are so attractive for local inference.

---

# 8. The Trade-off

Quantization isn't free.

You're reducing numerical precision.

Conceptually:

```text
Higher precision
      │
      │ better numerical fidelity
      │
      ▼
FP32
FP16
INT8
INT4
      ▲
      │
      │ smaller memory
      │
      ▼
Lower precision
```

So the engineering problem becomes:

> How much precision can we remove before model quality becomes unacceptable?

---

# 9. Quantization Is Not Simply "Delete Digits"

This is an important misconception.

Suppose the original weight is:

```text
0.734821
```

You shouldn't imagine quantization simply doing:

```text
0.734821 → 0.73
```

Modern quantization methods generally use **scaling and mapping strategies** to represent ranges of values with fewer bits.

Conceptually:

```text
Original floating-point values

[-1.0 ... +1.0]

             ↓
       Quantization

4-bit representation

[0 ... 15]
```

A scale/zero-point or related scheme allows the low-bit representation to approximate the original values.

The exact method depends on the quantization format.

---

# 10. Your `Q4_K_M`

You've been using:

```text
qwen2.5:1.5b
```

with a quantized variant such as:

```text
Q4_K_M
```

The important part for you is:

```text
Q4
```

It indicates approximately **4-bit weight quantization**.

The `K` and `M` refer to details of the quantization scheme used by the GGUF ecosystem, including how quantization is organized into blocks and how different tensors/groups are treated.

Don't memorize the letters yet.

The important engineering insight is:

> **Q4\_K\_M is a specific 4-bit quantization format designed to provide a useful memory/quality trade-off.**

---

# 11. Why Can Your Mac Run It?

Without quantization:

```text
Large model
     ↓
Large weight memory
     ↓
Potentially requires substantial RAM/VRAM
```

With quantization:

```text
Large model
     ↓
Quantized weights
     ↓
Much smaller memory footprint
     ↓
Local inference becomes practical
```

That's one of the foundations of the local-AI ecosystem.

---

# 12. But Model Size ≠ Runtime Memory

This is a very important AI Engineering concept.

Suppose:

```text
Model weights ≈ 1 GB
```

That does **not** mean the model needs exactly 1 GB RAM while running.

Runtime memory can include:

```text
Weights
+
KV cache
+
Activations
+
Runtime buffers
+
Context
+
Other overhead
```

Conceptually:

```text
             Runtime Memory
┌──────────────────────────────┐
│ Model weights                │
│                              │
│ KV cache                     │
│                              │
│ Activations                  │
│                              │
│ Runtime overhead             │
└──────────────────────────────┘
```

This becomes especially important when we discuss **long context windows**.

---

# 13. KV Cache

Here's your first introduction to an important inference optimization.

During autoregressive generation, the model repeatedly processes context.

It would be wasteful to recompute everything from scratch every time.

Transformers therefore maintain cached **Key/Value states** for previously processed tokens.

Conceptually:

```text
Token 1
   ↓
K,V
   ↓
Cache

Token 2
   ↓
K,V
   ↓
Cache

Token 3
   ↓
K,V
   ↓
Cache
```

During generation:

```text
New token
   ↓
Attention
   ↓
Reuse previous K/V
   ↓
Generate next token
```

The KV cache improves generation efficiency but consumes memory.

And:

> **Longer context → potentially larger KV cache.**

---

# 14. Quantization vs Context

Consider:

```text
Model:
Q4 quantized

Context:
4K tokens
```

versus:

```text
Same model:
Q4 quantized

Context:
32K tokens
```

The weights haven't changed.

But runtime memory requirements can increase because of the larger context/KV cache.

This is why:

> **"The model is only 1 GB"**

doesn't tell you the complete hardware requirement.

---

# 15. RAG Connection

This matters directly to your local RAG project.

Your architecture:

```text
             User Question
                   │
                   ▼
             Embedding Model
                   │
                   ▼
                ChromaDB
                   │
                   ▼
             Retrieved Context
                   │
                   ▼
             Qwen Q4 Model
                   │
                   ▼
                 Answer
```

If you retrieve too many huge chunks:

```text
More context
     ↓
More tokens
     ↓
Larger KV cache
     ↓
More memory
     ↓
Potentially slower inference
```

So retrieval quality and inference efficiency are connected.

You shouldn't retrieve:

> "Everything that might be useful."

You want:

> **The smallest amount of high-quality context that allows the model to answer correctly.**

That principle becomes extremely important in advanced RAG.

---

# 16. Engineering Trade-off

Imagine three versions of a model:

```text
Model A
FP16
Quality: high
Memory: high

Model B
INT8
Quality: slightly reduced
Memory: lower

Model C
4-bit
Quality: potentially lower
Memory: much lower
```

The correct engineering choice depends on:

```text
Quality requirements
+
Latency
+
Hardware
+
Memory
+
Throughput
+
Cost
```

There is no universal:

> "Use 4-bit."

---

# 17. Local AI Architecture

Your Mac-based stack is now becoming:

```text
                 MacBook
                    │
       ┌────────────┴────────────┐
       │                         │
    Ollama                   ChromaDB
       │                         │
       │                    Vector Storage
       │
 ┌─────┴─────────┐
 │               │
Qwen          Embedding
Q4 model       model
 │               │
 │               │
Generation    Retrieval
```

This is a genuine **local AI architecture**, not merely an LLM demo.

---

# 18. Debugging Scenario

Suppose you change:

```text
qwen2.5:1.5b Q4
```

to a much larger model and suddenly your Mac becomes extremely slow.

Possible reasons:

```text
Model weights larger
        +
More memory pressure
        +
CPU/GPU limitations
        +
KV cache
        +
Context length
        +
Memory bandwidth
```

The solution isn't automatically:

> "Use a smaller context."

You need to identify the actual bottleneck.

That's the engineering mindset we're building.

---

# 19. Engineering Challenge

Suppose you have:

```text
Model:
1.5B parameters
```

Compare the **approximate raw weight storage** for:

```text
FP32
FP16
INT8
INT4
```

Don't worry about runtime overhead.

Calculate:

```text
Parameters × bytes per parameter
```

Use:

```text
1 byte = 8 bits
```

Try it yourself.

---

# 20. Interview Questions

Answer these:

1. **What is quantization?**
2. **Why does INT4 require less memory than FP16?**
3. **What does Q4 mean in Q4\_K\_M?**
4. **Why isn't model file size equal to total runtime memory?**
5. **What is KV cache and why does it matter for long context?**

---

# 21. System Design Question

You're designing a local coding assistant.

You have:

```text
MacBook
16 GB RAM
```

You can choose:

```text
Small 4-bit model
vs
Large FP16 model
```

You need:

* acceptable response quality
* reasonable latency
* RAG
* 16K-token context
* multiple tool calls

What factors would you evaluate before choosing the model?

Think like an AI engineer:

```text
Model quality
Memory
Latency
Context
KV cache
Quantization
Throughput
```

---

## Next Lesson

After this we'll connect the pieces with **Inference Architecture**:

```text
Prompt
  ↓
Tokenizer
  ↓
Prefill
  ↓
KV Cache
  ↓
Decode
  ↓
Sampling
  ↓
Next Token
  ↓
...
```

You'll learn the difference between **prefill and decode**, why the **first token can be slow while later tokens are faster**, and why **TTFT and tokens/sec** are important production metrics.
