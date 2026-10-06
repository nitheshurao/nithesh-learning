# Level 7 — AI Agents: Key Notes

The important shift is:

> **An LLM application answers. An agent can decide what action to take, execute it, observe the result, and continue.**

---

## 27. What Is an AI Agent?

Basic LLM:

```text
User
 ↓
LLM
 ↓
Answer
```

Agent:

```text
User
 ↓
LLM
 ↓
Decide
 ↓
Tool
 ↓
Observe result
 ↓
Decide again
 ↓
Tool / Answer
```

An agent typically has:

* **Model** — reasoning/decision making
* **Tools** — actions it can execute
* **State** — current task information
* **Loop/workflow** — controls execution
* **Memory** — information retained across interactions
* **Guardrails** — restrictions and validation

---

# 28. Agent Loop

Core pattern:

```text
User
 ↓
Agent
 ↓
Think/Decide
 ↓
Action
 ↓
Tool
 ↓
Observation
 ↓
Decide again
 ↓
...
 ↓
Final Answer
```

Example:

```text
User:
"Find the bug in my authentication code."

Agent
 ↓
searchCode()
 ↓
readFile()
 ↓
analyze
 ↓
runTests()
 ↓
observe failure
 ↓
analyze
 ↓
propose fix
```

---

# 29. Tools

A tool is an operation the agent can invoke.

Examples:

```text
searchCode()
readFile()
writeFile()
runTests()
searchDocs()
queryDatabase()
```

Architecture:

```text
                 Agent
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
  searchCode    readFile    runTests
       │           │           │
       └───────────┼───────────┘
                   ▼
              Tool Results
                   │
                   ▼
                 Agent
```

### Important distinction

The LLM **doesn't actually execute the tool**.

Your application executes it.

```text
LLM
 ↓
Tool call
 ↓
Application validates
 ↓
Application executes
 ↓
Result → LLM
```

---

# 30. Tool Calling

A model may produce structured output such as:

```json
{
  "tool": "searchCode",
  "arguments": {
    "query": "refreshToken"
  }
}
```

Your application:

```text
Validate arguments
       ↓
Authorize tool
       ↓
Execute
       ↓
Return result
```

Never execute arbitrary model-generated operations without validation.

---

# 31. ReAct

Classic agent pattern:

```text
Reason
 ↓
Act
 ↓
Observe
 ↓
Reason
 ↓
Act
 ↓
Observe
```

Conceptually:

```text
Question
   ↓
Reason about next action
   ↓
Call tool
   ↓
Observe result
   ↓
Reason
   ↓
Call another tool
   ↓
Final answer
```

Modern frameworks often implement this through structured tool calls and workflow state rather than exposing raw reasoning text.

---

# 32. Agent State

Agents need state.

Example:

```typescript
type AgentState = {
  userQuery: string;
  messages: Message[];
  retrievedDocs: string[];
  toolResults: unknown[];
  answer?: string;
  stepCount: number;
};
```

Think:

```text
State
 ↓
Node
 ↓
State Update
 ↓
Next Node
```

This is where **LangGraph** becomes useful.

---

# 33. Agent vs RAG

RAG:

```text
Question
 ↓
Retrieve
 ↓
Context
 ↓
LLM
 ↓
Answer
```

Agent:

```text
Question
 ↓
Decide
 ├── Retrieve
 ├── Search web/docs
 ├── Call API
 ├── Execute code
 ├── Query database
 └── Ask user
 ↓
Observe
 ↓
Decide again
 ↓
Answer
```

Therefore:

> **RAG provides information; agents provide controlled action and orchestration.**

RAG can also be one of an agent's tools.

---

# 34. Planning

Complex task:

> "Analyze this repository, find failing tests, identify the cause, and propose a fix."

Possible plan:

```text
1. Inspect repository
2. Find test configuration
3. Run tests
4. Analyze failures
5. Inspect relevant code
6. Identify root cause
7. Propose fix
8. Run tests again
9. Report result
```

