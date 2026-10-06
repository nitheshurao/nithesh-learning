# Level 6 — LangChain & LangGraph: Key Notes

The main goal of Level 6 is:

> **Understand the abstractions, not just memorize LangChain APIs.**

---

## 21. LangChain Architecture

### Core components

```text
User
 ↓
Prompt
 ↓
Model
 ↓
Parser
 ↓
Output
```

Important building blocks:

* **Models** → LLM / chat model
* **Prompts** → reusable prompt templates
* **Output Parsers** → convert model output into structured data
* **Retrievers** → fetch relevant documents
* **Tools** → external actions/functions
* **Chains/Runnables** → connect components into workflows
* **Memory/State** → maintain application context

### Mental model

```text
Prompt
  ↓
Model
  ↓
Parser
  ↓
Result
```

LangChain mainly provides **composable abstractions** around these operations.

---

# 22. LangChain RAG

Typical LangChain RAG:

```text
Documents
   ↓
Loader
   ↓
Text Splitter
   ↓
Embeddings
   ↓
Vector Store
   ↓
Retriever
   ↓
Prompt
   ↓
LLM
   ↓
Answer
```

Important components:

* Document loaders
* Text splitters
* Embeddings
* Vector stores
* Retrievers
* Prompt templates
* LLMs
* Output parsers

### Key distinction

```text
Retriever → finds information

LLM → generates answer
```

LangChain connects them; it doesn't magically improve retrieval.

---

# 23. Structured Output

Instead of:

```text
"User is Nithesh and age is 28"
```

you want:

```json
{
  "name": "Nithesh",
  "age": 28
}
```

Use:

* JSON schema
* Zod
* Structured output
* Validation
* Retry/fallback

Architecture:

```text
LLM
 ↓
Structured Output
 ↓
Schema Validation
 ↓
Application
```

Very important for production systems.

---

# 24. Tools & Tool Calling

LLM decides:

```text
"I need to call searchCode()"
```

Architecture:

```text
User
 ↓
LLM
 ↓
Tool Selection
 ↓
Tool
 ↓
Tool Result
 ↓
LLM
 ↓
Answer
```

Example tools:

```text
searchCode()
readFile()
searchDocs()
getWeather()
queryDatabase()
```

Important:

> **The LLM chooses a tool; your application executes the tool.**

Never blindly trust tool arguments.

Validate:

```text
input
 ↓
schema validation
 ↓
authorization
 ↓
execution
```

---

# 25. LangGraph Fundamentals

LangChain is mainly about **components and composition**.

LangGraph is about **stateful workflows/agents**.

Core concepts:

### State

Shared information flowing through the workflow.

```typescript
type State = {
  question: string;
  documents: string[];
  answer?: string;
};
```

### Node

A unit of work.

```text
retrieve()
generate()
validate()
```

### Edge

Controls what happens next.

```text
retrieve
   ↓
generate
```

### Conditional Edge

```text
retrieve
   ↓
documents found?
 ┌───┴────┐
Yes       No
 ↓         ↓
Generate  Rewrite
```

---

# 26. LangGraph Mental Model

Think:

```text
State
  ↓
Node
  ↓
State Update
  ↓
Next Node
  ↓
State Update
```

Example:

```text
                 START
                   │
                   ▼
                Retrieve
                   │
                   ▼
             Evidence Found?
              /          \
            Yes           No
             ↓             ↓
         Generate       Rewrite
             │             │
             │             ▼
             │          Retrieve
             │
             ▼
           Verify
             │
        ┌────┴────┐
        ▼         ▼
      Valid     Invalid
        │         │
        ▼         ▼
       END     Generate Again
```

This is much better suited for agentic workflows than a simple linear chain.

---

# 27. LangChain vs LangGraph


| LangChain              | LangGraph           |
| ---------------------- | ------------------- |
| Components             | Workflows           |
| Chains                 | Graphs              |
| Simple pipelines       | Stateful workflows  |
| Model/tool integration | Agent orchestration |
| Linear composition     | Loops + branching   |
| Retrieval pipelines    | Complex agents      |

Think:

```text
LangChain
→ "How do I connect AI components?"

LangGraph
→ "How do I control a stateful AI workflow?"
```

---

# 28. Most Important Concepts to Remember

```text
LangChain
├── Models
├── Prompts
├── Retrievers
├── Tools
├── Parsers
└── Runnables

LangGraph
├── State
├── Nodes
├── Edges
├── Conditional routing
├── Loops
├── Checkpoints
└── Human-in-the-loop
```

---

# 29. Production Mental Model

Don't build:

```text
User
 ↓
LangChain
 ↓
LLM
```

Think:

```text
                    Application
                         │
                ┌────────┴────────┐
                ▼                 ▼
             LangChain        LangGraph
                │                 │
        Components/tools      State/workflow
                │                 │
                └────────┬────────┘
                         ▼
                       Models
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
            Ollama     Cloud LLM   Other
```

---

# 30. What You Should Be Able to Explain After Level 6

By the end, you should confidently answer:

1. **What problem does LangChain solve?**
2. **What is a Retriever?**
3. **What is structured output?**
4. **What is tool calling?**
5. **Why is validation important after LLM output?**
6. **What is LangGraph?**
7. **What are state, nodes and edges?**
8. **Why use LangGraph instead of a simple chain?**
9. **How do you implement loops and conditional routing?**
10. **How do you add human approval to an AI workflow?**

### One-line memory trick

```text
LangChain = AI building blocks
LangGraph = AI workflow/state orchestration
```

And for your roadmap, **Level 7 Agents** builds directly on this foundation.
