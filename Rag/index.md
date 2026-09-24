Yes. Based on the curriculum we established and the lessons completed so far, you have covered **Lessons 1–13**. Here is the remaining roadmap.

## Completed


| #  | Lesson                                          | Status |
| -- | ----------------------------------------------- | ------ |
| 1  | Embeddings → Vector Search → RAG              | ✅     |
| 2  | Tokens & Tokenization                           | ✅     |
| 3  | Transformers & Attention                        | ✅     |
| 4  | Logits, Temperature, Top-K, Top-P               | ✅     |
| 5  | Quantization                                    | ✅     |
| 6  | Inference, Prefill, Decode & KV Cache           | ✅     |
| 7  | Context Engineering & Prompt Architecture       | ✅     |
| 8  | First Local RAG Implementation                  | ✅     |
| 9  | Complete Local RAG: Retrieval → Prompt → Qwen | ✅     |
| 10 | RAG Evaluation                                  | ✅     |
| 11 | Chunking Strategies                             | ✅     |
| 12 | Advanced Retrieval Concepts                     | ✅     |
| 13 | Advanced RAG Retrieval Service                  | ✅     |

---

# Remaining AI Engineer Mastery Roadmap

## Level 5 — Advanced RAG

### 14. Reranking

* Bi-encoder vs cross-encoder
* Why vector similarity isn't enough
* Reranking pipeline
* Candidate size
* Latency trade-offs
* MRR improvement
* Local reranker options

### 15. Hybrid Search

* BM25
* Keyword search
* Dense vector search
* Sparse vs dense retrieval
* Reciprocal Rank Fusion
* Combining lexical + semantic results

### 16. Query Rewriting & Query Expansion

* Query rewriting
* Query decomposition
* Multi-query retrieval
* HyDE
* When rewriting hurts retrieval
* Original + rewritten query strategy

### 17. Context Compression

* Relevant sentence extraction
* Contextual compression
* Redundancy removal
* Token budget management
* Lost-in-the-middle problem

### 18. Advanced RAG Patterns

* Parent-child retrieval
* Multi-vector retrieval
* Self-query retrieval
* Metadata-aware retrieval
* Adaptive retrieval
* Corrective RAG
* Self-RAG concepts

### 19. RAG Citations & Grounded Answers

* Source attribution
* Citation generation
* Evidence extraction
* Claim → evidence mapping
* Preventing unsupported claims

### 20. Production RAG Pipeline

Build:

```text
Documents
   ↓
Parser
   ↓
Chunker
   ↓
Metadata
   ↓
Embedding
   ↓
Vector DB
   ↓
Hybrid Retrieval
   ↓
Reranking
   ↓
Compression
   ↓
Prompt
   ↓
LLM
   ↓
Citations
```

---

# Level 6 — LangChain & LangGraph

### 21. LangChain Architecture

* Models
* Prompts
* Output parsers
* Retrievers
* Runnable architecture
* LCEL
* What LangChain actually abstracts

### 22. LangChain RAG

* Document loaders
* Text splitters
* Embeddings
* Vector stores
* Retrievers
* Retrieval chains

### 23. Structured Output

* JSON schema
* Zod
* Structured generation
* Validation
* Retry strategies

### 24. Tools & Tool Calling

* Function calling
* Tool schemas
* Tool execution
* Tool errors
* Tool validation

### 25. LangGraph Fundamentals

* State
* Nodes
* Edges
* Conditional routing
* Persistence
* Checkpoints

### 26. LangGraph Workflows

Build:

```text
Question
   ↓
Classify
   ↓
Retrieve
   ↓
Validate Evidence
   ↓
Generate
   ↓
Verify
   ↓
Answer
```

---

# Level 7 — AI Agents

### 27. What Is an AI Agent?

* LLM application vs agent
* Agent loop
* Reasoning + action
* Tools
* State

### 28. ReAct

```text
Thought
  ↓
Action
  ↓
Observation
  ↓
Thought
  ↓
Action
```

* ReAct architecture
* Tool selection
* Failure modes

### 29. Agent Memory

* Conversation state
* Short-term memory
* Long-term memory
* Working memory
* Persistent state
* Memory retrieval

### 30. Planning & Multi-Step Agents

* Task decomposition
* Planning
* Execution
* Verification
* Replanning

### 31. Agent Reliability

* Infinite loops
* Tool failures
* Hallucinated tool calls
* Timeouts
* Retry policies
* Circuit breakers
* Maximum steps

### 32. Human-in-the-Loop

* Approval workflows
* Sensitive actions
* Tool authorization
* Interrupt/resume

### 33. Build: Local AI Software Engineer Agent

Your agent:

```text
User
 ↓
Agent
 ├── Search code
 ├── Read files
 ├── Search documentation
 ├── Run tests
 ├── Analyze errors
 └── Generate solution
```

Using your local:

```text
Ollama
+
ChromaDB
+
Node.js
+
TypeScript
+
LangGraph
```

---

# Level 8 — MCP

### 34. MCP Fundamentals

* MCP architecture
* Client
* Server
* Host
* Transport

### 35. MCP Primitives

* Tools
* Resources
* Prompts
* Sampling

### 36. Build MCP Server

Create your own:

```text
Local Developer MCP Server
```

Tools:

```text
searchCode()
readFile()
searchDocs()
runTests()
```

### 37. MCP Security

* Authentication
* Authorization
* Tool permissions
* Input validation
* Sandboxing
* Untrusted tool output

### 38. MCP Developer Platform

Integrate:

```text
AI Agent
   ↓
MCP
   ├── Files
   ├── Git
   ├── Documentation
   ├── Database
   └── Developer tools
```

---

# Level 9 — AI System Design

### 39. AI System Design Fundamentals

