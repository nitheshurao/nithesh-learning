The key is to separate **HTML parsing**, **resource downloading**, and **JavaScript execution**. In all four examples, the browser's HTML parser reads the document from top to bottom, but `async` and `defer` change when JavaScript executes.

### 1. CSS first + `defer` JS

```html
<link rel="stylesheet" href="style.css">
<script defer src="app.js"></script>
```

Here, the browser discovers the CSS first and starts downloading it. It then discovers the deferred JavaScript and also downloads the JavaScript without stopping HTML parsing. The browser continues parsing the HTML until the document is completely parsed. After HTML parsing is finished, the deferred JavaScript executes, and deferred scripts execute in document order. CSS is generally render-blocking, so the browser needs the stylesheet before it can render the page correctly.

```text
HTML parsing ──────────────────────→ Complete
      │
      ├── CSS download ────────────→ CSSOM
      │
      └── JS download ─────────────→ JS ready
                                      ↓
                               Execute JS
                                      ↓
                              DOM + CSSOM
                                      ↓
                                   Render
```

---

### 2. `defer` JS first + CSS

```html
<script defer src="app.js"></script>
<link rel="stylesheet" href="style.css">
```

Here, the browser discovers the deferred JavaScript first and starts downloading it. Because it is `defer`, downloading the JavaScript does **not** stop HTML parsing. The browser then discovers the stylesheet and starts downloading CSS as well. HTML parsing continues. Once HTML parsing finishes, the deferred JavaScript executes. So changing the order of the `<script defer>` and `<link>` does not make the JavaScript execute immediately—the important thing is the `defer` attribute. The browser can download both resources while parsing.

```text
HTML parsing ──────────────────────→ Complete
      │
      ├── JS download ─────────────→ JS ready
      │
      └── CSS download ────────────→ CSSOM
                                      ↓
                              Execute defer JS
                                      ↓
                              DOM + CSSOM
                                      ↓
                                   Render
```

---

### 3. CSS first + `async` JS

```html
<link rel="stylesheet" href="style.css">
<script async src="app.js"></script>
```

Here, the browser discovers CSS first and starts downloading it. Then it discovers the `async` JavaScript and starts downloading that as well, while HTML parsing continues. The important difference is that an `async` script executes **as soon as it finishes downloading**. It does not wait for HTML parsing to finish. Therefore, if `app.js` downloads before the HTML parser reaches the end of the document, HTML parsing is paused and the JavaScript executes. If CSS is still loading, a classic `async` script can be affected by stylesheet loading when execution requires the stylesheet to be ready. The exact timing depends on network and resource timing.

```text
HTML parsing ────────────────┬────────────→
      │                     │
      ├── CSS download ─────┼──→ CSSOM
      │                     │
      └── JS download ──────┘
                ↓
          JS finishes
                ↓
          Execute JS
                ↓
        HTML parsing resumes
```

So **`async` means “execute when ready,” not “execute after HTML.”**

---

### 4. `async` JS first + CSS

```html
<script async src="app.js"></script>
<link rel="stylesheet" href="style.css">
```

This is the most interesting case. The browser first discovers the `async` JavaScript and starts downloading it. It then continues parsing and discovers the stylesheet. Both resources can download in parallel. If `app.js` finishes downloading quickly, the browser can pause HTML parsing and execute the script immediately—even though the CSS was discovered afterward and may still be downloading. If the JavaScript finishes later, HTML parsing may continue until the script becomes ready. Therefore, with `async`, you cannot reliably say “CSS always loads first” or “JS always executes after CSS.” The execution timing depends on resource availability and the browser's loading pipeline.

```text
HTML parsing
     │
     ├── JS download ──→ JS ready
     │                       ↓
     │                  Execute JS
     │                       ↓
     │                parsing resumes
     │
     └── CSS download ──→ CSSOM
```

### The interview answer to remember

> **With `defer`, JavaScript downloads in parallel but waits until HTML parsing is complete before executing, so its position mainly determines execution order relative to other deferred scripts. With `async`, JavaScript downloads in parallel and executes as soon as it is available, so it can interrupt HTML parsing and its execution timing is independent of the other resources. CSS is generally render-blocking, while the exact interaction between CSS and JavaScript depends on when each resource is discovered and whether the script needs style information.**

And the simplest mental model is:

```text
defer:
Download JS → Parse HTML completely → Execute JS

async:
Download JS → JS ready → Execute immediately

CSS:
Download → Parse CSS → CSSOM → Needed for rendering
```

**One correction to keep in mind:** don't say in an interview that **“CSS always blocks JavaScript.”** The more accurate statement is that **a stylesheet can delay execution of a classic script when that stylesheet has already been discovered and is still loading**.
