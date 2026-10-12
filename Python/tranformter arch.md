# LLM Fundamentals — Short Notes + Memory Tricks

Your goal is to understand these concepts well enough to explain them in interviews, implement them using JavaScript and Ollama, and make production-level engineering decisions.

The best way to remember them is to connect each concept to a simple mental model.

## 1. Quick revision notes

![PaperBanana Diagram Generator - Create Editable SVG Scientific Diagrams with AI](https://images.openai.com/static-rsc-4/z252k1qzK8oo91pUm8kcELObCLdTNt9ugzcw3nlK7ZTMrGxrP2-lgK4-wFy8PBmgdxS1UhNurq1AP7DP1XRvNIFEo3VpgQzNgY276hlGedJAPPt_7BgTT_TwQx59XuA5kwvv2TD_i4aoNwd0wPVKfToko5a8F1kVraQuERIJom8?purpose=inline)

1. Transformer Architecture

A neural network architecture that processes tokens using attention and feed-forward layers. Modern LLMs such as GPT primarily use decoder-only Transformers to predict the next token.

Remember:The LLM's assembly line.

`<span>Tokens </span><span>→ </span><span>Embeddings </span><span>→ </span><span>Transformer </span><span>layers </span><span>→ </span><span>Logits </span><span>→ </span><span>Next </span><span>token</span>`

![マルチヘッド自己注意機構 | PyTorch](https://images.openai.com/static-rsc-4/vVd230bucIORmlSjhOEiDSWkwhtCuh1xy80Y4Qnb66g7ZmviKQRI9mdUzFZ4Fkg1MXcDHWq4Eyc66XnMidFSL28G3I9UbVde7EjSTuWk9BbncQtvNPIpAt2z6Ln8-0-0qYl_7bpn2i7vpClHsX0FvcICzEiEOsr-0A2TLgrPW6Y?purpose=inline)

2. Attention / Self-Attention

Lets each token determine which other tokens are relevant to understanding it. It uses Query (Q), Key (K), and Value (V) vectors.

\\[ Attention(Q,K,V)=softmax\\left(\\frac{QK^T}{\\sqrt{d\_k}}\\right)V \\]

Remember:Q = What am I looking for? K = What do I contain? V = What information do I provide?

![Breaking Language into Tokens: How Transformers Process Information?](https://images.openai.com/static-rsc-4/QYv6mxgwffZDAtSYWK6Ksk88JCvYSrhqiQR_Nu4yjZgDwSHPeJWK6R1Yl8vxXWthLzKqvBoAZyQxlX3RyboGTGyd-UyJ3vI4H9SO0kgzA72KjHkKpYDpMzP3DRITvLfSyhi6FNsoOBA0toKn1IyfoTBQbCdRYNlONrJdfOoxRIQ?purpose=inline)

3. Tokens & Tokenization

Tokenization converts text into smaller units—words, subwords, characters or other token units. The model processes token IDs, not raw text.

Example: `<span>unhappiness</span>`might split into `<span>un</span>`, `<span>happi</span>`, `<span>ness</span>`, depending on the tokenizer.

Remember:Text → pieces → numbers.

Tokens determine input length, context usage and often API cost.

![What are  Word Embeddings? How AI Learns the Meaning of Words | Medium](https://images.openai.com/static-rsc-4/iCc7z36SJQnE6gZ6oB44FRco3T6lHbLwAqz7C2qlteZa721IQgIm8H0hAAxIGkQ7vBtWbH5UlJ_IIbUXvBuBOnXkMoarepCx7wjYW91-VpVCJtHMwGE_Hv8dvwioRUSyuoeFgnUePCdH64GOQYdyA1RbGtsYdSM3tJ9LQ1niFQU?purpose=inline)

4. Embeddings

Dense numerical vectors representing tokens or other content. Learned token embeddings help the model represent meaning and relationships; separate embedding models can represent documents for semantic search.

Example: similar sentences may have nearby vectors in embedding space.

Remember:Embeddings = meaning represented as numbers.

Interview distinction:Token IDs are discrete identifiers; embeddings are vectors.

![The Context Window, Explained: Your Key to High‑Performance AI Coding | by Sharjeel Haider | Medium](https://images.openai.com/static-rsc-4/xGYBB-1yOwndilg3TzTK0h9crkyeg5WCKlS06h6qB4R96ZlcltBehvMBPKlPjvgYR8UwjUKOI3A3hR9D_HaECx8-qdGbODJz5yGtZtURhrjiIi7mkQGSuP5PYrPEAbzBoTZQTN0jwxDLLGRFqkEWxOY7ld_eMyC064HQcd3mOuw?purpose=inline)

5. Context Window

The maximum amount of token context a model can process in a single request, subject to the model's limits and configuration.

It can include system instructions, conversation history, retrieved documents, tool results and generated output.

Remember:The model's working desk.

A larger context window does not guarantee perfect recall or reasoning.

![LLM Temperature Explained: How It Affects Output | Utkarsh Bajaj posted on the topic | LinkedIn](https://images.openai.com/static-rsc-4/hP2wWkZjxyjLQYYl8_RC9w7BKK00VvnFDYdeOtk3Oi5PyokUzBzc85EbVKk8xURd4v9aD1axg2H8Rsf9JUXy77UL6bvqCkpVjMjxY3RdneoqN0EtB498zpijNu29z9Wf7xpg2KzGeiXFy2VYNAouvetrWAYVNvJA7jOOG0HQkuU?purpose=inline)

6. Temperature, Top-p & Top-k

These control how the model samples the next token from its probability distribution.

* Temperature:Changes how sharp or flat the distribution becomes.
* Top-k:Considers at most the k highest-ranked token candidates.
* Top-p:Considers the smallest high-probability candidate set whose cumulative probability reaches p.

Remember:Temperature = randomness; top-k = fixed candidate count; top-p = probability-based candidate set.

Lower temperature is often useful for consistency; higher temperature can increase variety.

![Prompt Engineering Best Practices: Building Reliable LLM Systems With Evaluation Frameworks](https://images.openai.com/static-rsc-4/DSx70vThFKELNO3MOjAlxoWSTpuMBJTeorvxjrgjTkKTuRarG6caHeb3-04oxcWbDCWAuyTXi_jcUGdqoxImnBPE8PAyIeZQ7ZO4WHssUf8BU1mjQaljkxfpHBxCbzPQ3glU9deANoiHwGxd5nYydjXN6qzVOk10FXbcy5duY50?purpose=inline)

7. Prompt Engineering

Designing instructions, context, examples and output requirements to improve model behavior.

A useful structure is: Role + Task + Context + Constraints + Output format.

Remember:Brief the model like a skilled engineer.

Clear prompts help, but they cannot guarantee factual correctness or override model limitations.

![Quiz: Structured Output & Schema Enforcement - Quizzly.ai](https://images.openai.com/static-rsc-4/KA6eo1P2T0_Ym2rWCX-dczO6ukkoHPRzEQp1PLti0oPp8nbuX1CQ_ECVXHazAjMezu5f7MouK-saTzzotyIYberKyzONPgMEQssTkjU0GBufyILWjyUBLwdVZV4nubTFjJ_3tSnu3k__yNsVgfYkOISckhVHzwAFpT0ve3NPUXc?purpose=inline)

8. Structured Output / JSON Mode

Constrains or guides generation toward a machine-readable format. JSON mode generally targets valid JSON; schema-constrained output can enforce a defined structure, depending on implementation.

Remember:JSON mode = format; schema = shape; validation = correctness checks.

Valid JSON does not necessarily mean valid business data.

![Understanding the Term BIC in the Financial Domain | by Saipriya Damarapati | Medium](https://images.openai.com/static-rsc-4/A67JA1e5MaMx5B7UUi0QDcMf1Ugin-XDf2dgjG6eP8VZUategWoUBAVPE1VsPs3kC8XhH7bPr3GSFmtPrkm2nXVyeT195Dq2wimdcQGTyVojqfX93xox4HxqGI7UBghM62DQo2WkY3IuDTJj341wBsfNu0RyHHqBbEDq5aQMDqI?purpose=inline)

9. Function Calling / Tool Calling

The model requests that an application invoke a tool with arguments, such as a database lookup, calculator or weather API. The application executes it and sends the result back to the model.

Remember:Model decides → application executes → model interprets.

Tool calling is not the same as the model executing code itself. Validate arguments and authorize sensitive operations.

![The User Experience vs. The Bill: Understanding the LLM Response Streaming Cost Impact | CloudAtler Blog](https://images.openai.com/static-rsc-4/4GzTASpDkI5d1ITTcXWnYRM1Dengmc90g7aL23F81YSNW4qCkAGDSakrHTC0El14GmPFNGC5Puc4vSaJXEAvGeS4Rt7wEiCCwQu5GAzw6G4o5YAios2jR2uGVSA2cD2dtJL21tdhHgwEDEYMKV0RX1R-BBGpRrjRUIioqSK9w7A?purpose=inline)

10. Streaming Responses

Sends generated output progressively instead of waiting for the entire response.

Common implementations use Server-Sent Events (SSE) or streaming HTTP responses.

Remember:Streaming = faster first visible output, not necessarily faster total generation.

Handle partial chunks, cancellation, errors and incomplete responses.

![How AI Works Under the Hood - LLMs Explained with Code | Nitay Neeman's Website](https://images.openai.com/static-rsc-4/ftaRe21Axy_1Xzd9uYFBCWPNEXOrzjsFQ_LrOajIIVmFYdDBlf325rp02mwQBR1DExdN1X_Lk3PMsnsVlgCq6S73h3UdqlP8rru4F9-gULZgTpJYpngQMMXpGApLKuuTQjKBaarUHbEq4fhYBTHrEolJAytK_ZBvlTs_toNxEfY?purpose=inline)

11. LLM Inference

Running a trained model to generate predictions. Text generation usually involves a prefill stage followed by autoregressive decoding.

* Prefill:Processes the input prompt and builds the KV cache.
* Decode:Generates tokens sequentially, using previous context and cached attention states.

Remember:Training teaches; inference uses what was learned.

![Free LLM VRAM Calculator: GPU Memory Requirements for Large Language Models | Simulations4All](https://images.openai.com/static-rsc-4/7jwBvWvpAz7dOsSv3Q4IZFIRlTvxSt0NW2txMG1lrH_PQcogGyZHSl7jUTGAiMCzX7VDPJEgU_qnekL80szUzTpSoWFqcF4F3lQhg-v0xV7OWUo2xW41MmX6CZLKaXCW_D4Fu7frX74Njj2msJ00BAs_KEXIFfEuaDwHQnVPga0?purpose=inline)

12. Quantization — INT8, INT4, GPTQ, AWQ

Reduces the numerical precision used to represent model weights, often lowering memory requirements and potentially improving inference speed.

* INT8 / INT4:Common lower-bit numerical representations.
* GPTQ:A post-training quantization method using calibration and approximate error compensation.
* AWQ:Activation-aware weight quantization that protects important weights using activation information.

Remember:Smaller weights → less memory; quality and speed depend on the method and hardware.

Quantization can introduce accuracy loss.

![KV Cache: The Secret to Faster LLM Inference | by Saiii | Medium](https://images.openai.com/static-rsc-4/pRKrvI7Wm2s2PKKLDinUYK-06LFkC40xQ7yOOL2DV3sHoqlESY-iDvLJLd-XRd8R5W_Bp0efmX7w7muiY4tj3W2BR1xnKR4ZZ67eKqH9CpNA0MAN3hvi3IN7ezZFCXcyhMJx8V2fKX1vJo9BEqi8N6J1r_i2hijLDnjL8YnNLT0?purpose=inline)

13. KV Cache

Stores previously computed attention Key and Value tensors so they do not need to be recomputed for every generated token.

Remember:A scratchpad that saves repeated work.

It improves decoding efficiency but consumes memory, especially with long contexts and concurrent requests.

![Surpassing NVIDIA FasterTransformer’s Inference Performance by 50%, Open Source Project Powers into the Future of Large Models Industrialization | by HPC-AI Tech | Medium](https://images.openai.com/static-rsc-4/DNINhlpNfOj5JwXs2TDt_hTtQeXgfcTUdi8onS40cxZqQ6xxqpZnf0noE1dBUPmflEP4GVI-obwVnoI1wCrP9f0W8snASLAPGdU4JKASKa_d2qH8Mj9uNh6wORjhB59LUhZg_-7By6OxfyyIvYWJWvpdWsaZvCVgjdBoJm7uuko?purpose=inline)

14. Batch Inference

Processes multiple inputs together to improve hardware utilization and throughput.

* Batch size:Number of inputs processed together.
* Throughput:Requests or tokens processed per unit time.
* Latency:Time an individual request takes.

Remember:Batch = serve more work together.

Larger batches can improve throughput but increase memory use and sometimes latency.

The illustrations are conceptual aids; exact architectures and implementation behavior vary by model and runtime.

## 2. Memorize the complete LLM pipeline

Instead of memorizing 14 isolated definitions, remember this sequence.

Input text

Prompt engineering · Tokenization

Represent the input

Token IDs · Embeddings · Context window

Process through the model

Transformer · Attention · KV cache

Generate the next token

Inference · Temperature · Top-k · Top-p

Return a usable response

Streaming · Structured output · Tool calling

Optimization across the system: quantization reduces weight memory; batching improves throughput.

## 3. Interview recall cheat sheet


| Concept           | Recallinonesentence                                                 |
| ----------------- | ------------------------------------------------------------------- |
| Transformer       | Processestokenrepresentationsthroughattentionandfeed-forwardlayers. |
| Attention         | Determineshowtokensuseinformationfromothertokens.                   |
| Tokens            | Thediscreteunitsthemodelprocesses.                                  |
| Embeddings        | Densevectorsrepresentingtokenorcontentfeatures.                     |
| Contextwindow     | Thetokenbudgetavailabletoarequest.                                  |
| Sampling          | Controlshowthenexttokenisselected.                                  |
| Promptengineering | Specifiesthetask,contextandconstraints.                             |
| Structuredoutput  | Makesresponsesconformtoamachine-readableformat.                     |
| Toolcalling       | Letstheapplicationexecutemodel-requestedactions.                    |
| Streaming         | Deliversoutputprogressively.                                        |
| Inference         | Runsthemodeltogeneratepredictions.                                  |
| Quantization      | Useslower-precisionrepresentationstoreduceresourcerequirements.     |
| KVcache           | Reusespreviouslycomputedattentionkeysandvalues.                     |
| Batchinference    | Processesmultipleinputstogetherforefficiency.                       |

## 4. Test your memory

Try answering these without looking at the notes.

#### 1

What is the difference between a token ID and an embedding?

A token ID is a discrete integer identifying a token; an embedding is a dense vector representing it.

#### 2

Why does a Transformer use attention?

Reveal answer

#### 3

How do top-k and top-p differ?

Reveal answer

#### 4

What is the difference between prefill and decode?

Reveal answer

#### 5

Why is the KV cache useful?

Reveal answer

#### 6

Does valid JSON guarantee a correct answer?

Reveal answer

#### 7

Why might quantization help local LLMs?

Reveal answer

#### 8

What is the trade-off of larger inference batches?

Reveal answer

Reveal allReset quiz

## 5. The best method to remember these concepts

Use Recall → Explain → Implement → Compare.

1. Recall:Define the concept in one sentence without notes.
2. Explain:Give a simple analogy and explain why it matters.
3. Implement:Run a small JavaScript/Node.js experiment with Ollama.
4. Compare:Explain the trade-offs, limitations and production implications.

For example, to master KV caching, generate the same prompt with different context lengths, observe generation speed and memory usage, and explain why cache size grows with the number of cached tokens.

Your interview standard should be: definition → mechanism → practical example → trade-off. That moves you beyond memorized theory toward AI engineering and senior-level system design.