* AI-specific architecture
* Model layer
* Retrieval layer
* Tool layer
* Data layer
* Evaluation layer

### 40. Design ChatGPT-Like System

* Conversation storage
* Streaming
* Context management
* Model routing
* Rate limiting
* Observability

### 41. Design Enterprise RAG

* Multi-tenancy
* Permissions
* Document ingestion
* ACL-aware retrieval
* Vector database
* Caching

### 42. Design AI Coding Assistant

* Code indexing
* Repository understanding
* Symbol search
* Context selection
* Code generation
* Validation

### 43. AI Search System

* Query understanding
* Hybrid search
* Ranking
* Personalization
* Freshness

### 44. AI Customer Support

* RAG
* Conversation state
* Tool calling
* Human escalation
* Guardrails

### 45. Scaling AI Systems

* Load balancing
* Horizontal scaling
* Model routing
* GPU allocation
* Queueing
* Backpressure

### 46. AI Caching

* Semantic caching
* Response caching
* Embedding caching
* Prompt caching
* Redis

### 47. AI Reliability

* Timeouts
* Retries
* Circuit breakers
* Fallback models
* Graceful degradation

### 48. AI Security

* Prompt injection
* Data exfiltration
* Jailbreaking
* Tenant isolation
* Secrets
* Tool security
* RAG poisoning

---

# Level 10 — AI Evaluation

You already started evaluation in Lesson 10, but we'll go much deeper.

### 49. Retrieval Evaluation

* Hit Rate
* Recall@K
* Precision@K
* MRR
* NDCG

### 50. Generation Evaluation

* Answer relevance
* Faithfulness
* Groundedness
* Completeness

### 51. LLM-as-a-Judge

* Judge prompts
* Rubrics
* Bias
* Judge agreement
* Human evaluation

### 52. Golden Datasets

* Dataset creation
* Positive/negative examples
* Edge cases
* Adversarial questions

### 53. Regression Testing

```text
Code change
   ↓
RAG evaluation
   ↓
Compare baseline
   ↓
Pass / Fail
```

### 54. Build: RAG Evaluation Framework

Final architecture:

```text
Questions
    ↓
RAG Pipeline
    ↓
Answers + Sources
    ↓
Evaluation Engine
    ↓
Metrics
    ↓
Dashboard / Report
```

---

# Level 11 — Fine-Tuning

### 55. Fine-Tuning Fundamentals

* Pretraining
* Instruction tuning
* Fine-tuning
* RAG vs fine-tuning

### 56. Dataset Preparation

* Instruction datasets
* Input/output pairs
* Data cleaning
* Train/validation split

### 57. LoRA

* Parameter-efficient fine-tuning
* Adapters
* Rank
* Alpha
* Target modules

### 58. QLoRA

* Quantization
* LoRA
* Memory efficiency

### 59. Fine-Tuning Evaluation

* Overfitting
* Generalization
* Benchmarking
* Regression

### 60. Decision Framework

```text
Need knowledge?
     ↓
RAG

Need external actions?
     ↓
Tools

Need behavior/style?
     ↓
Fine-tuning

Need reasoning workflow?
     ↓
Agent
```

---

# Level 12 — Production AI Engineering

### 61. Production Model Serving

* Ollama
* vLLM
* Model servers
* GPU inference

### 62. Docker for AI

* Model containers
* API containers
* Vector DB
* Networking
* Volumes

### 63. Kubernetes for AI

* Deployments
* Services
* GPU workloads
* Autoscaling

### 64. AI API Gateway

* Authentication
* Rate limiting
* Routing
* Quotas

### 65. Redis for AI

* Caching
* Semantic cache
* Session state
* Rate limiting
* Queues

### 66. AI Queues & Async Processing

* BullMQ
* Workers
* Job queues
* Backpressure
* Retry policies

### 67. Observability

* Logs
* Metrics
* Traces
* Token usage
* Latency
* Cost
* Error rates

### 68. AI Security in Production

* Prompt injection defense
* PII handling
* Secrets
* Access control
* Tenant isolation
* Audit logging

### 69. CI/CD for AI

* Automated tests
* RAG regression tests
* Model evaluation
* Deployment pipelines

### 70. Production AI Architecture

Final architecture:

```text
                         USERS
                           │
                           ▼
                    API Gateway
                           │
              ┌────────────┴────────────┐
              │                         │
         Auth / Rate Limit          Routing
              │                         │
              └────────────┬────────────┘
                           ▼
                    AI Application
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
       RAG Engine       Agent Engine     Cache
          │                │                │
          ▼                ▼                ▼
      Vector DB           Tools          Redis
          │                │
          └────────┬───────┘
                   ▼
              Model Gateway
                   │
          ┌────────┴────────┐
          ▼                 ▼
       Local LLM         Cloud LLM
          │
          ▼
       GPU/CPU
                 
      ─────────────────────────
          Observability
      Logs / Metrics / Traces
      Evaluation / Security
      ─────────────────────────
```

---

# Your Remaining Path

So you have:

**13 lessons completed → 57 major lessons remaining.**

The immediate sequence is:

```text
14  Reranking
 ↓
15  Hybrid Search
 ↓
16  Query Rewriting
 ↓
17  Context Compression
 ↓
18  Advanced RAG Patterns
 ↓
19  Citations & Grounding
 ↓
20  Production RAG
 ↓
21–26 LangChain/LangGraph
 ↓
27–33 Agents
 ↓
34–38 MCP
 ↓
39–48 AI System Design
 ↓
49–54 Evaluation
 ↓
55–60 Fine-Tuning
 ↓
61–70 Production AI
```

**Next lesson: 14 — Reranking**, where we'll move from simple similarity retrieval to **candidate retrieval → relevance scoring → final context selection**.