Agent architecture:

```text
Task
 ↓
Planner
 ↓
Steps
 ↓
Executor
 ↓
Results
 ↓
Verifier
 ↓
Replan if necessary
```

---

# 35. Agent Memory

Two major categories:

### Short-term memory

Current conversation/task state.

```text
Current messages
Current tools
Current results
Current plan
```

### Long-term memory

Persistent information.

```text
User preferences
Past tasks
Knowledge
Project information
```

Don't confuse:

```text
conversation history
```

with:

```text
long-term memory
```

They solve different problems.

---

# 36. Agent Failure Modes

Agents introduce new failure modes.

### Infinite loops

```text
Tool
 ↓
Agent
 ↓
Tool
 ↓
Agent
 ↓
Tool
...
```

Solution:

```text
maxSteps
timeouts
loop detection
```

### Wrong tool

Agent selects:

```text
deleteFile()
```

when it should have used:

```text
readFile()
```

Solution:

```text
tool descriptions
validation
permissions
confirmation
```

### Invalid arguments

```json
{
  "file": 123
}
```

when a string is required.

Solution:

```text
schema validation
```

---

# 37. Human-in-the-Loop

Dangerous action:

```text
Agent
 ↓
deleteProductionDatabase()
```

Don't allow automatic execution.

Instead:

```text
Agent
 ↓
Request approval
 ↓
Human
 ↓
Approve / Reject
 ↓
Tool execution
```

Use human approval for:

* destructive operations
* financial actions
* production deployments
* sending messages
* modifying important files
* privileged operations

---

# 38. Agent Guardrails

Think in layers:

```text
User Input
    ↓
Input Validation
    ↓
Agent
    ↓
Tool Selection
    ↓
Tool Authorization
    ↓
Argument Validation
    ↓
Tool Execution
    ↓
Output Validation
```

Security is not just a prompt.

---

# 39. Your Local AI Software Engineer Agent

This fits your roadmap perfectly.

Architecture:

```text
                         User
                           │
                           ▼
                     AI Engineer Agent
                           │
              ┌────────────┼─────────────┐
              ▼            ▼             ▼
          Code Search   File Reader   Test Runner
              │            │             │
              └────────────┼─────────────┘
                           ▼
                       Tool Results
                           │
                           ▼
                         Agent
                           │
                    ┌──────┴──────┐
                    ▼             ▼
                 RAG/Docs       Answer
```

Local stack:

```text
Node.js
TypeScript
Ollama
LangGraph
ChromaDB
Docker
```

---

# 40. Key Difference

Memorize this:

```text
LLM
→ generates

RAG
→ retrieves + generates

Tool-using application
→ generates + executes tools

Agent
→ decides + executes + observes + continues
```

---

# 41. Interview Questions

1. What makes an application an agent?
2. Agent vs RAG?
3. What is tool calling?
4. What is the ReAct pattern?
5. Why does an agent need state?
6. What causes agent loops?
7. How would you safely execute tools?
8. When should a human approve an action?
9. What is the difference between short-term and long-term memory?
10. Why use LangGraph for agents?

---

# 42. Mental Model

```text
                  AI AGENT
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
     Model         Tools         State
       │             │             │
       └─────────────┼─────────────┘
                     ▼
                  Workflow
                     │
              ┌──────┴──────┐
              ▼             ▼
            Action       Observation
              │             │
              └──────┬──────┘
                     ▼
                  Decide
                     │
              ┌──────┴──────┐
              ▼             ▼
            Continue       Finish
```

## Next

**Lesson 28 — ReAct & Agent Loops**

We'll go deeper into:

```text
Question
   ↓
Reason about action
   ↓
Tool call
   ↓
Observation
   ↓
State update
   ↓
Next decision
   ↓
...
   ↓
Final answer
```

Then we'll build the first **local tool-using agent with Ollama + TypeScript**.
